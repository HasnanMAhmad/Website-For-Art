import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

nav_calls = re.findall(r"navigate\(['\"]([^'\"]+)['\"]\)", text)
href_calls = re.findall(r'href=["\'](#[^"\']*)["\']', text)

print("Unique navigate() targets:")
for t in sorted(set(nav_calls)):
    print(" -", t)

print("\nUnique href=# targets:")
for h in sorted(set(href_calls)):
    print(" -", h)
