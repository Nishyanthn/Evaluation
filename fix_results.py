"""
Fix results_beta.jsx:
1. Add WorkflowShell import
2. Replace early return's app-container with just a plain div
3. Replace main return's sidebar/stepper shell with WorkflowShell
4. Fix navigate('/') -> navigate('/knowledge') and navigate('/human-review') -> navigate('/eval/human-review')
5. Fix closing tags
"""
import re

filepath = r'c:\Users\NISHYANTH NANDAGOPAL\OneDrive\Desktop\Desktop\iNextLabs tasks\Evaluation\my-app\src\Components\frontend\pages\results_beta.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add WorkflowShell import
if 'WorkflowShell' not in content:
    content = content.replace(
        "import '../styles/styleResults_beta.css';",
        "import '../styles/styleResults_beta.css';\nimport WorkflowShell from '../layout/WorkflowShell.jsx';"
    )

# 2. Fix early return (no-results case) - replace app-container with simple wrapper
content = content.replace(
    '''  if (!evaluationResults) {
    return (
      <div className="app-container">
        <div className="error-message">
          <AlertCircle className="error-icon" />
          <h2>No Results Found</h2>
          <p>Please complete an evaluation first.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }''',
    '''  if (!evaluationResults) {
    return (
      <WorkflowShell currentStep={5} title="Results">
        <div className="error-message">
          <AlertCircle className="error-icon" />
          <h2>No Results Found</h2>
          <p>Please complete an evaluation first.</p>
          <button onClick={() => navigate('/knowledge')} className="btn-primary">
            Go to Evaluation
          </button>
        </div>
      </WorkflowShell>
    );
  }'''
)

# 3. Fix navigate calls
content = content.replace("navigate('/human-review')", "navigate('/eval/human-review')")
content = content.replace("navigate('/')", "navigate('/knowledge')")

# 4. Replace main return's sidebar block
# Find 'return (\n    <div className="app-container">' and the stepper up to '<div className="content-wrapper">'
old_main_start = '  return (\n    <div className="app-container">'
new_main_start = '  return (\n    <WorkflowShell currentStep={5} title="Results">'

if old_main_start in content:
    # Find the index of old_main_start
    idx = content.index(old_main_start)
    # Find the index of content-wrapper after the sidebar section
    cw_marker = '          <div className="content-wrapper">'
    cw_idx = content.index(cw_marker, idx)
    # Replace everything from old_main_start to cw_idx (exclusive) with new_main_start + \n
    content = content[:idx] + new_main_start + '\n' + content[cw_idx:]
    print("Main return replaced")
else:
    print("WARNING: main return block not found")

# 5. Fix closing - the main component ended with several </div> for content-wrapper, content-area, main-layout, app-container
# After stripping, it should just be </div> for content-wrapper then </WorkflowShell>
# Pattern: "      </div>\n    </div>\n  );\n}"  (last 3 closing divs before );} )
# The content-wrapper is the outermost we keep, so we want:
# "      </div>\n    </WorkflowShell>\n  );\n}"
content = re.sub(
    r'(\s+</div>\n)\s+</div>\n(\s+\);\n\})\s*$',
    r'\1    </WorkflowShell>\n\2',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
lines = content.split('\n')
print(f"Total lines: {len(lines)}")
for i, line in enumerate(lines):
    if 'WorkflowShell' in line or 'app-container' in line:
        print(f"  Line {i+1}: {line.strip()}")
print("Done!")
