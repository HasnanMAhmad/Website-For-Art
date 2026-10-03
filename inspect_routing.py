with open(r'E:\Website_For_Art\index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
idx = c.find('function handleRouting')
if idx == -1:
    idx = c.find('window.addEventListener(\'hashchange\'')
if idx == -1:
    idx = c.find('hashchange')

print(c[idx-100:idx+800])
