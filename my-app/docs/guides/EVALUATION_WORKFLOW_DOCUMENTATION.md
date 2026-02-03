# 📚 Evaluation Workflow System - Complete Documentation

**Version:** 1.0
**Last Updated:** December 12, 2025

---

## 🎯 What is This System?

The **Evaluation Workflow System** is an automated testing platform that evaluates AI chatbot responses against predefined quality standards. Think of it as a "quality control system" for AI conversations.

### Simple Analogy
Imagine you run a customer service team. Instead of manually checking every conversation, this system automatically:
- Asks questions to your AI chatbot
- Compares answers against expected responses
- Scores the quality of each answer
- Tracks how many "tokens" (cost units) were used

---

## 🌟 Key Features

### 1. **Automated Test Case Generation**
- Upload knowledge base documents (PDF, TXT, Markdown)
- AI generates realistic test questions and expected answers
- Customizable number of test cases

### 2. **Multiple Evaluation Metrics**
- **Relevance**: Is the answer related to the question?
- **Correctness**: Is the answer factually accurate?
- **Completeness**: Does it fully address the question?
- **Toxicity**: Is the content safe and appropriate?

### 3. **Real-Time Token Usage Tracking**
- Tracks API costs for every operation
- Separates costs between agent queries and evaluation
- Shows cumulative usage during execution

### 4. **Comprehensive Reporting**
- Test pass/fail rates
- Individual metric scores
- Overall evaluation scores
- Detailed token usage reports

---

## 🛠️ Technology Stack

### **Frontend**
- **React.js** - User interface framework
- **JavaScript** - Programming language
- **CSS** - Styling

### **Backend**
- **Python 3.x** - Programming language
- **FastAPI** - Web framework for APIs
- **Uvicorn** - Web server

### **AI/ML Components**
- **Azure OpenAI** - Language model for evaluations
- **DeepEval** - Evaluation metrics library
- **AsyncAzureOpenAI** - Azure OpenAI Python client

### **Libraries & Dependencies**
- **httpx** - HTTP client for async requests
- **python-dotenv** - Environment variable management
- **PyPDF2** - PDF file parsing
- **Pydantic** - Data validation

---

## 🔄 Complete Workflow

### **Flow 1: Test Case Generation**

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTIONS                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ├─ 1. Upload Knowledge Base Files (PDF/TXT/MD)
                          ├─ 2. Specify number of test cases (e.g., 10)
                          ├─ 3. Provide custom instructions (optional)
                          └─ 4. Click "Generate"
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND PROCESSING                         │
├─────────────────────────────────────────────────────────┤
│  Step 1: Parse uploaded files                           │
│    → Extract text from PDFs, TXT, Markdown              │
│    → Combine all content                                │
│                                                          │
│  Step 2: Chunk content (if too large)                   │
│    → Split into manageable pieces (~4000 chars)         │
│                                                          │
│  Step 3: Generate test cases in batches                 │
│    → For 10 cases: Create 2 batches of 5               │
│    → Each batch calls Azure OpenAI                      │
│    → Track tokens used per batch                        │
│                                                          │
│  Step 4: Format output                                  │
│    → user_query: The test question                      │
│    → expected_response: Correct answer                  │
│    → category: Topic classification                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  RESULT RETURNED                        │
├─────────────────────────────────────────────────────────┤
│  ✓ Generated test cases                                 │
│  ✓ Token usage report                                   │
│  ✓ CSV download option                                  │
└─────────────────────────────────────────────────────────┘
```

#### **API Calls in Generation Flow:**
- **Batch 1**: 1 Azure OpenAI call (generates 5 cases)
- **Batch 2**: 1 Azure OpenAI call (generates 5 cases)
- **Total**: 2 API calls for 10 test cases

---

### **Flow 2: Running Evaluations**

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTIONS                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ├─ 1. Select/upload dataset
                          ├─ 2. Map fields (query, response, ground_truth)
                          ├─ 3. Choose metrics to evaluate
                          └─ 4. Click "Run Evaluation"
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│         FOR EACH TEST CASE (Loop Process)               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │  STEP 1: Query the Agent                   │        │
│  ├────────────────────────────────────────────┤        │
│  │  • Send test question to agent API         │        │
│  │  • Agent endpoint:                          │        │
│  │    inextlabs-demo-sales-bot-pf-as.         │        │
│  │    azurewebsites.net/score                 │        │
│  │  • Get actual response                      │        │
│  │  • Extract context (if available)           │        │
│  │  • Try to track agent tokens                │        │
│  │                                             │        │
│  │  API Calls: 1                               │        │
│  └────────────────────────────────────────────┘        │
│                          │                               │
│                          ▼                               │
│  ┌────────────────────────────────────────────┐        │
│  │  STEP 2: Evaluate with Metrics              │        │
│  ├────────────────────────────────────────────┤        │
│  │                                             │        │
│  │  A) Answer Relevancy Metric                │        │
│  │     • Extracts key statements (1-2 calls)  │        │
│  │     • Evaluates each statement (1-2 calls) │        │
│  │     • Calculates relevancy score            │        │
│  │     API Calls: 3-4                          │        │
│  │                                             │        │
│  │  B) Toxicity Metric                        │        │
│  │     • Evaluates toxic opinions (1 call)    │        │
│  │     • Classifies toxicity (1 call)         │        │
│  │     • Returns safety score                  │        │
│  │     API Calls: 1-2                          │        │
│  │                                             │        │
│  │  C) Correctness Metric (GEval)             │        │
│  │     • Compares actual vs expected (1 call) │        │
│  │     • Returns accuracy score                │        │
│  │     API Calls: 1                            │        │
│  │                                             │        │
│  │  D) Completeness Metric (GEval)            │        │
│  │     • Checks if fully answered (1 call)    │        │
│  │     • Returns completeness score            │        │
│  │     API Calls: 1                            │        │
│  │                                             │        │
│  └────────────────────────────────────────────┘        │
│                          │                               │
│                          ▼                               │
│  ┌────────────────────────────────────────────┐        │
│  │  STEP 3: Calculate Overall Score            │        │
│  ├────────────────────────────────────────────┤        │
│  │  • Average all metric scores                │        │
│  │  • Invert toxicity (lower is better)        │        │
│  │  • Determine pass/fail (>= 0.7 = pass)     │        │
│  │  • Print cumulative token usage             │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│               FINAL RESULTS                             │
├─────────────────────────────────────────────────────────┤
│  • Total tests completed                                │
│  • Overall average score                                │
│  • Pass/fail rate                                       │
│  • Detailed results per test case                       │
│  • Complete token usage breakdown                       │
└─────────────────────────────────────────────────────────┘
```

#### **API Calls Per Test Case (4 metrics):**
- **1 Agent call**: Query the chatbot
- **3-4 calls**: Answer Relevancy
- **1-2 calls**: Toxicity
- **1 call**: Correctness
- **1 call**: Completeness
- **Total**: ~7-9 API calls per test case

---

## 📊 Evaluation Metrics Explained

### 1. **Answer Relevancy** 🎯
**What it measures:** How relevant the answer is to the question asked.

**Example:**
- **Question:** "What is your return policy?"
- **Good Answer:** "We offer 30-day returns on all items..."
- **Score:** 0.9 (highly relevant)
- **Bad Answer:** "Thank you for contacting us!"
- **Score:** 0.2 (not relevant)

**How it works:**
1. Extracts key statements from the answer
2. Checks if each statement relates to the question
3. Calculates average relevancy

**Scoring:** 0.0 (not relevant) to 1.0 (perfectly relevant)

---

### 2. **Correctness** ✅
**What it measures:** Whether the answer is factually accurate compared to expected response.

**Example:**
- **Question:** "What's the warranty period?"
- **Expected:** "2-year warranty"
- **Actual:** "We provide a 2-year manufacturer warranty"
- **Score:** 0.95 (correct information)
- **Actual:** "1-year warranty"
- **Score:** 0.3 (incorrect information)

**How it works:**
- Compares actual output with expected output
- Uses LLM to judge factual accuracy

**Scoring:** 0.0 (completely wrong) to 1.0 (completely correct)

---

### 3. **Completeness** 📋
**What it measures:** Whether the answer fully addresses all aspects of the question.

**Example:**
- **Question:** "What payment methods do you accept?"
- **Complete Answer:** "We accept credit cards, PayPal, bank transfer, and Apple Pay"
- **Score:** 0.9 (comprehensive)
- **Incomplete Answer:** "We accept credit cards"
- **Score:** 0.4 (missing other methods)

**How it works:**
- Analyzes if all parts of the question are addressed
- Compares against expected completeness level

**Scoring:** 0.0 (incomplete) to 1.0 (fully complete)

---

### 4. **Toxicity** ⚠️
**What it measures:** Detects harmful, offensive, or inappropriate content.

**Example:**
- **Safe Response:** "I'd be happy to help you with that"
- **Score:** 0.05 (very safe)
- **Toxic Response:** "That's a stupid question"
- **Score:** 0.85 (highly toxic)

**How it works:**
- Analyzes language for offensive content
- Checks for discriminatory or harmful language
- Evaluates tone and appropriateness

**Scoring:** 0.0 (completely safe) to 1.0 (highly toxic)
**Note:** Lower is better! Target: < 0.5

---

## 💰 Token Usage Tracking

### What are Tokens?
Tokens are units of text processed by AI models. Generally:
- **1 token** ≈ 4 characters
- **1 token** ≈ 0.75 words
- Example: "Hello, how are you?" = ~5 tokens

### Why Track Tokens?
- **Cost Management**: API calls are billed per token
- **Performance Monitoring**: High token usage = more expensive
- **Optimization**: Identify where costs can be reduced

### Token Types

#### 1. **Prompt Tokens** (Input)
- Text sent TO the AI model
- Includes: Question + context + instructions

#### 2. **Completion Tokens** (Output)
- Text generated BY the AI model
- Generally more expensive than prompt tokens

#### 3. **Total Tokens**
- Prompt + Completion tokens combined

### Token Breakdown

```
┌─────────────────────────────────────────────┐
│         TOKEN USAGE BREAKDOWN               │
├─────────────────────────────────────────────┤
│                                             │
│  AGENT TOKENS                               │
│  └─ Tokens used when querying chatbot      │
│     • Only tracked if agent returns usage   │
│     • Your agent may not report this        │
│                                             │
│  EVALUATION TOKENS                          │
│  └─ Tokens used for quality assessment     │
│     ├─ Answer Relevancy: ~1,200 tokens     │
│     ├─ Toxicity: ~500 tokens               │
│     ├─ Correctness: ~600 tokens            │
│     └─ Completeness: ~650 tokens           │
│                                             │
│  TOTAL PER TEST CASE: ~3,000-5,000 tokens  │
│                                             │
└─────────────────────────────────────────────┘
```

### Token Tracking in Real-Time

The system prints token usage at multiple stages:

**During Test Generation:**
```
   ✅ Generated 5 cases (Total: 5)
   📊 Tokens used so far: 1,850 (prompt: 1,200, completion: 650)
```

**During Evaluation:**
```
   💰 Tokens: 450 (prompt: 300, completion: 150)

   📊 Cumulative Token Usage: 2,690 tokens
      - Agent: 0 (0 calls)
      - Evaluation: 2,690 (8 calls)
```

**Final Summary:**
```
📊 TOKEN USAGE SUMMARY - Evaluation Name
======================================================================
Total API Calls: 25
  - Agent Calls: 10
  - Evaluation Calls: 15

Total Tokens: 45,230
  - Prompt Tokens: 28,150
  - Completion Tokens: 17,080

Token Breakdown:
  - Agent Tokens: 12,000
  - Evaluation Tokens: 33,230
======================================================================
```

---

## 🔌 API Endpoints

### 1. **Health Check**
**Endpoint:** `GET /api/health`
**Purpose:** Verify backend is running
**Response:**
```json
{
  "status": "healthy",
  "service": "Evaluation Workflow Backend",
  "timestamp": "2025-12-12T10:30:00"
}
```

---

### 2. **Available Metrics**
**Endpoint:** `GET /api/available-metrics`
**Purpose:** Get list of evaluation metrics
**Response:**
```json
{
  "metrics": [
    {
      "id": "relevance",
      "name": "Answer Relevancy",
      "description": "Measures how relevant the answer is to the question",
      "available": true
    },
    ...
  ]
}
```

---

### 3. **Generate Test Cases**
**Endpoint:** `POST /api/generate-test-cases`
**Purpose:** Generate test cases from knowledge base
**Input:**
- `datasetName`: Name for the dataset
- `modelName`: AI model to use
- `numTestCases`: Number of cases to generate
- `customPrompt`: Optional instructions
- `kbFiles`: Uploaded files (PDF/TXT/MD)

**Response:**
```json
{
  "datasetName": "Customer Support Tests",
  "version": 1,
  "createdOn": "2025-12-12",
  "totalCases": 10,
  "data": [
    {
      "user_query": "What is your return policy?",
      "expected_response": "We offer 30-day returns...",
      "category": "Returns"
    }
  ],
  "tokenUsage": {
    "total_tokens": 3770,
    "prompt_tokens": 2450,
    "completion_tokens": 1320,
    "total_calls": 2,
    "breakdown": {
      "agent": { "calls": 0, "tokens": 0 },
      "evaluation": { "calls": 2, "tokens": 3770 }
    }
  }
}
```

---

### 4. **Run Evaluation**
**Endpoint:** `POST /api/run-evaluation`
**Purpose:** Execute evaluation on test dataset
**Input:**
```json
{
  "evaluationName": "Q4 Customer Support Eval",
  "dataset": {
    "name": "Customer Tests",
    "data": [...]
  },
  "fieldMappings": {
    "query": "user_query",
    "response": "actual_response",
    "ground_truth": "expected_response"
  },
  "judgeModel": "gpt-4",
  "criteriaData": {
    "selectedMetrics": ["relevance", "correctness", "completeness", "toxicity"],
    "modelUnderTest": "chatbot-v1",
    "temperature": 0
  }
}
```

**Response:**
```json
{
  "evaluationName": "Q4 Customer Support Eval",
  "totalTests": 10,
  "completedTests": 10,
  "overallScore": 0.87,
  "testResults": [
    {
      "test_index": 1,
      "user_query": "What is your return policy?",
      "actual_response": "We offer 30-day returns...",
      "expected_response": "30-day return policy",
      "status": "completed",
      "score": 0.92,
      "metric_scores": {
        "Relevance": 0.95,
        "Correctness": 0.98,
        "Completeness": 0.85,
        "Toxicity": 0.02
      },
      "passed": true
    }
  ],
  "timestamp": "2025-12-12T10:45:00",
  "tokenUsage": {
    "total_tokens": 45230,
    "prompt_tokens": 28150,
    "completion_tokens": 17080,
    "total_calls": 25,
    "breakdown": {
      "agent": { "calls": 10, "tokens": 12000 },
      "evaluation": { "calls": 15, "tokens": 33230 }
    }
  }
}
```

---

### 5. **Download Dataset**
**Endpoint:** `POST /api/download-dataset`
**Purpose:** Export dataset as CSV file
**Input:** Dataset object
**Response:** CSV file download

---

### 6. **Test Azure OpenAI**
**Endpoint:** `GET /api/test-azure-openai`
**Purpose:** Verify Azure OpenAI connection
**Response:**
```json
{
  "status": "success",
  "message": "Azure OpenAI working!",
  "test_score": 0.95,
  "model_name": "gpt-4"
}
```

---

## ⚙️ Configuration

### Environment Variables (`.env` file)

```env
# Azure OpenAI Configuration
AZURE_OPENAI_MODEL_NAME=gpt-4
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
```

### File Locations

```
project-root/
├── .env                           (Root or backend folder)
├── src/
│   ├── App.js                     (Frontend main component)
│   ├── Components/
│   │   └── backend/
│   │       ├── evaluation_backend.py    (Main backend)
│   │       └── test_generation.py       (Test generation logic)
```

---

## 🎮 How to Use - Step by Step

### **Scenario 1: Generate Test Cases**

1. **Prepare Knowledge Base Files**
   - Collect documents about your chatbot's domain
   - Supported formats: PDF, TXT, Markdown

2. **Open the Application**
   - Navigate to test generation section

3. **Upload Files**
   - Click "Upload" and select KB files
   - Multiple files can be uploaded

4. **Configure Generation**
   - Dataset name: "Customer Support Q4"
   - Number of cases: 20
   - Model: gpt-4
   - Custom prompt (optional): "Focus on technical questions"

5. **Generate**
   - Click "Generate Test Cases"
   - Watch terminal for progress:
     ```
     📝 Generating batch 1/4 (5 cases)...
     ✅ Generated 5 cases (Total: 5)
     📊 Tokens used so far: 1,850
     ```

6. **Review Results**
   - Check generated questions and answers
   - Edit if needed
   - Download as CSV

---

### **Scenario 2: Run Evaluation**

1. **Select Dataset**
   - Choose existing dataset or upload CSV
   - Ensure columns match required fields

2. **Map Fields**
   - Query field → "user_query"
   - Response field → "actual_response"
   - Ground truth → "expected_response"

3. **Choose Metrics**
   - ☑ Answer Relevancy
   - ☑ Correctness
   - ☑ Completeness
   - ☑ Toxicity

4. **Configure Evaluation**
   - Evaluation name: "Q4 Performance Test"
   - Judge model: gpt-4
   - Model under test: "chatbot-v2"

5. **Run Evaluation**
   - Click "Run Evaluation"
   - Monitor progress in terminal:
     ```
     🧪 TEST CASE #1
     🔍 Measuring relevance...
     💰 Tokens: 450
     ✅ relevance: 0.850
     ```

6. **Review Results**
   - Overall score: 0.87
   - Pass rate: 8/10
   - Failed tests: Review individually
   - Token usage: 45,230 tokens

---

## 🔍 Understanding Results

### Test Case Result

```json
{
  "test_index": 1,
  "user_query": "What is your return policy?",
  "actual_response": "We offer 30-day returns on unopened items with receipt",
  "expected_response": "30-day return policy for unused items",
  "status": "completed",
  "score": 0.92,                    // Overall score (0-1)
  "metric_scores": {
    "Relevance": 0.95,              // Highly relevant
    "Correctness": 0.98,            // Factually accurate
    "Completeness": 0.85,           // Mostly complete
    "Toxicity": 0.02                // Very safe (low is good)
  },
  "passed": true                     // >= 0.7 = pass
}
```

### Interpreting Scores

| Score Range | Meaning | Action |
|-------------|---------|--------|
| 0.90 - 1.00 | Excellent | No action needed |
| 0.70 - 0.89 | Good | Monitor for consistency |
| 0.50 - 0.69 | Fair | Review and improve |
| 0.00 - 0.49 | Poor | Immediate attention required |

---

## 🚨 Troubleshooting

### Issue: "Agent did not return token usage information"

**Symptom:** Terminal shows warning, agent tokens = 0

**Cause:** Your agent API doesn't return token usage

**Solution:**
- Check if agent endpoint supports token reporting
- Add token usage to agent API response
- Or accept that agent tokens won't be tracked

---

### Issue: "Azure OpenAI model not initialized"

**Symptom:** Evaluations fail immediately

**Cause:** Missing or incorrect environment variables

**Solution:**
1. Check `.env` file exists
2. Verify all required variables are set:
   - AZURE_OPENAI_API_KEY
   - AZURE_OPENAI_ENDPOINT
   - AZURE_OPENAI_DEPLOYMENT_NAME
3. Restart backend server

---

### Issue: High token usage

**Symptom:** Token counts are higher than expected

**Explanation:**
- Each metric makes multiple API calls
- AnswerRelevancy alone makes 3-4 calls per test
- With 4 metrics: ~8 evaluation calls per test

**Solutions:**
- Use fewer metrics (affects quality assessment)
- Reduce test case count
- Use smaller/cheaper models for non-critical evaluations

---

## 📈 Best Practices

### Test Case Generation
1. **Use quality KB documents** - Better input = better test cases
2. **Start small** - Generate 5-10 cases first, review, then scale up
3. **Provide custom prompts** - Guide the AI for better relevance
4. **Review before using** - AI-generated cases may need manual refinement

### Running Evaluations
1. **Choose relevant metrics** - Don't use all metrics if not needed
2. **Set realistic thresholds** - 0.7 is good for most cases
3. **Monitor token usage** - Track costs in real-time
4. **Analyze failures** - Learn from low-scoring tests

### Cost Optimization
1. **Batch evaluations** - Run multiple tests together
2. **Reuse test datasets** - Don't regenerate unnecessarily
3. **Use appropriate models** - GPT-3.5 for simple, GPT-4 for complex
4. **Cache results** - Store evaluation results to avoid re-running

---

## 📞 Support & Resources

### File Locations
- **Backend:** `src/Components/backend/evaluation_backend.py`
- **Test Generation:** `src/Components/backend/test_generation.py`
- **Frontend:** `src/App.js`
- **Configuration:** `.env` (root or backend folder)

### Running the System

**Backend:**
```bash
cd src/Components/backend
python evaluation_backend.py
# Server starts at http://localhost:8001
```

**Frontend:**
```bash
cd my-app
npm start
# App opens at http://localhost:3000
```

### Key Dependencies
```bash
# Python dependencies
pip install fastapi uvicorn deepeval openai httpx python-dotenv PyPDF2

# Node dependencies
npm install react
```

---

## 🎓 Glossary

**Agent** - Your AI chatbot being tested

**DeepEval** - Library providing evaluation metrics

**GEval** - General evaluation metric using LLM as judge

**Ground Truth** - The correct/expected answer

**Judge Model** - AI model evaluating responses (e.g., GPT-4)

**KB (Knowledge Base)** - Documents containing information about your domain

**Metric** - Measurement criteria (relevance, correctness, etc.)

**Model Under Test** - The chatbot version being evaluated

**Prompt Tokens** - Input text sent to AI

**Completion Tokens** - Output text generated by AI

**Test Case** - A single question-answer pair for evaluation

**Threshold** - Minimum score required to pass (default: 0.7)

**Token Counter** - System tracking API usage and costs

---

## 📝 Summary

This evaluation system provides:
- ✅ Automated test case generation from documents
- ✅ Multiple quality metrics for comprehensive assessment
- ✅ Real-time token tracking for cost management
- ✅ Detailed reporting and analytics
- ✅ CSV export capabilities
- ✅ RESTful API for integration

**Key Metrics:** Relevance, Correctness, Completeness, Toxicity
**Tech Stack:** Python + FastAPI + React + Azure OpenAI + DeepEval
**Cost Tracking:** Complete token usage monitoring
**Output:** Detailed test results with pass/fail rates

---

**End of Documentation**
