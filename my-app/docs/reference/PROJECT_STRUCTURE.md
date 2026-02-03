# EvalBot Project Structure

This document outlines the organized directory structure for the EvalBot evaluation framework.

## Directory Overview

```
my-app/
├── public/                          # Static files
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
│
├── src/
│   ├── App.js                      # Main application routing
│   ├── index.js                    # React entry point
│   ├── index.css                   # Global styles
│   ├── reportWebVitals.js         # Performance monitoring
│   │
│   └── Components/
│       ├── frontend/               # React Frontend Components
│       │   ├── pages/              # Page Components
│       │   │   ├── testcase_beta.jsx      # Test Data Generation page
│       │   │   ├── fieldmap_beta.jsx      # Field Mapping page
│       │   │   ├── criteria_beta.jsx      # Criteria Selection page
│       │   │   ├── review_beta.jsx        # Review & Confirmation page
│       │   │   └── results_beta.jsx       # Results Display page
│       │   │
│       │   ├── modals/             # Modal Components
│       │   │   └── HumanReviewModal.js    # Human Review Modal
│       │   │
│       │   └── styles/             # Component-specific Stylesheets
│       │       ├── styleTestcase_beta.css     # Shared base styles
│       │       ├── styleFieldmap_beta.css     # Field mapping styles
│       │       ├── styleCriteria_beta.css     # Criteria styles
│       │       ├── styleReview_beta.css       # Review styles
│       │       └── styleResults_beta.css      # Results styles
│       │
│       └── backend/                # Python Backend
│           ├── evaluation_backend.py    # Main FastAPI application
│           ├── README_EVALUATION_BACKEND.md
│           │
│           ├── config/             # Configuration files
│           │   ├── .env            # Environment variables
│           │   └── requirements.txt     # Python dependencies
│           │
│           ├── tests/              # Test & Development Scripts
│           │   ├── test_evaluation.py        # Backend testing
│           │   ├── test_generation.py        # LLM generation testing
│           │   └── test_azure_openai.py      # Azure OpenAI connection testing
│           │
│           ├── utils/              # Utility modules (placeholder for future use)
│           │
│           └── venv/               # Python virtual environment (excluded from source)
│
├── package.json                    # Node.js dependencies & scripts
├── QUICK_START_GUIDE.md           # Quick start instructions
├── README.md                       # Project README
└── EVALUATION_WORKFLOW_DOCUMENTATION.md
```

## Component Organization

### Frontend Structure (`src/Components/frontend/`)

#### Pages (`pages/`)
Individual page components representing each step of the evaluation workflow:
- **testcase_beta.jsx** - Dataset upload/generation (Step 1)
- **fieldmap_beta.jsx** - Field mapping configuration (Step 2)
- **criteria_beta.jsx** - Metric selection (Step 3)
- **review_beta.jsx** - Review & run evaluation (Step 4)
- **results_beta.jsx** - Display evaluation results

#### Modals (`modals/`)
Reusable modal components:
- **HumanReviewModal.js** - Modal for human review of test cases

#### Styles (`styles/`)
CSS stylesheets organized by component:
- **styleTestcase_beta.css** - Base/shared styles used across all pages
- **styleFieldmap_beta.css** - Field mapping page styles
- **styleCriteria_beta.css** - Criteria selection page styles
- **styleReview_beta.css** - Review page styles
- **styleResults_beta.css** - Results page styles

### Backend Structure (`src/Components/backend/`)

#### Root Level
- **evaluation_backend.py** - Main FastAPI application with all API endpoints

#### Config (`config/`)
Configuration and dependency files:
- **.env** - Environment variables (API keys, model configs)
- **requirements.txt** - Python package dependencies

#### Tests (`tests/`)
Test and development scripts:
- **test_evaluation.py** - Backend functionality tests
- **test_generation.py** - LLM-based test case generation testing
- **test_azure_openai.py** - Azure OpenAI connection verification

#### Utils (`utils/`)
Reserved for future utility modules and helpers

#### Venv (`venv/`)
Python virtual environment (not included in version control)

## File Dependencies & Import Paths

### Frontend Component Imports
All frontend pages import stylesheets with relative paths:
```javascript
// In pages/testcase_beta.jsx
import '../styles/styleTestcase_beta.css';
import '../styles/styleCriteria_beta.css';
```

### App.js Routing
Main application file imports pages from the new path:
```javascript
import TestcaseBeta from "./Components/frontend/pages/testcase_beta.jsx";
import FieldMapBeta from './Components/frontend/pages/fieldmap_beta.jsx';
// ... etc
```

### Backend Configuration
Environment variables are loaded from `config/.env`:
```python
from dotenv import load_dotenv
load_dotenv('config/.env')
```

## Workflow Steps

The application follows a 4-step evaluation workflow:

1. **Test Data Generation** (`testcase_beta.jsx`)
   - Upload existing dataset or generate via LLM
   - Supported formats: CSV, JSON, JSONL, XLSX

2. **Field Mapping** (`fieldmap_beta.jsx`)
   - Map dataset columns to standard fields (query, response, etc.)
   - Select evaluation model

3. **Criteria Selection** (`criteria_beta.jsx`)
   - Choose evaluation metrics (Relevance, Correctness, etc.)
   - Configure metric parameters

4. **Review & Execute** (`review_beta.jsx`)
   - Review all configurations
   - Execute evaluation

5. **View Results** (`results_beta.jsx`)
   - Display evaluation metrics and scores
   - Export results

## Running the Project

### Frontend
```bash
cd my-app
npm install
npm start
```

### Backend
```bash
cd src/Components/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r config/requirements.txt
python evaluation_backend.py
```

## Key Files to Modify

- **Adding new page**: Create `pages/your_component.jsx` and update `App.js`
- **Adding component styles**: Create `styles/your_component.css`
- **Updating API logic**: Modify `evaluation_backend.py`
- **Adding dependencies**: Update `config/requirements.txt` (backend) or `package.json` (frontend)

## Removed/Cleaned Files

The following files were removed during reorganization (no longer needed):
- `EvaluationDashboardV3.js` - Replaced by individual page components
- `styles3.css` - Replaced by modular stylesheets
- `.deepeval/` - Cache folder (auto-generated)
- `__pycache__/` - Python cache (auto-generated)
- `app/` - Empty module folder

## Notes

- All import paths have been updated to reflect the new structure
- The project maintains a clean separation between frontend pages, modals, and styles
- Backend is organized with clear configuration, tests, and utility sections
- Virtual environment (`venv`) should be in `.gitignore`
