# 📚 Documentation Index

Welcome to the EvalBot documentation! All documentation has been organized into logical categories for easy navigation.

---

## 📖 Documentation Structure

```
docs/
├── guides/                  ← Getting started & setup
│   ├── README.md           → Project overview
│   ├── QUICK_START_GUIDE.md     → How to run the project
│   └── EVALUATION_WORKFLOW_DOCUMENTATION.md → Workflow details
│
├── architecture/           ← System design & architecture
│   └── ARCHITECTURE_OVERVIEW.md  → Visual diagrams & data flows
│
├── reference/              ← Project structure & references
│   ├── PROJECT_STRUCTURE.md     → Detailed structure guide
│   ├── STRUCTURE_REFERENCE.md   → Quick lookup tables
│   └── FILE_STRUCTURE_MAP.md    → Complete file tree
│
└── updates/                ← Changes & improvements
    ├── REORGANIZATION_CHECKLIST.md  → What was changed
    └── SETUP_COMPLETE.md       → Completion summary
```

---

## 🎯 Where to Start

### I want to get started quickly
👉 Read: [QUICK_START_GUIDE.md](guides/QUICK_START_GUIDE.md)

### I want to understand the project
👉 Read: [README.md](guides/README.md)

### I want to know how the workflow works
👉 Read: [EVALUATION_WORKFLOW_DOCUMENTATION.md](guides/EVALUATION_WORKFLOW_DOCUMENTATION.md)

### I want to understand the architecture
👉 Read: [ARCHITECTURE_OVERVIEW.md](architecture/ARCHITECTURE_OVERVIEW.md)

### I want to find a specific file
👉 Read: [STRUCTURE_REFERENCE.md](reference/STRUCTURE_REFERENCE.md) or [FILE_STRUCTURE_MAP.md](reference/FILE_STRUCTURE_MAP.md)

### I want to know what changed
👉 Read: [REORGANIZATION_CHECKLIST.md](updates/REORGANIZATION_CHECKLIST.md)

### I want a project structure overview
👉 Read: [PROJECT_STRUCTURE.md](reference/PROJECT_STRUCTURE.md)

---

## 📑 Document Descriptions

### Guides (guides/)

**README.md**
- Project overview
- What is EvalBot?
- Key features
- Technology stack

**QUICK_START_GUIDE.md**
- Installation steps
- Running frontend
- Running backend
- Verification checklist

**EVALUATION_WORKFLOW_DOCUMENTATION.md**
- Complete workflow steps
- What happens at each step
- Data flow through the system
- Integration points

### Architecture (architecture/)

**ARCHITECTURE_OVERVIEW.md**
- Visual system architecture
- Component relationships
- Data flow diagrams
- Backend structure
- Frontend component hierarchy
- Before/after comparison

### Reference (reference/)

**PROJECT_STRUCTURE.md**
- Detailed directory tree
- Purpose of each folder
- File organization philosophy
- Component descriptions
- Import path examples

**STRUCTURE_REFERENCE.md**
- Quick lookup tables
- File locations at a glance
- Common tasks (add page, add style, etc.)
- Import examples
- Removed files list

**FILE_STRUCTURE_MAP.md**
- Complete file tree with annotations
- File organization by function
- Import dependency map
- Data flow through frontend
- Backend API structure
- File size overview
- Quick path reference

### Updates (updates/)

**REORGANIZATION_CHECKLIST.md**
- Complete list of changes
- What was moved where
- Import path updates
- Files deleted
- Testing checklist
- Next steps

**SETUP_COMPLETE.md**
- Reorganization completion summary
- What was accomplished
- Before/after comparison
- Key improvements
- Benefits of new structure

---

## 🎓 Quick Reference Tables

### File Locations

| File | Location |
|------|----------|
| Test Data Page | `src/Components/frontend/pages/testcase_beta.jsx` |
| Field Mapping Page | `src/Components/frontend/pages/fieldmap_beta.jsx` |
| Criteria Page | `src/Components/frontend/pages/criteria_beta.jsx` |
| Review Page | `src/Components/frontend/pages/review_beta.jsx` |
| Results Page | `src/Components/frontend/pages/results_beta.jsx` |
| Backend App | `src/Components/backend/evaluation_backend.py` |
| Environment Config | `src/Components/backend/config/.env` |
| Python Deps | `src/Components/backend/config/requirements.txt` |

### Document Organization

| Category | Purpose | Documents |
|----------|---------|-----------|
| **Guides** | Getting started | README, Quick Start, Workflow |
| **Architecture** | System design | Architecture Overview |
| **Reference** | Look-up info | Project Structure, Reference, Map |
| **Updates** | Changes made | Checklist, Setup Complete |

---

## 🔍 Search by Task

### I need to...

**Understand the project**
- Start with: [README.md](guides/README.md)
- Then read: [EVALUATION_WORKFLOW_DOCUMENTATION.md](guides/EVALUATION_WORKFLOW_DOCUMENTATION.md)

**Get it running**
- Follow: [QUICK_START_GUIDE.md](guides/QUICK_START_GUIDE.md)

**Add a new page**
- Reference: [STRUCTURE_REFERENCE.md](reference/STRUCTURE_REFERENCE.md#common-tasks)
- See examples in: [FILE_STRUCTURE_MAP.md](reference/FILE_STRUCTURE_MAP.md#quick-path-reference)

**Add new styles**
- Reference: [STRUCTURE_REFERENCE.md](reference/STRUCTURE_REFERENCE.md)

**Understand the architecture**
- Read: [ARCHITECTURE_OVERVIEW.md](architecture/ARCHITECTURE_OVERVIEW.md)

**Find a specific file**
- Search: [STRUCTURE_REFERENCE.md](reference/STRUCTURE_REFERENCE.md#complete-directory-tree)
- Or view: [FILE_STRUCTURE_MAP.md](reference/FILE_STRUCTURE_MAP.md)

**Know what changed**
- Check: [REORGANIZATION_CHECKLIST.md](updates/REORGANIZATION_CHECKLIST.md)

---

## 📋 Document Quick Links

### Essential Reading (Start Here)
1. [README.md](guides/README.md) - What is this project?
2. [QUICK_START_GUIDE.md](guides/QUICK_START_GUIDE.md) - How do I run it?
3. [ARCHITECTURE_OVERVIEW.md](architecture/ARCHITECTURE_OVERVIEW.md) - How does it work?

### Reference Documents (Keep Handy)
- [STRUCTURE_REFERENCE.md](reference/STRUCTURE_REFERENCE.md) - File locations
- [FILE_STRUCTURE_MAP.md](reference/FILE_STRUCTURE_MAP.md) - Complete tree
- [PROJECT_STRUCTURE.md](reference/PROJECT_STRUCTURE.md) - Detailed guide

### Information Documents (For Learning)
- [EVALUATION_WORKFLOW_DOCUMENTATION.md](guides/EVALUATION_WORKFLOW_DOCUMENTATION.md) - How the workflow works
- [ARCHITECTURE_OVERVIEW.md](architecture/ARCHITECTURE_OVERVIEW.md) - System design

### History & Changes
- [REORGANIZATION_CHECKLIST.md](updates/REORGANIZATION_CHECKLIST.md) - What was changed
- [SETUP_COMPLETE.md](updates/SETUP_COMPLETE.md) - Completion summary

---

## 🗂️ Folder Descriptions

### docs/guides/
Get started with the project
- Project overview (README)
- Step-by-step setup (Quick Start)
- Workflow explanation
- Best for: New users

### docs/architecture/
Understand how the system works
- Visual architecture diagrams
- Component relationships
- Data flows
- Best for: Developers, architects

### docs/reference/
Find information quickly
- File locations
- Directory structure
- Quick lookup tables
- Import paths
- Best for: When you need to find something

### docs/updates/
See what changed
- List of changes
- Migration notes
- Completion status
- Best for: Understanding modifications

---

## 💡 Tips for Navigation

1. **New to the project?** → Start with guides/ folder
2. **Need to find a file?** → Check reference/ folder
3. **Want to understand design?** → Read architecture/ folder
4. **Curious about changes?** → Look in updates/ folder

---

## 📊 Documentation Stats

| Category | Documents | Total Pages |
|----------|-----------|------------|
| Guides | 3 | ~15 pages |
| Architecture | 1 | ~10 pages |
| Reference | 3 | ~20 pages |
| Updates | 2 | ~10 pages |
| **Total** | **9** | **~55 pages** |

---

## 🎯 Common Scenarios

### Scenario 1: I'm new, where do I start?
1. Read [README.md](guides/README.md)
2. Follow [QUICK_START_GUIDE.md](guides/QUICK_START_GUIDE.md)
3. Explore [ARCHITECTURE_OVERVIEW.md](architecture/ARCHITECTURE_OVERVIEW.md)

### Scenario 2: I need to add a feature
1. Check [STRUCTURE_REFERENCE.md](reference/STRUCTURE_REFERENCE.md#common-tasks)
2. Reference [FILE_STRUCTURE_MAP.md](reference/FILE_STRUCTURE_MAP.md)
3. Use examples from component pages

### Scenario 3: I want to understand the workflow
1. Read [EVALUATION_WORKFLOW_DOCUMENTATION.md](guides/EVALUATION_WORKFLOW_DOCUMENTATION.md)
2. View diagrams in [ARCHITECTURE_OVERVIEW.md](architecture/ARCHITECTURE_OVERVIEW.md)

### Scenario 4: I need to troubleshoot
1. Check [QUICK_START_GUIDE.md](guides/QUICK_START_GUIDE.md) for setup issues
2. Review [REORGANIZATION_CHECKLIST.md](updates/REORGANIZATION_CHECKLIST.md) for changes
3. Reference [ARCHITECTURE_OVERVIEW.md](architecture/ARCHITECTURE_OVERVIEW.md) for system issues

---

## 📞 Support

- **Setup problems?** → Check [QUICK_START_GUIDE.md](guides/QUICK_START_GUIDE.md)
- **File location questions?** → Check [STRUCTURE_REFERENCE.md](reference/STRUCTURE_REFERENCE.md)
- **Architecture questions?** → Check [ARCHITECTURE_OVERVIEW.md](architecture/ARCHITECTURE_OVERVIEW.md)
- **Change history?** → Check [REORGANIZATION_CHECKLIST.md](updates/REORGANIZATION_CHECKLIST.md)

---

**Last Updated:** January 30, 2026  
**Documentation Version:** 2.0 (Organized)

All documents are ready for use. Happy learning! 📚
