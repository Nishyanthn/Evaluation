# EvalBot Architecture & Organization

## Application Flow Diagram

```
User Browser
    ↓
┌─────────────────────────────────────────┐
│ React Frontend (src/Components/frontend)│
├─────────────────────────────────────────┤
│                                         │
│  Step 1: Test Data (testcase_beta)     │
│     ↓ select/generate dataset          │
│  Step 2: Field Map (fieldmap_beta)     │
│     ↓ map columns & select model       │
│  Step 3: Criteria (criteria_beta)      │
│     ↓ select evaluation metrics        │
│  Step 4: Review (review_beta)          │
│     ↓ execute evaluation               │
│  Step 5: Results (results_beta)        │
│     ↓ display metrics & scores         │
│                                         │
│  Modals:                                │
│  - HumanReviewModal (human review)     │
│                                         │
│  Styles:                                │
│  - All CSS files in /styles folder     │
└──────────────┬──────────────────────────┘
               │ HTTP Requests
               ↓
┌─────────────────────────────────────────┐
│ Python Backend (Port 8001)              │
│ FastAPI Application                     │
├─────────────────────────────────────────┤
│                                         │
│ ✓ /api/generate-test-cases             │
│ ✓ /api/download-dataset                │
│ ✓ /api/run-evaluation                  │
│ ✓ (other evaluation endpoints)         │
│                                         │
│ Integration with:                       │
│ • Azure OpenAI APIs                    │
│ • DeepEval Framework                   │
│ • CSV/JSON/XLSX File Processing        │
│                                         │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴─────────┐
       ↓                 ↓
    Files            Azure
  (Upload/           OpenAI
   Generate)         API
```

## Folder Structure Hierarchy

```
my-app (Root Project)
│
├── Frontend Facing
│   ├── public/                    → Static assets
│   └── src/
│       ├── App.js               → Main router
│       ├── index.js             → React entry
│       └── Components/
│           └── frontend/        ← ALL FRONTEND CODE
│               ├── pages/       → Page components (workflow steps)
│               ├── modals/      → Modal components (popups)
│               └── styles/      → CSS stylesheets
│
├── Backend Facing
│   └── src/
│       └── Components/
│           └── backend/         ← ALL BACKEND CODE
│               ├── evaluation_backend.py → Main app
│               ├── config/      → Settings & dependencies
│               ├── tests/       → Test scripts
│               └── utils/       → Helper functions (future)
│
└── Documentation
    ├── package.json             → NPM config
    ├── PROJECT_STRUCTURE.md     → Detailed structure
    ├── STRUCTURE_REFERENCE.md   → Quick reference
    ├── README.md                → Project info
    └── QUICK_START_GUIDE.md     → Setup instructions
```

## Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     App.js (Router)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
            ┌────────────┼────────────┬────────────┬─────────┐
            ↓            ↓            ↓            ↓         ↓
        TestCase    FieldMap    Criteria      Review    Results
        (Step 1)    (Step 2)    (Step 3)     (Step 4)  (Step 5)
         pages/      pages/      pages/       pages/    pages/
            │            │            │            │         │
            └────────────┴────────────┴────────────┴─────────┘
                                 │
                         (Shared Styles)
                                 │
                ┌────────────────┴────────────────┐
                ↓                                  ↓
         styleTestcase_beta.css    [Component Specific CSS]
         (base/shared)             (Criteria/Fieldmap/etc)
                                 styles/
                                 
┌─────────────────────────────────────────────────────────────┐
│                    Modals (Optional)                        │
│                   modals/                                   │
│                                                             │
│  HumanReviewModal.js                                       │
│  - Shows when manual review needed                         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Input (Upload/Generate)
    ↓
Dataset Created
    ↓
TestCase Component State
    ├─ onComplete() callback
    ↓
App.js (manages evaluation data)
    ├─ selectedDataset
    ├─ fieldMappings
    ├─ criteria
    └─ judgeModel
    ↓
Passed to Next Page Component
    ↓
Backend API Call
    ↓
evaluation_backend.py
    ├─ Azure OpenAI Processing
    ├─ DeepEval Metrics
    └─ Result Generation
    ↓
Results Returned to Frontend
    ↓
Results Component Displays Data
```

## Backend Architecture

```
evaluation_backend.py (Main)
│
├── FastAPI Application
│   ├── CORS Middleware Configuration
│   └── Route Handlers
│
├── Azure OpenAI Integration
│   ├── AsyncAzureOpenAI Client
│   ├── LLM Test Case Generation
│   └── Model Configuration
│
├── DeepEval Integration
│   ├── LLMTestCase Creation
│   ├── Metrics (Relevance, Toxicity, etc.)
│   └── GEval Custom Metrics
│
├── File Processing
│   ├── CSV Parsing
│   ├── JSON/JSONL Parsing
│   ├── XLSX Processing
│   └── Dataset Management
│
└── Configuration
    ├── config/.env (Credentials)
    └── config/requirements.txt (Dependencies)
```

## File Import Chain

```
App.js
  ├─ imports TestcaseBeta from ./Components/frontend/pages/testcase_beta.jsx
  │   └─ imports ../styles/styleTestcase_beta.css
  │   └─ imports lucide-react icons
  │
  ├─ imports FieldMapBeta from ./Components/frontend/pages/fieldmap_beta.jsx
  │   └─ imports ../styles/styleTestcase_beta.css (shared)
  │   └─ imports ../styles/styleFieldmap_beta.css
  │
  ├─ imports CriteriaBeta from ./Components/frontend/pages/criteria_beta.jsx
  │   └─ imports ../styles/styleTestcase_beta.css (shared)
  │   └─ imports ../styles/styleCriteria_beta.css
  │
  ├─ imports ReviewBeta from ./Components/frontend/pages/review_beta.jsx
  │   └─ imports ../styles/styleTestcase_beta.css (shared)
  │   └─ imports ../styles/styleReview_beta.css
  │
  └─ imports ResultsBeta from ./Components/frontend/pages/results_beta.jsx
      └─ imports ../styles/styleTestcase_beta.css (shared)
      └─ imports ../styles/styleResults_beta.css
```

## Removed Components (Cleanup Summary)

```
❌ BEFORE (Messy):
frontend/
  ├── testcase_beta.jsx
  ├── fieldmap_beta.jsx
  ├── criteria_beta.jsx
  ├── review_beta.jsx
  ├── results_beta.jsx
  ├── HumanReviewModal.js
  ├── EvaluationDashboardV3.js      ❌ UNUSED (removed)
  ├── styleTestcase_beta.css
  ├── styleFieldmap_beta.css
  ├── styleCriteria_beta.css
  ├── styleReview_beta.css
  ├── styleResults_beta.css
  └── styles3.css                   ❌ UNUSED (removed)

backend/
  ├── evaluation_backend.py
  ├── test_evaluation.py            ❌ MOVED to tests/
  ├── test_generation.py            ❌ MOVED to tests/
  ├── test_azure_openai.py          ❌ MOVED to tests/
  ├── requirements.txt              ❌ MOVED to config/
  ├── .env                          ❌ MOVED to config/
  ├── __pycache__/                  ❌ DELETED (cache)
  ├── .deepeval/                    ❌ DELETED (cache)
  └── app/                          ❌ DELETED (empty)

✅ AFTER (Clean & Organized):
frontend/
  ├── pages/
  │   ├── testcase_beta.jsx
  │   ├── fieldmap_beta.jsx
  │   ├── criteria_beta.jsx
  │   ├── review_beta.jsx
  │   └── results_beta.jsx
  ├── modals/
  │   └── HumanReviewModal.js
  └── styles/
      ├── styleTestcase_beta.css
      ├── styleFieldmap_beta.css
      ├── styleCriteria_beta.css
      ├── styleReview_beta.css
      └── styleResults_beta.css

backend/
  ├── evaluation_backend.py
  ├── config/
  │   ├── requirements.txt
  │   └── .env
  ├── tests/
  │   ├── test_evaluation.py
  │   ├── test_generation.py
  │   └── test_azure_openai.py
  └── utils/
```

## Benefits of New Structure

✅ **Clarity** - Each folder has a specific purpose  
✅ **Scalability** - Easy to add new pages, modals, or utilities  
✅ **Maintainability** - Related files grouped together  
✅ **Navigation** - Quick to find what you need  
✅ **Best Practices** - Follows React/Python conventions  
✅ **No Breaking Changes** - All imports updated, no functionality lost  
