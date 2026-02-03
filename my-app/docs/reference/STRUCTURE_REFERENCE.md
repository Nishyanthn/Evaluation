# EvalBot - Project Structure Reference Guide

## Quick Navigation

### Frontend Pages
| File | Location | Purpose |
|------|----------|---------|
| testcase_beta.jsx | `frontend/pages/` | Dataset upload/generation (Step 1) |
| fieldmap_beta.jsx | `frontend/pages/` | Field mapping configuration (Step 2) |
| criteria_beta.jsx | `frontend/pages/` | Metric selection (Step 3) |
| review_beta.jsx | `frontend/pages/` | Review & execute (Step 4) |
| results_beta.jsx | `frontend/pages/` | Display results (Step 5) |

### Frontend Styles
| File | Location | Used By |
|------|----------|---------|
| styleTestcase_beta.css | `frontend/styles/` | Base/shared styles for all pages |
| styleFieldmap_beta.css | `frontend/styles/` | fieldmap_beta.jsx |
| styleCriteria_beta.css | `frontend/styles/` | criteria_beta.jsx |
| styleReview_beta.css | `frontend/styles/` | review_beta.jsx |
| styleResults_beta.css | `frontend/styles/` | results_beta.jsx |

### Backend Files
| File | Location | Purpose |
|------|----------|---------|
| evaluation_backend.py | `backend/` | Main FastAPI application & API endpoints |
| requirements.txt | `backend/config/` | Python dependencies |
| .env | `backend/config/` | Environment variables (Azure OpenAI keys, etc.) |
| test_evaluation.py | `backend/tests/` | Backend functionality tests |
| test_generation.py | `backend/tests/` | LLM generation testing |
| test_azure_openai.py | `backend/tests/` | Azure OpenAI connection testing |

## Complete Directory Tree

```
my-app/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── App.js
│   ├── index.js
│   ├── index.css
│   ├── reportWebVitals.js
│   └── Components/
│       ├── frontend/
│       │   ├── pages/
│       │   │   ├── criteria_beta.jsx
│       │   │   ├── fieldmap_beta.jsx
│       │   │   ├── results_beta.jsx
│       │   │   ├── review_beta.jsx
│       │   │   └── testcase_beta.jsx
│       │   ├── modals/
│       │   │   └── HumanReviewModal.js
│       │   └── styles/
│       │       ├── styleCriteria_beta.css
│       │       ├── styleFieldmap_beta.css
│       │       ├── styleResults_beta.css
│       │       ├── styleReview_beta.css
│       │       └── styleTestcase_beta.css
│       └── backend/
│           ├── config/
│           │   ├── .env
│           │   └── requirements.txt
│           ├── tests/
│           │   ├── test_azure_openai.py
│           │   ├── test_evaluation.py
│           │   └── test_generation.py
│           ├── utils/
│           ├── venv/
│           ├── evaluation_backend.py
│           └── README_EVALUATION_BACKEND.md
├── package.json
├── EVALUATION_WORKFLOW_DOCUMENTATION.md
├── PROJECT_STRUCTURE.md (NEW)
├── QUICK_START_GUIDE.md
└── README.md
```

## Common Tasks

### Add a New Frontend Page
1. Create `src/Components/frontend/pages/your_page.jsx`
2. Create `src/Components/frontend/styles/styleYourPage.css`
3. Update `src/App.js` to import: `import YourPage from './Components/frontend/pages/your_page.jsx'`

### Add a New Backend Endpoint
1. Edit `src/Components/backend/evaluation_backend.py`
2. Add endpoint function with FastAPI decorator
3. Update `config/requirements.txt` if new dependencies needed

### Update Dependencies
**Frontend:**
```bash
cd my-app
npm install package-name
```

**Backend:**
```bash
cd src/Components/backend
pip install package-name
pip freeze > config/requirements.txt
```

### Run Backend Tests
```bash
cd src/Components/backend
python tests/test_evaluation.py
python tests/test_generation.py
python tests/test_azure_openai.py
```

## Import Path Examples

### Frontend Component Import
```javascript
// In src/App.js
import TestcaseBeta from './Components/frontend/pages/testcase_beta.jsx';
import HumanReviewModal from './Components/frontend/modals/HumanReviewModal.js';
```

### Frontend Style Import
```javascript
// In src/Components/frontend/pages/testcase_beta.jsx
import '../styles/styleTestcase_beta.css';
```

### Backend Environment Loading
```python
# In src/Components/backend/evaluation_backend.py
from dotenv import load_dotenv
load_dotenv('config/.env')
```

## What Was Cleaned Up

✅ **Removed files:**
- `EvaluationDashboardV3.js` (replaced by modular pages)
- `styles3.css` (replaced by modular stylesheets)

✅ **Removed folders:**
- `.deepeval/` (cache - auto-generated)
- `__pycache__/` (cache - auto-generated)
- `app/` (empty folder)

✅ **Reorganized:**
- Test files moved to `backend/tests/`
- Configuration files moved to `backend/config/`
- Page components moved to `frontend/pages/`
- Stylesheets moved to `frontend/styles/`
- Modals moved to `frontend/modals/`

## Environment Setup

### Required Environment Variables (backend/config/.env)
```
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-08-01-preview
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment
```

## Notes

- All import paths updated to new locations
- No functionality changed - only reorganized
- Clean separation of concerns (pages, styles, modals, tests)
- Ready for scalability
