# evaluation_backend.py
# Fixed backend with proper DeepEval compatibility

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import asyncio
import httpx
from deepeval.test_case import LLMTestCase
from deepeval.metrics import (
    AnswerRelevancyMetric,
    ToxicityMetric,
    GEval
)
from deepeval.test_case import LLMTestCaseParams
from deepeval.models.base_model import DeepEvalBaseLLM
from openai import AsyncAzureOpenAI
import asyncio
from dotenv import load_dotenv
import os
from datetime import datetime
import json
from pathlib import Path
import io
import csv
import re

# Try multiple locations for .env file
print("\n🔍 Looking for .env file...")
print("="*70)

current_dir = Path(__file__).parent
print(f"Backend directory: {current_dir}")

backend_env = current_dir / '.env'
root_env = current_dir.parent.parent.parent / '.env'

env_loaded = False

if backend_env.exists():
    print(f"✅ Found .env in backend directory: {backend_env}")
    load_dotenv(backend_env)
    env_loaded = True
elif root_env.exists():
    print(f"✅ Found .env in root directory: {root_env}")
    load_dotenv(root_env)
    env_loaded = True
else:
    print(f"❌ .env file not found!")
    print(f"   Checked: {backend_env}")
    print(f"   Checked: {root_env}")

print("="*70)

# Custom Azure OpenAI Model for Cognitive Services endpoint
class CustomAzureOpenAIModel(DeepEvalBaseLLM):
    """Custom Azure OpenAI model that works with Cognitive Services endpoints"""

    def __init__(
        self,
        model_name: str,
        deployment_name: str,
        azure_endpoint: str,
        api_key: str,
        api_version: str = "2024-02-15-preview"
    ):
        self.model_name = model_name
        self.deployment_name = deployment_name
        self.azure_endpoint = azure_endpoint
        self.api_version = api_version
        self.token_counter = None  # Will be set by evaluation workflow

        # Create Azure OpenAI client
        self.client = AsyncAzureOpenAI(
            azure_endpoint=azure_endpoint,
            api_key=api_key,
            api_version=api_version
        )

        print(f"   ✅ Custom Azure OpenAI Model initialized")
        print(f"      Deployment: {deployment_name}")
        print(f"      Endpoint: {azure_endpoint}")

    def set_token_counter(self, token_counter):
        """Set the token counter for tracking usage"""
        self.token_counter = token_counter

    def load_model(self):
        """Required by DeepEvalBaseLLM - already loaded in __init__"""
        return self.client

    def generate(self, prompt: str, schema: any = None):
        """Synchronous generate method required by DeepEval"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(self.a_generate(prompt, schema))
        finally:
            loop.close()

    async def a_generate(self, prompt: str, schema: any = None):
        """Async generate method for DeepEval"""
        try:
            messages = [{"role": "user", "content": prompt}]

            # Prepare request parameters
            params = {
                "model": self.deployment_name,
                "messages": messages,
                "temperature": 0,
                "max_tokens": 2000
            }

            # Add response format if schema provided
            if schema:
                params["response_format"] = {"type": "json_object"}
                messages[0]["content"] = f"{prompt}\n\nPlease respond with valid JSON only."

            # Make API call
            response = await self.client.chat.completions.create(**params)

            # Extract content
            content = response.choices[0].message.content

            # Track token usage
            usage = response.usage
            print(f"   💰 Tokens: {usage.total_tokens} (prompt: {usage.prompt_tokens}, completion: {usage.completion_tokens})")

            # Add to token counter if available
            if self.token_counter:
                self.token_counter.add(
                    tokens=usage.total_tokens,
                    prompt_tokens=usage.prompt_tokens,
                    completion_tokens=usage.completion_tokens,
                    call_type="evaluation"
                )

            # If schema is provided, parse and return the object
            if schema:
                try:
                    import json
                    parsed_json = json.loads(content)
                    # Create an instance of the schema with the parsed data
                    return schema(**parsed_json)
                except Exception as e:
                    print(f"   ⚠️ Warning: Could not parse JSON response: {e}")
                    print(f"   Raw content: {content[:200]}")
                    # Return content as-is if parsing fails
                    return content
            
            return content

        except Exception as e:
            print(f"   ❌ Error in a_generate: {e}")
            raise

    def get_model_name(self) -> str:
        """Return model name for DeepEval"""
        return self.model_name

app = FastAPI(title="Evaluation Workflow API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Azure OpenAI Model for evaluation
print("\n🔧 Initializing Azure OpenAI Model...")
print("="*70)

model_name = os.getenv("AZURE_OPENAI_MODEL_NAME")
deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
api_key = os.getenv("AZURE_OPENAI_API_KEY")
api_version = os.getenv("AZURE_OPENAI_API_VERSION")
endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")

print(f"Model Name: {model_name}")
print(f"Deployment Name: {deployment_name}")
print(f"API Version: {api_version}")
print(f"Endpoint: {endpoint}")
print(f"API Key: {'*' * 20}{api_key[-4:] if api_key and len(api_key) > 4 else 'NOT SET'}")

missing_vars = []
if not model_name:
    missing_vars.append("AZURE_OPENAI_MODEL_NAME")
if not deployment_name:
    missing_vars.append("AZURE_OPENAI_DEPLOYMENT_NAME")
if not api_key:
    missing_vars.append("AZURE_OPENAI_API_KEY")
if not api_version:
    missing_vars.append("AZURE_OPENAI_API_VERSION")
if not endpoint:
    missing_vars.append("AZURE_OPENAI_ENDPOINT")

endpoint_uses_cognitive_services = '.cognitiveservices.azure.com' in endpoint if endpoint else False

if endpoint_uses_cognitive_services:
    print(f"\n💡 INFO: Detected Cognitive Services endpoint format")
    print(f"   Using custom Azure OpenAI model for compatibility")

if missing_vars:
    print(f"\n❌ ERROR: Missing environment variables: {', '.join(missing_vars)}")
    print("="*70)
    evaluation_model = None
else:
    try:
        evaluation_model = CustomAzureOpenAIModel(
            model_name=model_name,
            deployment_name=deployment_name,
            azure_endpoint=endpoint,
            api_key=api_key,
            api_version=api_version
        )
        print("\n✅ Azure OpenAI Model initialized successfully")
        print("="*70)
    except Exception as e:
        print(f"\n❌ Error initializing Azure OpenAI: {e}")
        import traceback
        traceback.print_exc()
        print("="*70)
        evaluation_model = None

# Import test generation utilities
from test_generation import parse_kb_files, generate_test_cases_with_llm

# Agent endpoint
AGENT_API_URL = "https://inextlabs-demo-sales-bot-pf-as.azurewebsites.net/score"

# Pydantic models
class FieldMappings(BaseModel):
    query: str
    response: str
    context: Optional[str] = "not_available"
    ground_truth: Optional[str] = "not_available"
    tool_calls: Optional[str] = "not_available"
    tool_definitions: Optional[str] = "not_available"

class CriteriaData(BaseModel):
    selectedMetrics: List[str]
    customPrompt: Optional[str] = None
    modelUnderTest: str
    temperature: float

class EvaluationRequest(BaseModel):
    evaluationName: str
    dataset: Dict[str, Any]
    fieldMappings: FieldMappings
    judgeModel: str
    criteriaData: CriteriaData

class EvaluationResponse(BaseModel):
    evaluationName: str
    totalTests: int
    completedTests: int
    overallScore: float
    testResults: List[Dict[str, Any]]
    timestamp: str
    tokenUsage: Optional[Dict[str, Any]] = None

class GenerateTestCasesRequest(BaseModel):
    datasetName: str
    modelName: str
    numTestCases: int
    customPrompt: Optional[str] = ""
    # Note: KB files will be sent as multipart/form-data, not in JSON

class GenerateTestCasesResponse(BaseModel):
    datasetName: str
    version: int
    createdOn: str
    totalCases: int
    data: List[Dict[str, str]]

class TokenCounter:
    """Track token usage during evaluation"""
    def __init__(self):
        self.total_tokens = 0
        self.prompt_tokens = 0
        self.completion_tokens = 0
        self.call_count = 0
        self.breakdown = {
            "agent_calls": 0,
            "evaluation_calls": 0,
            "agent_tokens": 0,
            "evaluation_tokens": 0
        }

    def add(self, tokens, prompt_tokens=0, completion_tokens=0, call_type="evaluation"):
        """Add token usage

        Args:
            tokens: Total tokens used
            prompt_tokens: Prompt tokens used (optional)
            completion_tokens: Completion tokens used (optional)
            call_type: Type of call - "agent" or "evaluation"
        """
        self.total_tokens += tokens
        self.prompt_tokens += prompt_tokens
        self.completion_tokens += completion_tokens
        self.call_count += 1

        if call_type == "agent":
            self.breakdown["agent_calls"] += 1
            self.breakdown["agent_tokens"] += tokens
        else:
            self.breakdown["evaluation_calls"] += 1
            self.breakdown["evaluation_tokens"] += tokens

    def print_summary(self, operation_name="Evaluation"):
        print("\n" + "="*70)
        print(f"📊 TOKEN USAGE SUMMARY - {operation_name}")
        print("="*70)
        print(f"Total API Calls: {self.call_count}")
        print(f"  - Agent Calls: {self.breakdown['agent_calls']}")
        print(f"  - Evaluation Calls: {self.breakdown['evaluation_calls']}")
        print(f"\nTotal Tokens: {self.total_tokens:,}")
        print(f"  - Prompt Tokens: {self.prompt_tokens:,}")
        print(f"  - Completion Tokens: {self.completion_tokens:,}")
        print(f"\nToken Breakdown:")
        print(f"  - Agent Tokens: {self.breakdown['agent_tokens']:,}")
        print(f"  - Evaluation Tokens: {self.breakdown['evaluation_tokens']:,}")
        print("="*70 + "\n")

    def get_summary(self) -> Dict[str, Any]:
        """Get token usage summary as dictionary"""
        return {
            "total_tokens": self.total_tokens,
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "total_calls": self.call_count,
            "breakdown": {
                "agent": {
                    "calls": self.breakdown["agent_calls"],
                    "tokens": self.breakdown["agent_tokens"]
                },
                "evaluation": {
                    "calls": self.breakdown["evaluation_calls"],
                    "tokens": self.breakdown["evaluation_tokens"]
                }
            }
        }

async def query_agent(user_query: str, conversation_id: str = "eval_001", token_counter=None) -> Dict[str, Any]:
    """Query the agent endpoint"""
    print(f"\n🔍 AGENT QUERY DEBUG")
    print(f"{'='*70}")
    print(f"Question: {user_query}")

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            payload = {
                "question": user_query,
                "conversation_id": conversation_id,
                "past_message_include": "15",
                "channel": "Evaluation Testing",
                "user_profile": {},
                "user_id": "916383705270",
                "contact_id": "rKgHCnFEpFwEeNxdaUWG6A",
                "attachment": {
                    "url": "",
                    "is_uploaded": "false"
                }
            }

            response = await client.post(
                AGENT_API_URL,
                json=payload,
                headers={"Content-Type": "application/json"}
            )

            response.raise_for_status()
            result = response.json()

            agent_response = (
                result.get("response") or
                result.get("answer") or
                result.get("output") or
                result.get("text") or
                str(result.get("message", ""))
            )

            context = result.get("context", [])
            if isinstance(context, str):
                context = [context] if context else []
            elif context is None:
                context = []

            # Track agent token usage if available
            if token_counter:
                # Check if the agent returns token usage information
                agent_tokens = result.get("token_usage") or result.get("usage") or result.get("tokens")
                if agent_tokens:
                    total = agent_tokens.get("total_tokens", 0)
                    prompt = agent_tokens.get("prompt_tokens", 0)
                    completion = agent_tokens.get("completion_tokens", 0)
                    if total > 0:
                        token_counter.add(
                            tokens=total,
                            prompt_tokens=prompt,
                            completion_tokens=completion,
                            call_type="agent"
                        )
                        print(f"💰 Agent Tokens Tracked: {total} (prompt: {prompt}, completion: {completion})")
                    else:
                        print(f"⚠️  Agent returned token usage but values are 0")
                else:
                    print(f"⚠️  Agent did not return token usage information")
                    print(f"   Available keys in response: {', '.join(result.keys())}")
                    print(f"   ℹ️  Agent tokens are NOT being tracked - endpoint may not support token reporting")

            print(f"✅ Response received: {str(agent_response)[:100]}...")
            print(f"{'='*70}\n")

            return {
                "response": agent_response,
                "context": context,
                "raw_response": result
            }

        except Exception as e:
            print(f"\n❌ Error querying agent: {e}")
            return {
                "response": "Error getting response from agent",
                "context": [],
                "error": str(e)
            }

def get_field_value(row: Dict[str, Any], field_mapping: str, field_name_debug: str = "") -> str:
    """Extract field value from dataset row"""
    if field_mapping == "not_available" or not field_mapping:
        return ""

    field_name = field_mapping
    if "{{item." in field_mapping:
        field_name = field_mapping.replace("{{item.", "").replace("}}", "")

    value = row.get(field_name, "")
    return str(value)

async def evaluate_single_test(
    test_row: Dict[str, Any],
    field_mappings: FieldMappings,
    selected_metrics: List[str],
    test_index: int,
    token_counter: TokenCounter
) -> Dict[str, Any]:
    """Evaluate a single test case"""
    print(f"\n{'='*70}")
    print(f"🧪 TEST CASE #{test_index + 1}")
    print(f"{'='*70}")

    user_query = get_field_value(test_row, field_mappings.query, "QUERY")
    expected_response = get_field_value(test_row, field_mappings.ground_truth, "GROUND_TRUTH")

    if not user_query:
        print(f"\n⚠️  NO USER QUERY FOUND - SKIPPING TEST CASE")
        return {
            "test_index": test_index + 1,
            "user_query": "",
            "status": "skipped",
            "reason": "No query field mapped",
            "score": 0.0
        }

    print(f"\n📝 Query: {user_query}")

    # Query the agent
    agent_result = await query_agent(user_query, f"eval_{test_index:03d}", token_counter)
    actual_response = agent_result.get("response", "")
    retrieval_context = agent_result.get("context", [])

    if "error" in agent_result:
        return {
            "test_index": test_index + 1,
            "user_query": user_query,
            "actual_response": str(actual_response),
            "expected_response": expected_response,
            "context": retrieval_context,
            "status": "error",
            "error": agent_result["error"],
            "score": 0.0
        }

    # Create test case (without retrieval_context since we don't have it)
    test_case = LLMTestCase(
        input=user_query,
        actual_output=str(actual_response),
        expected_output=expected_response if expected_response else None
    )

    print(f"\n📊 Selected Metrics: {selected_metrics}")
    metric_scores = {}

    for metric_key in selected_metrics:
        if metric_key == "custom":
            continue

        try:
            if evaluation_model is None:
                print(f"   ❌ Azure OpenAI model not initialized")
                continue

            print(f"   🔍 Measuring {metric_key}...")

            # Initialize metric based on type
            if metric_key == "relevance":
                metric_instance = AnswerRelevancyMetric(
                    model=evaluation_model,
                    threshold=0.7
                )
                metric_name = "Relevance"

            elif metric_key == "toxicity":
                metric_instance = ToxicityMetric(
                    model=evaluation_model,
                    threshold=0.5
                )
                metric_name = "Toxicity"

            elif metric_key == "correctness":
                # GEval for correctness - compares actual vs expected
                metric_instance = GEval(
                    name="Correctness",
                    criteria="Determine whether the actual output is factually correct compared to the expected output.",
                    evaluation_params=[
                        LLMTestCaseParams.ACTUAL_OUTPUT,
                        LLMTestCaseParams.EXPECTED_OUTPUT
                    ],
                    model=evaluation_model,
                    threshold=0.7
                )
                metric_name = "Correctness"

            elif metric_key == "completeness":
                # GEval for completeness
                metric_instance = GEval(
                    name="Completeness",
                    criteria="Determine whether the actual output completely addresses all aspects of the input query and matches the expected output's completeness.",
                    evaluation_params=[
                        LLMTestCaseParams.INPUT,
                        LLMTestCaseParams.ACTUAL_OUTPUT,
                        LLMTestCaseParams.EXPECTED_OUTPUT
                    ],
                    model=evaluation_model,
                    threshold=0.7
                ) 
                metric_name = "Completeness"

            else:
                print(f"   ⚠️ Unknown metric: {metric_key}")
                continue

            # Measure the metric
            await asyncio.to_thread(metric_instance.measure, test_case)
            score = metric_instance.score
            metric_scores[metric_name] = score
            print(f"   ✅ {metric_key}: {score:.3f}")

        except Exception as e:
            print(f"   ❌ Error measuring {metric_key}: {str(e)}")
            import traceback
            traceback.print_exc()
            # Don't add failed metrics to scores
            continue

    # Calculate overall score
    if metric_scores:
        # Toxicity is inverted (lower is better)
        inverted_metrics = ["Toxicity"]
        adjusted_scores = []

        for metric_name, score in metric_scores.items():
            if metric_name in inverted_metrics:
                adjusted_scores.append(1.0 - score)
            else:
                adjusted_scores.append(score)

        overall_score = sum(adjusted_scores) / len(adjusted_scores)
    else:
        overall_score = 0.0

    passed = overall_score >= 0.7

    print(f"\n🎯 Overall Score: {overall_score:.3f}")

    # Print cumulative token usage after each test case
    if token_counter:
        print(f"📊 Cumulative Token Usage: {token_counter.total_tokens:,} tokens")
        print(f"   - Agent: {token_counter.breakdown['agent_tokens']:,} ({token_counter.breakdown['agent_calls']} calls)")
        print(f"   - Evaluation: {token_counter.breakdown['evaluation_tokens']:,} ({token_counter.breakdown['evaluation_calls']} calls)")

    print(f"{'='*70}\n")

    return {
        "test_index": test_index + 1,
        "user_query": user_query,
        "actual_response": str(actual_response),
        "expected_response": expected_response,
        "context": retrieval_context,
        "status": "completed",
        "score": overall_score,
        "metric_scores": metric_scores,
        "passed": passed
    }

@app.post("/api/run-evaluation", response_model=EvaluationResponse)
async def run_evaluation(request: EvaluationRequest):
    """Main evaluation endpoint"""
    print("\n" + "="*70)
    print("🚀 STARTING EVALUATION")
    print("="*70)
    print(f"Evaluation: {request.evaluationName}")
    print(f"Dataset: {request.dataset['name']}")
    print(f"Test Cases: {len(request.dataset['data'])}")
    print(f"Metrics: {', '.join(request.criteriaData.selectedMetrics)}")
    print("="*70 + "\n")

    # Initialize token counter and set it on the evaluation model
    token_counter = TokenCounter()
    if evaluation_model:
        evaluation_model.set_token_counter(token_counter)

    test_results = []

    for idx, test_row in enumerate(request.dataset['data']):
        result = await evaluate_single_test(
            test_row=test_row,
            field_mappings=request.fieldMappings,
            selected_metrics=request.criteriaData.selectedMetrics,
            test_index=idx,
            token_counter=token_counter
        )
        test_results.append(result)

    completed_tests = [r for r in test_results if r.get("status") == "completed"]
    total_tests = len(test_results)

    if completed_tests:
        overall_score = sum(r["score"] for r in completed_tests) / len(completed_tests)
    else:
        overall_score = 0.0

    print("\n" + "="*70)
    print("✅ EVALUATION COMPLETE")
    print("="*70)
    print(f"Total: {total_tests}")
    print(f"Completed: {len(completed_tests)}")
    print(f"Overall Score: {overall_score:.3f}")
    passed_count = sum(1 for r in completed_tests if r.get('passed', False))
    print(f"Pass Rate: {passed_count}/{len(completed_tests) if completed_tests else 0}")
    print("="*70 + "\n")

    # Print and get token usage summary
    token_counter.print_summary(request.evaluationName)
    token_summary = token_counter.get_summary()

    return EvaluationResponse(
        evaluationName=request.evaluationName,
        totalTests=total_tests,
        completedTests=len(completed_tests),
        overallScore=overall_score,
        testResults=test_results,
        timestamp=datetime.now().isoformat(),
        tokenUsage=token_summary
    )

@app.get("/api/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "service": "Evaluation Workflow Backend",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/available-metrics")
async def get_available_metrics():
    """Available metrics - updated to only include metrics that work without retrieval context"""
    return {
        "metrics": [
            {
                "id": "relevance",
                "name": "Answer Relevancy",
                "description": "Measures how relevant the answer is to the question",
                "available": True
            },
            {
                "id": "correctness",
                "name": "Correctness",
                "description": "Compares actual output with expected output for factual accuracy",
                "available": True
            },
            {
                "id": "completeness",
                "name": "Completeness",
                "description": "Evaluates if the answer fully addresses the query",
                "available": True
            },
            {
                "id": "toxicity",
                "name": "Toxicity (Lower is Better)",
                "description": "Detects harmful or toxic content - low scores indicate safe responses",
                "available": True
            }
        ]
    }

@app.get("/api/test-azure-openai")
async def test_azure_openai():
    """Test Azure OpenAI connection"""
    if evaluation_model is None:
        return {
            "status": "error",
            "message": "Azure OpenAI model not initialized"
        }

    try:
        test_case = LLMTestCase(
            input="What is 2+2?",
            actual_output="4",
            expected_output="4"
        )

        metric = AnswerRelevancyMetric(model=evaluation_model, threshold=0.5)
        await asyncio.to_thread(metric.measure, test_case)

        return {
            "status": "success",
            "message": "Azure OpenAI working!",
            "test_score": metric.score,
            "model_name": model_name
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }

# ==============================================================================
# TEST CASE GENERATION ENDPOINTS
# ==============================================================================

@app.post("/api/generate-test-cases")
async def generate_test_cases(
    datasetName: str = File(...),
    modelName: str = File(...),
    numTestCases: int = File(...),
    customPrompt: str = File(default=""),
    kbFiles: List[UploadFile] = File(default=[])
):
    """Generate test cases using LLM based on KB files"""

    print("\n" + "="*70)
    print("🚀 TEST CASE GENERATION REQUEST")
    print("="*70)
    print(f"Dataset Name: {datasetName}")
    print(f"Model: {modelName}")
    print(f"Number of Cases: {numTestCases}")
    print(f"Custom Prompt: {customPrompt[:100]}..." if len(customPrompt) > 100 else f"Custom Prompt: {customPrompt}")
    print(f"KB Files: {len(kbFiles)}")
    print("="*70 + "\n")

    try:
        # Initialize token counter for test generation
        token_counter = TokenCounter()
        if evaluation_model:
            evaluation_model.set_token_counter(token_counter)
            print("✅ Token tracking enabled for test generation\n")

        # Parse KB files
        kb_content = ""
        if kbFiles and len(kbFiles) > 0:
            kb_content = await parse_kb_files(kbFiles)
            print(f"📚 Total KB content length: {len(kb_content)} characters\n")
        else:
            print("⚠️ No KB files provided - generating generic test cases\n")

        # Generate test cases
        test_cases = await generate_test_cases_with_llm(
            kb_content=kb_content,
            num_test_cases=int(numTestCases),
            custom_prompt=customPrompt,
            model_name=modelName,
            evaluation_model=evaluation_model,
            token_counter=token_counter
        )

        # Print token usage summary
        token_counter.print_summary("Test Case Generation")
        token_summary = token_counter.get_summary()

        # Format response
        response_data = {
            "datasetName": datasetName,
            "version": 1,
            "createdOn": datetime.now().strftime("%Y-%m-%d"),
            "totalCases": len(test_cases),
            "data": test_cases,
            "tokenUsage": token_summary
        }

        print(f"\n{'='*70}")
        print(f"✅ GENERATION REQUEST COMPLETE")
        print(f"{'='*70}\n")

        return response_data

    except Exception as e:
        print(f"\n❌ Error generating test cases: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating test cases: {str(e)}")

@app.post("/api/download-dataset")
async def download_dataset(dataset: Dict[str, Any]):
    """Download dataset as CSV file"""

    try:
        # Create CSV in memory
        output = io.StringIO()
        if not dataset.get('data') or len(dataset['data']) == 0:
            raise HTTPException(status_code=400, detail="No data to download")

        # Get field names from first row
        fieldnames = list(dataset['data'][0].keys())
        writer = csv.DictWriter(output, fieldnames=fieldnames)

        writer.writeheader()
        for row in dataset['data']:
            writer.writerow(row)

        # Convert to bytes
        csv_content = output.getvalue()
        output.close()

        # Create response
        filename = f"{dataset.get('datasetName', 'dataset')}.csv"
        return StreamingResponse(
            io.BytesIO(csv_content.encode('utf-8')),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )

    except Exception as e:
        print(f"❌ Error downloading dataset: {e}")
        raise HTTPException(status_code=500, detail=f"Error downloading dataset: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Evaluation Backend Server...")
    print("📍 http://localhost:8001")
    print("📖 Docs: http://localhost:8001/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8001)