import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect burger menu links
idx_drawer = text.find('id="mobile-drawer"')
idx_drawer_end = text.find('</aside>', idx_drawer)
print("=== BURGER DRAWER HTML ===")
print(text[idx_drawer:idx_drawer+2500])

# Let's inspect desktop header links
idx_header = text.find('<header')
idx_header_end = text.find('</header>')
print("\n=== DESKTOP HEADER HTML ===")
print(text[idx_header:idx_header+2500])
