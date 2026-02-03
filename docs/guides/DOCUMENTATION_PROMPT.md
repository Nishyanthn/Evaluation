# Documentation Generation Prompt for AI Agent Evaluation Dashboard

Please generate comprehensive technical documentation for the AI Agent Evaluation Dashboard project based on the following detailed specifications:

## Project Overview
The AI Agent Evaluation Dashboard is a full-stack web application designed to evaluate AI agents (specifically customer support chatbots) using industry-standard metrics powered by DeepEval and Azure OpenAI. The system provides a complete workflow from test case generation to detailed evaluation results with token usage tracking.

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **LLM Integration**: Azure OpenAI (GPT-4o-mini) via AsyncAzureOpenAI client
- **Evaluation Framework**: DeepEval (custom integration)
- **API Communication**: httpx for async HTTP requests
- **Data Processing**: pandas, openpyxl for dataset handling
- **Server**: Uvicorn ASGI server running on port 8001

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router DOM v7.9.6
- **Styling**: Custom CSS with CSS variables for theming
- **Icons**: Lucide React
- **File Handling**: XLSX library for Excel file processing
- **State Management**: React hooks (useState, useEffect)

### Infrastructure
- **Agent Endpoint**: Azure Web App (https://inextlabs-demo-sales-bot-pf-as.azurewebsites.net/score)
- **Backend Server**: http://localhost:8001
- **Frontend Server**: http://localhost:3000
- **Configuration**: Environment variables via .env file

## Architecture & Workflow

### Complete 4-Step Evaluation Workflow

#### Step 1: Test Data Generation (testcase_beta.jsx)
Users have two options for creating test datasets:

**Option A: Manual Upload**
- Supported formats: CSV, JSON, JSONL, XLSX/XLS
- User uploads pre-prepared test cases with fields like:
  - user_query: The question/input to test
  - expected_response: Ground truth answer
  - Additional metadata fields
- Files are parsed client-side and stored in component state
- Datasets can be previewed before proceeding

**Option B: AI-Powered Generation**
- User uploads Knowledge Base files (PDF, TXT, Markdown)
- Configurable parameters:
  - Dataset name
  - LLM model selection (GPT-4, GPT-4o-mini, GPT-3.5-turbo, Azure GPT-4)
  - Number of test cases (1-100, slider input)
  - Custom prompt for generation instructions
- Backend endpoint: POST /api/generate-test-cases
- Process:
  1. KB files are parsed and combined into text chunks
  2. LLM generates test cases in batches of 5
  3. Each test case includes: user_query, expected_response, category
  4. Token usage is tracked during generation
- Generated datasets can be downloaded as CSV

#### Step 2: Field Mapping (fieldmap_beta.jsx)
Maps dataset columns to evaluation framework parameters:

**Required Mappings:**
- Query: User input/question field
- Response: Agent's actual response field (or "Generate from Agent API")

**Optional Mappings:**
- Context: Retrieved context/documents
- Ground Truth: Expected correct answer
- Tool Calls: Agent tool/function calls made
- Tool Definitions: Available tools configuration

**Judge Model Selection:**
- User selects the LLM model to use for evaluation
- Options: GPT-4o-mini, GPT-4 Turbo, GPT-3.5, Claude models

**Dynamic Response Generation:**
- If "Generate from Agent API" is selected for response field:
  - System queries live agent endpoint during evaluation
  - Uses query field to get real-time agent responses

#### Step 3: Criteria Selection (criteria_beta.jsx)
Configure evaluation metrics and model settings:

**Available Metrics:**
1. **Answer Relevancy**: Measures how relevant the answer is to the question
2. **Correctness**: Compares actual output with expected output for factual accuracy
3. **Completeness**: Evaluates if the answer fully addresses the query
4. **Toxicity**: Detects harmful or toxic content (lower scores are better)

**Model Configuration:**
- Model Under Test: Select which model is being evaluated
- Temperature: Slider from 0 (deterministic) to 2 (creative)

**Metric Selection:**
- Multi-select checkbox interface
- At least one metric must be selected
- Custom evaluation prompts supported (if custom metric selected)

#### Step 4: Review & Execute (review_beta.jsx)
Final review and execution:

**Review Sections:**
1. Dataset Summary:
   - Dataset name, version, number of test cases
   - Preview of first 3 rows
2. Field Mapping Summary:
   - Judge model selection
   - All field mappings displayed
3. Criteria Summary:
   - Selected metrics
   - Model configuration

**Execution:**
- User provides evaluation name
- System calls POST /api/run-evaluation
- Progress indicators during evaluation
- Navigates to results page upon completion

### Backend API Endpoints

#### 1. POST /api/run-evaluation
Main evaluation endpoint that orchestrates the entire evaluation process.

**Request Body:**
```json
{
  "evaluationName": "string",
  "dataset": {
    "name": "string",
    "data": [{"field": "value"}]
  },
  "fieldMappings": {
    "query": "field_name",
    "response": "field_name or 'agent_api'",
    "context": "field_name or 'not_available'",
    "ground_truth": "field_name or 'not_available'"
  },
  "judgeModel": "string",
  "criteriaData": {
    "selectedMetrics": ["relevance", "correctness"],
    "modelUnderTest": "gpt-4",
    "temperature": 0.7
  }
}
```

**Response:**
```json
{
  "evaluationName": "string",
  "totalTests": 10,
  "completedTests": 10,
  "overallScore": 0.85,
  "testResults": [
    {
      "test_index": 1,
      "user_query": "question",
      "actual_response": "answer",
      "expected_response": "expected",
      "score": 0.85,
      "metric_scores": {
        "Relevance": 0.9,
        "Correctness": 0.8
      },
      "passed": true
    }
  ],
  "timestamp": "ISO-8601",
  "tokenUsage": {
    "total_tokens": 5000,
    "prompt_tokens": 3000,
    "completion_tokens": 2000,
    "breakdown": {
      "agent": {"calls": 10, "tokens": 2000},
      "evaluation": {"calls": 20, "tokens": 3000}
    }
  }
}
```

**Process Flow:**
1. Initialize TokenCounter for tracking API usage
2. For each test case in dataset:
   - Extract query using field mappings
   - Get response (from dataset or agent API)
   - Create LLMTestCase object
   - Run each selected metric:
     - AnswerRelevancyMetric
     - GEval for Correctness/Completeness
     - ToxicityMetric
   - Calculate overall score (inverted for toxicity)
   - Track token usage for each API call
3. Aggregate results and return

#### 2. POST /api/generate-test-cases
Generates test cases using LLM based on knowledge base documents.

**Request (multipart/form-data):**
- datasetName: string
- modelName: string
- numTestCases: integer
- customPrompt: string (optional)
- kbFiles[]: File[] (PDF, TXT, MD)

**Process:**
1. Parse all KB files into combined text
2. Chunk text to avoid token limits (max 4000 chars per chunk)
3. Generate in batches of 5 test cases
4. Rotate through KB chunks for diversity
5. Track token usage during generation
6. Return formatted test cases

**Response:**
```json
{
  "datasetName": "string",
  "version": 1,
  "createdOn": "YYYY-MM-DD",
  "totalCases": 20,
  "data": [
    {
      "user_query": "question",
      "expected_response": "answer",
      "category": "topic"
    }
  ],
  "tokenUsage": {...}
}
```

#### 3. POST /api/download-dataset
Download dataset as CSV file.

**Request Body:**
```json
{
  "datasetName": "name",
  "data": [{"field": "value"}]
}
```

**Response:** CSV file stream with Content-Disposition header

#### 4. GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "Evaluation Workflow Backend",
  "timestamp": "ISO-8601"
}
```

#### 5. GET /api/available-metrics
Returns list of available evaluation metrics.

**Response:**
```json
{
  "metrics": [
    {
      "id": "relevance",
      "name": "Answer Relevancy",
      "description": "Measures how relevant...",
      "available": true
    }
  ]
}
```

#### 6. GET /api/test-azure-openai
Test Azure OpenAI connection and configuration.

### Core Backend Components

#### CustomAzureOpenAIModel Class
Custom implementation of DeepEvalBaseLLM for Azure Cognitive Services compatibility.

**Key Features:**
- Async Azure OpenAI client integration
- Token usage tracking integration
- Schema-based JSON response parsing
- Synchronous wrapper for DeepEval compatibility

**Methods:**
- `__init__`: Initialize with Azure endpoint, deployment, API key
- `set_token_counter`: Attach token counter for tracking
- `load_model`: Required by DeepEval interface
- `generate`: Sync wrapper for a_generate
- `a_generate`: Async generation with token tracking
- `get_model_name`: Return model identifier

#### TokenCounter Class
Comprehensive token usage tracking system.

**Tracked Metrics:**
- Total tokens, prompt tokens, completion tokens
- API call count
- Breakdown by call type (agent vs evaluation)

**Methods:**
- `add(tokens, prompt_tokens, completion_tokens, call_type)`: Add usage
- `print_summary(operation_name)`: Console output summary
- `get_summary()`: Return dictionary with all metrics

#### Agent Query Function
`async def query_agent(user_query, conversation_id, token_counter)`

**Process:**
1. Construct payload with query and metadata
2. POST to agent API endpoint
3. Extract response from various possible JSON keys
4. Parse context array
5. Track token usage if provided by agent
6. Return response, context, and raw response

#### Test Case Evaluation
`async def evaluate_single_test(...)`

**Steps:**
1. Extract query and expected response using field mappings
2. Query agent if response not in dataset
3. Create LLMTestCase object
4. For each selected metric:
   - Initialize metric with evaluation model
   - Run measurement (async thread)
   - Extract score
5. Calculate overall score with metric adjustments
6. Determine pass/fail (threshold: 0.7)
7. Print cumulative token usage
8. Return detailed result object

### Frontend Components Structure

#### App.js
Main application router with state management across workflow.

**State:**
- selectedDataset: Currently selected dataset
- evaluationData: Accumulated config from all steps

**Routes:**
- / → TestcaseBeta
- /field-mapping → FieldMapBeta
- /criteria → CriteriaBeta
- /review → ReviewBeta
- /results → ResultsBeta

#### Results Page (results_beta.jsx)
Comprehensive results dashboard.

**Display Sections:**
1. **Summary Cards:**
   - Overall score with color coding
   - Pass/fail count and percentage
   - Average metric scores

2. **Key Insights:**
   - Auto-generated insights based on results
   - Success/warning/error categorization

3. **Detailed Results Table:**
   - Sortable/filterable test results
   - Click to view detailed modal
   - Color-coded pass/fail status

4. **Test Detail Modal:**
   - Circular progress indicator
   - Overall score and status
   - Metric breakdown with progress bars
   - Performance insights
   - Response comparison (expected vs actual)
   - Retrieved context display

5. **Token Usage Summary:**
   - Total tokens consumed
   - Breakdown by agent vs evaluation
   - API call counts

6. **Export Options:**
   - Download results as JSON
   - Export to CSV/Excel

### Key Features Deep Dive

#### 1. Token Usage Tracking
Comprehensive tracking across all LLM API calls:

**Tracked During:**
- Test case generation from KB
- Agent API queries (if supported)
- Each evaluation metric measurement

**Display:**
- Real-time cumulative tracking
- Per-batch updates during generation
- Final summary with breakdowns
- Cost estimation potential

#### 2. Agent API Integration
Dynamic integration with live AI agent:

**Configuration:**
- Agent endpoint URL in backend
- Conversation ID generation
- Metadata injection (user_id, channel, etc.)

**Features:**
- Real-time response generation during evaluation
- Context extraction from agent responses
- Error handling and fallback responses
- Token usage extraction if available

#### 3. DeepEval Custom Integration
Custom implementation for Azure OpenAI compatibility:

**Challenges Solved:**
- Cognitive Services endpoint format support
- Async/sync compatibility with DeepEval
- Schema-based JSON parsing
- Token usage extraction and tracking

**Metrics Implementation:**
- AnswerRelevancyMetric: Pre-built DeepEval metric
- ToxicityMetric: Pre-built DeepEval metric
- Correctness: GEval with custom criteria
- Completeness: GEval with custom criteria

#### 4. Test Case Generation AI System
LLM-powered test case creation from documents:

**Process:**
1. **Document Parsing:**
   - PDF: PyPDF2 text extraction
   - TXT/MD: Direct text parsing
   - Combined into unified KB content

2. **Text Chunking:**
   - Max 4000 chars per chunk
   - Paragraph-aware splitting
   - Preserves context integrity

3. **Batch Generation:**
   - 5 test cases per batch
   - Rotates through KB chunks
   - Diverse question generation

4. **Quality Control:**
   - JSON schema validation
   - Field presence verification
   - Error handling and retry logic

5. **Output Formatting:**
   - Consistent field structure
   - Category tagging
   - Direct dataset integration

### Environment Configuration

Required .env variables:
```
AZURE_OPENAI_MODEL_NAME=gpt-4o-mini
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_OPENAI_ENDPOINT=https://your-endpoint.cognitiveservices.azure.com/
```

### Error Handling & Validation

#### Backend
- Environment variable validation on startup
- API key format verification
- Endpoint connectivity testing
- Graceful metric measurement failures
- Token counter null checks
- Agent API timeout handling (120s)

#### Frontend
- Required field validation at each step
- File format verification
- Minimum metric selection enforcement
- Navigation guards (prevent skipping steps)
- API error display with troubleshooting hints
- Loading states during async operations

### Performance Optimizations

1. **Async Operations:**
   - Async agent queries
   - Async metric measurements
   - Concurrent file parsing

2. **Batching:**
   - Test case generation in batches
   - Reduces API overhead

3. **Caching:**
   - Dataset preview caching
   - Field mapping persistence across navigation

4. **UI Optimizations:**
   - Virtual scrolling for large datasets
   - Lazy loading of result modals
   - Debounced search/filter inputs

### Security Considerations

1. **API Key Management:**
   - Environment variable storage
   - Masked display in logs
   - Backend-only access

2. **CORS Configuration:**
   - Configured for localhost development
   - Needs restriction for production

3. **Input Validation:**
   - File type restrictions
   - File size limits
   - Field name sanitization
   - SQL injection prevention (if database added)

## Documentation Sections to Generate

Please create the following documentation sections:

1. **README.md**
   - Project overview and purpose
   - Quick start guide
   - Prerequisites and installation
   - Running the application
   - Environment setup

2. **ARCHITECTURE.md**
   - System architecture diagram description
   - Component interaction flow
   - Data flow diagrams
   - Technology stack details

3. **API_DOCUMENTATION.md**
   - Complete API endpoint reference
   - Request/response schemas
   - Error codes and handling
   - Authentication (future)

4. **USER_GUIDE.md**
   - Step-by-step workflow walkthrough
   - Screenshots descriptions
   - Feature explanations
   - Best practices
   - Troubleshooting

5. **DEVELOPER_GUIDE.md**
   - Project structure
   - Code organization
   - Adding new metrics
   - Extending functionality
   - Testing guidelines

6. **DEPLOYMENT.md**
   - Production deployment steps
   - Environment configuration
   - Scaling considerations
   - Monitoring and logging

Please generate comprehensive, well-structured documentation with proper markdown formatting, code examples, and clear explanations suitable for both technical and non-technical users.
