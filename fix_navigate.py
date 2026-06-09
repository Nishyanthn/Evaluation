"""
Fix navigate paths in all workflow pages to use new portal routes.
"""
import os

base = r'c:\Users\NISHYANTH NANDAGOPAL\OneDrive\Desktop\Desktop\iNextLabs tasks\Evaluation\my-app\src\Components\frontend\pages'

replacements = {
    'testcase_beta.jsx': [
        ("navigate('/field-mapping')", "navigate('/eval/field-mapping')"),
    ],
    'fieldmap_beta.jsx': [
        ("navigate('/')", "navigate('/knowledge')"),
        ("navigate('/criteria')", "navigate('/eval/criteria')"),
    ],
    'criteria_beta.jsx': [
        ("navigate('/')", "navigate('/knowledge')"),
        ("navigate('/field-mapping')", "navigate('/eval/field-mapping')"),
        ("navigate('/review')", "navigate('/eval/review')"),
    ],
    'review_beta.jsx': [
        ("navigate('/')", "navigate('/knowledge')"),
        ("navigate('/criteria')", "navigate('/eval/criteria')"),
        # '/results' navigate already uses state — we'll handle it carefully
        ("navigate('/results',", "navigate('/eval/results',"),
    ],
}

for fname, pairs in replacements.items():
    fpath = os.path.join(base, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in pairs:
        if old in content:
            content = content.replace(old, new)
            print(f"  {fname}: replaced {old!r} -> {new!r}")
        else:
            print(f"  {fname}: NOT FOUND: {old!r}")
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print("All done!")
