# MISHIS ARTWORK — TECHNICAL SPECIFICATION & SYSTEM HANDOVER

**Status**: Storefront, Studio Backend & Clean URL Routing Active, Connected & Automated  
**Production Domain**: [https://mishisartwork.com](https://mishisartwork.com)  
**Studio Admin Route**: [https://mishisartwork.com/admin](https://mishisartwork.com/admin) (or `#/admin`)  
**Artist & Brand**: Mishayam Rehman (UK Fine Artist & Painter)  
**Automated Pipeline**: 100% Operational via FTP (deploying HTML + Apache `.htaccess` + PHP REST API + MySQL backend)  

---

## 🎨 1. Architecture & Technology Stack
- **Frontend Core**: Vanilla HTML5, Modern Dynamic ECMAScript, CSS3 with Tailwind CSS & Lucide Icons.
- **Clean URL Engine**: HTML5 History API (`pushState`/`popstate`) with Hostinger Apache `mod_rewrite` (`.htaccess`). Supports both clean canonical URLs and hash compatibility.
- **Backend API Core**: Production PHP 8.x REST API with MySQL PDO persistence (`/api/products.php`, `/api/upload.php`, `/api/auth.php`, `/api/db.php`).
- **Database**: Hostinger Production MySQL (`u325926470_Mishi_Artwork`) with auto-table migration and graceful local JSON fallback (`api/data/artworks.json`).
- **Packaging Model**: High-performance, self-contained single-page bundle (`index.html`) with dual-mode clean routing.
- **Hero Showcase**: 16:9 Landscape Edge-to-Edge auto-sliding 5 artworks (2s interval).
- **Navigation & Mobile Drawer**: Classic accordion mobile menu matching brand design (`About`, `Originals`, `Prints`, `Bookmarks`, `Commissions [OPEN]`, `Art care instructions`).
- **Currency Engine**: Dynamic 4-currency real-time converter (GBP £, USD $, EUR €, PKR Rs.).
- **Checkout Flow**: WhatsApp Direct Checkout with automated cart summary dispatch.

---

## 🔗 2. Canonical Clean URL Structure
All routes match top luxury e-commerce standards with zero ugly fragments:

| Page / Feature | Clean Canonical URL | Direct Filter / Behavior |
| :--- | :--- | :--- |
| **Homepage** | `https://mishisartwork.com/` | Hero banner, artist spotlight, explore collections |
| **Original Paintings (All)** | `https://mishisartwork.com/originals` | All original fine art oil & mixed media pieces |
| **Culture & Heritage** | `https://mishisartwork.com/originals/culture` | Automatically activates Culture & Heritage collection filter |
| **Emotional Identity** | `https://mishisartwork.com/originals/emotional` | Automatically activates Emotional Identity collection filter |
| **Botanical & Nature** | `https://mishisartwork.com/originals/botanical` | Automatically activates Botanical & Nature collection filter |
| **Fine Art Prints (All)** | `https://mishisartwork.com/prints` | All archival fine art prints |
| **Prints - Culture & Heritage** | `https://mishisartwork.com/prints/culture` | Fine art prints in Culture & Heritage |
| **Prints - Emotional Identity** | `https://mishisartwork.com/prints/emotional` | Fine art prints in Emotional Identity |
| **Prints - Botanical & Nature** | `https://mishisartwork.com/prints/botanical` | Fine art prints in Botanical & Nature |
| **Bookmarks / Keepsakes** | `https://mishisartwork.com/bookmarks` | Hand-painted acrylic bookmarks on cotton rag |
| **Bespoke Commissions** | `https://mishisartwork.com/commissions` | Commission inquiry builder & WhatsApp dispatch |
| **About the Artist** | `https://mishisartwork.com/about` | Mishayam Rehman portrait, manifesto & principles |
| **Art Care Instructions** | `https://mishisartwork.com/art-care` | Dedicated care guides for oil prints & bookmarks |
| **Single Product Page** | `https://mishisartwork.com/product/:id` | Detailed artwork view (e.g. `/product/orig-1`) |
| **Studio Admin Portal** | `https://mishisartwork.com/admin` | Master catalog, painting management & pricing |

*Note: All legacy hash links (e.g. `#/admin`, `#/originals/culture`, `#/category/originals`) remain 100% backward-compatible and automatically resolve cleanly without broken links.*

---

## 🏛️ 3. Studio Backend & Paintings Management (`/admin`)
The Studio Admin Portal is accessible via **`https://mishisartwork.com/admin`** (or `#/admin`), via the "Studio Admin Portal 🔒" footer links, or by pressing **`Ctrl + Shift + A`** anywhere on the site.

### Key Backend Features:
1. **Executive Portfolio Analytics**:
   - Total Artworks in Collection
   - Available for Purchase (In Stock)
   - Reserved (Private Viewing / Hold)
   - Sold (Archival Display)
   - **Total Portfolio Valuation** in £ GBP with live auto-converted rates to USD ($), EUR (€), and PKR (Rs.).
2. **Neat & Visual Artwork Management**:
   - Thumbnail previews with zoom & link to live storefront.
   - Title, Collection badge, Medium, Dimensions, Year.
   - **Inline Price Quick-Editor**: Click or type directly into the price field in £ GBP, see real-time converted currency tooltip (`≈ $... • €... • ₨...`), and click "Save" to immediately update the live database and storefront.
   - **1-Click Availability Selector**: Interactive status dropdown (`Available` [Green], `Reserved` [Amber], `Sold` [Red]) that syncs to MySQL with a single click.
   - **Homepage Featured Star**: 1-click toggle to feature or unpin paintings on the curated homepage showcase.
   - **Full Artwork Editor Modal**: Modify photos (drag & drop upload to `/assets/uploads/` or URL), specifications, framing options, and descriptions.
   - **Safety Confirmation**: Delete modal prevents accidental removals.
   - **Backup & Factory Reset**: 1-click JSON catalog backup download and curated defaults restore.

---

## 🔒 4. Service Credentials & Hosting Configuration
(Hostinger hPanel Production Environment)

### 🖥️ FTP Deployment Connection
- **Live Domain**: `https://mishisartwork.com`
- **FTP Gateway Host**: `145.79.209.71` (Port `21`)
- **Deployment User**: `u325926470.mishisartwork.com` (Main account: `u325926470`)
- **Deployment Password**: `Mishiart_0401`
- **Target Deployment Path**: `/public_html`

### 🗄️ MySQL Database (Production Live Environment)
- **DB Host**: `127.0.0.1` / `localhost` (Port `3306`)
- **DB Name / Schema**: `u325926470_Mishi_Artwork`
- **Database User**: `u325926470_Mishi_DB_User`
- **Database Password**: `Mishiart_0401`
- **Tables**: `artworks` (auto-managed with PDO)

### 🔑 Staff & Administrative Panel Login
- **Access Route**: `https://mishisartwork.com/admin` or `#/admin` or shortcut `Ctrl + Shift + A`
- **Studio PIN**: `mishi2026`
- **Studio Password**: `Mishiart_0401`
- **Admin Username**: `Mishiartwork`

---

## 🛠️ 5. Operations & Deployment Workflows

### A. Local Development
Start the local server:
```bash
python -m http.server 8000
```
Then navigate to: `http://localhost:8000`

### B. Deployment to Production
Execute the automated FTP upload pipeline (synchronizes `index.html`, `.htaccess`, and the `api/` directory):
```bash
python deploy.py
```

### C. Live Endpoint Health Verification
Verify that the production endpoint is active, secure, and serving traffic:
```bash
python verify-site-secure.py
```
