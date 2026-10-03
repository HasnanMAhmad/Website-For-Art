import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

checks = {
    "Broken button text removed": 'class="p-2 text-stone-400 hover:text-stone-800 transition-colors" aria-label="Close Menu">' not in c,
    "Drawer header logo centered": 'justify-center bg-[#FAF7F2]' in c and 'absolute right-4 top-1/2' in c,
    "Burger button visible on laptop": 'openMobileMenu()' in c and '<span class="hidden md:inline-block text-xs font-semibold uppercase tracking-wider text-stone-700">Menu</span>' in c,
    "Drawer backdrop works on laptop (no lg:hidden)": '<div id="mobile-menu-backdrop" onclick="closeMobileMenu()" class="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-sm hidden transition-opacity">' in c,
    "Drawer box works on laptop (no lg:hidden)": '<div id="mobile-menu-drawer" class="fixed top-0 left-0 z-50 w-4/5 max-w-sm h-full bg-[#FAF7F2] shadow-2xl flex flex-col transform -translate-x-full transition-transform duration-300 overflow-hidden">' in c,
    "How to Care removed from About dropdown": '#art-care" onclick="handleMenuScroll' not in c,
    "How to Care dedicated menu item in drawer": 'href="#/art-care"' in c and 'How To Care For Your Art' in c,
    "Dedicated view-art-care page view exists": '<main id="view-art-care" class="page-view hidden">' in c,
    "Router handles #/art-care": "hash === '#/art-care'" in c,
    "showArtCareView function defined": 'function showArtCareView()' in c,
    "Homepage portrait card links to #/about": '<a href="#/about" class="block group cursor-pointer" aria-label="Read Full Story of Mishayam Rehman">' in c,
    "Homepage artist headline links to #/about": '<a href="#/about" class="hover:text-[#C99C94] transition-colors">"Art is how we tether' in c
}

print("=== FIXES AUDIT MATRIX ===")
all_pass = True
for name, passed in checks.items():
    status = "PASS" if passed else "FAIL"
    print(f"  [{status}] {name}")
    if not passed:
        all_pass = False

print("\nResult:", "ALL CHECKS PASSED!" if all_pass else "SOME CHECKS FAILED!")
