with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

home_idx = c.find('id="view-home"')
next_view = c.find('id="view-category-', home_idx)
home_html = c[home_idx:next_view]

import re
matches = list(re.finditer(r'<a[^>]*commission[^>]*>.*?</a>', home_html, re.DOTALL | re.IGNORECASE))
print(f"Commissions links in home view: {len(matches)}")
for i, m in enumerate(matches):
    print(f"\n=== Link {i+1} at relative {m.start()} ===")
    print(m.group(0))

# Also check header (above view-home)
header_idx = c.find('<header')
header_end = c.find('</header>')
header_html = c[header_idx:header_end]
header_matches = list(re.finditer(r'<a[^>]*commission[^>]*>.*?</a>', header_html, re.DOTALL | re.IGNORECASE))
print(f"\nCommissions links in header: {len(header_matches)}")
for i, m in enumerate(header_matches):
    print(f"=== Header Link {i+1} ===")
    print(m.group(0))
