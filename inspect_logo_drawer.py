with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
print("Searching for mobile drawer header:")
m_drawer = re.search(r'id="mobile-menu-drawer".*?(?=<div class="flex-1)', c, re.DOTALL)
if m_drawer:
    s = m_drawer.group(0)
    s_clean = re.sub(r'data:image/[^;]+;base64,[^"]+', '[BASE64_DATA]', s)
    print(s_clean)
else:
    print("Not found mobile-menu-drawer")
