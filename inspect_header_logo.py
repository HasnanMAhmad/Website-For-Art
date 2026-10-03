with open(r'E:\Website_For_Art\index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
m = re.search(r'(<img[^>]*alt=[\'"][^\'"]*Logo[^\'"]*[\'"][^>]*>)', c, re.IGNORECASE)
if m:
    tag = m.group(1)
    print("Found header logo tag!")
    print("Tag length:", len(tag))
    # Extract src
    m_src = re.search(r'src=[\'"]([^\'"]+)[\'"]', tag)
    if m_src:
        print("Src length:", len(m_src.group(1)))
        print("Src prefix:", m_src.group(1)[:60])
