"""
Fix human_review_beta.jsx:
1. Add PortalLayout import (not WorkflowShell since it's not a workflow step)
2. Replace all <div className="app-container"> / <ReviewSidebar .../> patterns 
   with PortalLayout wrapper
3. Remove ReviewSidebar function definition entirely
4. Fix navigate('/') -> navigate('/knowledge')
5. Fix navigate('/eval/new') for "New Evaluation" button
"""
import re

filepath = r'c:\Users\NISHYANTH NANDAGOPAL\OneDrive\Desktop\Desktop\iNextLabs tasks\Evaluation\my-app\src\Components\frontend\pages\human_review_beta.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add PortalLayout import
if 'PortalLayout' not in content:
    content = content.replace(
        "import '../styles/styleHumanReview_beta.css';",
        "import '../styles/styleHumanReview_beta.css';\nimport PortalLayout from '../layout/PortalLayout.jsx';"
    )

# 2a. Loading state - replace app-container + ReviewSidebar
content = content.replace(
    '''  if (isLoading) {
    return (
      <div className="app-container">
        <ReviewSidebar navigate={navigate} />
        <div className="hr-center">
          <div className="hr-spinner" />
          <p>Loading review queue…</p>
        </div>
      </div>
    );
  }''',
    '''  if (isLoading) {
    return (
      <PortalLayout activeSection="knowledge">
        <div className="hr-center">
          <div className="hr-spinner" />
          <p>Loading review queue…</p>
        </div>
      </PortalLayout>
    );
  }'''
)

# 2b. Error state
content = content.replace(
    '''  if (error) {
    return (
      <div className="app-container">
        <ReviewSidebar navigate={navigate} />
        <div className="hr-center">
          <AlertCircle size={48} color="#ef4444" />
          <h2>Could not load queue</h2>
          <p style={{color: '#6b7280'}}>{error}</p>
          <p style={{color: '#6b7280', fontSize: '0.85rem'}}>Make sure the backend is running on http://localhost:8001</p>
          <button className="btn-primary" onClick={fetchQueue}>Retry</button>
        </div>
      </div>
    );
  }''',
    '''  if (error) {
    return (
      <PortalLayout activeSection="knowledge">
        <div className="hr-center">
          <AlertCircle size={48} color="#ef4444" />
          <h2>Could not load queue</h2>
          <p style={{color: '#6b7280'}}>{error}</p>
          <p style={{color: '#6b7280', fontSize: '0.85rem'}}>Make sure the backend is running on http://localhost:8001</p>
          <button className="btn-primary" onClick={fetchQueue}>Retry</button>
        </div>
      </PortalLayout>
    );
  }'''
)

# 2c. Empty queue state
content = content.replace(
    '''  if (queue.length === 0) {
    return (
      <div className="app-container">
        <ReviewSidebar navigate={navigate} />
        <div className="hr-center">
          <Inbox size={56} color="#9ca3af" />
          <h2 style={{marginTop: '1rem'}}>No cases to review</h2>
          <p style={{color: '#6b7280'}}>
            Run an evaluation first. Cases that fall in the confidence gray zone will appear here.
          </p>
          <button className="btn-primary" style={{marginTop: '1rem'}} onClick={() => navigate('/')}>
            New Evaluation
          </button>
        </div>
      </div>
    );
  }''',
    '''  if (queue.length === 0) {
    return (
      <PortalLayout activeSection="knowledge">
        <div className="hr-center">
          <Inbox size={56} color="#9ca3af" />
          <h2 style={{marginTop: '1rem'}}>No cases to review</h2>
          <p style={{color: '#6b7280'}}>
            Run an evaluation first. Cases that fall in the confidence gray zone will appear here.
          </p>
          <button className="btn-primary" style={{marginTop: '1rem'}} onClick={() => navigate('/eval/new')}>
            New Evaluation
          </button>
        </div>
      </PortalLayout>
    );
  }'''
)

# 2d. Main return
content = content.replace(
    '  return (\n    <div className="app-container">\n      <ReviewSidebar navigate={navigate} />\n\n      <div className="main-layout">\n        {/* Header bar */}\n        <div className="stepper-container">',
    '  return (\n    <PortalLayout activeSection="knowledge">\n      <div className="hr-page-inner">\n        {/* Header bar */}\n        <div className="hr-header-panel">'
)

# Fix remaining navigate calls
content = content.replace("navigate('/')", "navigate('/knowledge')")

# 3. Fix closing: old was </div>(content-wrapper) </div>(content-area) </div>(main-layout) </div>(app-container)
# After fix: </div>(content-wrapper) </div>(hr-page-inner) </PortalLayout>
# Find the pattern:
#           </div>\n        </div>\n      </div>\n    </div>\n  );\n}
content = re.sub(
    r'(          </div>\n)\s+</div>\n\s+</div>\n\s+</div>\n(\s+\);\n\})\s*\n\nfunction',
    r'\1      </div>\n    </PortalLayout>\n\2\n\nfunction',
    content
)

# 4. Remove ReviewSidebar function entirely (it's the last function in the file)
review_sidebar_start = '\nfunction ReviewSidebar({ navigate }) {'
if review_sidebar_start in content:
    idx = content.index(review_sidebar_start)
    content = content[:idx] + '\n'
    print("ReviewSidebar removed")
else:
    print("WARNING: ReviewSidebar not found")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

lines = content.split('\n')
print(f"Total lines: {len(lines)}")
for i, line in enumerate(lines):
    if any(x in line for x in ['PortalLayout', 'app-container', 'ReviewSidebar', 'WorkflowShell']):
        print(f"  Line {i+1}: {line.strip()}")
print("Done!")
