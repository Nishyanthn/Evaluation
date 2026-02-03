# 📊 Visual Project Structure Map

## Complete File Tree

```
Evaluation/
│
└── my-app/
    │
    ├── 📁 public/
    │   ├── index.html
    │   ├── manifest.json
    │   └── robots.txt
    │
    ├── 📁 src/
    │   ├── App.js                          [✓ UPDATED - routing]
    │   ├── index.js                        [entry point]
    │   ├── index.css                       [global styles]
    │   ├── reportWebVitals.js             [analytics]
    │   │
    │   └── 📁 Components/
    │       │
    │       ├── 📁 frontend/                [✨ REORGANIZED]
    │       │   │
    │       │   ├── 📁 pages/               [✨ NEW - Page Components]
    │       │   │   ├── testcase_beta.jsx        [✓ MOVED - Step 1]
    │       │   │   ├── fieldmap_beta.jsx        [✓ MOVED - Step 2]
    │       │   │   ├── criteria_beta.jsx        [✓ MOVED - Step 3]
    │       │   │   ├── review_beta.jsx          [✓ MOVED - Step 4]
    │       │   │   └── results_beta.jsx         [✓ MOVED - Step 5]
    │       │   │
    │       │   ├── 📁 modals/              [✨ NEW - Modal Components]
    │       │   │   └── HumanReviewModal.js      [✓ MOVED]
    │       │   │
    │       │   └── 📁 styles/              [✨ NEW - CSS Files]
    │       │       ├── styleTestcase_beta.css   [✓ MOVED - shared base]
    │       │       ├── styleFieldmap_beta.css   [✓ MOVED]
    │       │       ├── styleCriteria_beta.css   [✓ MOVED]
    │       │       ├── styleReview_beta.css     [✓ MOVED]
    │       │       └── styleResults_beta.css    [✓ MOVED]
    │       │
    │       └── 📁 backend/                 [✨ REORGANIZED]
    │           ├── evaluation_backend.py        [main FastAPI app]
    │           ├── README_EVALUATION_BACKEND.md
    │           │
    │           ├── 📁 config/              [✨ NEW - Configuration]
    │           │   ├── .env                     [✓ MOVED - env vars]
    │           │   └── requirements.txt         [✓ MOVED - dependencies]
    │           │
    │           ├── 📁 tests/               [✨ NEW - Test Files]
    │           │   ├── test_evaluation.py       [✓ MOVED]
    │           │   ├── test_generation.py       [✓ MOVED]
    │           │   └── test_azure_openai.py     [✓ MOVED]
    │           │
    │           ├── 📁 utils/               [✨ NEW - Utilities]
    │           │   └── [ready for future use]
    │           │
    │           └── 📁 venv/                [Python environment]
    │
    ├── 📁 node_modules/                    [dependencies]
    ├── 📁 .git/                            [git history]
    │
    ├── 📄 .env                             [root env vars]
    ├── 📄 .gitignore                       [git config]
    ├── 📄 package.json                     [npm config]
    ├── 📄 package-lock.json               [npm lock]
    │
    ├── 📋 README.md                        [project info]
    ├── 📋 QUICK_START_GUIDE.md            [setup guide]
    ├── 📋 EVALUATION_WORKFLOW_DOCUMENTATION.md
    │
    ├── 📋 PROJECT_STRUCTURE.md             [✨ NEW - detailed guide]
    ├── 📋 STRUCTURE_REFERENCE.md           [✨ NEW - quick reference]
    ├── 📋 ARCHITECTURE_OVERVIEW.md         [✨ NEW - diagrams]
    ├── 📋 REORGANIZATION_CHECKLIST.md      [✨ NEW - changes log]
    └── 📋 SETUP_COMPLETE.md                [✨ NEW - summary]


Legend:
  📁 = Folder
  📄 = File (Code)
  📋 = File (Documentation)
  ✨ = New or Reorganized
  ✓ = Moved
  [✓ UPDATED] = Import paths updated
```

---

## File Organization by Function

### 🎨 Frontend UI Components

```
frontend/pages/                    [Step 1-5 of workflow]
├── testcase_beta.jsx             [Dataset Upload/Generation]
├── fieldmap_beta.jsx             [Field Mapping]
├── criteria_beta.jsx             [Metrics Selection]
├── review_beta.jsx               [Review & Execute]
└── results_beta.jsx              [Display Results]

frontend/modals/                   [Modal Dialogs]
└── HumanReviewModal.js           [Human Review Popup]

frontend/styles/                   [CSS Stylesheets]
├── styleTestcase_beta.css        [Base styles for all pages]
├── styleFieldmap_beta.css        [Field mapping styles]
├── styleCriteria_beta.css        [Criteria styles]
├── styleReview_beta.css          [Review page styles]
└── styleResults_beta.css         [Results page styles]
```

### 🔧 Backend API & Configuration

```
backend/                           [Main Application]
└── evaluation_backend.py          [FastAPI endpoints & logic]

backend/config/                    [Configuration]
├── .env                          [API keys, credentials]
└── requirements.txt              [Python dependencies]

backend/tests/                     [Testing & Development]
├── test_evaluation.py            [Evaluation tests]
├── test_generation.py            [LLM generation tests]
└── test_azure_openai.py          [Azure connection tests]

backend/utils/                     [Utilities - Reserved]
└── [ready for helpers, formatters, etc.]
```

---

## Import Dependency Map

```
App.js (Router)
  │
  ├─→ pages/testcase_beta.jsx
  │     ├─→ ../styles/styleTestcase_beta.css
  │     └─→ lucide-react (icons)
  │
  ├─→ pages/fieldmap_beta.jsx
  │     ├─→ ../styles/styleTestcase_beta.css (shared)
  │     ├─→ ../styles/styleFieldmap_beta.css
  │     └─→ lucide-react (icons)
  │
  ├─→ pages/criteria_beta.jsx
  │     ├─→ ../styles/styleTestcase_beta.css (shared)
  │     ├─→ ../styles/styleCriteria_beta.css
  │     └─→ lucide-react (icons)
  │
  ├─→ pages/review_beta.jsx
  │     ├─→ ../styles/styleTestcase_beta.css (shared)
  │     ├─→ ../styles/styleReview_beta.css
  │     └─→ lucide-react (icons)
  │
  └─→ pages/results_beta.jsx
        ├─→ ../styles/styleTestcase_beta.css (shared)
        ├─→ ../styles/styleResults_beta.css
        └─→ lucide-react (icons)

modals/HumanReviewModal.js
  └─→ Used by any page component
```

---

## Data Flow Through Frontend

```
User → Browser
   ↓
App.js (Manages Workflow State)
   ↓
   ├─→ Step 1: testcase_beta.jsx
   │     [Upload/Generate Dataset]
   │     └─→ Calls Backend API
   │
   ├─→ Step 2: fieldmap_beta.jsx
   │     [Map Fields & Select Model]
   │     └─→ Validates Mapping
   │
   ├─→ Step 3: criteria_beta.jsx
   │     [Select Metrics]
   │     └─→ Builds Criteria Config
   │
   ├─→ Step 4: review_beta.jsx
   │     [Review All Configs]
   │     └─→ Executes Backend API
   │
   └─→ Step 5: results_beta.jsx
         [Display Results]
         └─→ Shows Scores & Metrics
```

---

## Backend API Structure

```
evaluation_backend.py
│
├── FastAPI Setup
├── CORS Configuration
├── Environment Loading (from config/.env)
│
├── Routes:
│   ├── /api/generate-test-cases
│   ├── /api/download-dataset
│   ├── /api/run-evaluation
│   └── [other endpoints]
│
├── Azure OpenAI Integration
│   ├── AsyncAzureOpenAI Client
│   ├── LLM Calls
│   └── Token Management
│
├── DeepEval Integration
│   ├── Test Case Generation
│   ├── Metrics Calculation
│   └── Results Processing
│
└── File Handling
    ├── CSV Processing
    ├── JSON Processing
    ├── XLSX Processing
    └── Dataset Management
```

---

## Folder Purpose Reference

```
pages/
Purpose: Page components representing workflow steps
Usage: One component per page/step
Add New: Create new_page.jsx and update App.js imports
Example: testcase_beta.jsx is Step 1 of workflow

modals/
Purpose: Reusable modal dialogs and popups
Usage: Called from any page that needs a modal
Add New: Create modal_name.js and import where needed
Example: HumanReviewModal.js for manual reviews

styles/
Purpose: CSS stylesheets organized by component
Usage: Import in corresponding page component
Add New: Create style_name.css with component-specific styles
Shared: styleTestcase_beta.css imported by all pages

config/
Purpose: Configuration and dependencies
Usage: Backend setup and environment variables
Files: .env (credentials), requirements.txt (packages)
Update: When adding new Python packages

tests/
Purpose: Test scripts and development tools
Usage: Run to verify functionality
Add New: Create test_feature_name.py
Run: python tests/test_name.py

utils/
Purpose: Helper functions and utilities
Usage: Reserved for future utility modules
Add New: Create util_name.py with helper functions
Usage: Import and use in backend or tests
```

---

## File Sizes Overview

```
Small Files (< 10 KB):
  - testcase_beta.jsx                32 KB
  - fieldmap_beta.jsx                15 KB
  - criteria_beta.jsx                11 KB
  - review_beta.jsx                  16 KB
  - results_beta.jsx                 18 KB
  - HumanReviewModal.js               6 KB

Stylesheets:
  - styleTestcase_beta.css           16 KB (base)
  - styleFieldmap_beta.css            5 KB
  - styleCriteria_beta.css            3 KB
  - styleReview_beta.css              4 KB
  - styleResults_beta.css             8 KB

Backend:
  - evaluation_backend.py           864 lines (Main app)
  - requirements.txt                 (Dependencies)
  - .env                            (Credentials)
  - test_evaluation.py              139 lines
  - test_generation.py              197 lines
  - test_azure_openai.py            218 lines
```

---

## Quick Path Reference

```
To access a file from within code:

From App.js (src/):
  import X from './Components/frontend/pages/testcase_beta.jsx'
  
From testcase_beta.jsx (pages/):
  import styles from '../styles/styleTestcase_beta.css'
  import modal from '../modals/HumanReviewModal.js'
  
From evaluation_backend.py (backend/):
  from dotenv import load_dotenv
  load_dotenv('config/.env')
  
From test files (tests/):
  import from parent directory as needed
```

---

## Changes Summary

| Aspect | Count |
|--------|-------|
| Folders Created | 6 new folders |
| Files Moved | 11 frontend + 5 backend = 16 files |
| Files Deleted | 4 unused files |
| Import Paths Updated | 6 files |
| Documentation Files Added | 5 new guides |

**Total Impact: Clean, organized, scalable structure!**

---

**Last Updated:** January 30, 2026  
**Status:** ✅ Complete
