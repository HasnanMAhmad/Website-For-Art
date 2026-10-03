with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('function router(')
if idx == -1:
    idx = c.find('const router =')
if idx == -1:
    idx = c.find('function router')

print(c[idx:idx+1500])
