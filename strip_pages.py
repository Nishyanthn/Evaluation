import sys

def strip_page(filepath, step, title, ret_line, cw_line):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    out = []
    for i, line in enumerate(lines):
        n = i + 1
        if n == ret_line:
            out.append(f'    <WorkflowShell currentStep={{{step}}} title="{title}">\n')
        elif ret_line < n < cw_line:
            pass  # skip sidebar/stepper
        else:
            out.append(line)
    # Add WorkflowShell import if missing
    content = ''.join(out)
    if 'WorkflowShell' not in content:
        content = content.replace(
            "import '../styles/styleTestcase_beta.css';",
            "import '../styles/styleTestcase_beta.css';\nimport WorkflowShell from '../layout/WorkflowShell.jsx';"
        )
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Done {filepath}: {len(out)} lines')

base = r'c:\Users\NISHYANTH NANDAGOPAL\OneDrive\Desktop\Desktop\iNextLabs tasks\Evaluation\my-app\src\Components\frontend\pages'
strip_page(base + r'\criteria_beta.jsx', 3, 'Criteria', 159, 232)
strip_page(base + r'\review_beta.jsx', 4, 'Review and Run', 126, 211)
print("All done!")
