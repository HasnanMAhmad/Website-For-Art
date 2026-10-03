with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
idx = c.find('<header')
idx_end = c.find('</header>')
header_html = c[idx:idx_end+10]
header_clean = re.sub(r'data:image/[^;]+;base64,[^"]+', '[BASE64_LOGO]', header_html)
print(header_clean)
