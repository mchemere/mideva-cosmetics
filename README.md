# MIDEVA COSMETICS – LUXURY BEAUTY E-COMMERCE WEBSITE

An elegant, modern, high-performance e-commerce frontend for **Mideva Cosmetics**, an international beauty brand crafted to celebrate natural radiance, skin confidence, and luxurious self-care through high-performance botanical essentials.

---

## 🌟 Brand Identity & Visual Aesthetic

- **Brand Name:** Mideva Cosmetics
- **Tagline:** *"Discover Your Beauty. Embrace Your Glow."*
- **Supporting Narrative:** *"Enhance your natural beauty with carefully selected beauty and skincare essentials formulated to nourish, protect, and illuminate."*
- **Aesthetic Direction:** Luxurious, feminine, modern, and warm. Designed to stand alongside international luxury beauty houses while proudly honoring East African botanicals (Baobab, Nilotica Shea, Marula, Kenyan Highland Coffee).
- **Color Palette:**
  - **Champagne Gold:** `#C5A059` / `#E5C378` / `#A7823E` (Accents, badges, CTAs)
  - **Soft Blush Pink:** `#FCF4F5` / `#F8E3E7` / `#F3CAD2` (Section backgrounds, pills)
  - **Warm Ivory / Cream:** `#FFFDF8` / `#FAF6F0` (Card and background surfaces)
  - **Warm Beige:** `#F4ECE3` / `#E6D8CA` (Borders, subtle cards)
  - **Dark Espresso Brown:** `#2B1E1A` / `#4A3A35` (Readable text, luxury dark headers)
- **Typography:**
  - Headings: `'Playfair Display', Georgia, serif`
  - Body & UI: `'Plus Jakarta Sans', system-ui, sans-serif`

---

## 🚀 Technology Stack

- **HTML5:** Clean, semantic, accessible markup with OpenGraph and meta descriptions.
- **CSS3:** Custom responsive design system, CSS variables, flexbox, CSS grid, glassmorphic headers (`backdrop-filter`), micro-animations, and custom scrollbars.
- **Vanilla JavaScript (ES6+):** Modular, framework-free architecture with state persistence using `localStorage`. Ready for REST / GraphQL backend integration.
- **No external frameworks:** Zero React, Angular, Vue, or TypeScript dependencies.

---

## 📁 Project Structure

```text
mideva-cosmetics/
├── index.html                     # Flagship Homepage
├── css/
│   ├── style.css                  # Core luxury design system, typography & components
│   └── responsive.css             # Breakpoint adaptations (1200px, 992px, 768px, 576px, 400px)
├── js/
│   ├── products.js                # 17 rich cosmetic products catalog & search helper
│   ├── cart.js                    # Shopping bag state, drawer, coupons & checkout modal
│   ├── wishlist.js                # Wishlist state, badge sync & move-to-cart engine
│   └── main.js                    # Global header, search modal, quick view, auth & forms
├── pages/
│   ├── shop.html                  # Catalog with category filters, price slider & sorting
│   ├── product-details.html       # Dynamic product view (?id=...) with gallery & tabs
│   ├── cart.html                  # Full cart table, shipping calculator & checkout modal
│   ├── wishlist.html              # Saved items grid with transfer to bag
│   ├── about.html                 # Brand story, mission, founder letter & commitments
│   ├── contact.html               # Interactive inquiry form, boutique details & FAQs
│   ├── login.html                 # Luxury sign in card with session persistence
│   └── register.html              # Account creation with Glow Club rewards benefits
└── assets/
    └── images/                    # Curated high-res beauty photography, logos & SVGs
```

---

## 🛍️ Product Catalog & Categories

The website comes with 17 curated beauty products across 6 categories:

1. **Skincare:**
   - Luminous Glow Vitamin C Serum (15% Ethyl Ascorbic Acid & Baobab)
   - Hydra-Plump Hyaluronic Acid Moisturizer (72-hour moisture surge)
   - Rose Petal Hydrating Mist & Toner (Steam-distilled Damask rose)
   - Gentle Radiance Clarifying Gel Cleanser (Papaya enzymes & green tea)
2. **Makeup:**
   - Velvet Satin Matte Lipstick – Kenya Sunset (Warm terracotta nude)
   - High-Shine Glossy Lip Nectar – Golden Honey (Glass-finish lip oil)
   - Flawless Radiance Weightless Foundation (SPF 25, 24 shades)
   - Golden Hour Champagne Highlighter (Baked micro-pearl illuminating powder)
3. **Body Care:**
   - Golden Radiance Shimmering Body Elixir (Marula & Argan dry oil)
   - Whipped Shea & Cocoa Deep Nourishing Body Butter (Nilotica shea)
   - Exfoliating Brown Sugar & Coffee Body Polish (Organic Kenyan Arabica)
4. **Hair Care:**
   - Botanical Crown Scalp & Hair Growth Elixir (Rosemary, Biotin & Castor oil)
   - Deep Moisture Silk Amino Acid Repair Mask (Keratin and Baobab protein)
5. **Fragrances:**
   - Mideva Éclat de Rose Eau de Parfum (50ml) (Bulgarian rose, amber, vanilla)
   - Amber Santal & White Jasmine Body Mist (150ml) (Sandalwood & floral mist)
6. **Beauty Accessories:**
   - Sculpting Rose Quartz Face Roller & Gua Sha Set (100% natural crystal)
   - Velvet Plush Powder Puff & Blending Sponge Duo (Airbrushed finish)

---

## ⚡ Interactive Frontend Features

- **Dynamic Cart Management (`js/cart.js`):**
  - Add to bag from any product card, quick view modal, or detail page.
  - Slide-out mini-cart drawer (`#cart-drawer`) with real-time subtotal.
  - Increment / decrement quantity controls.
  - Remove items from cart.
  - Coupon discount engine supporting codes:
    - `GLOW10` (10% off)
    - `MIDEVA20` (20% off)
    - `WELCOME15` (15% off)
  - Delivery calculation: Free delivery in Nairobi for orders over KSh 5,000; KSh 300 flat rate otherwise.
  - Simulated express checkout modal with M-Pesa, Card, and Cash on Delivery options.
  - Persistent state in browser `localStorage`.
- **Dynamic Wishlist Management (`js/wishlist.js`):**
  - Heart toggle buttons across all product cards with active state tracking.
  - Reactive navbar wishlist counter badge.
  - "Move to Bag" action transferring saved items straight to cart.
  - Persistent state in browser `localStorage`.
- **Live Search & Autocomplete Modal (`js/main.js`):**
  - Clickable search icon opening animated overlay.
  - Real-time search by product title, category, or description.
- **Quick View Modal (`openQuickView(id)`):**
  - Preview any product without navigating away.
  - View image, price, rating, highlights, quantity picker, and direct "Add to Bag".
- **Dynamic Product Details Page (`product-details.html?id=...`):**
  - Automatically loads full details and images from catalog based on URL ID.
  - Interactive tabs: *Key Ingredients*, *How to Use Ritual*, and *Customer Reviews*.
  - Related products recommendation slider.
- **Shop Catalog Filtering & Sorting (`shop.html`):**
  - Filter by Category (Skincare, Makeup, Body Care, Hair Care, Fragrances, Accessories).
  - Price range slider up to KSh 8,000 with real-time count.
  - Sort by: Featured, Price (Low to High), Price (High to Low), Rating, Name.
- **Toast Notification Engine:**
  - Non-intrusive floating feedback messages for cart actions, wishlist toggles, and form submissions.
- **Authentication Simulation (`login.html` & `register.html`):**
  - Form validation with localStorage session management.
  - Updates navigation account icon to display user's initial.
- **Interactive Forms:**
  - Newsletter subscription with instant voucher generation.
  - Contact Us form with validation and confirmation feedback.

---

## 💻 How to Run Locally

You can serve Mideva Cosmetics using any static file server:

### Option A: Python 3
```bash
python3 -m http.server 8080
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### Option B: Node.js (npx serve)
```bash
npx serve .
```

### Option C: VS Code Live Server
Right-click `index.html` and choose **"Open with Live Server"**.

---

## 🔮 Backend Integration Roadmap

The frontend has been constructed with clear interfaces for REST API integration:
- Replace `MIDEVA_PRODUCTS` in `js/products.js` with `fetch('/api/products')`.
- Replace `localStorage` cart mutations in `js/cart.js` with `POST /api/cart` and `POST /api/checkout`.
- Replace auth helpers in `js/main.js` with standard JWT bearer token authentication.

---

© 2026 Mideva Cosmetics Ltd. All rights reserved.
