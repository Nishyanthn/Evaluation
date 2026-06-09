"""
strip_sidebars.py
Replaces the old EvalBot app-container/sidebar/stepper shell in each workflow page
with just the WorkflowShell wrapper. Must be run from any directory.
"""

def strip_page(filepath, step, title, ret_line_1based, cw_line_1based):
    """
    ret_line_1based: 1-based line number of the `return (` line
    cw_line_1based:  1-based line number of `<div className="content-wrapper">`
    
    Keeps everything before ret_line, replaces ret_line..cw_line-1 with:
      return (
        <WorkflowShell currentStep={N} title="T">
    Then keeps cw_line..end but also fixes the closing tags at the end.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    total = len(lines)
    print(f"  {filepath}: {total} lines total")

    # Build new content
    out = []
    i = 0
    while i < total:
        n = i + 1  # 1-based
        if n == ret_line_1based:
            # Replace 'return (' with WorkflowShell opening
            out.append('  return (\n')
            out.append(f'    <WorkflowShell currentStep={{{step}}} title="{title}">\n')
            # Skip everything from ret_line+1 up to (but not including) cw_line
            i += 1
            while i < total:
                n2 = i + 1
                if n2 == cw_line_1based:
                    break
                i += 1
            # Don't increment i here — let the main loop handle cw_line
            continue
        else:
            out.append(lines[i])
        i += 1

    # Add WorkflowShell import if not present
    content = ''.join(out)
    if 'WorkflowShell' not in content:
        content = content.replace(
            "import '../styles/styleTestcase_beta.css';",
            "import '../styles/styleTestcase_beta.css';\nimport WorkflowShell from '../layout/WorkflowShell.jsx';"
        )
        out = [content]  # replace whole content

    # Fix closing: the old shell had 3 extra </div> layers after content-wrapper's closing </div>
    # Pattern at end: "          </div>\n        </div>\n      </div>\n    </div>\n  );\n}\n"
    # Should become: "          </div>\n    </WorkflowShell>\n  );\n}\n"
    final = ''.join(out) if len(out) > 1 else out[0]

    # Replace the 3 extra closing divs before ); }
    import re
    # Match the last closing sequence: 2+ levels of </div> before ); }
    final = re.sub(
        r'(          </div>\n)(\s+</div>\n)+(\s*\);\n\})',
        r'\1    </WorkflowShell>\n\3',
        final
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final)
    
    line_count = final.count('\n')
    print(f"  Done: {filepath} ({line_count} lines written)")


if __name__ == '__main__':
    import os
    base = r'c:\Users\NISHYANTH NANDAGOPAL\OneDrive\Desktop\Desktop\iNextLabs tasks\Evaluation\my-app\src\Components\frontend\pages'
    
    pages = [
        ('criteria_beta.jsx', 3, 'Criteria',       158, 232),
        ('review_beta.jsx',   4, 'Review and Run',  125, 211),
    ]
    
    for fname, step, title, ret_line, cw_line in pages:
        fpath = os.path.join(base, fname)
        print(f"\nProcessing: {fname}")
        strip_page(fpath, step, title, ret_line, cw_line)
    
    print("\nAll done!")
