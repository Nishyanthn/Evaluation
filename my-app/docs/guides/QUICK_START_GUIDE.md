# Quick Start Guide - AI Evaluation Workflow

## Overview

This guide will help you set up and run the complete AI Evaluation Workflow, including both frontend and backend.

## Architecture

```
Frontend (React)          Backend (FastAPI)              Agent API
Port: 3000          →     Port: 8001              →      Azure Endpoint

1. User configures      2. Runs evaluation         3. Queries agent
   evaluation              with DeepEval              for each test
2. Submits to              metrics                     case
   backend              3. Returns results
```

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- Azure OpenAI API credentials

## Setup Steps

### 1. Frontend Setup

```bash
# Navigate to project root
cd my-app

# Install dependencies
npm install

# Start frontend
npm start
```

Frontend will be available at: **http://localhost:3000**

### 2. Backend Setup

```bash
# Navigate to backend folder
cd src/Components/backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Edit .env file with your Azure OpenAI credentials
```

**Edit `.env` file:**
```env
AZURE_OPENAI_MODEL_NAME=gpt-4
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_KEY=your-actual-api-key
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
```

```bash
# Start backend
python evaluation_backend.py
```

Backend will be available at: **http://localhost:8001**

## Running an Evaluation

### Option 1: Using the Frontend (Recommended)

1. **Start Both Servers**
   - Terminal 1: `npm start` (frontend)
   - Terminal 2: `python evaluation_backend.py` (backend)

2. **Navigate to http://localhost:3000**

3. **Step 1: Test Case Generation**
   - Click "Upload New Dataset"
   - Upload a CSV/JSON file with test cases
   - Required columns: `user_query`, `expected_response`
   - Select the uploaded dataset
   - Click **Next**

4. **Step 2: Field Mapping**
   - Review auto-detected field mappings
   - Select judge model (e.g., evaluator-gpt-4o)
   - Click **Next**

5. **Step 3: Criteria**
   - Select evaluation metrics (e.g., Faithfulness, Relevance, Hallucination)
   - Configure model settings
   - Click **Next**

6. **Step 4: Review**
   - Review all configuration
   - Enter evaluation name
   - Click **Run Evaluation**
   - Wait for completion
   - Check backend terminal for detailed results

### Option 2: Using Test Script

```bash
# Make sure backend is running first
cd src/Components/backend
python test_evaluation.py
```

### Option 3: Using cURL

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

## Sample Test Data

Create a CSV file `test_cases.csv`:

```csv
id,user_query,expected_response
1,What is artificial intelligence?,Artificial Intelligence is the simulation of human intelligence in machines.
2,What are machine learning benefits?,Machine learning provides automation and improved decision making.
3,Explain neural networks,Neural networks are computing systems inspired by biological neural networks.
```

Or JSON file `test_cases.json`:

```json
[
  {
    "id": 1,
    "user_query": "What is artificial intelligence?",
    "expected_response": "Artificial Intelligence is the simulation of human intelligence in machines."
  },
  {
    "id": 2,
    "user_query": "What are machine learning benefits?",
    "expected_response": "Machine learning provides automation and improved decision making."
  }
]
```

## Understanding the Results

### Backend Terminal Output

The backend will print detailed results:

```
======================================================================
🚀 STARTING EVALUATION
======================================================================
Evaluation Name: My Test Run
Dataset: test_cases
Test Cases: 3
Selected Metrics: faithfulness, relevance
======================================================================

======================================================================
🧪 Test Case #1
======================================================================
📝 Query: What is artificial intelligence?
🤖 Querying agent...
✅ Agent Response: AI is the simulation of human intelligence...
📚 Retrieved Context: 2 chunk(s)

📊 Running Evaluation Metrics:
----------------------------------------------------------------------
   🔍 Measuring Faithfulness... Score: 0.90
   🔍 Measuring Relevance... Score: 0.85
----------------------------------------------------------------------
📈 Overall Score: 0.88 (87.5%)
======================================================================

... (more test cases)

======================================================================
✅ EVALUATION COMPLETE
======================================================================
Total Test Cases: 3
Completed: 3
Overall Score: 0.85 (85.0%)
Pass Rate: 2/3
======================================================================

======================================================================
📊 TOKEN USAGE SUMMARY
======================================================================
Total API Calls: 6
Prompt Tokens: 3,234
Completion Tokens: 1,892
Total Tokens: 5,126
======================================================================
```

### Frontend Alert

After completion, you'll see an alert with:
- Total tests
- Completed tests
- Overall score percentage
- Message to check backend terminal

## Troubleshooting

### Frontend Issues

**Port 3000 already in use:**
```bash
# Kill process on port 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill
```

**Dataset upload not working:**
- Check file format (CSV, JSON, JSONL, XLSX)
- Ensure required columns exist
- Check browser console for errors

### Backend Issues

**Cannot import deepeval:**
```bash
pip install deepeval --upgrade
```

**Azure OpenAI authentication error:**
- Verify `.env` file credentials
- Check API key validity
- Ensure endpoint URL is correct

**Agent timeout:**
- Agent has 120-second timeout
- Check agent endpoint availability
- Verify network connection

**CORS errors:**
- Ensure backend is running on port 8001
- Check CORS middleware configuration

### Common Errors

**"Cannot connect to backend server"**
- Make sure backend is running: `python evaluation_backend.py`
- Check if port 8001 is available
- Verify backend URL in frontend code

**"No context retrieved"**
- Agent may not be returning context
- Check agent response format
- May need to adjust context extraction logic

**Metrics failing:**
- Check Azure OpenAI quota
- Verify model deployment name
- Check token limits

## API Documentation

Once the backend is running, visit:
**http://localhost:8001/docs**

This provides interactive API documentation with:
- All available endpoints
- Request/response schemas
- Try-it-out functionality

## Next Steps

1. ✅ Test with sample data
2. ✅ Verify metrics are working
3. ✅ Check terminal output
4. 🚧 Create results visualization UI
5. 🚧 Add result export functionality
6. 🚧 Implement custom metrics
7. 🚧 Add evaluation history

## Support

- **Backend README:** `src/Components/backend/README_EVALUATION_BACKEND.md`
- **FastAPI Docs:** http://localhost:8001/docs
- **DeepEval Docs:** https://docs.confident-ai.com/
- **React Router Docs:** https://reactrouter.com/

## File Structure

```
my-app/
├── src/
│   ├── App.js                          # Main router & state
│   ├── Components/
│   │   ├── frontend/
│   │   │   ├── testcase_beta.jsx       # Step 1
│   │   │   ├── fieldmap_beta.jsx       # Step 2
│   │   │   ├── criteria_beta.jsx       # Step 3
│   │   │   ├── review_beta.jsx         # Step 4
│   │   │   └── *.css                   # Styles
│   │   └── backend/
│   │       ├── evaluation_backend.py   # NEW BACKEND ✨
│   │       ├── evaluation_serverV3.py  # Old (reference)
│   │       ├── requirements.txt
│   │       ├── .env
│   │       ├── test_evaluation.py
│   │       └── README_EVALUATION_BACKEND.md
├── package.json
└── QUICK_START_GUIDE.md               # This file
```

---

**Happy Evaluating! 🚀**
