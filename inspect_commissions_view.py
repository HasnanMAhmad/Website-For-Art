with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('id="view-category-commissions"')
if idx != -1:
    print(c[idx:idx+2500])
else:
    print("view-category-commissions NOT FOUND!")
