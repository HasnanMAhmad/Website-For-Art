import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

idx_dash = c.find('id="admin-dashboard-view"')
if idx_dash != -1:
    print("=== admin-dashboard-view HTML ===")
    print(c[idx_dash:idx_dash+1800])

idx_list = c.find('function renderAdminArtworksList')
if idx_list != -1:
    print("\n=== renderAdminArtworksList & related admin functions ===")
    print(c[idx_list:idx_list+1800])
