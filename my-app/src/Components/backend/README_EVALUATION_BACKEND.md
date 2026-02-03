# Evaluation Backend - README

## Overview

This is the backend service for the AI Evaluation Workflow. It receives evaluation configurations from the frontend, runs test cases against an AI agent, and evaluates responses using DeepEval metrics.

## Files

- **evaluation_backend.py** - New backend for the evaluation workflow (USE THIS)
-
- **requirements.txt** - Python dependencies
- **.env** - Environment variables for Azure OpenAI configuration

## Setup

### 1. Install Dependencies

```bash
cd src/Components/backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Edit the `.env` file with your Azure OpenAI credentials:

```env
AZURE_OPENAI_MODEL_NAME=gpt-4
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_KEY=your-actual-api-key
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
```

### 3. Run the Server

```bash
python evaluation_backend.py
```

The server will start on `http://localhost:8001`

## API Endpoints

### 1. Health Check
```
GET /api/health
```

Returns server health status.

**Response:**
```json
{
  "status": "healthy",
  "service": "Evaluation Workflow Backend",
  "timestamp": "2025-12-08T10:30:00"
}
```

### 2. Available Metrics
```
GET /api/available-metrics
```

Returns list of available evaluation metrics.

**Response:**
```json
{
  "metrics": [
    {
      "id": "hallucination",
      "name": "Hallucination Detection",
      "available": true
    },
    {
      "id": "faithfulness",
      "name": "Faithfulness",
      "available": true
    },
    ...
  ]
}
```

### 3. Run Evaluation
```
POST /api/run-evaluation
```

Main endpoint to run evaluation workflow.

**Request Body:**
```json
{
  "evaluationName": "Production Test - Dec 8",
  "dataset": {
    "name": "test_dataset",
    "version": 1,
    "data": [
      {
        "id": 1,
        "user_query": "What is AI?",
        "expected_response": "AI stands for...",
        "metadata": {}
      }
    ]
  },
  "fieldMappings": {
    "query": "{{item.user_query}}",
    "response": "{{item.expected_response}}",
    "context": "not_available",
    "ground_truth": "{{item.expected_response}}",
    "tool_calls": "not_available",
    "tool_definitions": "not_available"
  },
  "judgeModel": "evaluator-gpt-4o",
  "criteriaData": {
    "selectedMetrics": ["faithfulness", "relevance", "hallucination"],
    "customPrompt": null,
    "modelUnderTest": "gpt-4",
    "temperature": 0.7
  }
}
```

**Response:**
```json
{
  "evaluationName": "Production Test - Dec 8",
  "totalTests": 10,
  "completedTests": 10,
  "overallScore": 0.85,
  "testResults": [
    {
      "test_index": 1,
      "user_query": "What is AI?",
      "actual_response": "AI stands for...",
      "expected_response": "AI stands for...",
      "context": ["..."],
      "status": "completed",
      "score": 0.85,
      "metric_scores": {
        "Faithfulness": 0.9,
        "Relevance": 0.8
      },
      "passed": true
    }
  ],
  "timestamp": "2025-12-08T10:30:00"
}
```

## How It Works

### Evaluation Flow

1. **Receive Configuration** - Frontend sends complete evaluation config
2. **Process Each Test Case**:
   - Extract user query using field mapping
   - Call agent endpoint with the query
   - Receive agent response and context
   - Create DeepEval test case
   - Run selected metrics
   - Calculate scores
3. **Aggregate Results** - Calculate overall scores and statistics
4. **Print to Terminal** - Display detailed results in console
5. **Return to Frontend** - Send results back to frontend

### Agent Integration

The backend calls this agent endpoint for each test case:

```
POST https://inextlabs-demo-sales-bot-pf-as.azurewebsites.net/score
```

**Payload:**
```json
{
  "question": "user query here",
  "conversation_id": "eval_001",
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
```

### Supported Metrics

| Metric | DeepEval Class | Status |
|--------|---------------|--------|
| Hallucination Detection | HallucinationMetric | ✅ Available |
| Faithfulness | FaithfulnessMetric | ✅ Available |
| Relevance | AnswerRelevancyMetric | ✅ Available |
| Toxicity | ToxicityMetric | ✅ Available |
| Bias | BiasMetric | ✅ Available |
| Semantic Similarity | - | ❌ Not in DeepEval |
| Answer Correctness | - | ⚠️ Using Relevance as proxy |
| Custom Evaluation | - | 🚧 Coming soon |

### Terminal Output

The backend prints detailed evaluation progress to terminal:

```
======================================================================
🚀 STARTING EVALUATION
======================================================================
Evaluation Name: Production Test - Dec 8
Dataset: test_dataset
Test Cases: 10
Judge Model: evaluator-gpt-4o
Selected Metrics: faithfulness, relevance, hallucination
======================================================================

======================================================================
🧪 Test Case #1
======================================================================
📝 Query: What is AI?
🤖 Querying agent...
✅ Agent Response: AI stands for Artificial Intelligence...
📚 Retrieved Context: 3 chunk(s)

📊 Running Evaluation Metrics:
----------------------------------------------------------------------
   🔍 Measuring Faithfulness... Score: 0.90
   🔍 Measuring Relevance... Score: 0.85
   🔍 Measuring Hallucination... Score: 0.10
----------------------------------------------------------------------
📈 Overall Score: 0.88 (88.3%)
======================================================================

...

======================================================================
✅ EVALUATION COMPLETE
======================================================================
Total Test Cases: 10
Completed: 10
Skipped/Failed: 0
Overall Score: 0.85 (85.0%)
Pass Rate: 8/10
======================================================================

======================================================================
📊 TOKEN USAGE SUMMARY - Production Test - Dec 8
======================================================================
Total API Calls: 30
Prompt Tokens: 15,432
Completion Tokens: 8,921
Total Tokens: 24,353
======================================================================
```

## Testing

### Using cURL

```bash
curl -X POST http://localhost:8001/api/run-evaluation \
  -H "Content-Type: application/json" \
  -d '{
    "evaluationName": "Test Run",
    "dataset": {
      "name": "sample_dataset",
      "version": 1,
      "data": [
        {
          "id": 1,
          "user_query": "What is AI?",
          "expected_response": "AI is Artificial Intelligence"
        }
      ]
    },
    "fieldMappings": {
      "query": "{{item.user_query}}",
      "response": "{{item.expected_response}}",
      "context": "not_available",
      "ground_truth": "{{item.expected_response}}",
      "tool_calls": "not_available",
      "tool_definitions": "not_available"
    },
    "judgeModel": "evaluator-gpt-4o",
    "criteriaData": {
      "selectedMetrics": ["faithfulness", "relevance"],
      "customPrompt": null,
      "modelUnderTest": "gpt-4",
      "temperature": 0.7
    }
  }'
```

### Using the Frontend

1. Start the backend: `python evaluation_backend.py`
2. Start the frontend: `npm start`
3. Complete the 4-step evaluation workflow
4. Click "Run Evaluation" in Step 4
5. Check the backend terminal for detailed results

## Troubleshooting

### Common Issues

**1. Import Error: deepeval metrics not found**
- Solution: `pip install deepeval --upgrade`

**2. Azure OpenAI Authentication Error**
- Check `.env` file has correct credentials
- Verify API key is valid
- Ensure endpoint URL is correct

**3. Agent Timeout**
- The agent endpoint has a 120-second timeout
- If tests are timing out, check agent availability

**4. Context Not Retrieved**
- Check agent response format
- Verify agent returns context field
- May need to adjust context extraction logic

## Development Notes

- The backend runs on port **8001** (frontend on 3000)
- CORS is enabled for all origins (for development)
- Results are printed to terminal for debugging
- Token usage is tracked and displayed after evaluation
- Each test case gets a unique conversation_id (eval_001, eval_002, etc.)

## Next Steps

- [ ] Implement custom metric evaluation
- [ ] Add semantic similarity metric
- [ ] Create evaluation results UI
- [ ] Add retry logic for failed tests
- [ ] Implement evaluation result storage
- [ ] Add export to Excel/CSV functionality

## Support

For issues or questions, check:
- FastAPI docs: http://localhost:8001/docs
- DeepEval documentation: https://docs.confident-ai.com/
- Azure OpenAI docs: https://learn.microsoft.com/en-us/azure/ai-services/openai/
