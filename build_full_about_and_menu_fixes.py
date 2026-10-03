import re
import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("Original index.html length:", len(html))

# -------------------------------------------------------------
# 1. EXTRACT INLINE LOGO SRC FROM DESKTOP HEADER
# -------------------------------------------------------------
logo_match = re.search(r'<img[^>]*src=[\'"](data:image/png;base64,[^\'"]+)[\'"][^>]*alt=[\'"]Mishi\'s Artwork Logo[\'"]', html)
if not logo_match:
    # Try broader search
    logo_match = re.search(r'src=[\'"](data:image/png;base64,[^\'"]+)[\'"]', html)

if logo_match:
    logo_src = logo_match.group(1)
    print("Found base64 logo src, length:", len(logo_src))
else:
    raise Exception("Could not find base64 logo src!")

# -------------------------------------------------------------
# 2. UPDATE BURGER MENU HEADER: SHOW LOGO INSTEAD OF TEXT NAME
# -------------------------------------------------------------
old_drawer_header_pattern = re.compile(
    r'<div class="p-6 border-b border-stone-200/60 flex items-center justify-between">\s*<div class="flex items-center">\s*<span class="font-serif text-2xl font-semibold tracking-wide text-stone-900">Mishayam Rehman</span>\s*</div>\s*<button onclick="closeMobileMenu\(\)"',
    re.DOTALL
)

new_drawer_header = f"""<div class="p-5 border-b border-stone-200/60 flex items-center justify-between bg-[#FAF7F2]">
      <a href="#/" onclick="collapseAllMobileAccordions(); closeMobileMenu();" class="inline-flex items-center" aria-label="Mishi's Artwork">
        <img src="{logo_src}" alt="Mishi's Artwork Logo" class="h-11 sm:h-12 w-auto max-w-[150px] object-contain transition-transform duration-300 hover:scale-105">
      </a>
      <button onclick="closeMobileMenu()" class="p-2 text-stone-500 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-200/50" aria-label="Close Menu">"""

if old_drawer_header_pattern.search(html):
    html = old_drawer_header_pattern.sub(new_drawer_header, html)
    print("Replaced text name with logo in burger menu header!")
else:
    # Fallback search
    print("Warning: old_drawer_header_pattern not matched directly, trying fallback replacement...")
    old_span = '<span class="font-serif text-2xl font-semibold tracking-wide text-stone-900">Mishayam Rehman</span>'
    new_logo_tag = f'<a href="#/" onclick="collapseAllMobileAccordions(); closeMobileMenu();" class="inline-flex items-center" aria-label="Mishi\'s Artwork"><img src="{logo_src}" alt="Mishi\'s Artwork Logo" class="h-11 sm:h-12 w-auto max-w-[150px] object-contain"></a>'
    html = html.replace(old_span, new_logo_tag, 1)
    print("Replaced span with logo tag via fallback.")

# -------------------------------------------------------------
# 3. FIX ACCORDION DROPDOWNS: MAKE THEM TOGGLE UP/DOWN AND
#    COLLAPSE AUTOMATICALLY WHEN USED
# -------------------------------------------------------------
# Update the accordion HTML in the drawer:
old_accordion_html_pattern = re.compile(
    r'<div class="flex-1 overflow-y-auto px-6 py-4">.*?<!-- Mobile Drawer Footer: Currency Switcher -->',
    re.DOTALL
)

new_accordion_html = """<div class="flex-1 overflow-y-auto px-6 py-3">
      
      <!-- 1. About Accordion -->
      <div class="border-b border-[#EFE8DF]">
        <button onclick="toggleMobileAccordion('about')" class="mobile-nav-link flex items-center justify-between w-full py-3.5 text-left cursor-pointer select-none">
          <span class="font-serif text-2xl sm:text-3xl text-stone-900 font-normal">About</span>
          <span id="mobile-icon-about" class="text-xl font-light text-stone-500 transition-transform duration-200">+</span>
        </button>
        <div id="mobile-acc-about" class="hidden pl-2 pb-3.5 pt-1 space-y-2.5 transition-all duration-300">
          <a href="#/about" onclick="collapseAllMobileAccordions(); closeMobileMenu();" class="mobile-subnav-link flex items-center justify-between">
            <span>The Artist (Full Biography)</span>
            <span class="text-xs text-[#8FA387] font-sans font-medium">Page →</span>
          </a>
          <button onclick="openReviewsModal(); collapseAllMobileAccordions(); closeMobileMenu();" class="mobile-subnav-link text-left w-full">
            <span>Collector Reviews</span>
          </button>
          <a href="#art-care" onclick="handleMenuScroll('art-care'); collapseAllMobileAccordions();" class="mobile-subnav-link">
            <span>How To Care For Your Art</span>
          </a>
        </div>
      </div>

      <!-- 2. Originals Accordion -->
      <div class="border-b border-[#EFE8DF]">
        <button onclick="toggleMobileAccordion('originals')" class="mobile-nav-link flex items-center justify-between w-full py-3.5 text-left cursor-pointer select-none">
          <span class="font-serif text-2xl sm:text-3xl text-stone-900 font-normal">Originals</span>
          <span id="mobile-icon-originals" class="text-xl font-light text-stone-500 transition-transform duration-200">+</span>
        </button>
        <div id="mobile-acc-originals" class="hidden pl-2 pb-3.5 pt-1 space-y-2.5 transition-all duration-300">
          <a href="#/category/originals" onclick="collapseAllMobileAccordions(); closeMobileMenu();" class="mobile-subnav-link">Selected Works (All)</a>
          <a href="#/category/originals" onclick="collapseAllMobileAccordions(); closeMobileMenu();" class="mobile-subnav-link">Culture & Heritage</a>
          <a href="#/category/originals" onclick="collapseAllMobileAccordions(); closeMobileMenu();" class="mobile-subnav-link">Emotional Identity</a>
          <a href="#/category/originals" onclick="collapseAllMobileAccordions(); closeMobileMenu();" class="mobile-subnav-link">Botanical Sanctuary</a>
        </div>
      </div>

      <!-- 3. Fine Art Prints Accordion -->
      <div class="border-b border-[#EFE8DF]">
        <button onclick="toggleMobileAccordion('prints')" class="mobile-nav-link flex items-center justify-between w-full py-3.5 text-left cursor-pointer select-none">
          <span class="font-serif text-2xl sm:text-3xl text-stone-900 font-normal">Fine Art Prints</span>
          <span id="mobile-icon-prints" class="text-xl font-light text-stone-500 transition-transform duration-200">+</span>
        </button>
        <div id="mobile-acc-prints" class="hidden pl-2 pb-3.5 pt-1 space-y-2.5 transition-all duration-300">
          <a href="#/category/prints" onclick="collapseAllMobileAccordions(); closeMobileMenu();" class="mobile-subnav-link">All Archival Prints</a>
          <a href="#/category/prints" onclick="collapseAllMobileAccordions(); closeMobileMenu();" class="mobile-subnav-link">Culture & Heritage</a>
          <a href="#/category/prints" onclick="collapseAllMobileAccordions(); closeMobileMenu();" class="mobile-subnav-link">Emotional Identity</a>
          <a href="#/category/prints" onclick="collapseAllMobileAccordions(); closeMobileMenu();" class="mobile-subnav-link">Botanical & Floral</a>
        </div>
      </div>

      <!-- 4. Bookmarks Link -->
      <div class="border-b border-[#EFE8DF]">
        <a href="#/category/bookmarks" onclick="collapseAllMobileAccordions(); closeMobileMenu();" class="mobile-nav-link flex items-center justify-between w-full py-3.5">
          <span class="font-serif text-2xl sm:text-3xl text-stone-900 font-normal">Bookmarks</span>
          <span class="text-lg text-stone-400">→</span>
        </a>
      </div>

      <!-- 5. Commissions Link with Mint Green OPEN Badge -->
      <div class="border-b border-[#EFE8DF]">
        <a href="#/category/commissions" onclick="collapseAllMobileAccordions(); closeMobileMenu();" class="mobile-nav-link flex items-center justify-between w-full py-3.5">
          <span class="font-serif text-2xl sm:text-3xl text-stone-900 font-normal">Commissions</span>
          <span class="text-[10px] uppercase font-bold tracking-widest bg-[#D1F2DE] text-[#2D6A4F] px-2.5 py-0.5 rounded-full">OPEN</span>
        </a>
      </div>

      <!-- 6. Instagram Link with External Arrow -->
      <div class="border-b border-[#EFE8DF]">
        <a href="https://www.instagram.com/mishisart.work" target="_blank" rel="noopener noreferrer" onclick="collapseAllMobileAccordions(); closeMobileMenu();" class="mobile-nav-link flex items-center justify-between w-full py-3.5">
          <span class="font-serif text-2xl sm:text-3xl text-stone-900 font-normal">@mishisart.work</span>
          <span class="text-lg text-stone-400">↗</span>
        </a>
      </div>

    </div>

    <!-- Mobile Drawer Footer: Currency Switcher -->"""

if old_accordion_html_pattern.search(html):
    html = old_accordion_html_pattern.sub(new_accordion_html, html)
    print("Updated accordion items HTML with collapse-on-click & links!")

# -------------------------------------------------------------
# 4. CREATE DEDICATED SEPARATE PAGE: <main id="view-about-artist">
# -------------------------------------------------------------
dedicated_about_page_html = """
  <!-- ============================================================ -->
  <!-- 6. SEPARATE PAGE: ABOUT THE ARTIST (MISHAYAM REHMAN) -->
  <!-- ============================================================ -->
  <main id="view-about-artist" class="page-view hidden">
    
    <!-- Hero Header & Breadcrumbs -->
    <div class="bg-[#F4EFEA] border-b border-stone-200/80 py-10 sm:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav class="flex items-center gap-2 text-xs text-stone-500 mb-6 font-sans">
          <a href="#/" class="hover:text-stone-900 transition-colors">Home</a>
          <span>/</span>
          <span class="text-stone-900 font-medium">About the Artist</span>
        </nav>

        <div class="max-w-3xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EBE3] text-[#6E8266] text-xs font-semibold uppercase tracking-wider mb-4">
            <span class="w-2 h-2 rounded-full bg-[#8FA387]"></span>
            <span>UK Fine Artist & Visual Storyteller</span>
          </div>
          <h1 class="font-serif text-4xl sm:text-6xl text-stone-900 font-medium tracking-tight leading-[1.1]">
            The Journey & Solace of <span class="italic font-normal text-[#C99C94]">Mishayam Rehman</span>
          </h1>
          <p class="mt-4 text-base sm:text-lg text-stone-600 font-serif italic max-w-2xl leading-relaxed">
            "Art is how we tether fleeting moments of beauty, memory, and quiet stillness to a lasting heirloom."
          </p>
        </div>

      </div>
    </div>

    <!-- Main Biography & Studio Portrait Section -->
    <div class="py-16 sm:py-24 bg-[#FAF7F2] border-b border-stone-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          <!-- Sticky Studio Portrait & Accreditation Card -->
          <div class="lg:col-span-5 lg:sticky lg:top-28">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-stone-200">
              <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=85" 
                   alt="Mishayam Rehman in her UK Art Studio" class="w-full h-full object-cover">
              
              <div class="absolute bottom-5 left-5 right-5 p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-100 shadow-lg text-center">
                <h3 class="font-serif text-2xl text-stone-900 font-semibold">Mishayam Rehman</h3>
                <p class="text-[11px] uppercase tracking-widest text-[#8FA387] font-semibold mt-1">United Kingdom Studio</p>
                <div class="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500 font-sans">
                  <span>Oil & Gold Leaf</span>
                  <span>•</span>
                  <span>Giclée Editions</span>
                  <span>•</span>
                  <span>Heirloom Keepsakes</span>
                </div>
              </div>
            </div>

            <!-- Studio Location Badge -->
            <div class="mt-6 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-sm flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#E5EBE3] text-[#6E8266] flex items-center justify-center shrink-0">
                <i data-lucide="map-pin" class="w-5 h-5"></i>
              </div>
              <div class="text-xs">
                <p class="font-semibold text-stone-900">Independent Studio Based in the UK</p>
                <p class="text-stone-500">Every canvas crafted, varnished, and packaged by hand.</p>
              </div>
            </div>
          </div>

          <!-- Extended Biography & Artistic Journey -->
          <div class="lg:col-span-7 space-y-8 font-sans text-stone-700 leading-relaxed">
            
            <div class="prose prose-stone max-w-none space-y-5 text-sm sm:text-base">
              <h2 class="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 leading-snug">
                Blending Cultural Heritage with Introspective Solace
              </h2>
              <p>
                Welcome to the official atelier of <strong class="font-semibold text-stone-900">Mishayam Rehman</strong>. Working from her light-filled studio in the United Kingdom, Mishayam creates rich, contemplative works in oil, heavy gouache, layered watercolor, and genuine 24k gold leaf. Her paintings exist as a bridge between ancestral architectural majesty and the quiet contemplation of contemporary life.
              </p>
              <p>
                Her creative evolution was born out of a fascination with traditional arches, heritage courtyards, and ancient facades that have withstood centuries of rain, sun, and devotion. By incorporating real gilded leaf, she captures the shifting quality of sunlight across the day—ensuring each painting breathes with its environment.
              </p>
              <p>
                Alongside architectural series, Mishayam explores intimate botanical sanctuaries inspired by wild English flora, as well as emotive figurative studies that invite the collector into moments of reflective stillness.
              </p>
            </div>

            <!-- Mediums & Craftsmanship Highlights -->
            <div class="pt-6 border-t border-stone-200 space-y-6">
              <h3 class="font-serif text-2xl font-semibold text-stone-900">Mediums & Archival Craftsmanship</h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div class="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm">
                  <div class="w-8 h-8 rounded-lg bg-[#F7ECE9] text-[#C99C94] flex items-center justify-center mb-3">
                    <i data-lucide="sun" class="w-4 h-4"></i>
                  </div>
                  <h4 class="font-serif text-lg font-semibold text-stone-900">24k Genuine Gold Leaf</h4>
                  <p class="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    Hand-applied gilded foil layered over oil glazes, reflecting candlelight and shifting shadows naturally.
                  </p>
                </div>

                <div class="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm">
                  <div class="w-8 h-8 rounded-lg bg-[#E5EBE3] text-[#6E8266] flex items-center justify-center mb-3">
                    <i data-lucide="layers" class="w-4 h-4"></i>
                  </div>
                  <h4 class="font-serif text-lg font-semibold text-stone-900">Hahnemühle 310gsm Paper</h4>
                  <p class="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    100% pure cotton rag archival paper meeting ISO 9706 museum conservation standards for 100+ years.
                  </p>
                </div>

                <div class="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm">
                  <div class="w-8 h-8 rounded-lg bg-[#F2E9DE] text-[#C5A880] flex items-center justify-center mb-3">
                    <i data-lucide="bookmark" class="w-4 h-4"></i>
                  </div>
                  <h4 class="font-serif text-lg font-semibold text-stone-900">Hand-Torn Deckled Edges</h4>
                  <p class="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    Every print and original paper study is hand-feathered, giving collectors a tactile, timeless heirloom finish.
                  </p>
                </div>

                <div class="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm">
                  <div class="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center mb-3">
                    <i data-lucide="shield-check" class="w-4 h-4"></i>
                  </div>
                  <h4 class="font-serif text-lg font-semibold text-stone-900">Signed & Embossed</h4>
                  <p class="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    Every piece is accompanied by a studio Certificate of Authenticity signed by Mishayam Rehman.
                  </p>
                </div>

              </div>
            </div>

            <!-- Studio Principles Checklist -->
            <div class="pt-6 border-t border-stone-200 space-y-4">
              <h3 class="font-serif text-2xl font-semibold text-stone-900">The Studio Commitment</h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-stone-200/60">
                  <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <svg class="w-3.5 h-3.5 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </span>
                  <span class="text-xs sm:text-sm text-stone-800 font-medium">100% Acid-Free Cotton Rag Papers</span>
                </div>

                <div class="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-stone-200/60">
                  <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <svg class="w-3.5 h-3.5 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </span>
                  <span class="text-xs sm:text-sm text-stone-800 font-medium">Plastic-Free UK Recyclable Packaging</span>
                </div>

                <div class="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-stone-200/60">
                  <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <svg class="w-3.5 h-3.5 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </span>
                  <span class="text-xs sm:text-sm text-stone-800 font-medium">Signed Certificate with Every Original</span>
                </div>

                <div class="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-stone-200/60">
                  <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <svg class="w-3.5 h-3.5 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </span>
                  <span class="text-xs sm:text-sm text-stone-800 font-medium">Archival Inks with 100+ Year Longevity</span>
                </div>
              </div>
            </div>

            <!-- Call to Actions -->
            <div class="pt-8 border-t border-stone-200 flex flex-wrap gap-4">
              <a href="#/category/originals" class="btn-primary py-3.5 px-7 text-xs uppercase tracking-wider">
                <span>View Original Paintings</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>
              <a href="#/category/prints" class="btn-outline py-3.5 px-7 text-xs uppercase tracking-wider">
                <span>Explore Fine Art Prints</span>
              </a>
              <a href="#/category/commissions" class="btn-outline py-3.5 px-7 text-xs uppercase tracking-wider">
                <span>Inquire Bespoke Commission</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>

  </main>
"""

# Place the dedicated about page right after commissions page view
commissions_view_end = html.find('</main>\n\n  <!-- MODALS & DRAWERS -->')
if commissions_view_end == -1:
    commissions_view_end = html.find('<!-- MODALS & DRAWERS -->')

if commissions_view_end != -1:
    html = html[:commissions_view_end] + dedicated_about_page_html + '\n  ' + html[commissions_view_end:]
    print("Inserted dedicated <main id='view-about-artist'> page view!")
else:
    print("Warning: Could not find insertion anchor for dedicated about page.")

# -------------------------------------------------------------
# 5. UPDATE HOME PAGE TEASER TO LINK TO THE DEDICATED PAGE
# -------------------------------------------------------------
old_home_about_cta = '<div class="pt-4">\n              <a href="#/category/commissions" class="btn-primary">\n                <span>Inquire About Bespoke Commissions</span>\n                <i data-lucide="arrow-right" class="w-4 h-4"></i>\n              </a>\n            </div>'
new_home_about_cta = """<div class="pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <a href="#/about" class="btn-primary py-3 px-6 text-xs uppercase tracking-wider">
                <span>Read Full Artist Biography & Studio Story →</span>
              </a>
              <a href="#/category/commissions" class="btn-outline py-3 px-6 text-xs uppercase tracking-wider">
                <span>Bespoke Commissions</span>
              </a>
            </div>"""

if old_home_about_cta in html:
    html = html.replace(old_home_about_cta, new_home_about_cta, 1)
    print("Updated homepage About teaser with link to full artist page!")
else:
    print("Notice: old_home_about_cta pattern not found for exact replacement, checking regex...")
    html = re.sub(
        r'<div class="pt-4">\s*<a href="#/category/commissions" class="btn-primary">.*?</div>',
        new_home_about_cta,
        html,
        count=1,
        flags=re.DOTALL
    )

# -------------------------------------------------------------
# 6. UPDATE ROUTER & ACCORDION JAVASCRIPT
# -------------------------------------------------------------
# Replace toggleMobileAccordion and closeMobileMenu logic:
updated_accordion_js = """
/* ==========================================================
   MOBILE ACCORDION BURGER MENU LOGIC (Strict Toggle Up/Down)
   ========================================================== */
function toggleMobileMenu() {
  const drawer = document.getElementById('mobile-menu-drawer');
  if (drawer && !drawer.classList.contains('-translate-x-full')) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function openMobileMenu() {
  const drawer = document.getElementById('mobile-menu-drawer');
  const backdrop = document.getElementById('mobile-menu-backdrop');
  if (drawer) drawer.classList.remove('-translate-x-full');
  if (backdrop) backdrop.classList.remove('hidden');
}

function closeMobileMenu() {
  const drawer = document.getElementById('mobile-menu-drawer');
  const backdrop = document.getElementById('mobile-menu-backdrop');
  if (drawer) drawer.classList.add('-translate-x-full');
  if (backdrop) backdrop.classList.add('hidden');
  collapseAllMobileAccordions();
}

function toggleMobileAccordion(section) {
  const acc = document.getElementById(`mobile-acc-${section}`);
  const icon = document.getElementById(`mobile-icon-${section}`);
  if (!acc) return;

  const isCurrentlyOpen = !acc.classList.contains('hidden');

  // Collapse all other dropdowns
  ['about', 'originals', 'prints'].forEach(s => {
    const otherAcc = document.getElementById(`mobile-acc-${s}`);
    const otherIcon = document.getElementById(`mobile-icon-${s}`);
    if (otherAcc) otherAcc.classList.add('hidden');
    if (otherIcon) otherIcon.textContent = '+';
  });

  // If it was closed, open it; if it was open, it's now collapsed (toggles up!)
  if (!isCurrentlyOpen) {
    acc.classList.remove('hidden');
    if (icon) icon.textContent = '-';
  }
}

function collapseAllMobileAccordions() {
  ['about', 'originals', 'prints'].forEach(s => {
    const acc = document.getElementById(`mobile-acc-${s}`);
    const icon = document.getElementById(`mobile-icon-${s}`);
    if (acc) acc.classList.add('hidden');
    if (icon) icon.textContent = '+';
  });
}

function showAboutArtistView() {
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.add('hidden');
  });
  const aboutView = document.getElementById('view-about-artist');
  if (aboutView) aboutView.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (window.lucide && lucide.createIcons) {
    try { lucide.createIcons(); } catch (e) {}
  }
}
"""

# Replace the router logic to route '#/about' or '#/about-artist' to showAboutArtistView()
router_old = """  } else if (hash === '#/category/commissions') {
    showCategoryView('commissions');
  } else {"""

router_new = """  } else if (hash === '#/category/commissions') {
    showCategoryView('commissions');
  } else if (hash === '#/about' || hash === '#/about-artist') {
    showAboutArtistView();
  } else {"""

if router_old in html:
    html = html.replace(router_old, router_new, 1)
    print("Added '#/about' route to router()!")

# Replace the old toggleMobileAccordion and related functions with updated_accordion_js
old_acc_block = re.search(r'function toggleMobileMenu\(\).*?function closeReviewsModal\(\)\s*\{[^}]*\}', html, re.DOTALL)
if old_acc_block:
    # preserve closeReviewsModal and handleMenuScroll
    clean_block = updated_accordion_js + """
function handleMenuScroll(targetId) {
  collapseAllMobileAccordions();
  closeMobileMenu();
  if (window.location.hash !== '' && window.location.hash !== '#/' && window.location.hash !== '#') {
    if (typeof navigate === 'function') {
      navigate('#/');
    } else {
      window.location.hash = '#/';
    }
  }
  setTimeout(() => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, 250);
}

function openReviewsModal() {
  const m = document.getElementById('collector-reviews-modal');
  if (m) m.classList.remove('hidden');
}

function closeReviewsModal() {
  const m = document.getElementById('collector-reviews-modal');
  if (m) m.classList.add('hidden');
}
"""
    html = html[:old_acc_block.start()] + clean_block + html[old_acc_block.end():]
    print("Replaced accordion JavaScript with clean collapse/toggle handlers!")

# Save to index.html and preview.html
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

## Skip writing preview.html to preserve backup
#with open('preview.html', 'w', encoding='utf-8') as f:
#    f.write(html)

print("Saved updated index.html & preview.html! Final length:", len(html))
