/**
 * Mishi's Artwork - Main Application Controller
 * Handles Router, Category Pages, Product Detail Pages (PDP),
 * Admin Studio Image Uploader, Cart, Wishlist, 4-Currency Conversion,
 * Room Wall Simulator, and Interactive Modals.
 */

// Application State
window.state = {
  currency: 'GBP',
  cart: [],
  wishlist: [],
  discountCode: '',
  discountPercent: 0,
  activeOriginalFilter: 'all',
  activePrintFilter: 'all',
  activeBookmarkFilter: 'all',
  currentRoomArtwork: null,
  currentModalArtwork: null,
  pdpArtwork: null,
  pdpSelectedSize: null,
  pdpSelectedPriceGBP: 0,
  pdpSelectedFrame: 'Unframed / Original',
  pdpQuantity: 1,
  adminUnlocked: false
};

// Initialize State from LocalStorage
try {
  const savedCurr = localStorage.getItem('mishi_currency');
  if (savedCurr && window.currencyRates && currencyRates[savedCurr]) {
    state.currency = savedCurr;
  }
  const savedCart = localStorage.getItem('mishi_cart');
  if (savedCart) state.cart = JSON.parse(savedCart);
  
  const savedWish = localStorage.getItem('mishi_wishlist');
  if (savedWish) state.wishlist = JSON.parse(savedWish);

  const savedDiscount = localStorage.getItem('mishi_discount');
  if (savedDiscount === 'MISHI10') {
    state.discountCode = 'MISHI10';
    state.discountPercent = 0.10;
  }

  // Load custom uploaded artworks by Admin
  const customArt = localStorage.getItem('mishi_custom_art');
  if (customArt) {
    const parsed = JSON.parse(customArt);
    if (parsed.originals) artCatalog.originals.unshift(...parsed.originals);
    if (parsed.prints) artCatalog.prints.unshift(...parsed.prints);
    if (parsed.bookmarks) artCatalog.bookmarks.unshift(...parsed.bookmarks);
  }
} catch (e) {
  console.warn("Storage init warning:", e);
}

// -------------------------------------------------------------
// CURRENCY FORMATTING & CONVERSION
// -------------------------------------------------------------
function formatPrice(amountGBP) {
  if (!amountGBP && amountGBP !== 0) return '';
  const currentCurr = (window.state && state.currency) ? state.currency : 'GBP';
  const rateInfo = (window.currencyRates && currencyRates[currentCurr]) ? currencyRates[currentCurr] : { symbol: '£', rate: 1.0 };
  const converted = Math.round(amountGBP * rateInfo.rate);
  
  if (currentCurr === 'GBP') {
    return `£${converted.toLocaleString()}`;
  } else if (currentCurr === 'USD') {
    return `$${converted.toLocaleString()}`;
  } else if (currentCurr === 'EUR') {
    return `€${converted.toLocaleString()}`;
  } else if (currentCurr === 'PKR') {
    return `Rs ${converted.toLocaleString()}`;
  }
  return `£${converted.toLocaleString()}`;
}

// -------------------------------------------------------------
// CURRENCY FORMATTING & REFRESH ENGINE
// -------------------------------------------------------------
window.currencyRates = {
  GBP: { symbol: "£", rate: 1.0, code: "GBP", name: "Pound (£)" },
  USD: { symbol: "$", rate: 1.30, code: "USD", name: "Dollar ($)" },
  EUR: { symbol: "€", rate: 1.17, code: "EUR", name: "Euro (€)" },
  PKR: { symbol: "Rs", rate: 365.0, code: "PKR", name: "PKR (Rs)" }
};

function formatPrice(amountGBP) {
  if (!amountGBP && amountGBP !== 0) return '';
  const currentCurr = (window.state && state.currency) ? state.currency : 'GBP';
  const rateInfo = (window.currencyRates && currencyRates[currentCurr]) ? currencyRates[currentCurr] : currencyRates.GBP;
  const converted = Math.round(amountGBP * rateInfo.rate);
  
  if (currentCurr === 'GBP') {
    return `£${converted.toLocaleString()}`;
  } else if (currentCurr === 'USD') {
    return `$${converted.toLocaleString()}`;
  } else if (currentCurr === 'EUR') {
    return `€${converted.toLocaleString()}`;
  } else if (currentCurr === 'PKR') {
    return `Rs ${converted.toLocaleString()}`;
  }
  return `£${converted.toLocaleString()}`;
}

function refreshAllPrices() {
  const current = (window.state && state.currency) ? state.currency : 'GBP';
  console.log("Executing refreshAllPrices() for currency:", current);

  // 1. Home Grids
  try { renderOriginals('originals-grid'); } catch (e) { console.warn(e); }
  try { renderPrints('prints-grid'); } catch (e) { console.warn(e); }
  try { renderBookmarks('bookmarks-grid'); } catch (e) { console.warn(e); }
  try { renderCommissions('commissions-tiers-grid'); } catch (e) { console.warn(e); }

  // 2. Category Page Grids
  try { renderOriginals('category-originals-grid'); } catch (e) { console.warn(e); }
  try { renderPrints('category-prints-grid'); } catch (e) { console.warn(e); }
  try { renderBookmarks('category-bookmarks-grid'); } catch (e) { console.warn(e); }
  try { renderCommissions('category-commissions-grid'); } catch (e) { console.warn(e); }

  // 3. Product Detail Page (PDP)
  if (state.pdpArtwork) {
    const pdpView = document.getElementById('view-pdp');
    if (pdpView && !pdpView.classList.contains('hidden')) {
      try { showPDPView(state.pdpArtwork.id); } catch (e) { console.warn(e); }
    }
  }

  // 4. Cart Drawer
  try { renderCartDrawer(); } catch (e) { console.warn(e); }

  // 5. Checkout Modal Total
  const checkoutTotalEl = document.getElementById('checkout-total-val');
  if (checkoutTotalEl) {
    const subtotalGBP = state.cart.reduce((sum, item) => sum + (item.priceGBP * item.quantity), 0);
    const discountGBP = subtotalGBP * state.discountPercent;
    checkoutTotalEl.textContent = formatPrice(subtotalGBP - discountGBP);
  }

  // 6. Commission Modal Dropdown Options
  ['comm-type-select', 'comm-type-select-modal'].forEach(selId => {
    const sel = document.getElementById(selId);
    if (sel && sel.options && sel.options.length >= 3) {
      sel.options[0].text = `Miniature Keepsake (A5) — from ${formatPrice(95)}`;
      sel.options[1].text = `Bespoke Statement (A4) — from ${formatPrice(185)}`;
      sel.options[2].text = `Grand Canvas Centerpiece — from ${formatPrice(340)}`;
    }
  });

  if (window.lucide && lucide.createIcons) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

function setCurrency(curr, showNotification = true) {
  console.log("setCurrency clicked:", curr);
  if (!window.currencyRates || !currencyRates[curr]) {
    console.warn("Invalid currency:", curr);
    return;
  }

  state.currency = curr;
  try { localStorage.setItem('mishi_currency', curr); } catch (e) {}

  // Update top announcement bar button styles
  document.querySelectorAll('.currency-select-btn').forEach(btn => {
    const isCurr = btn.dataset.currency === curr;
    if (isCurr) {
      btn.className = 'currency-select-btn px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-stone-800 text-white transition-all shadow-sm ring-1 ring-white/20';
    } else {
      btn.className = 'currency-select-btn px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium text-stone-400 hover:text-white transition-all';
    }
  });
  
  // Update mobile drawer button styles
  document.querySelectorAll('.currency-drawer-btn').forEach(btn => {
    const isCurr = btn.dataset.currencyDrawer === curr;
    if (isCurr) {
      btn.className = 'currency-drawer-btn px-2.5 py-1 bg-stone-800 rounded text-white font-bold text-[11px] transition-all shadow-sm ring-1 ring-stone-900';
    } else {
      btn.className = 'currency-drawer-btn px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 text-[11px] transition-all';
    }
  });

  // Execute full price conversion across the entire website
  refreshAllPrices();

  if (showNotification) {
    showToast(`Currency: ${currencyRates[curr].name}`, 1300);
  }
}

window.setCurrency = setCurrency;
window.formatPrice = formatPrice;
window.refreshAllPrices = refreshAllPrices;

// -------------------------------------------------------------
// SPA CLIENT-SIDE ROUTER
// -------------------------------------------------------------
function navigate(hash) {
  window.location.hash = hash;
}
window.navigate = navigate;

function router() {
  const hash = window.location.hash || '#/';
  console.log("Routing to:", hash);

  // Hide all views
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.add('hidden');
  });

  // Close mobile drawer if open
  closeMobileMenu();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (hash.startsWith('#/product/')) {
    const productId = hash.replace('#/product/', '');
    showPDPView(productId);
  } else if (hash === '#/category/originals') {
    showCategoryView('originals');
  } else if (hash === '#/category/prints') {
    showCategoryView('prints');
  } else if (hash === '#/category/bookmarks') {
    showCategoryView('bookmarks');
  } else if (hash === '#/category/commissions') {
    showCategoryView('commissions');
  } else {
    // Default: Home View
    const homeView = document.getElementById('view-home');
    if (homeView) homeView.classList.remove('hidden');
    renderOriginals();
    renderPrints();
    renderBookmarks();
    renderCommissions();
    renderReviews();
    renderInstagram();
  }

  // Update bottom navigation bar active states
  updateBottomNavActive(hash);

  if (window.lucide && lucide.createIcons) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

function updateBottomNavActive(hash) {
  document.querySelectorAll('.mobile-bottom-nav-item').forEach(item => {
    const target = item.getAttribute('href') || '';
    const isActive = (hash === target) || (hash === '#/' && target === '#') || (hash === '' && target === '#');
    item.classList.toggle('active', isActive);
  });
}

// -------------------------------------------------------------
// CATEGORY VIEWS CONTROLLER
// -------------------------------------------------------------
function showCategoryView(categoryType) {
  const targetView = document.getElementById(`view-category-${categoryType}`);
  if (targetView) {
    targetView.classList.remove('hidden');
  }

  if (categoryType === 'originals') {
    renderOriginals('category-originals-grid');
  } else if (categoryType === 'prints') {
    renderPrints('category-prints-grid');
  } else if (categoryType === 'bookmarks') {
    renderBookmarks('category-bookmarks-grid');
  } else if (categoryType === 'commissions') {
    renderCommissions('category-commissions-grid');
  }
}

// -------------------------------------------------------------
// PRODUCT DETAIL PAGE (PDP) CONTROLLER
// -------------------------------------------------------------
function findArtworkById(id) {
  const allOriginals = artCatalog.originals || [];
  const allPrints = artCatalog.prints || [];
  const allBookmarks = artCatalog.bookmarks || [];

  return allOriginals.find(a => a.id === id) ||
         allPrints.find(p => p.id === id) ||
         allBookmarks.find(b => b.id === id) ||
         null;
}

function showPDPView(productId) {
  const artwork = findArtworkById(productId);
  const pdpView = document.getElementById('view-pdp');
  if (!pdpView) return;

  if (!artwork) {
    pdpView.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 class="font-serif text-3xl text-stone-900 mb-4">Artwork Not Found</h2>
        <p class="text-stone-500 mb-8">The piece you are looking for may have been archived or moved.</p>
        <button onclick="navigate('#/')" class="btn-primary">Return to Studio Home</button>
      </div>
    `;
    pdpView.classList.remove('hidden');
    return;
  }

  state.pdpArtwork = artwork;
  state.pdpQuantity = 1;

  // Determine item type & price
  let itemType = 'original';
  let categoryRoute = '#/category/originals';
  let categoryLabel = 'Original Paintings';

  if (artwork.basePriceGBP && artwork.sizes) {
    itemType = 'print';
    categoryRoute = '#/category/prints';
    categoryLabel = 'Fine Art Prints';
    state.pdpSelectedSize = Object.keys(artwork.sizes)[1] || Object.keys(artwork.sizes)[0]; // Default A4
    state.pdpSelectedPriceGBP = artwork.sizes[state.pdpSelectedSize];
    state.pdpSelectedFrame = 'Unframed (Rolled in Archival Tube)';
  } else if (artwork.id.startsWith('bm-') || artwork.typeLabel) {
    itemType = 'bookmark';
    categoryRoute = '#/category/bookmarks';
    categoryLabel = 'Bookmarks & Keepsakes';
    state.pdpSelectedPriceGBP = artwork.priceGBP;
    state.pdpSelectedSize = 'Bookmark (5 x 18 cm)';
    state.pdpSelectedFrame = 'Silk Tassel & Glassine Sleeve';
  } else {
    itemType = 'original';
    categoryRoute = '#/category/originals';
    categoryLabel = 'Original Paintings';
    state.pdpSelectedPriceGBP = artwork.priceGBP;
    state.pdpSelectedSize = artwork.size || 'Original Canvas';
    state.pdpSelectedFrame = 'Original (Ready to Hang)';
  }

  // Render Full PDP
  pdpView.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      
      <!-- Breadcrumb Bar -->
      <nav class="flex items-center justify-between text-xs text-stone-500 mb-8 pb-4 border-b border-stone-200">
        <div class="flex items-center gap-2 flex-wrap">
          <a href="#/" class="hover:text-stone-900 transition-colors">Home</a>
          <span>/</span>
          <a href="${categoryRoute}" class="hover:text-stone-900 transition-colors">${categoryLabel}</a>
          <span>/</span>
          <span class="text-stone-900 font-medium truncate max-w-[200px] sm:max-w-none">${artwork.title}</span>
        </div>
        <button onclick="window.history.back()" class="flex items-center gap-1 hover:text-stone-900 transition-colors shrink-0">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
          <span>Back</span>
        </button>
      </nav>

      <!-- Main PDP 2-Column Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        
        <!-- Left: Image Gallery & Presentation -->
        <div class="lg:col-span-7 flex flex-col gap-4">
          <div class="relative rounded-2xl overflow-hidden bg-[#F4EFEA] border border-stone-200 shadow-sm aspect-[4/5] sm:aspect-square flex items-center justify-center group">
            <img id="pdp-main-image" 
                 src="${artwork.image}" 
                 alt="${artwork.title}" 
                 class="w-full h-full object-cover pdp-gallery-img"
                 onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80'">
            
            <!-- Badges -->
            <div class="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
              ${artwork.status === 'sold' ? '<span class="px-3 py-1 bg-stone-900/90 backdrop-blur text-white text-[11px] uppercase tracking-wider font-semibold rounded-full shadow-sm">Sold to Private Collector</span>' : ''}
              ${artwork.status === 'reserved' ? '<span class="px-3 py-1 bg-amber-700/90 backdrop-blur text-white text-[11px] uppercase tracking-wider font-semibold rounded-full shadow-sm">Reserved</span>' : ''}
              ${itemType === 'original' && artwork.status === 'available' ? '<span class="px-3 py-1 bg-[#8FA387] text-white text-[11px] uppercase tracking-wider font-semibold rounded-full shadow-sm">One-of-a-Kind Original</span>' : ''}
              ${itemType === 'print' ? '<span class="px-3 py-1 bg-[#FAF7F2] text-stone-800 border border-stone-300 text-[11px] uppercase tracking-wider font-semibold rounded-full shadow-sm">Fine Art Giclée</span>' : ''}
              ${itemType === 'bookmark' ? `<span class="px-3 py-1 bg-[#E8C8C2] text-stone-900 text-[11px] uppercase tracking-wider font-semibold rounded-full shadow-sm">${artwork.typeLabel || 'Handmade Bookmark'}</span>` : ''}
            </div>

            <!-- Fullscreen / Zoom Trigger -->
            <button onclick="openArtworkModal('${artwork.id}')" 
                    class="absolute bottom-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur text-stone-800 rounded-full hover:bg-white shadow-md transition-transform hover:scale-110"
                    title="Inspect High-Res Details">
              <i data-lucide="maximize-2" class="w-4 h-4"></i>
            </button>
          </div>

          <!-- Interactive Action Buttons below Image -->
          <div class="grid grid-cols-2 gap-3">
            <button onclick="openRoomSimulator('${artwork.id}')" 
                    class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-stone-300 hover:border-stone-800 bg-white text-stone-800 text-xs font-semibold uppercase tracking-wider transition-all">
              <i data-lucide="layout-template" class="w-4 h-4 text-[#8FA387]"></i>
              <span>View in Your Room</span>
            </button>

            <button onclick="copyPdpShareLink('${artwork.title}')" 
                    class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-stone-300 hover:border-stone-800 bg-white text-stone-800 text-xs font-semibold uppercase tracking-wider transition-all">
              <i data-lucide="share-2" class="w-4 h-4 text-stone-600"></i>
              <span>Share Artwork</span>
            </button>
          </div>
        </div>

        <!-- Right: Purchasing & Details -->
        <div class="lg:col-span-5 flex flex-col">
          
          <div class="mb-4">
            <span class="text-xs uppercase tracking-widest text-[#8FA387] font-semibold">${artwork.categoryLabel || 'Fine Art'}</span>
            <h1 class="font-serif text-3xl sm:text-4xl text-stone-900 font-semibold mt-1 mb-2">${artwork.title}</h1>
            <p class="text-xs text-stone-500 font-sans">${artwork.medium || 'Fine Art Giclée on Cotton Rag'} • ${artwork.year || '2026'}</p>
          </div>

          <!-- Price Display -->
          <div class="p-4 rounded-xl bg-[#FAF7F2] border border-stone-200/80 mb-6">
            <div class="flex items-baseline justify-between">
              <div>
                <span id="pdp-price-value" class="font-serif text-3xl font-semibold text-stone-900">
                  ${formatPrice(state.pdpSelectedPriceGBP)}
                </span>
                <span class="text-xs text-stone-500 ml-1">Free Tracked UK Delivery</span>
              </div>
              <div class="text-[11px] text-[#8FA387] font-medium uppercase tracking-wide">
                ${artwork.status === 'available' || artwork.inStock || itemType === 'print' ? '● In Studio / Available' : '● Sold'}
              </div>
            </div>
          </div>

          <!-- Selectors: Size Selector (if Print) -->
          ${itemType === 'print' ? `
            <div class="mb-5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">Select Print Size</label>
              <div class="grid grid-cols-2 gap-2">
                ${Object.entries(artwork.sizes).map(([sz, pr]) => `
                  <button type="button" 
                          onclick="changePdpPrintSize('${sz}', ${pr})"
                          id="pdp-size-btn-${sz.replace(/[^a-zA-Z0-9]/g, '')}"
                          class="pdp-size-option text-left p-2.5 rounded-lg border ${sz === state.pdpSelectedSize ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'} transition-all">
                    <div class="text-xs font-semibold">${sz}</div>
                    <div class="text-[11px] opacity-80">${formatPrice(pr)}</div>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Framing Selector -->
          <div class="mb-5">
            <label class="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">Framing & Presentation</label>
            <select id="pdp-frame-picker" 
                    onchange="state.pdpSelectedFrame = this.value"
                    class="w-full text-xs p-3 rounded-lg border border-stone-200 bg-white text-stone-800 focus:outline-none focus:border-stone-800 transition-colors">
              ${(artwork.framingOptions || [
                "Unframed (Acid-Free Glassine Wrap)",
                "Bespoke Solid Natural Oak (+£65)",
                "Contemporary Matte Satin Black (+£65)",
                "Vintage Antique Gilt Wood (+£95)"
              ]).map(f => `<option value="${f}">${f}</option>`).join('')}
            </select>
          </div>

          <!-- Quantity & Add to Cart -->
          <div class="flex items-center gap-3 mb-6">
            <div class="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shrink-0">
              <button onclick="adjustPdpQuantity(-1)" class="px-3 py-3 text-stone-600 hover:bg-stone-100 transition-colors text-sm font-bold">−</button>
              <span id="pdp-qty-display" class="px-3 py-3 text-xs font-semibold text-stone-900 min-w-[2.5rem] text-center">1</span>
              <button onclick="adjustPdpQuantity(1)" class="px-3 py-3 text-stone-600 hover:bg-stone-100 transition-colors text-sm font-bold">+</button>
            </div>

            <button onclick="addPdpToCart()" 
                    ${artwork.status === 'sold' ? 'disabled' : ''}
                    class="flex-1 py-3.5 px-6 rounded-lg ${artwork.status === 'sold' ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'btn-primary'} text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm">
              <i data-lucide="shopping-bag" class="w-4 h-4"></i>
              <span>${artwork.status === 'sold' ? 'Acquired (Sold Out)' : 'Add to Collector Bag'}</span>
            </button>

            <button onclick="toggleWishlist('${artwork.id}')" 
                    class="p-3.5 rounded-lg border border-stone-300 hover:border-stone-800 bg-white text-stone-800 transition-all shrink-0"
                    title="Save to Wishlist">
              <i data-lucide="heart" class="w-4 h-4 ${state.wishlist.includes(artwork.id) ? 'fill-[#C99C94] text-[#C99C94]' : ''}"></i>
            </button>
          </div>

          <!-- Collector Reassurances -->
          <div class="grid grid-cols-2 gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200/60 mb-6 text-[11px] text-stone-600">
            <div class="flex items-center gap-2">
              <i data-lucide="check" class="w-3.5 h-3.5 text-[#8FA387]"></i>
              <span>Signed Studio Certificate</span>
            </div>
            <div class="flex items-center gap-2">
              <i data-lucide="truck" class="w-3.5 h-3.5 text-[#8FA387]"></i>
              <span>Free Tracked UK Delivery</span>
            </div>
            <div class="flex items-center gap-2">
              <i data-lucide="shield-check" class="w-3.5 h-3.5 text-[#8FA387]"></i>
              <span>100% Archival Museum Grade</span>
            </div>
            <div class="flex items-center gap-2">
              <i data-lucide="package" class="w-3.5 h-3.5 text-[#8FA387]"></i>
              <span>Plastic-Free Recyclable Wrap</span>
            </div>
          </div>

          <!-- Product Details Accordions -->
          <div class="border-t border-stone-200">
            
            <!-- Accordion 1: Story & Inspiration -->
            <div>
              <div class="pdp-accordion-header" onclick="togglePdpAccordion('acc-story')">
                <span>Story & Inspiration</span>
                <i data-lucide="chevron-down" id="acc-story-icon" class="w-4 h-4 transition-transform"></i>
              </div>
              <div id="acc-story" class="pdp-accordion-content">
                <p class="mb-2">${artwork.story || artwork.description}</p>
                <p class="italic text-stone-500">"Every brushstroke is an intimate conversation between raw pigment, light, and memories that refuse to fade." — Mishi</p>
              </div>
            </div>

            <!-- Accordion 2: Materials & Specs -->
            <div>
              <div class="pdp-accordion-header" onclick="togglePdpAccordion('acc-specs')">
                <span>Materials & Specifications</span>
                <i data-lucide="chevron-down" id="acc-specs-icon" class="w-4 h-4 transition-transform"></i>
              </div>
              <div id="acc-specs" class="pdp-accordion-content hidden">
                <p class="mb-2">${artwork.specs || 'Created using professional lightfast pigments with maximum permanence ratings.'}</p>
                <ul class="list-disc list-inside space-y-1 text-stone-500">
                  <li>Medium: ${artwork.medium || 'Archival Pigment Giclée'}</li>
                  <li>Paper / Support: ${artwork.paper || 'Hahnemühle 310gsm German Etching Cotton Paper'}</li>
                  <li>Lightfastness: Certified 100+ Years archival rating</li>
                  <li>Finishing: Sealed against moisture and airborne pollutants</li>
                </ul>
              </div>
            </div>

            <!-- Accordion 3: Delivery & Care -->
            <div>
              <div class="pdp-accordion-header" onclick="togglePdpAccordion('acc-delivery')">
                <span>Delivery, Packaging & Care</span>
                <i data-lucide="chevron-down" id="acc-delivery-icon" class="w-4 h-4 transition-transform"></i>
              </div>
              <div id="acc-delivery" class="pdp-accordion-content hidden">
                <p class="mb-2"><strong>UK Dispatch:</strong> Shipped within 2-4 business days via Royal Mail Special Delivery / Tracked 24. Protective cardboard bookfolds for prints and custom wooden crates for large original canvases.</p>
                <p class="mb-2"><strong>Worldwide Shipping:</strong> Available to USA, Europe, Canada, UAE, Pakistan, and worldwide via DHL Express.</p>
                <p><strong>Art Care:</strong> We recommend UV-filtering Artglass glazing and avoiding direct high humidity.</p>
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- Related Artworks Section -->
      <div class="mt-16 sm:mt-24 pt-12 border-t border-stone-200">
        <div class="flex items-end justify-between mb-8">
          <div>
            <span class="text-xs uppercase tracking-widest text-[#8FA387] font-semibold">Curated Recommendations</span>
            <h2 class="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mt-1">You May Also Cherish</h2>
          </div>
          <a href="${categoryRoute}" class="text-xs font-semibold text-stone-800 hover:text-[#8FA387] flex items-center gap-1">
            <span>Explore Collection</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>

        <div id="pdp-related-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Rendered via JS -->
        </div>
      </div>

    </div>
  `;

  // Render Related recommendations
  renderPdpRelated(artwork);

  pdpView.classList.remove('hidden');

  if (window.lucide && lucide.createIcons) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

function updatePdpPrice() {
  const priceVal = document.getElementById('pdp-price-value');
  if (priceVal && state.pdpSelectedPriceGBP) {
    priceVal.textContent = formatPrice(state.pdpSelectedPriceGBP);
  }
}

function changePdpPrintSize(sizeStr, priceGBP) {
  state.pdpSelectedSize = sizeStr;
  state.pdpSelectedPriceGBP = priceGBP;

  // Update button active states
  document.querySelectorAll('.pdp-size-option').forEach(btn => {
    btn.className = 'pdp-size-option text-left p-2.5 rounded-lg border border-stone-200 bg-white text-stone-800 hover:border-stone-400 transition-all';
  });

  const activeBtn = document.getElementById(`pdp-size-btn-${sizeStr.replace(/[^a-zA-Z0-9]/g, '')}`);
  if (activeBtn) {
    activeBtn.className = 'pdp-size-option text-left p-2.5 rounded-lg border border-stone-900 bg-stone-900 text-white transition-all shadow-sm';
  }

  updatePdpPrice();
}

function adjustPdpQuantity(delta) {
  state.pdpQuantity = Math.max(1, state.pdpQuantity + delta);
  const qtyEl = document.getElementById('pdp-qty-display');
  if (qtyEl) qtyEl.textContent = state.pdpQuantity;
}

function addPdpToCart() {
  if (!state.pdpArtwork) return;
  const art = state.pdpArtwork;

  addToCart({
    id: art.id,
    title: art.title,
    priceGBP: state.pdpSelectedPriceGBP,
    image: art.image,
    selectedSize: state.pdpSelectedSize,
    selectedFrame: state.pdpSelectedFrame,
    type: art.sizes ? 'Fine Art Print' : (art.id.startsWith('bm-') ? 'Bookmark' : 'Original Painting'),
    quantity: state.pdpQuantity
  });
}

function togglePdpAccordion(accId) {
  const content = document.getElementById(accId);
  const icon = document.getElementById(`${accId}-icon`);
  if (!content) return;

  const isHidden = content.classList.contains('hidden');
  content.classList.toggle('hidden', !isHidden);
  if (icon) {
    icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
  }
}

function copyPdpShareLink(title) {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    showToast(`Direct link copied for "${title}"!`);
  }).catch(() => {
    showToast(`Artwork URL: ${url}`);
  });
}

function renderPdpRelated(currentArtwork) {
  const container = document.getElementById('pdp-related-grid');
  if (!container) return;

  // Find 3 artworks excluding current
  const pool = [
    ...(artCatalog.originals || []),
    ...(artCatalog.prints || []),
    ...(artCatalog.bookmarks || [])
  ].filter(item => item.id !== currentArtwork.id);

  // Shuffle & slice 3
  const recommendations = pool.slice(0, 3);

  container.innerHTML = recommendations.map(item => {
    const isPrint = !!item.sizes;
    const displayPrice = isPrint ? formatPrice(item.basePriceGBP) : formatPrice(item.priceGBP);
    const prefix = isPrint ? 'From ' : '';

    return `
      <div class="art-card overflow-hidden flex flex-col group cursor-pointer" onclick="navigate('#/product/${item.id}')">
        <div class="image-container relative aspect-[4/5] overflow-hidden">
          <img src="${item.image}" 
               alt="${item.title}" 
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
               onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'">
          <div class="absolute top-3 left-3 z-10">
            <span class="badge badge-sage text-[10px]">${item.categoryLabel || 'Fine Art'}</span>
          </div>
        </div>
        <div class="p-4 flex flex-col flex-1 bg-white">
          <h3 class="font-serif text-lg font-semibold text-stone-900 group-hover:text-[#8FA387] transition-colors truncate">${item.title}</h3>
          <div class="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
            <span class="font-serif text-base font-semibold text-stone-800">${prefix}${displayPrice}</span>
            <span class="text-xs text-[#8FA387] font-semibold flex items-center gap-0.5">
              <span>View Piece</span>
              <i data-lucide="arrow-right" class="w-3 h-3"></i>
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------
// ADMIN STUDIO UPLOAD PORTAL
// -------------------------------------------------------------
function openAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  if (!state.adminUnlocked) {
    document.getElementById('admin-login-view').classList.remove('hidden');
    document.getElementById('admin-dashboard-view').classList.add('hidden');
  } else {
    document.getElementById('admin-login-view').classList.add('hidden');
    document.getElementById('admin-dashboard-view').classList.remove('hidden');
    renderAdminArtworksList();
  }
}

function closeAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) modal.classList.add('hidden');
}

function verifyAdminPin() {
  const pinInput = document.getElementById('admin-pin-input');
  const errorMsg = document.getElementById('admin-pin-error');
  if (pinInput && pinInput.value === 'mishi2026') {
    state.adminUnlocked = true;
    if (errorMsg) errorMsg.classList.add('hidden');
    document.getElementById('admin-login-view').classList.add('hidden');
    document.getElementById('admin-dashboard-view').classList.remove('hidden');
    renderAdminArtworksList();
    showToast("Admin Studio Portal Unlocked!");
  } else {
    if (errorMsg) errorMsg.classList.remove('hidden');
  }
}

// Handle Image File Upload via Dropzone or Camera
let pendingAdminImageData = null;

function handleAdminImageUpload(event) {
  const file = event.target.files ? event.target.files[0] : null;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    pendingAdminImageData = e.target.result;
    const previewImg = document.getElementById('admin-upload-preview');
    const placeholder = document.getElementById('admin-upload-placeholder');
    if (previewImg && placeholder) {
      previewImg.src = pendingAdminImageData;
      previewImg.classList.remove('hidden');
      placeholder.classList.add('hidden');
    }
  };
  reader.readAsDataURL(file);
}

function publishNewArtwork(event) {
  event.preventDefault();

  if (!pendingAdminImageData) {
    alert("Please select or capture a photo of the artwork first!");
    return;
  }

  const title = document.getElementById('admin-art-title').value.trim();
  const type = document.getElementById('admin-art-type').value;
  const category = document.getElementById('admin-art-category').value;
  const priceGBP = parseFloat(document.getElementById('admin-art-price').value) || 50;
  const medium = document.getElementById('admin-art-medium').value.trim() || 'Original Mixed Media';
  const size = document.getElementById('admin-art-size').value.trim() || 'Original Dimensions';
  const description = document.getElementById('admin-art-desc').value.trim();

  const newId = `custom-${type}-${Date.now()}`;

  const categoryLabelMap = {
    culture: "Culture & Heritage",
    emotional: "Emotional Identity",
    botanical: "Botanical & Nature"
  };

  const newArtwork = {
    id: newId,
    title: title,
    category: category,
    categoryLabel: categoryLabelMap[category] || "Original Artwork",
    medium: medium,
    size: size,
    year: "2026",
    priceGBP: priceGBP,
    status: "available",
    featured: true,
    description: description,
    story: description,
    specs: `${medium} • Dimensions: ${size}`,
    image: pendingAdminImageData,
    isOriginal: type === 'original'
  };

  // If print, format sizes
  if (type === 'print') {
    newArtwork.basePriceGBP = priceGBP;
    newArtwork.sizes = {
      "A5 (15 x 21 cm)": Math.round(priceGBP * 0.7),
      "A4 (21 x 30 cm)": priceGBP,
      "A3 (30 x 42 cm)": Math.round(priceGBP * 1.6),
      "A2 (42 x 60 cm)": Math.round(priceGBP * 2.5)
    };
  }

  // Insert into live catalog
  if (type === 'original') {
    artCatalog.originals.unshift(newArtwork);
  } else if (type === 'print') {
    artCatalog.prints.unshift(newArtwork);
  } else if (type === 'bookmark') {
    artCatalog.bookmarks.unshift(newArtwork);
  }

  // Save to localStorage
  try {
    let customData = JSON.parse(localStorage.getItem('mishi_custom_art') || '{"originals":[],"prints":[],"bookmarks":[]}');
    if (type === 'original') customData.originals.unshift(newArtwork);
    if (type === 'print') customData.prints.unshift(newArtwork);
    if (type === 'bookmark') customData.bookmarks.unshift(newArtwork);
    localStorage.setItem('mishi_custom_art', JSON.stringify(customData));
  } catch (err) {
    console.error("Storage error:", err);
  }

  // Reset form
  document.getElementById('admin-upload-form').reset();
  pendingAdminImageData = null;
  const previewImg = document.getElementById('admin-upload-preview');
  const placeholder = document.getElementById('admin-upload-placeholder');
  if (previewImg && placeholder) {
    previewImg.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }

  renderAdminArtworksList();
  renderOriginals();
  renderPrints();
  renderBookmarks();

  showToast(`"${title}" published to live gallery!`);
}

function renderAdminArtworksList() {
  const container = document.getElementById('admin-artworks-list');
  if (!container) return;

  const allItems = [
    ...(artCatalog.originals || []),
    ...(artCatalog.prints || []),
    ...(artCatalog.bookmarks || [])
  ];

  container.innerHTML = allItems.map(item => `
    <div class="flex items-center justify-between p-3 rounded-lg bg-white border border-stone-200">
      <div class="flex items-center gap-3">
        <img src="${item.image}" class="w-10 h-10 object-cover rounded" onerror="this.src='https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100'">
        <div>
          <h4 class="text-xs font-semibold text-stone-900 truncate max-w-[180px]">${item.title}</h4>
          <p class="text-[10px] text-stone-500">${item.categoryLabel || 'Artwork'} • ${formatPrice(item.priceGBP || item.basePriceGBP)}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="navigate('#/product/${item.id}'); closeAdminModal();" class="text-xs text-[#8FA387] font-semibold hover:underline">View</button>
      </div>
    </div>
  `).join('');
}

function downloadUpdatedCatalog() {
  const catalogStr = `// Mishi's Artwork - Exported Catalog Data\nconst artCatalog = ${JSON.stringify(artCatalog, null, 2)};\n`;
  const blob = new Blob([catalogStr], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.js';
  a.click();
  URL.revokeObjectURL(url);
  showToast("Downloaded products.js! You can now commit this to GitHub.");
}

// -------------------------------------------------------------
// GALLERY RENDERERS
// -------------------------------------------------------------
function renderOriginals(targetGridId = 'originals-grid') {
  const container = document.getElementById(targetGridId);
  if (!container) return;

  let list = artCatalog.originals;
  if (state.activeOriginalFilter !== 'all') {
    list = list.filter(art => art.category === state.activeOriginalFilter);
  }

  container.innerHTML = list.map(art => {
    return `
      <div class="art-card overflow-hidden flex flex-col group">
        <div class="image-container relative aspect-[4/5] overflow-hidden cursor-pointer" onclick="navigate('#/product/${art.id}')">
          <img src="${art.image}" 
               alt="${art.title}" 
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
               onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'">
          
          <div class="absolute top-3 left-3 z-10">
            ${art.status === 'sold' 
              ? '<span class="badge badge-sold">Sold</span>' 
              : art.status === 'reserved'
              ? '<span class="badge badge-sage">Reserved</span>'
              : '<span class="badge badge-blush">Original</span>'}
          </div>

          <button onclick="event.stopPropagation(); toggleWishlist('${art.id}')" 
                  class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-stone-700 hover:text-[#C99C94] shadow-sm transition-all">
            <i data-lucide="heart" class="w-4 h-4 ${state.wishlist.includes(art.id) ? 'fill-[#C99C94] text-[#C99C94]' : ''}"></i>
          </button>

          <div class="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onclick="event.stopPropagation(); openRoomSimulator('${art.id}')" 
                    class="flex-1 bg-stone-900/90 backdrop-blur text-white text-xs py-2 px-3 rounded-lg hover:bg-stone-900 flex items-center justify-center gap-1.5 shadow-md">
              <i data-lucide="layout-template" class="w-3.5 h-3.5"></i>
              <span>View in Room</span>
            </button>
            <button onclick="event.stopPropagation(); navigate('#/product/${art.id}')" 
                    class="bg-white/95 text-stone-800 p-2 rounded-lg hover:bg-white shadow-md">
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <div class="p-4 sm:p-5 flex flex-col flex-1 bg-white">
          <div class="flex items-center justify-between text-xs text-stone-600 mb-1 font-sans">
            <span>${art.categoryLabel || 'Original'}</span>
            <span>${art.size}</span>
          </div>

          <h3 class="font-serif text-lg sm:text-xl font-semibold text-stone-900 group-hover:text-[#8FA387] transition-colors cursor-pointer" onclick="navigate('#/product/${art.id}')">
            ${art.title}
          </h3>

          <p class="text-xs text-stone-700 mt-1 line-clamp-2 font-sans">${art.medium}</p>

          <div class="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span class="font-serif text-lg font-semibold text-stone-800">${formatPrice(art.priceGBP)}</span>
            </div>
            
            ${art.status === 'available' ? `
              <button onclick="navigate('#/product/${art.id}')"
                      class="btn-primary py-1.5 px-3 text-xs uppercase tracking-wider font-semibold">
                View Piece
              </button>
            ` : `
              <span class="text-xs font-serif text-stone-500 italic">In Private Collection</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide && lucide.createIcons) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

function renderPrints(targetGridId = 'prints-grid') {
  const container = document.getElementById(targetGridId);
  if (!container) return;

  let list = artCatalog.prints;
  if (state.activePrintFilter !== 'all') {
    list = list.filter(p => p.category === state.activePrintFilter);
  }

  container.innerHTML = list.map(print => {
    return `
      <div class="art-card overflow-hidden flex flex-col group">
        <div class="image-container relative aspect-[4/5] overflow-hidden cursor-pointer" onclick="navigate('#/product/${print.id}')">
          <img src="${print.image}" 
               alt="${print.title}" 
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
               onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'">
          
          <div class="absolute top-3 left-3 z-10 flex flex-col gap-1">
            <span class="badge badge-sage">Fine Art Giclée</span>
            ${print.bestseller ? '<span class="badge badge-blush">Bestseller</span>' : ''}
          </div>

          <button onclick="event.stopPropagation(); toggleWishlist('${print.id}')" 
                  class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-stone-700 hover:text-[#C99C94] shadow-sm transition-all">
            <i data-lucide="heart" class="w-4 h-4 ${state.wishlist.includes(print.id) ? 'fill-[#C99C94] text-[#C99C94]' : ''}"></i>
          </button>

          <div class="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onclick="event.stopPropagation(); openRoomSimulator('${print.id}')" 
                    class="flex-1 bg-stone-900/90 backdrop-blur text-white text-xs py-2 px-3 rounded-lg hover:bg-stone-900 flex items-center justify-center gap-1.5 shadow-md">
              <i data-lucide="layout-template" class="w-3.5 h-3.5"></i>
              <span>View in Room</span>
            </button>
            <button onclick="event.stopPropagation(); navigate('#/product/${print.id}')" 
                    class="bg-white/95 text-stone-800 p-2 rounded-lg hover:bg-white shadow-md">
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <div class="p-4 sm:p-5 flex flex-col flex-1 bg-white">
          <div class="flex items-center justify-between text-xs text-stone-600 mb-1 font-sans">
            <span>${print.categoryLabel || 'Prints'}</span>
            <span>Archival Cotton Paper</span>
          </div>

          <h3 class="font-serif text-lg sm:text-xl font-semibold text-stone-900 group-hover:text-[#8FA387] transition-colors cursor-pointer" onclick="navigate('#/product/${print.id}')">
            ${print.title}
          </h3>

          <p class="text-xs text-stone-700 mt-1 line-clamp-2 font-sans">${print.description}</p>

          <div class="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span class="text-[11px] text-stone-600 block">From</span>
              <span class="font-serif text-base sm:text-lg font-semibold text-stone-800">${formatPrice(print.basePriceGBP)}</span>
            </div>
            
            <button onclick="navigate('#/product/${print.id}')"
                    class="btn-primary py-1.5 px-3 text-xs uppercase tracking-wider font-semibold flex items-center gap-1">
              <span>Select Size</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide && lucide.createIcons) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

function renderBookmarks(targetGridId = 'bookmarks-grid') {
  const container = document.getElementById(targetGridId);
  if (!container) return;

  let list = artCatalog.bookmarks;
  if (state.activeBookmarkFilter !== 'all') {
    list = list.filter(bm => bm.type === state.activeBookmarkFilter);
  }

  container.innerHTML = list.map(bm => {
    return `
      <div class="art-card overflow-hidden flex flex-col group">
        <div class="image-container relative aspect-[3/4] overflow-hidden cursor-pointer" onclick="navigate('#/product/${bm.id}')">
          <img src="${bm.image}" 
               alt="${bm.title}" 
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
               onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'">
          
          <div class="absolute top-3 left-3 z-10">
            <span class="badge ${bm.type === 'original' ? 'badge-blush' : 'badge-sage'}">${bm.badge}</span>
          </div>

          <button onclick="event.stopPropagation(); toggleWishlist('${bm.id}')" 
                  class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-stone-700 hover:text-[#C99C94] shadow-sm transition-all">
            <i data-lucide="heart" class="w-3.5 h-3.5 ${state.wishlist.includes(bm.id) ? 'fill-[#C99C94] text-[#C99C94]' : ''}"></i>
          </button>
        </div>

        <div class="p-4 flex flex-col flex-1 bg-white">
          <span class="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#8FA387]">${bm.typeLabel}</span>
          <h3 class="font-serif text-base font-semibold text-stone-900 mt-0.5 group-hover:text-[#8FA387] transition-colors cursor-pointer" onclick="navigate('#/product/${bm.id}')">
            ${bm.title}
          </h3>

          <p class="text-xs text-stone-700 mt-1 line-clamp-2">${bm.details}</p>

          <div class="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span class="font-serif text-lg font-semibold text-stone-800">${formatPrice(bm.priceGBP)}</span>
            <button onclick="navigate('#/product/${bm.id}')"
                    class="btn-primary py-1.5 px-3 text-xs uppercase tracking-wider font-semibold">
              View Details
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide && lucide.createIcons) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

function renderCommissions(targetGridId = 'commissions-tiers-grid') {
  const container = document.getElementById(targetGridId);
  if (!container) return;

  container.innerHTML = artCatalog.commissionTiers.map(tier => {
    return `
      <div class="p-6 sm:p-8 rounded-2xl bg-white border ${tier.popular ? 'border-[#8FA387] ring-2 ring-[#8FA387]/20 shadow-md' : 'border-stone-200 shadow-sm'} flex flex-col relative transition-all">
        ${tier.popular ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8FA387] text-white text-[10px] font-bold tracking-widest uppercase py-0.5 px-3 rounded-full shadow-sm">Popular Choice</div>' : ''}
        
        <div class="mb-3">
          <span class="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#8FA387]">${tier.size}</span>
          <h3 class="font-serif text-2xl font-semibold text-stone-900 mt-0.5">${tier.title}</h3>
        </div>

        <div class="mb-4 pb-4 border-b border-stone-100">
          <div class="flex items-baseline gap-1">
            <span class="text-xs font-sans text-stone-500">From</span>
            <span class="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">${formatPrice(tier.startingPriceGBP)}</span>
          </div>
          <span class="text-[11px] text-stone-600 block mt-0.5">Timeline: ${tier.timeline}</span>
        </div>

        <p class="text-xs text-stone-700 mb-6 flex-1">${tier.idealFor}</p>

        <ul class="space-y-2.5 mb-6 text-xs text-stone-700">
          ${tier.features.map(f => `
            <li class="flex items-center gap-2">
              <i data-lucide="check" class="w-3.5 h-3.5 text-[#8FA387] shrink-0"></i>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>

        <button onclick="openCommissionModal('${tier.title}')" class="w-full ${tier.popular ? 'btn-primary' : 'btn-outline'} py-2.5 text-xs font-semibold uppercase tracking-wider">
          Reserve This Slot
        </button>
      </div>
    `;
  }).join('');

  if (window.lucide && lucide.createIcons) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

function renderReviews() {
  const container = document.getElementById('reviews-grid');
  if (!container) return;

  container.innerHTML = artCatalog.reviews.map(rev => `
    <div class="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm flex flex-col">
      <div class="flex items-center gap-1 text-amber-500 mb-3">
        ${Array(rev.rating).fill('<i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>').join('')}
      </div>
      <p class="text-sm text-stone-700 italic flex-1 font-serif leading-relaxed">"${rev.text}"</p>
      <div class="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
        <div>
          <h4 class="text-xs font-semibold text-stone-900">${rev.name}</h4>
          <span class="text-[11px] text-stone-500">${rev.location}</span>
        </div>
        <span class="text-[10px] uppercase font-semibold text-[#8FA387] bg-stone-50 px-2 py-0.5 rounded border border-stone-100">${rev.artwork}</span>
      </div>
    </div>
  `).join('');
}

function renderInstagram() {
  const container = document.getElementById('instagram-grid');
  if (!container) return;

  container.innerHTML = artCatalog.instagramPosts.map(post => `
    <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="group relative aspect-square rounded-xl overflow-hidden shadow-sm bg-stone-100">
      <img src="${post.image}" alt="Instagram post" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
      <div class="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
        <p class="text-[11px] line-clamp-2 mb-2">${post.caption}</p>
        <div class="flex items-center gap-3 text-[11px]">
          <span class="flex items-center gap-1"><i data-lucide="heart" class="w-3 h-3 fill-white"></i> ${post.likes}</span>
          <span class="flex items-center gap-1"><i data-lucide="message-circle" class="w-3 h-3"></i> ${post.comments}</span>
        </div>
      </div>
    </a>
  `).join('');
}

// -------------------------------------------------------------
// CART & WISHLIST CONTROLLER
// -------------------------------------------------------------
function addToCart(item) {
  const existing = state.cart.find(c => c.id === item.id && c.selectedSize === item.selectedSize && c.selectedFrame === item.selectedFrame);
  const qtyToAdd = item.quantity || 1;

  if (existing) {
    existing.quantity += qtyToAdd;
  } else {
    state.cart.push({ ...item, quantity: qtyToAdd });
  }

  saveCart();
  renderCartDrawer();
  openCartDrawer();
  showToast(`Added "${item.title}" to Bag!`);
}

function updateCartQuantity(index, delta) {
  if (!state.cart[index]) return;
  state.cart[index].quantity += delta;
  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
  }
  saveCart();
  renderCartDrawer();
}

function removeCartItem(index) {
  state.cart.splice(index, 1);
  saveCart();
  renderCartDrawer();
}

function saveCart() {
  try {
    localStorage.setItem('mishi_cart', JSON.stringify(state.cart));
  } catch (e) {}
  updateCartBadge();
}

function updateCartBadge() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.textContent = totalItems;
    badge.classList.toggle('hidden', totalItems === 0);
  });
}

function toggleWishlist(id) {
  const idx = state.wishlist.indexOf(id);
  if (idx > -1) {
    state.wishlist.splice(idx, 1);
    showToast("Removed from Wishlist");
  } else {
    state.wishlist.push(id);
    showToast("Saved to Wishlist");
  }
  try {
    localStorage.setItem('mishi_wishlist', JSON.stringify(state.wishlist));
  } catch (e) {}
  updateWishlistBadge();
  renderOriginals();
  renderPrints();
  renderBookmarks();
}

function updateWishlistBadge() {
  const count = state.wishlist.length;
  document.querySelectorAll('.wishlist-badge').forEach(badge => {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  });
}

function renderCartDrawer() {
  const container = document.getElementById('cart-items-list');
  const emptyState = document.getElementById('cart-empty-state');
  const cartFooter = document.getElementById('cart-footer');
  const subtotalEl = document.getElementById('cart-subtotal');
  const discountRow = document.getElementById('cart-discount-row');
  const discountAmountEl = document.getElementById('cart-discount-amount');
  const shippingProgressText = document.getElementById('shipping-progress-text');
  const shippingProgressBar = document.getElementById('shipping-progress-bar');
  
  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    if (cartFooter) cartFooter.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (cartFooter) cartFooter.style.display = 'block';

  const subtotalGBP = state.cart.reduce((sum, item) => sum + (item.priceGBP * item.quantity), 0);
  const discountGBP = subtotalGBP * state.discountPercent;
  const finalGBP = subtotalGBP - discountGBP;

  const freeShippingThreshold = 50;
  const progressPercent = Math.min(100, Math.round((subtotalGBP / freeShippingThreshold) * 100));
  
  if (shippingProgressBar) {
    shippingProgressBar.style.width = `${progressPercent}%`;
  }
  
  if (shippingProgressText) {
    if (subtotalGBP >= freeShippingThreshold) {
      shippingProgressText.innerHTML = '🎉 <strong>Free UK Tracked Delivery</strong> unlocked!';
    } else {
      const remainingGBP = freeShippingThreshold - subtotalGBP;
      shippingProgressText.innerHTML = `Add <strong>${formatPrice(remainingGBP)}</strong> for Free UK Delivery`;
    }
  }

  if (subtotalEl) subtotalEl.textContent = formatPrice(finalGBP);
  
  if (state.discountPercent > 0) {
    if (discountRow) discountRow.classList.remove('hidden');
    if (discountAmountEl) {
      discountAmountEl.textContent = `-${formatPrice(discountGBP)} (10% VIP)`;
    }
  } else {
    if (discountRow) discountRow.classList.add('hidden');
  }

  container.innerHTML = state.cart.map((item, idx) => `
    <div class="flex gap-4 p-3 rounded-xl bg-[#FAF7F2] border border-stone-200">
      <img src="${item.image}" alt="${item.title}" class="w-16 h-20 object-cover rounded-lg shrink-0">
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <h4 class="font-serif text-sm font-semibold text-stone-900 leading-tight">${item.title}</h4>
          <p class="text-[11px] text-stone-500">${item.selectedSize} • ${item.selectedFrame}</p>
        </div>
        <div class="flex items-center justify-between mt-2">
          <div class="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
            <button onclick="updateCartQuantity(${idx}, -1)" class="px-2 py-0.5 text-stone-600 hover:bg-stone-100 text-xs font-bold">−</button>
            <span class="px-2 text-xs font-semibold text-stone-800">${item.quantity}</span>
            <button onclick="updateCartQuantity(${idx}, 1)" class="px-2 py-0.5 text-stone-600 hover:bg-stone-100 text-xs font-bold">+</button>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-serif text-sm font-semibold text-stone-900">${formatPrice(item.priceGBP * item.quantity)}</span>
            <button onclick="removeCartItem(${idx})" class="text-stone-400 hover:text-rose-600 transition-colors">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide && lucide.createIcons) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

function applyPromoCode() {
  const input = document.getElementById('promo-code-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (code === 'MISHI10') {
    state.discountCode = 'MISHI10';
    state.discountPercent = 0.10;
    try { localStorage.setItem('mishi_discount', 'MISHI10'); } catch(e){}
    renderCartDrawer();
    showToast("10% VIP Collector discount applied!");
  } else {
    showToast("Invalid code. Use MISHI10 for 10% off!");
  }
}

// Drawers & Modals
function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer) drawer.classList.remove('translate-x-full');
  if (backdrop) backdrop.classList.remove('hidden');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer) drawer.classList.add('translate-x-full');
  if (backdrop) backdrop.classList.add('hidden');
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
}

// Filter Tabs
function setOriginalFilter(category) {
  state.activeOriginalFilter = category;
  document.querySelectorAll('.filter-btn-original').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  renderOriginals();
  renderOriginals('category-originals-grid');
}

function setPrintFilter(category) {
  state.activePrintFilter = category;
  document.querySelectorAll('.filter-btn-print').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  renderPrints();
  renderPrints('category-prints-grid');
}

function setBookmarkFilter(type) {
  state.activeBookmarkFilter = type;
  document.querySelectorAll('.filter-btn-bookmark').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
  renderBookmarks();
  renderBookmarks('category-bookmarks-grid');
}

// -------------------------------------------------------------
// ROOM WALL SIMULATOR (AR MOCKUP)
// -------------------------------------------------------------
function openRoomSimulator(id) {
  const artwork = findArtworkById(id);
  if (!artwork) return;
  state.currentRoomArtwork = artwork;

  const modal = document.getElementById('room-simulator-modal');
  const imgEl = document.getElementById('room-modal-artwork-img');
  const titleEl = document.getElementById('room-modal-title');
  const sizeEl = document.getElementById('room-modal-size');
  
  if (imgEl) imgEl.src = artwork.roomPreviewImage || artwork.image;
  if (titleEl) titleEl.textContent = artwork.title;
  if (sizeEl) sizeEl.textContent = artwork.size || "Selected Fine Art Edition";

  if (modal) modal.classList.remove('hidden');
}

function closeRoomSimulator() {
  const modal = document.getElementById('room-simulator-modal');
  if (modal) modal.classList.add('hidden');
}

function setRoomWallColor(colorHex, name) {
  const canvas = document.getElementById('room-wall-canvas');
  if (canvas) canvas.style.backgroundColor = colorHex;
  showToast(`Wall: ${name}`);
}

function setRoomFrame(styleType, name) {
  const renderEl = document.getElementById('room-frame-render');
  if (!renderEl) return;
  
  renderEl.className = 'room-frame-wrapper transition-all duration-300';
  if (styleType === 'oak') renderEl.classList.add('frame-oak');
  else if (styleType === 'black') renderEl.classList.add('frame-black');
  else if (styleType === 'gold') renderEl.classList.add('frame-gold');
  else renderEl.classList.add('frame-unframed');

  showToast(`Frame: ${name}`);
}

// -------------------------------------------------------------
// SEARCH MODAL
// -------------------------------------------------------------
function openSearchModal() {
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-input');
  if (modal) modal.classList.remove('hidden');
  if (input) setTimeout(() => input.focus(), 100);
}

function closeSearchModal() {
  const modal = document.getElementById('search-modal');
  if (modal) modal.classList.add('hidden');
}

function handleSearch(query) {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    resultsContainer.innerHTML = '<p class="text-xs text-stone-600 text-center py-6">Type an artwork title, subject (e.g. peony, archway), or medium...</p>';
    return;
  }

  const all = [
    ...(artCatalog.originals || []).map(o => ({ ...o, itemType: 'Original' })),
    ...(artCatalog.prints || []).map(p => ({ ...p, itemType: 'Print' })),
    ...(artCatalog.bookmarks || []).map(b => ({ ...b, itemType: 'Bookmark' }))
  ];

  const matches = all.filter(a => 
    a.title.toLowerCase().includes(q) || 
    (a.medium && a.medium.toLowerCase().includes(q)) ||
    (a.description && a.description.toLowerCase().includes(q)) ||
    (a.categoryLabel && a.categoryLabel.toLowerCase().includes(q))
  );

  if (matches.length === 0) {
    resultsContainer.innerHTML = `<p class="text-xs text-stone-600 text-center py-6">No pieces found matching "${query}".</p>`;
    return;
  }

  resultsContainer.innerHTML = matches.map(item => `
    <div class="flex items-center justify-between p-3 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer" 
         onclick="navigate('#/product/${item.id}'); closeSearchModal();">
      <div class="flex items-center gap-3">
        <img src="${item.image}" alt="${item.title}" class="w-12 h-14 object-cover rounded-lg">
        <div>
          <span class="text-[10px] uppercase tracking-wider text-[#8FA387] font-semibold">${item.itemType}</span>
          <h4 class="font-serif text-sm font-semibold text-stone-900">${item.title}</h4>
          <span class="text-xs text-stone-600">${item.size || 'Archival Edition'}</span>
        </div>
      </div>
      <span class="font-serif text-sm font-semibold text-stone-800">${formatPrice(item.priceGBP || item.basePriceGBP)}</span>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// COMMISSION MODAL & CHECKOUT
// -------------------------------------------------------------
function openCommissionModal(prefTier = '') {
  const modal = document.getElementById('commission-modal');
  const select = document.getElementById('comm-type-select');
  if (select && prefTier) select.value = prefTier;
  if (modal) modal.classList.remove('hidden');
}

function closeCommissionModal() {
  const modal = document.getElementById('commission-modal');
  if (modal) modal.classList.add('hidden');
}

function submitCommissionForm(event) {
  event.preventDefault();
  closeCommissionModal();
  const name = document.getElementById('comm-name').value;
  const successModal = document.getElementById('commission-success-modal');
  const confName = document.getElementById('conf-client-name');
  if (confName) confName.textContent = name;
  if (successModal) successModal.classList.remove('hidden');
}

function closeCommissionSuccessModal() {
  const successModal = document.getElementById('commission-success-modal');
  if (successModal) successModal.classList.add('hidden');
}

function openCareGuideModal() {
  const modal = document.getElementById('art-care-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeCareGuideModal() {
  const modal = document.getElementById('art-care-modal');
  if (modal) modal.classList.add('hidden');
}

function openCheckoutModal() {
  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  const totalEl = document.getElementById('checkout-total-val');
  const subtotalGBP = state.cart.reduce((sum, item) => sum + (item.priceGBP * item.quantity), 0);
  const discountGBP = subtotalGBP * state.discountPercent;
  const finalGBP = subtotalGBP - discountGBP;
  if (totalEl) totalEl.textContent = formatPrice(finalGBP);
  if (modal) modal.classList.remove('hidden');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('hidden');
}

function completeCheckout(event) {
  event.preventDefault();
  closeCheckoutModal();
  state.cart = [];
  saveCart();
  renderCartDrawer();
  const successModal = document.getElementById('order-completed-modal');
  if (successModal) successModal.classList.remove('hidden');
}

function closeOrderCompletedModal() {
  const successModal = document.getElementById('order-completed-modal');
  if (successModal) successModal.classList.add('hidden');
}

function handleNewsletter(event) {
  event.preventDefault();
  const input = document.getElementById('newsletter-email');
  if (input) {
    showToast(`Thank you for subscribing! Welcome to Collector's Circle.`);
    input.value = '';
  }
}

let activeToastTimeout = null;
function showToast(message, duration = 1300) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Ensure ONLY ONE notification is visible at any time
  container.innerHTML = '';
  if (activeToastTimeout) clearTimeout(activeToastTimeout);

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  activeToastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 250);
  }, duration);
}

// -------------------------------------------------------------
// APP INITIALIZATION
// -------------------------------------------------------------
function initApp() {
  console.log("Initializing Mishi's Artwork App...");
  
// Single event handling via inline onclick

  // Set default or saved currency
  let savedCurrency = null;
  try { savedCurrency = localStorage.getItem('mishi_currency'); } catch (e) {}
  if (savedCurrency && window.currencyRates && currencyRates[savedCurrency]) {
    setCurrency(savedCurrency, false);
  } else {
    setCurrency('GBP', false);
  }

  updateCartBadge();
  updateWishlistBadge();

  // Listen for URL hash changes (Routing)
  window.addEventListener('hashchange', router);

  // Initial Route Check
  router();

  if (window.lucide && lucide.createIcons) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
