/**
 * Mideva Cosmetics - Wishlist Management
 * Persisted with localStorage, Badge Syncing & Move to Cart functionality
 */

const MIDEVA_WISHLIST_KEY = "mideva_cosmetics_wishlist";

const MidevaWishlist = {
  // Get array of saved product IDs
  getItems: function () {
    try {
      const data = localStorage.getItem(MIDEVA_WISHLIST_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Error reading wishlist from localStorage", e);
    }
    return [];
  },

  // Save array to localStorage
  saveItems: function (items) {
    try {
      localStorage.setItem(MIDEVA_WISHLIST_KEY, JSON.stringify(items));
      this.updateBadges();
      this.updateHeartIcons();
      window.dispatchEvent(new CustomEvent("mideva-wishlist-updated", { detail: items }));
    } catch (e) {
      console.error("Error saving wishlist to localStorage", e);
    }
  },

  // Check if item is in wishlist
  hasItem: function (productId) {
    const items = this.getItems();
    return items.includes(productId);
  },

  // Toggle wishlist state for product
  toggle: function (productId) {
    let items = this.getItems();
    const product = typeof MidevaCatalog !== "undefined" ? MidevaCatalog.getById(productId) : null;
    const prodName = product ? product.name : "Item";

    if (items.includes(productId)) {
      items = items.filter(id => id !== productId);
      this.saveItems(items);
      if (typeof showToast === "function") {
        showToast(`Removed "${prodName}" from your wishlist.`, "info");
      }
    } else {
      items.push(productId);
      this.saveItems(items);
      if (typeof showToast === "function") {
        showToast(`Saved "${prodName}" to your wishlist! 💖`, "success");
      }
    }

    this.renderWishlistPage();
  },

  // Remove single item
  remove: function (productId) {
    let items = this.getItems();
    items = items.filter(id => id !== productId);
    this.saveItems(items);
    this.renderWishlistPage();
    if (typeof showToast === "function") {
      showToast("Removed from wishlist.", "info");
    }
  },

  // Move product to cart
  moveToCart: function (productId) {
    if (typeof MidevaCart !== "undefined") {
      MidevaCart.addItem(productId, 1, false);
      this.remove(productId);
      if (typeof showToast === "function") {
        showToast("Moved item to your shopping bag! 🛍️", "success");
      }
    }
  },

  // Update badge counters across header
  updateBadges: function () {
    const items = this.getItems();
    const count = items.length;
    const badges = document.querySelectorAll(".wishlist-badge, .wishlist-count");
    badges.forEach(badge => {
      badge.textContent = count;
      if (count > 0) {
        badge.style.display = "flex";
      } else {
        badge.style.display = "none";
      }
    });
  },

  // Update heart buttons active state across page
  updateHeartIcons: function () {
    const items = this.getItems();
    document.querySelectorAll(".btn-wishlist-toggle").forEach(btn => {
      const prodId = btn.getAttribute("data-id");
      if (prodId && items.includes(prodId)) {
        btn.classList.add("active");
        btn.setAttribute("aria-label", "Remove from Wishlist");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("aria-label", "Add to Wishlist");
      }
    });
  },

  // Render full Wishlist Page
  renderWishlistPage: function () {
    const container = document.getElementById("wishlist-page-container");
    if (!container) return;

    const items = this.getItems();
    const isSubPage = window.location.pathname.includes("/pages/");
    const basePath = isSubPage ? "../" : "";

    if (items.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 4.5rem 2rem; border-radius: var(--radius-lg); background: #fff; border: 1px solid var(--color-border); max-width: 680px; margin: 0 auto;">
          <div style="font-size: 3.5rem; margin-bottom: 1.2rem;">💖</div>
          <h2 style="font-family: var(--font-serif); margin-bottom: 0.8rem;">Your Wishlist is Empty</h2>
          <p style="color: var(--color-text-muted); max-width: 440px; margin: 0 auto 2rem auto;">
            Save your favorite beauty and skincare products to your wishlist so you can revisit them anytime or add them directly to your bag.
          </p>
          <a href="shop.html" class="btn btn-primary btn-lg">Explore Beauty Products</a>
        </div>
      `;
      return;
    }

    const products = items.map(id => MidevaCatalog.getById(id)).filter(Boolean);

    let cardsHtml = products.map(product => {
      const imgPath = basePath + product.image;
      return `
        <div class="product-card" data-id="${product.id}">
          <div class="product-thumb-wrap">
            <span class="badge badge-product">${product.badge || 'Featured'}</span>
            <button class="btn-wishlist-toggle active" data-id="${product.id}" onclick="MidevaWishlist.toggle('${product.id}')" title="Remove from Wishlist">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <img src="${imgPath}" alt="${product.name}" onerror="this.src='${basePath}assets/images/cat-skincare.jpg'">
          </div>
          <div class="product-info">
            <span class="product-category-tag">${product.categoryName}</span>
            <h3 class="product-title">
              <a href="product-details.html?id=${product.id}">${product.name}</a>
            </h3>
            <div class="product-price-row">
              <span class="price-current">KSh ${product.price.toLocaleString()}</span>
              ${product.originalPrice ? `<span class="price-original">KSh ${product.originalPrice.toLocaleString()}</span>` : ''}
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: auto;">
              <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="MidevaWishlist.moveToCart('${product.id}')">
                Move to Bag
              </button>
              <button class="btn btn-secondary btn-sm" onclick="MidevaWishlist.remove('${product.id}')" title="Remove">
                ✕
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h2 style="font-size: 1.8rem;">Saved Items (${products.length})</h2>
          <p style="color: var(--color-text-muted); font-size: 0.9rem;">Review and move your saved essentials directly to your shopping bag.</p>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="MidevaWishlist.saveItems([]); MidevaWishlist.renderWishlistPage();">
          Clear All
        </button>
      </div>
      <div class="products-grid">
        ${cardsHtml}
      </div>
    `;
  }
};

// Auto-init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  MidevaWishlist.updateBadges();
  MidevaWishlist.updateHeartIcons();
  MidevaWishlist.renderWishlistPage();
});

// Export to window
if (typeof window !== "undefined") {
  window.MidevaWishlist = MidevaWishlist;
}
