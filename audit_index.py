with open(r'E:\Website_For_Art\index.html', 'r', encoding='utf-8') as f:
    c = f.read()

pos_hero = c.find('hero-landscape-banner')
pos_about = c.find('id="about"')
pos_cat = c.find('Explore by Category')
pos_care = c.find('id="art-care"')

print('File size:', len(c))
print('Hero banner present:', pos_hero != -1)
print('Section order check (Hero < About < Category < Care):', pos_hero < pos_about < pos_cat < pos_care)
print('Positions:', 'Hero:', pos_hero, 'About:', pos_about, 'Category:', pos_cat, 'Care:', pos_care)
print('Name Mishayam Rehman count:', c.count('Mishayam Rehman'))
print('Accordion menu check:', 'mobile-acc-about' in c)
print('Currencies check:', all(cur in c for cur in ['GBP', 'USD', 'EUR', 'PKR']))
