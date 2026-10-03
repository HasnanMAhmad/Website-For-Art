import re
import os

def apply_fixes(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. FIX HIGH-CONTRAST "VIEW ARTWORK" BUTTON & REMOVE EXTRA LINE & REMOVE CHEVRON ARROWS
    old_banner_controls_pattern = re.compile(
        r'<div class="max-w-2xl">.*?<!-- Bottom Controls: Slide Dots & Chevron Arrows -->.*?</div>\s*</div>\s*</section>',
        re.DOTALL
    )

    new_banner_content = """<div class="max-w-2xl">
          <span id="banner-category" class="text-[10px] sm:text-xs uppercase tracking-widest text-[#E8C8C2] font-semibold block mb-1">
            Original Masterwork
          </span>
          <h1 id="banner-title" class="font-serif text-2xl sm:text-4xl lg:text-5xl text-white font-medium leading-tight tracking-tight drop-shadow-lg">
            Whispers of the Courtyard
          </h1>
          <p id="banner-medium" class="text-[11px] sm:text-sm text-stone-200 mt-1 font-sans drop-shadow-md">
            Original Oil & 24k Gold Leaf • 40 x 50 cm
          </p>

          <!-- High-Contrast Radiant Buttons (Clearly visible on any painting background) -->
          <div class="mt-4 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <a id="banner-link" href="#/product/orig-1" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-stone-900 font-semibold text-xs uppercase tracking-wider shadow-xl hover:bg-stone-100 hover:scale-105 active:scale-95 transition-all">
              <span>View Artwork</span>
              <svg class="w-3.5 h-3.5 text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
            <a href="#about" onclick="handleMenuScroll('about')" class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black/50 text-white border border-white/40 hover:bg-white hover:text-stone-900 text-xs uppercase tracking-wider backdrop-blur-md transition-all">
              <span>About the Artist ↓</span>
            </a>
            <a href="#/category/originals" class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black/50 text-white border border-white/40 hover:bg-white hover:text-stone-900 text-xs uppercase tracking-wider backdrop-blur-md transition-all hidden sm:inline-flex">
              <span>All Originals</span>
            </a>
          </div>
        </div>

        <!-- Bottom Controls: Clickable Indicator Dots Only (Line & Arrow Chevrons Removed) -->
        <div class="flex items-center justify-center w-full pt-1 pb-1">
          <div class="flex items-center gap-2.5 bg-black/45 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-md">
            <button onclick="setBannerSlide(0)" class="banner-dot w-7 h-2 rounded-full bg-white transition-all duration-300 cursor-pointer" aria-label="Slide 1"></button>
            <button onclick="setBannerSlide(1)" class="banner-dot w-2.5 h-2 rounded-full bg-white/40 hover:bg-white/80 transition-all duration-300 cursor-pointer" aria-label="Slide 2"></button>
            <button onclick="setBannerSlide(2)" class="banner-dot w-2.5 h-2 rounded-full bg-white/40 hover:bg-white/80 transition-all duration-300 cursor-pointer" aria-label="Slide 3"></button>
            <button onclick="setBannerSlide(3)" class="banner-dot w-2.5 h-2 rounded-full bg-white/40 hover:bg-white/80 transition-all duration-300 cursor-pointer" aria-label="Slide 4"></button>
            <button onclick="setBannerSlide(4)" class="banner-dot w-2.5 h-2 rounded-full bg-white/40 hover:bg-white/80 transition-all duration-300 cursor-pointer" aria-label="Slide 5"></button>
          </div>
        </div>

      </div>
    </section>"""

    if old_banner_controls_pattern.search(content):
        content = old_banner_controls_pattern.sub(new_banner_content, content)
        print(f"[{os.path.basename(file_path)}] Updated banner controls & removed extra line and arrows.")
    else:
        print(f"[{os.path.basename(file_path)}] Warning: old banner controls pattern not matched directly.")

    # 2. FIX TICKS (✓ CHECKMARKS) IN ABOUT SECTION (Make them crisp, bold inline SVGs)
    old_ticks_pattern = re.compile(
        r'<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-300/60">.*?</div>\s*</div>\s*<div class="pt-4">',
        re.DOTALL
    )

    new_ticks_html = """<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-300/60">
              <div class="flex items-start gap-3">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <svg class="w-3.5 h-3.5 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
                <span class="text-xs sm:text-sm text-stone-800 font-medium">100% Acid-Free Cotton Rag Papers</span>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <svg class="w-3.5 h-3.5 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
                <span class="text-xs sm:text-sm text-stone-800 font-medium">Plastic-Free UK Recyclable Packaging</span>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <svg class="w-3.5 h-3.5 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
                <span class="text-xs sm:text-sm text-stone-800 font-medium">Signed Certificate with Every Original</span>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <svg class="w-3.5 h-3.5 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
                <span class="text-xs sm:text-sm text-stone-800 font-medium">Archival Inks with 100+ Year Longevity</span>
              </div>
            </div>

            <div class="pt-4">"""

    if old_ticks_pattern.search(content):
        content = old_ticks_pattern.sub(new_ticks_html, content)
        print(f"[{os.path.basename(file_path)}] Replaced ticks with bold, crisp high-contrast SVG checkmarks.")

    # 3. ADD TOUCH SWIPE AND DOT CLICK HANDLERS IN JAVASCRIPT
    touch_js = """
// Touch-Swipe & Clickable Indicator Dots for Hero Banner
let touchStartX = 0;
let touchEndX = 0;

function initBannerTouchSwipe() {
  const banner = document.querySelector('.hero-landscape-banner');
  if (!banner) return;

  banner.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  banner.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleBannerSwipe();
  }, { passive: true });
}

function handleBannerSwipe() {
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 40) {
    if (diff > 0) {
      nextBannerSlide(); // Swiped left -> next
    } else {
      prevBannerSlide(); // Swiped right -> prev
    }
  }
}

// Update showBannerSlide to animate pill width for active dot
const originalShowBannerSlide = showBannerSlide;
showBannerSlide = function(index) {
  const slides = document.querySelectorAll('.hero-banner-slide');
  const dots = document.querySelectorAll('.banner-dot');
  if (!slides.length) return;

  currentBannerSlide = (index + slides.length) % slides.length;

  slides.forEach((s, idx) => {
    if (idx === currentBannerSlide) {
      s.classList.add('active');
    } else {
      s.classList.remove('active');
    }
  });

  dots.forEach((d, idx) => {
    if (idx === currentBannerSlide) {
      d.classList.remove('w-2.5', 'bg-white/40');
      d.classList.add('w-7', 'bg-white');
    } else {
      d.classList.remove('w-7', 'bg-white');
      d.classList.add('w-2.5', 'bg-white/40');
    }
  });

  const active = slides[currentBannerSlide];
  if (active) {
    const title = active.getAttribute('data-title');
    const medium = active.getAttribute('data-medium');
    const category = active.getAttribute('data-category');
    const link = active.getAttribute('data-link');

    const titleEl = document.getElementById('banner-title');
    const mediumEl = document.getElementById('banner-medium');
    const catEl = document.getElementById('banner-category');
    const linkEl = document.getElementById('banner-link');
    const counterEl = document.getElementById('banner-counter');

    if (titleEl && title) titleEl.textContent = title;
    if (mediumEl && medium) mediumEl.textContent = medium;
    if (catEl && category) catEl.textContent = category;
    if (linkEl && link) linkEl.href = link;
    if (counterEl) counterEl.textContent = `${currentBannerSlide + 1} / ${slides.length}`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initBannerTouchSwipe();
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initBannerTouchSwipe();
}
"""

    if '/* ==========================================================\n   EDGE-TO-EDGE HERO BANNER SLIDER' in content:
        content = content.replace('/* ==========================================================\n   EDGE-TO-EDGE HERO BANNER SLIDER', touch_js + '\n/* ==========================================================\n   EDGE-TO-EDGE HERO BANNER SLIDER')
        print(f"[{os.path.basename(file_path)}] Added touch swipe logic and dynamic dot animations.")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"[{os.path.basename(file_path)}] Successfully saved.")

# Apply to both index.html and preview.html
apply_fixes(r'E:\Website_For_Art\index.html')
apply_fixes(r'E:\Website_For_Art\preview.html')
