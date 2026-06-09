import sys
files = [
  (r'c:\Users\NISHYANTH NANDAGOPAL\OneDrive\Desktop\Desktop\iNextLabs tasks\Evaluation\my-app\src\Components\frontend\pages\review_beta.jsx', 280, 320),
  (r'c:\Users\NISHYANTH NANDAGOPAL\OneDrive\Desktop\Desktop\iNextLabs tasks\Evaluation\my-app\src\Components\frontend\pages\results_beta.jsx', 420, 460),
  (r'c:\Users\NISHYANTH NANDAGOPAL\OneDrive\Desktop\Desktop\iNextLabs tasks\Evaluation\my-app\src\Components\frontend\pages\human_review_beta.jsx', 395, 415),
]
for path, s, e in files:
    lines = open(path, encoding='utf-8').readlines()
    print(f'=== {path.split(chr(92))[-1]} ===')
    for i in range(s-1, min(e, len(lines))):
        print(f'{i+1}: {lines[i]}', end='')
    print()
