with open(r'E:\Website_For_Art\index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re

for fn in ['toggleMobileAccordion', 'toggleMobileMenu', 'closeMobileMenu', 'handleMenuScroll']:
    idx = c.find(f'function {fn}')
    if idx != -1:
        print(f"=== {fn} ===")
        print(c[idx:idx+400])

print("\n=== Accordion HTML ===")
m = re.search(r'id="mobile-acc-about".*?</div>\s*</div>', c, re.DOTALL)
if m:
    print(m.group(0))
