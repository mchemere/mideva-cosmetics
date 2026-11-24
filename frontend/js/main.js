/**
 * Mideva Cosmetics – Main Application Script
 * Global UI Interactions, Search, Quick View, Toasts, Auth State, and Page Controllers
 */

// ==========================================================================
// TOAST NOTIFICATION SYSTEM
// ==========================================================================
function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = "✨";
  if (type === "error") icon = "⚠️";
  if (type === "info") icon = "ℹ️";

  toast.innerHTML = `
    <span style="font-size: 1.1rem; flex-shrink: 0;">${icon}</span>
    <span style="flex: 1;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.35s ease";
    setTimeout(() => toast.remove(), 350);
  }, 3800);
}
window.showToast = showToast;

// ==========================================================================
// GLOBAL UI INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initStickyHeader();
  initMobileMenu();
  initSearchModal();
  initQuickViewModal();
  initNewsletterForms();
  initAuthDisplay();

  // Page-specific initializers
  initHomePage();
  initShopPage();
  initProductDetailsPage();
  initContactPage();
  initAuthPages();
});

// Sticky header on scroll
function initStickyHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// Mobile Menu Drawer
function initMobileMenu() {
  const toggleBtn = document.querySelector(".mobile-menu-btn");
  const navMenu = document.querySelector(".nav-menu");
  const overlay = document.querySelector(".mobile-menu-overlay");
  const closeBtn = document.querySelector(".mobile-nav-close");

  if (!toggleBtn || !navMenu) return;

  function openMenu() {
    navMenu.classList.add("active");
    if (overlay) overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    navMenu.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  toggleBtn.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (overlay) overlay.addEventListener("click", closeMenu);

  // Mobile dropdown accordion
  document.querySelectorAll(".nav-item-dropdown").forEach(dropdown => {
    const toggle = dropdown.querySelector(".dropdown-toggle");
    if (toggle) {
      toggle.addEventListener("click", (e) => {
        if (window.innerWidth <= 992) {
          e.preventDefault();
          dropdown.classList.toggle("mobile-open");
        }
      });
    }
  });
}

// Global Quick Search Modal
function initSearchModal() {
  const openBtns = document.querySelectorAll(".btn-open-search");
  const modal = document.getElementById("search-modal");
  const closeBtn = document.querySelector(".btn-close-search");
  const searchInput = document.getElementById("global-search-input");
  const resultsContainer = document.getElementById("global-search-results");

  if (!modal) return;

  function openSearch() {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
  }

  function closeSearch() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    if (searchInput) searchInput.value = "";
    if (resultsContainer) resultsContainer.innerHTML = "";
  }

  openBtns.forEach(btn => btn.addEventListener("click", openSearch));
  if (closeBtn) closeBtn.addEventListener("click", closeSearch);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeSearch();
  });

  if (searchInput && resultsContainer) {
    const isSubPage = window.location.pathname.includes("/pages/");
    const basePath = isSubPage ? "../" : "";

    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim();
      if (!q) {
        resultsContainer.innerHTML = `
          <div style="text-align: center; color: var(--color-text-muted); padding: 2rem 0; font-size: 0.9rem;">
            Type a product name, category, or skincare ingredient...
          </div>
        `;
        return;
      }

      const results = MidevaCatalog.search(q);
      if (results.length === 0) {
        resultsContainer.innerHTML = `
          <div style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">
            No products found matching "<strong>${q}</strong>".
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = results.slice(0, 6).map(prod => {
        const imgPath = basePath + prod.image;
        const detailLink = isSubPage ? `product-details.html?id=${prod.id}` : `pages/product-details.html?id=${prod.id}`;
        return `
          <a href="${detailLink}" class="search-result-item" onclick="document.getElementById('search-modal').classList.remove('active')">
            <img src="${imgPath}" alt="${prod.name}" class="search-result-thumb" onerror="this.src='${basePath}assets/images/cat-skincare.jpg'">
            <div class="search-result-info">
              <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-primary-dark); font-weight: 600;">${prod.categoryName}</span>
              <h4>${prod.name}</h4>
              <span>KSh ${prod.price.toLocaleString()}</span>
            </div>
          </a>
        `;
      }).join("");
    });
  }
}

// Quick View Modal
function initQuickViewModal() {
  const modal = document.getElementById("quick-view-modal");
  const closeBtn = document.querySelector(".btn-close-quick");
  if (!modal) return;

  function closeQuick() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", closeQuick);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeQuick();
  });
}

function openQuickView(productId) {
  const modal = document.getElementById("quick-view-modal");
  const body = document.getElementById("quick-view-content");
  if (!modal || !body) return;

  const product = MidevaCatalog.getById(productId);
  if (!product) return;

  const isSubPage = window.location.pathname.includes("/pages/");
  const basePath = isSubPage ? "../" : "";
  const imgPath = basePath + product.image;
  const detailLink = isSubPage ? `product-details.html?id=${product.id}` : `pages/product-details.html?id=${product.id}`;

  body.innerHTML = `
    <div class="quick-view-card">
      <button class="btn-close-quick" onclick="document.getElementById('quick-view-modal').classList.remove('active'); document.body.style.overflow='';">✕</button>
      <div class="quick-view-media">
        <img src="${imgPath}" alt="${product.name}" onerror="this.src='${basePath}assets/images/cat-skincare.jpg'">
      </div>
      <div class="quick-view-body">
        <span class="product-category-tag">${product.categoryName}</span>
        <h2 style="font-size: 1.5rem; margin-bottom: 0.4rem;">${product.name}</h2>
        ${MidevaCatalog.renderStars(product.rating)}
        
        <div class="product-price-row" style="margin-top: 0.5rem; margin-bottom: 1rem;">
          <span class="price-current" style="font-size: 1.4rem;">KSh ${product.price.toLocaleString()}</span>
          ${product.originalPrice ? `<span class="price-original">KSh ${product.originalPrice.toLocaleString()}</span>` : ''}
        </div>

        <p style="font-size: 0.88rem; color: var(--color-text-body); line-height: 1.6; margin-bottom: 1.2rem;">
          ${product.shortDesc}
        </p>

        <div style="margin-bottom: 1.5rem;">
          <span style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-dark); display: block; margin-bottom: 0.5rem;">Key Highlights:</span>
          <ul style="font-size: 0.82rem; color: var(--color-text-muted); display: flex; flex-direction: column; gap: 0.35rem;">
            ${product.keyBenefits.slice(0, 2).map(b => `<li>✦ ${b}</li>`).join("")}
          </ul>
        </div>

        <div style="display: flex; gap: 0.8rem; align-items: center; margin-top: auto;">
          <div class="qty-stepper" style="height: 42px;">
            <button class="qty-btn" onclick="let el = document.getElementById('qv-qty'); el.textContent = Math.max(1, parseInt(el.textContent) - 1);">−</button>
            <span class="qty-val" id="qv-qty">1</span>
            <button class="qty-btn" onclick="let el = document.getElementById('qv-qty'); el.textContent = parseInt(el.textContent) + 1;">+</button>
          </div>
          <button class="btn btn-primary" style="flex: 1;" onclick="
            let q = parseInt(document.getElementById('qv-qty').textContent);
            MidevaCart.addItem('${product.id}', q);
            document.getElementById('quick-view-modal').classList.remove('active');
            document.body.style.overflow='';
          ">
            Add to Bag
          </button>
        </div>

        <div style="margin-top: 1rem; text-align: center;">
          <a href="${detailLink}" style="font-size: 0.82rem; color: var(--color-primary-dark); text-decoration: underline; font-weight: 600;">
            View Full Product Details →
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}
window.openQuickView = openQuickView;

// Newsletter subscription handling
function initNewsletterForms() {
  document.querySelectorAll(".newsletter-form").forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type='email']");
      if (!input || !input.value.trim()) {
        showToast("Please enter a valid email address.", "error");
        return;
      }
      showToast("Welcome to the Glow Club! 🌸 Check your inbox for your 10% coupon code: GLOW10", "success");
      input.value = "";
    });
  });
}

// User Authentication State Display
function initAuthDisplay() {
  const user = JSON.parse(localStorage.getItem("mideva_user") || "null");
  const authLinks = document.querySelectorAll(".user-account-link");

  authLinks.forEach(link => {
    if (user && user.name) {
      link.setAttribute("title", `Signed in as ${user.name}`);
      link.innerHTML = `
        <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary); color: #fff; font-size: 0.75rem; font-weight: 700;">
          ${user.name.charAt(0).toUpperCase()}
        </span>
      `;
    }
  });
}

// ==========================================================================
// HOMEPAGE CONTROLLER
// ==========================================================================
function initHomePage() {
  const featuredGrid = document.getElementById("featured-products-grid");
  const bestSellersGrid = document.getElementById("bestsellers-products-grid");

  if (featuredGrid) {
    const featured = MidevaCatalog.getFeatured().slice(0, 8);
    featuredGrid.innerHTML = featured.map(prod => renderProductCard(prod, "")).join("");
    MidevaWishlist.updateHeartIcons();
  }

  if (bestSellersGrid) {
    const best = MidevaCatalog.getBestSellers().slice(0, 4);
    bestSellersGrid.innerHTML = best.map(prod => renderProductCard(prod, "")).join("");
    MidevaWishlist.updateHeartIcons();
  }
}

// Reusable Product Card HTML Template
function renderProductCard(product, basePath = "") {
  const isWish = MidevaWishlist.hasItem(product.id);
  const detailUrl = basePath ? `${basePath}product-details.html?id=${product.id}` : `pages/product-details.html?id=${product.id}`;
  const imgPath = basePath + product.image;

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-thumb-wrap">
        <span class="badge badge-product">${product.badge || 'New'}</span>
        <button class="btn-wishlist-toggle ${isWish ? 'active' : ''}" 
                data-id="${product.id}" 
                onclick="MidevaWishlist.toggle('${product.id}')" 
                title="${isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="${isWish ? 'currentColor' : 'none'}">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <button class="btn-quick-view" onclick="openQuickView('${product.id}')">Quick View</button>
        <img src="${imgPath}" alt="${product.name}" loading="lazy" onerror="this.src='${basePath}assets/images/cat-skincare.jpg'">
      </div>
      <div class="product-info">
        <span class="product-category-tag">${product.categoryName}</span>
        <h3 class="product-title">
          <a href="${detailUrl}">${product.name}</a>
        </h3>
        <p class="product-short-desc">${product.shortDesc}</p>
        ${MidevaCatalog.renderStars(product.rating)}
        <div class="product-price-row">
          <span class="price-current">KSh ${product.price.toLocaleString()}</span>
          ${product.originalPrice ? `<span class="price-original">KSh ${product.originalPrice.toLocaleString()}</span>` : ''}
        </div>
        <div class="product-card-actions">
          <button class="btn-add-cart" onclick="MidevaCart.addItem('${product.id}', 1)">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  `;
}
window.renderProductCard = renderProductCard;

// ==========================================================================
// SHOP PAGE CONTROLLER
// ==========================================================================
function initShopPage() {
  const shopGrid = document.getElementById("shop-products-grid");
  if (!shopGrid) return;

  const urlParams = new URLSearchParams(window.location.search);
  let currentCategory = urlParams.get("category") || "all";
  let currentSearch = urlParams.get("search") || "";
  let currentSort = "featured";
  let maxPrice = 8000;

  const filterBtns = document.querySelectorAll(".category-filter-btn");
  const priceSlider = document.getElementById("price-range-slider");
  const priceDisplay = document.getElementById("price-slider-val");
  const sortSelect = document.getElementById("shop-sort-select");
  const searchInput = document.getElementById("shop-search-input");
  const resultsCount = document.getElementById("shop-results-count");
  const activeFilterTag = document.getElementById("active-filter-badge");

  function filterAndRender() {
    let list = MidevaCatalog.getAll();

    // Category filter
    if (currentCategory && currentCategory !== "all") {
      list = list.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());
    }

    // Search query filter
    if (currentSearch) {
      const q = currentSearch.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.categoryName.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q)
      );
    }

    // Price filter
    list = list.filter(p => p.price <= maxPrice);

    // Sorting
    if (currentSort === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (currentSort === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (currentSort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (currentSort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Render results
    if (resultsCount) {
      resultsCount.textContent = `Showing ${list.length} beauty product${list.length === 1 ? '' : 's'}`;
    }

    if (activeFilterTag) {
      if (currentCategory !== "all") {
        activeFilterTag.innerHTML = `Filter: <strong>${currentCategory.toUpperCase()}</strong> <button onclick="window.resetShopCategory()" style="margin-left: 6px; cursor: pointer;">✕</button>`;
        activeFilterTag.style.display = "inline-flex";
      } else {
        activeFilterTag.style.display = "none";
      }
    }

    if (list.length === 0) {
      shopGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: #fff; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3>No matching beauty essentials found</h3>
          <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">Try adjusting your filters or price slider to see more products.</p>
          <button class="btn btn-secondary btn-sm" onclick="window.resetShopFilters()">Reset All Filters</button>
        </div>
      `;
    } else {
      shopGrid.innerHTML = list.map(prod => renderProductCard(prod, "../")).join("");
      MidevaWishlist.updateHeartIcons();
    }
  }

  // Bind filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.getAttribute("data-category");
      filterAndRender();
    });

    if (btn.getAttribute("data-category") === currentCategory) {
      btn.classList.add("active");
    }
  });

  // Price range slider
  if (priceSlider) {
    priceSlider.addEventListener("input", (e) => {
      maxPrice = Number(e.target.value);
      if (priceDisplay) priceDisplay.textContent = `KSh ${maxPrice.toLocaleString()}`;
      filterAndRender();
    });
  }

  // Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      filterAndRender();
    });
  }

  // Search input
  if (searchInput) {
    searchInput.value = currentSearch;
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value;
      filterAndRender();
    });
  }

  window.resetShopCategory = function () {
    currentCategory = "all";
    filterBtns.forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-category") === "all");
    });
    filterAndRender();
  };

  window.resetShopFilters = function () {
    currentCategory = "all";
    currentSearch = "";
    currentSort = "featured";
    maxPrice = 8000;
    if (priceSlider) priceSlider.value = 8000;
    if (priceDisplay) priceDisplay.textContent = "KSh 8,000";
    if (searchInput) searchInput.value = "";
    if (sortSelect) sortSelect.value = "featured";
    filterBtns.forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-category") === "all");
    });
    filterAndRender();
  };

  filterAndRender();
}

// ==========================================================================
// PRODUCT DETAILS CONTROLLER
// ==========================================================================
function initProductDetailsPage() {
  const container = document.getElementById("product-details-container");
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id") || "luminous-vitamin-c-serum";
  const product = MidevaCatalog.getById(id) || MidevaCatalog.getAll()[0];

  const imgPath = "../" + product.image;
  const isWish = MidevaWishlist.hasItem(product.id);

  // Render main details
  container.innerHTML = `
    <!-- Breadcrumb -->
    <nav class="breadcrumbs" style="justify-content: flex-start; margin-bottom: 2rem;">
      <a href="../index.html">Home</a>
      <span class="divider">/</span>
      <a href="shop.html">Shop</a>
      <span class="divider">/</span>
      <a href="shop.html?category=${product.category}">${product.categoryName}</a>
      <span class="divider">/</span>
      <span style="color: var(--color-text-dark); font-weight: 600;">${product.name}</span>
    </nav>

    <div style="display: grid; grid-template-columns: 1fr 1.15fr; gap: 4rem; align-items: start;">
      <!-- Product Gallery / Image -->
      <div>
        <div style="position: relative; border-radius: var(--radius-lg); overflow: hidden; background: var(--color-cream); border: 1px solid var(--color-border); box-shadow: var(--shadow-md); aspect-ratio: 1/1.05;">
          <span class="badge badge-product" style="top: 1.2rem; left: 1.2rem;">${product.badge || 'Glow Pick'}</span>
          <img id="main-product-img" src="${imgPath}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
      </div>

      <!-- Product Information -->
      <div>
        <span class="product-category-tag" style="font-size: 0.82rem;">${product.categoryName}</span>
        <h1 style="font-size: 2.2rem; margin-top: 0.3rem; margin-bottom: 0.8rem;">${product.name}</h1>
        
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem;">
          ${MidevaCatalog.renderStars(product.rating)}
          <span style="font-size: 0.85rem; color: var(--color-text-muted);">| ${product.reviewCount} Verified Reviews</span>
          <span style="font-size: 0.82rem; color: var(--color-success); font-weight: 700;">● In Stock (Ships today)</span>
        </div>

        <div class="product-price-row" style="margin-bottom: 1.5rem;">
          <span class="price-current" style="font-size: 1.8rem; color: var(--color-primary-dark);">KSh ${product.price.toLocaleString()}</span>
          ${product.originalPrice ? `<span class="price-original" style="font-size: 1.2rem;">KSh ${product.originalPrice.toLocaleString()}</span>` : ''}
          ${product.originalPrice ? `<span class="badge badge-blush" style="margin-left: 0.5rem;">Save KSh ${(product.originalPrice - product.price).toLocaleString()}</span>` : ''}
        </div>

        <p style="font-size: 1.02rem; color: var(--color-text-body); line-height: 1.7; margin-bottom: 1.8rem;">
          ${product.description}
        </p>

        <!-- Key Benefits List -->
        <div style="background: var(--color-cream); padding: 1.4rem; border-radius: var(--radius-md); border: 1px solid var(--color-border-light); margin-bottom: 2rem;">
          <h4 style="font-size: 0.95rem; margin-bottom: 0.6rem; color: var(--color-text-dark);">Why You'll Love It:</h4>
          <ul style="font-size: 0.88rem; color: var(--color-text-body); display: flex; flex-direction: column; gap: 0.4rem;">
            ${product.keyBenefits.map(b => `<li style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--color-primary);">✦</span> ${b}</li>`).join("")}
          </ul>
        </div>

        <!-- Add to Cart & Actions -->
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem;">
          <div class="qty-stepper" style="height: 48px; border-radius: var(--radius-sm);">
            <button class="qty-btn" style="width: 38px; font-size: 1.2rem;" onclick="let el = document.getElementById('details-qty'); el.textContent = Math.max(1, parseInt(el.textContent) - 1);">−</button>
            <span class="qty-val" id="details-qty" style="width: 44px; font-size: 1rem;">1</span>
            <button class="qty-btn" style="width: 38px; font-size: 1.2rem;" onclick="let el = document.getElementById('details-qty'); el.textContent = parseInt(el.textContent) + 1;">+</button>
          </div>

          <button class="btn btn-primary btn-lg" style="flex: 1;" onclick="
            let q = parseInt(document.getElementById('details-qty').textContent);
            MidevaCart.addItem('${product.id}', q);
          ">
            Add to Shopping Bag
          </button>

          <button class="btn btn-secondary btn-wishlist-toggle ${isWish ? 'active' : ''}" 
                  style="width: 50px; height: 50px; border-radius: var(--radius-sm);"
                  data-id="${product.id}"
                  onclick="MidevaWishlist.toggle('${product.id}')"
                  title="Add to Wishlist">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="${isWish ? 'currentColor' : 'none'}">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        <!-- Shipping & Authenticity Badges -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border-top: 1px solid var(--color-border); padding-top: 1.5rem; font-size: 0.82rem; color: var(--color-text-muted);">
          <div>🚚 <strong>Free Nairobi Delivery</strong> on orders over KSh 5,000</div>
          <div>🌿 <strong>Clean & Ethical:</strong> 100% Cruelty-Free</div>
          <div>✨ <strong>Guaranteed Authentic:</strong> Formulated in Nairobi</div>
          <div>🔄 <strong>7-Day Returns:</strong> If unopened and sealed</div>
        </div>
      </div>
    </div>

    <!-- Product Tabs (Ingredients, How to Use, Reviews) -->
    <div style="margin-top: 4.5rem; background: #fff; border-radius: var(--radius-lg); border: 1px solid var(--color-border); padding: 2.5rem; box-shadow: var(--shadow-sm);">
      <div style="display: flex; gap: 2rem; border-bottom: 2px solid var(--color-border-light); margin-bottom: 2rem; overflow-x: auto;">
        <button class="tab-btn active" onclick="window.switchTab(event, 'tab-ingredients')" style="padding-bottom: 0.8rem; font-weight: 600; font-size: 1.05rem; border-bottom: 3px solid var(--color-primary); color: var(--color-primary-dark);">Key Ingredients</button>
        <button class="tab-btn" onclick="window.switchTab(event, 'tab-how-to-use')" style="padding-bottom: 0.8rem; font-weight: 600; font-size: 1.05rem; color: var(--color-text-muted);">How to Use</button>
        <button class="tab-btn" onclick="window.switchTab(event, 'tab-reviews')" style="padding-bottom: 0.8rem; font-weight: 600; font-size: 1.05rem; color: var(--color-text-muted);">Customer Reviews (${product.reviewCount})</button>
      </div>

      <div id="tab-ingredients" class="tab-pane active">
        <h4 style="font-size: 1.15rem; margin-bottom: 0.8rem;">Full Ingredients List</h4>
        <p style="font-size: 0.95rem; line-height: 1.8; color: var(--color-text-body); background: var(--color-cream); padding: 1.2rem; border-radius: var(--radius-md);">
          ${product.ingredients}
        </p>
      </div>

      <div id="tab-how-to-use" class="tab-pane" style="display: none;">
        <h4 style="font-size: 1.15rem; margin-bottom: 0.8rem;">Recommended Beauty Ritual</h4>
        <p style="font-size: 0.95rem; line-height: 1.8; color: var(--color-text-body); background: var(--color-cream); padding: 1.2rem; border-radius: var(--radius-md);">
          ${product.howToUse}
        </p>
      </div>

      <div id="tab-reviews" class="tab-pane" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h4 style="font-size: 1.3rem;">Real Customer Reviews</h4>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.3rem;">
              ${MidevaCatalog.renderStars(product.rating)}
              <span style="font-weight: 700; color: var(--color-text-dark);">${product.rating} out of 5 stars</span>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="showToast('Thank you! Review submissions open after order delivery.', 'info')">
            Write a Review
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.2rem;">
          <div style="border-bottom: 1px solid var(--color-border-light); padding-bottom: 1.2rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
              <strong>Wanjiku M. (Nairobi)</strong>
              <span style="font-size: 0.82rem; color: var(--color-text-muted);">Verified Buyer • 2 weeks ago</span>
            </div>
            ${MidevaCatalog.renderStars(5)}
            <p style="font-size: 0.92rem; color: var(--color-text-body); margin-top: 0.5rem;">
              "Honestly the best skincare purchase I have made this year! My skin feels so soft, glowing, and radiant. Delivery was super fast within Westlands."
            </p>
          </div>
          <div style="border-bottom: 1px solid var(--color-border-light); padding-bottom: 1.2rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
              <strong>Amina K. (Mombasa)</strong>
              <span style="font-size: 0.82rem; color: var(--color-text-muted);">Verified Buyer • 1 month ago</span>
            </div>
            ${MidevaCatalog.renderStars(5)}
            <p style="font-size: 0.92rem; color: var(--color-text-body); margin-top: 0.5rem;">
              "The scent and consistency are pure luxury. Highly recommend Mideva Cosmetics to anyone who wants authentic results with gentle ingredients."
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <div style="margin-top: 5rem;">
      <div class="section-header" style="margin-bottom: 2.5rem;">
        <span class="section-subtitle-tag">Complete Your Glow</span>
        <h2>You May Also Adore</h2>
      </div>
      <div class="products-grid" id="related-products-grid"></div>
    </div>
  `;

  // Render related items
  const relatedGrid = document.getElementById("related-products-grid");
  if (relatedGrid) {
    const related = MidevaCatalog.getAll().filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
    const fallbackRelated = related.length >= 2 ? related : MidevaCatalog.getAll().filter(p => p.id !== product.id).slice(0, 4);
    relatedGrid.innerHTML = fallbackRelated.map(p => renderProductCard(p, "../")).join("");
    MidevaWishlist.updateHeartIcons();
  }

  // Tab switching helper
  window.switchTab = function (e, tabId) {
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.style.borderBottom = "none";
      btn.style.color = "var(--color-text-muted)";
    });
    document.querySelectorAll(".tab-pane").forEach(pane => pane.style.display = "none");

    e.target.style.borderBottom = "3px solid var(--color-primary)";
    e.target.style.color = "var(--color-primary-dark)";
    const pane = document.getElementById(tabId);
    if (pane) pane.style.display = "block";
  };
}

// ==========================================================================
// CONTACT US CONTROLLER
// ==========================================================================
function initContactPage() {
  const form = document.getElementById("mideva-contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const message = document.getElementById("contact-message").value.trim();

    if (!name || !email || !message) {
      showToast("Please fill in your name, email, and message.", "error");
      return;
    }

    showToast(`Thank you, ${name}! Your inquiry has been sent to the Mideva beauty team. We'll be in touch within 24 hours. 🌸`, "success");
    form.reset();
  });
}

// ==========================================================================
// AUTHENTICATION PAGES CONTROLLER (LOGIN & REGISTER)
// ==========================================================================
function initAuthPages() {
  // Login form handler
  const loginForm = document.getElementById("mideva-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value.trim();

      if (!email || !password) {
        showToast("Please enter both email and password.", "error");
        return;
      }

      const mockName = email.split("@")[0];
      const capitalized = mockName.charAt(0).toUpperCase() + mockName.slice(1);
      localStorage.setItem("mideva_user", JSON.stringify({ name: capitalized, email: email }));
      
      showToast(`Welcome back, ${capitalized}! Logging you in... ✨`, "success");
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1000);
    });
  }

  // Register form handler
  const regForm = document.getElementById("mideva-register-form");
  if (regForm) {
    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const pass = document.getElementById("reg-password").value;
      const passConfirm = document.getElementById("reg-password-confirm").value;

      if (!name || !email || !pass) {
        showToast("Please complete all required fields.", "error");
        return;
      }

      if (pass !== passConfirm) {
        showToast("Passwords do not match.", "error");
        return;
      }

      localStorage.setItem("mideva_user", JSON.stringify({ name: name, email: email }));
      showToast(`Welcome to Mideva Cosmetics, ${name}! Your account is ready. 🌸`, "success");
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1200);
    });
  }
}
