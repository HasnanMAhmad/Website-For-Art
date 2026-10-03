with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = list(re.finditer(r'<section[^>]*id=["\'][^"\']*commission[^"\']*["\']', c, re.IGNORECASE))
print(f"Sections with commission id: {len(matches)}")
for m in matches:
    print(m.group(0))

idx = c.find('id="commissions-tiers-grid"')
if idx != -1:
    print("Found commissions-tiers-grid at", idx)
    print(c[idx-300:idx+200])
else:
    print("commissions-tiers-grid NOT found")
