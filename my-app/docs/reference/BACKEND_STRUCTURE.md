# 🔧 Backend Organization - Final Structure

## Backend Folder Organization

```
backend/
├── evaluation_backend.py          ← Main FastAPI application
├── test_generation.py             ← Utility module (REQUIRED for main app)
├── README_EVALUATION_BACKEND.md
│
├── config/                        ← Configuration files
│   ├── .env                      ← Environment variables
│   └── requirements.txt          ← Python dependencies
│
├── tests/                         ← Test scripts
│   ├── test_evaluation.py        ← Backend evaluation tests
│   └── test_azure_openai.py      ← Azure OpenAI connection tests
│
├── utils/                         ← Utilities (ready for expansion)
│
└── venv/                          ← Python virtual environment
```

---

## File Descriptions

### evaluation_backend.py
- **Main FastAPI application**
- Contains all API endpoints
- Imports: `test_generation` for utility functions
- Imports: Azure OpenAI clients
- Imports: DeepEval metrics

### test_generation.py
- **Utility module (NOT a test file)**
- Contains helper functions for test case generation
- Functions:
  - `parse_kb_files()` - Parse knowledge base files
  - `generate_test_cases_with_llm()` - Generate test cases using LLM
  - File parsing utilities (PDF, TXT, Markdown, JSON, CSV)
- **Location:** Backend root (required for main app import)
- **Status:** Active utility module

### config/.env
- Environment variables
- Azure OpenAI credentials
- API keys
- Model configurations

### config/requirements.txt
- Python package dependencies
- FastAPI, Azure packages, DeepEval, etc.

### tests/test_evaluation.py
- Test script for backend functionality
- Run: `python tests/test_evaluation.py`
- Purpose: Verify backend operations

### tests/test_azure_openai.py
- Test script for Azure OpenAI connection
- Run: `python tests/test_azure_openai.py`
- Purpose: Verify Azure connectivity

### utils/
- Reserved for future utility modules
- For helper functions, formatters, validators, etc.

---

## Why test_generation.py is at Backend Root

**Important:** `test_generation.py` is **not a test file** - it's a **utility module**

### Evidence:
- ✅ Called by `evaluation_backend.py` on line 231
- ✅ Contains helper functions, not test assertions
- ✅ Provides critical functionality for main app
- ✅ Must be imported directly by main application

### Import in evaluation_backend.py:
```python
from test_generation import parse_kb_files, generate_test_cases_with_llm
```

### Why not in tests/?
- ❌ Not a test script
- ❌ Actively used by production code
- ❌ Would cause import errors if moved
- ❌ Not run as pytest or unit test

---

## Imports Summary

### evaluation_backend.py imports:
```python
from test_generation import parse_kb_files, generate_test_cases_with_llm
from fastapi import ...
from azure.openai import ...
from deepeval.metrics import ...
# ... other imports
```

### Why this works:
- `test_generation.py` is in same directory as `evaluation_backend.py`
- Python can find it using simple relative import
- No sys.path manipulation needed

---

## Running the Backend

### Setup:
```bash
cd src/Components/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r config/requirements.txt
```

### Run main app:
```bash
python evaluation_backend.py
```

### Run tests:
```bash
python tests/test_evaluation.py
python tests/test_azure_openai.py
```

---

## What's in Each Test File

### test_evaluation.py
```python
# Tests for:
- Backend endpoints
- Data processing
- Evaluation metrics
- Integration tests
```

### test_azure_openai.py
```python
# Tests for:
- Azure OpenAI connection
- API authentication
- Token usage
- Model availability
```

---

## Error Resolution

If you see:
```
ModuleNotFoundError: No module named 'test_generation'
```

**Solution:**
- Ensure `test_generation.py` is in `backend/` root directory
- Don't move it to `backend/tests/` (it's a utility, not a test)
- Keep the import as: `from test_generation import ...`

---

## File Organization Philosophy

| Location | Purpose | Files |
|----------|---------|-------|
| **backend/ root** | Main app & utilities | evaluation_backend.py, test_generation.py |
| **backend/config/** | Configuration | .env, requirements.txt |
| **backend/tests/** | Test scripts | test_evaluation.py, test_azure_openai.py |
| **backend/utils/** | Utilities (future) | Ready for expansion |
| **backend/venv/** | Python env | Do not modify |

---

## Key Points

✅ `test_generation.py` must stay at backend root  
✅ Actual test files go in tests/ folder  
✅ Import path: `from test_generation import ...`  
✅ No __init__.py needed (simple modules)  
✅ All dependencies in config/requirements.txt  

---

## Structure is Now Correct!

```
✓ evaluation_backend.py    (main app)
✓ test_generation.py       (utility - required!)
✓ config/                  (config files)
✓ tests/                   (test scripts)
✓ utils/                   (ready for expansion)
```

Your backend should now run without import errors! 🚀
