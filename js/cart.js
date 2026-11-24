/**
 * Mideva Cosmetics - Shopping Cart Management
 * Persisted with localStorage, Slide-out Mini-Cart Drawer, Coupon Engine & Checkout Flow
 */

const MIDEVA_CART_KEY = "mideva_cosmetics_cart";
const MIDEVA_COUPONS = {
  "GLOW10": { discountRate: 0.10, description: "10% Glow Club Discount" },
  "MIDEVA20": { discountRate: 0.20, description: "20% Exclusive VIP Offer" },
  "WELCOME15": { discountRate: 0.15, description: "15% Welcome Gift" }
};

const MidevaCart = {
  // Get cart state from localStorage
  getState: function () {
    try {
      const data = localStorage.getItem(MIDEVA_CART_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Error reading cart from localStorage", e);
    }
    return { items: [], coupon: null, discountRate: 0 };
  },

  // Save cart state to localStorage
  saveState: function (state) {
    try {
      localStorage.setItem(MIDEVA_CART_KEY, JSON.stringify(state));
      this.updateBadges();
      // Dispatch custom event for reactive UI updates
      window.dispatchEvent(new CustomEvent("mideva-cart-updated", { detail: state }));
    } catch (e) {
      console.error("Error saving cart to localStorage", e);
    }
  },

  // Add product to cart
  addItem: function (productId, quantity = 1, openDrawerAfter = true) {
    const product = typeof MidevaCatalog !== "undefined" ? MidevaCatalog.getById(productId) : null;
    if (!product) {
      console.error("Product not found:", productId);
      return;
    }

    const state = this.getState();
    const existingIndex = state.items.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
      state.items[existingIndex].quantity += Number(quantity);
    } else {
      state.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        categoryName: product.categoryName,
        quantity: Number(quantity)
      });
    }

    this.saveState(state);

    if (typeof showToast === "function") {
      showToast(`Added "${product.name}" to your cart! ✨`, "success");
    }

    if (openDrawerAfter) {
      this.openDrawer();
    }
  },

  // Remove item from cart
  removeItem: function (productId) {
    const state = this.getState();
    const item = state.items.find(i => i.id === productId);
    state.items = state.items.filter(i => i.id !== productId);
    this.saveState(state);

    if (typeof showToast === "function" && item) {
      showToast(`Removed "${item.name}" from your cart.`, "info");
    }

    this.renderDrawer();
    this.renderCartPage();
  },

  // Update item quantity
  updateQuantity: function (productId, newQty) {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty <= 0) {
      this.removeItem(productId);
      return;
    }

    const state = this.getState();
    const item = state.items.find(i => i.id === productId);
    if (item) {
      item.quantity = qty;
      this.saveState(state);
      this.renderDrawer();
      this.renderCartPage();
    }
  },

  // Clear all items
  clearCart: function () {
    const emptyState = { items: [], coupon: null, discountRate: 0 };
    this.saveState(emptyState);
    this.renderDrawer();
    this.renderCartPage();
    if (typeof showToast === "function") {
      showToast("Your shopping cart has been cleared.", "info");
    }
  },

  // Apply discount coupon
  applyCoupon: function (code) {
    if (!code) return { success: false, message: "Please enter a voucher code." };
    const upperCode = code.trim().toUpperCase();

    if (MIDEVA_COUPONS[upperCode]) {
      const state = this.getState();
      state.coupon = upperCode;
      state.discountRate = MIDEVA_COUPONS[upperCode].discountRate;
      this.saveState(state);
      this.renderDrawer();
      this.renderCartPage();

      const discountPercent = state.discountRate * 100;
      if (typeof showToast === "function") {
        showToast(`Promo code ${upperCode} applied! ${discountPercent}% discount activated. 🌸`, "success");
      }
      return { success: true, message: `Promo code ${upperCode} applied!` };
    } else {
      if (typeof showToast === "function") {
        showToast("Invalid discount code. Try GLOW10 for 10% off!", "error");
      }
      return { success: false, message: "Invalid discount code." };
    }
  },

  // Remove applied coupon
  removeCoupon: function () {
    const state = this.getState();
    state.coupon = null;
    state.discountRate = 0;
    this.saveState(state);
    this.renderDrawer();
    this.renderCartPage();
    if (typeof showToast === "function") {
      showToast("Coupon removed.", "info");
    }
  },

  // Calculate totals
  getTotals: function () {
    const state = this.getState();
    const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = Math.round(subtotal * (state.discountRate || 0));
    
    // Free delivery in Nairobi over KSh 5,000, or KSh 300 standard. Free if cart empty.
    let shipping = 0;
    if (subtotal > 0) {
      shipping = subtotal >= 5000 ? 0 : 300;
    }

    const total = Math.max(0, subtotal - discountAmount + shipping);
    const totalCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      discountAmount,
      discountRate: state.discountRate || 0,
      coupon: state.coupon,
      shipping,
      total,
      totalCount
    };
  },

  // Update badge counters across header
  updateBadges: function () {
    const totals = this.getTotals();
    const badges = document.querySelectorAll(".cart-badge, .cart-count");
    badges.forEach(badge => {
      badge.textContent = totals.totalCount;
      if (totals.totalCount > 0) {
        badge.style.display = "flex";
      } else {
        badge.style.display = "none";
      }
    });
  },

  // Slide-out Drawer DOM controls
  openDrawer: function () {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (drawer && overlay) {
      this.renderDrawer();
      drawer.classList.add("active");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  },

  closeDrawer: function () {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (drawer && overlay) {
      drawer.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  // Render Slide-out Drawer HTML
  renderDrawer: function () {
    const container = document.getElementById("cart-drawer-content");
    if (!container) return;

    const state = this.getState();
    const totals = this.getTotals();

    // Check if we are in root or subpage for relative path
    const isSubPage = window.location.pathname.includes("/pages/");
    const basePath = isSubPage ? "../" : "";

    if (state.items.length === 0) {
      container.innerHTML = `
        <div class="cart-drawer-body">
          <div class="cart-drawer-empty">
            <div class="cart-drawer-empty-icon">🛍️</div>
            <h3>Your Bag is Empty</h3>
            <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
              Your beauty bag is waiting for your favorite glow essentials.
            </p>
            <a href="${basePath}pages/shop.html" class="btn btn-primary btn-sm" onclick="MidevaCart.closeDrawer()">
              Explore Shop
            </a>
          </div>
        </div>
      `;
      return;
    }

    let itemsHtml = state.items.map(item => {
      const imgPath = basePath + item.image;
      return `
        <div class="drawer-item" data-id="${item.id}">
          <img src="${imgPath}" alt="${item.name}" class="drawer-item-img" onerror="this.src='${basePath}assets/images/cat-skincare.jpg'">
          <div class="drawer-item-details">
            <h4 class="drawer-item-title">${item.name}</h4>
            <div class="drawer-item-price">KSh ${item.price.toLocaleString()}</div>
            <div class="drawer-item-actions">
              <div class="qty-stepper">
                <button class="qty-btn" onclick="MidevaCart.updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn" onclick="MidevaCart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
              </div>
              <button class="btn-remove-item" onclick="MidevaCart.removeItem('${item.id}')">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="cart-drawer-body">
        <div class="cart-drawer-items">
          ${itemsHtml}
        </div>
      </div>
      <div class="cart-drawer-footer">
        <div class="drawer-subtotal-row">
          <span>Subtotal:</span>
          <strong>KSh ${totals.subtotal.toLocaleString()}</strong>
        </div>
        <p class="drawer-shipping-notice">
          ${totals.subtotal >= 5000 
            ? "✨ <strong>Complimentary delivery</strong> applied!" 
            : `Add KSh ${(5000 - totals.subtotal).toLocaleString()} more for Free Nairobi Delivery!`}
        </p>
        <div class="drawer-footer-actions">
          <a href="${basePath}pages/cart.html" class="btn btn-primary btn-block" onclick="MidevaCart.closeDrawer()">
            View Bag & Checkout
          </a>
          <button class="btn btn-secondary btn-block btn-sm" onclick="MidevaCart.closeDrawer()">
            Continue Shopping
          </button>
        </div>
      </div>
    `;
  },

  // Render Full Cart Page
  renderCartPage: function () {
    const pageContainer = document.getElementById("cart-page-container");
    if (!pageContainer) return;

    const state = this.getState();
    const totals = this.getTotals();
    const isSubPage = window.location.pathname.includes("/pages/");
    const basePath = isSubPage ? "../" : "";

    if (state.items.length === 0) {
      pageContainer.innerHTML = `
        <div class="card" style="text-align: center; padding: 4.5rem 2rem; border-radius: var(--radius-lg); background: #fff; border: 1px solid var(--color-border);">
          <div style="font-size: 3.5rem; margin-bottom: 1.2rem;">🌸</div>
          <h2 style="font-family: var(--font-serif); margin-bottom: 0.8rem;">Your Shopping Bag is Empty</h2>
          <p style="color: var(--color-text-muted); max-width: 480px; margin: 0 auto 2rem auto;">
            Looks like you haven't added any beauty or skincare essentials to your bag yet. Discover our curated collections today!
          </p>
          <a href="shop.html" class="btn btn-primary btn-lg">Explore All Products</a>
        </div>
      `;
      return;
    }

    let rowsHtml = state.items.map(item => {
      const imgPath = basePath + item.image;
      const rowTotal = item.price * item.quantity;
      return `
        <tr class="cart-table-row" data-id="${item.id}">
          <td style="padding: 1.2rem 1rem;">
            <div style="display: flex; align-items: center; gap: 1.2rem;">
              <img src="${imgPath}" alt="${item.name}" style="width: 75px; height: 75px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
              <div>
                <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-primary-dark); font-weight: 600;">${item.categoryName || 'Beauty'}</span>
                <h4 style="font-size: 1rem; font-family: var(--font-serif); margin-top: 0.2rem; color: var(--color-text-dark);">${item.name}</h4>
                <button class="btn-remove-item" onclick="MidevaCart.removeItem('${item.id}')" style="margin-top: 0.4rem; display: inline-block;">Remove Item</button>
              </div>
            </div>
          </td>
          <td style="padding: 1.2rem 1rem; font-weight: 600; color: var(--color-text-dark);">
            KSh ${item.price.toLocaleString()}
          </td>
          <td style="padding: 1.2rem 1rem;">
            <div class="qty-stepper">
              <button class="qty-btn" onclick="MidevaCart.updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="MidevaCart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
            </div>
          </td>
          <td style="padding: 1.2rem 1rem; font-weight: 700; color: var(--color-primary-dark); font-size: 1.05rem;">
            KSh ${rowTotal.toLocaleString()}
          </td>
        </tr>
      `;
    }).join("");

    pageContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: 1.7fr 1fr; gap: 2.5rem; align-items: start;">
        <!-- Left: Cart Items Table -->
        <div style="background: #fff; border-radius: var(--radius-lg); border: 1px solid var(--color-border); padding: 1.8rem; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; border-bottom: 1px solid var(--color-border-light); padding-bottom: 0.8rem;">
            <h3 style="font-size: 1.3rem;">Items in Your Bag (${totals.totalCount})</h3>
            <button onclick="MidevaCart.clearCart()" style="font-size: 0.82rem; color: var(--color-danger); text-decoration: underline;">Clear Bag</button>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--color-border); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">
                  <th style="padding: 0.8rem 1rem;">Product</th>
                  <th style="padding: 0.8rem 1rem;">Price</th>
                  <th style="padding: 0.8rem 1rem;">Quantity</th>
                  <th style="padding: 0.8rem 1rem;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.8rem; padding-top: 1.2rem; border-top: 1px solid var(--color-border-light); flex-wrap: wrap; gap: 1rem;">
            <a href="shop.html" class="btn btn-secondary btn-sm">← Continue Shopping</a>
            <span style="font-size: 0.84rem; color: var(--color-text-muted);">Prices inclusive of all applicable taxes.</span>
          </div>
        </div>

        <!-- Right: Order Summary -->
        <div style="background: #fff; border-radius: var(--radius-lg); border: 1px solid var(--color-border); padding: 2rem; box-shadow: var(--shadow-md);">
          <h3 style="font-size: 1.3rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border-light); padding-bottom: 0.8rem;">
            Order Summary
          </h3>

          <!-- Promo Code Box -->
          <div style="margin-bottom: 1.5rem; background: var(--color-cream); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--color-border-light);">
            <label style="display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.4rem; color: var(--color-text-dark);">
              Have a Promo Code?
            </label>
            <div style="display: flex; gap: 0.4rem;">
              <input type="text" id="coupon-input" placeholder="e.g. GLOW10" value="${totals.coupon || ''}" 
                style="flex: 1; padding: 0.55rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); font-size: 0.85rem; text-transform: uppercase;"
                ${totals.coupon ? 'disabled' : ''}>
              ${totals.coupon 
                ? `<button class="btn btn-secondary btn-sm" onclick="MidevaCart.removeCoupon()">Remove</button>`
                : `<button class="btn btn-dark btn-sm" onclick="MidevaCart.handleApplyCoupon()">Apply</button>`
              }
            </div>
            ${totals.coupon ? `<div style="font-size: 0.76rem; color: var(--color-primary-dark); font-weight: 600; margin-top: 0.35rem;">✓ ${totals.coupon} Active (${totals.discountRate * 100}% off)</div>` : ''}
          </div>

          <!-- Cost Calculations -->
          <div style="display: flex; flex-direction: column; gap: 0.8rem; font-size: 0.95rem; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; color: var(--color-text-muted);">
              <span>Bag Subtotal:</span>
              <strong style="color: var(--color-text-dark);">KSh ${totals.subtotal.toLocaleString()}</strong>
            </div>

            ${totals.discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; color: var(--color-primary-dark);">
                <span>Discount (${totals.coupon}):</span>
                <strong>- KSh ${totals.discountAmount.toLocaleString()}</strong>
              </div>
            ` : ''}

            <div style="display: flex; justify-content: space-between; color: var(--color-text-muted);">
              <span>Estimated Delivery:</span>
              <strong style="color: var(--color-text-dark);">
                ${totals.shipping === 0 ? '<span style="color: var(--color-primary-dark);">FREE</span>' : 'KSh ' + totals.shipping.toLocaleString()}
              </strong>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 700; color: var(--color-text-dark); border-top: 1px solid var(--color-border); padding-top: 1rem; margin-top: 0.5rem;">
              <span>Total:</span>
              <span style="color: var(--color-primary-dark);">KSh ${totals.total.toLocaleString()}</span>
            </div>
          </div>

          <button class="btn btn-primary btn-block btn-lg" onclick="MidevaCart.openCheckoutModal()">
            Proceed to Checkout
          </button>

          <div style="margin-top: 1.5rem; text-align: center; font-size: 0.78rem; color: var(--color-text-muted); display: flex; flex-direction: column; gap: 0.4rem;">
            <span>🔒 Secure 256-bit SSL Encrypted Checkout</span>
            <span>📱 Lipa na M-Pesa & Card Payments Supported</span>
          </div>
        </div>
      </div>
    `;
  },

  handleApplyCoupon: function () {
    const input = document.getElementById("coupon-input");
    if (input) {
      this.applyCoupon(input.value);
    }
  },

  // Open simulated checkout modal
  openCheckoutModal: function () {
    const modal = document.getElementById("checkout-modal");
    if (modal) {
      const totals = this.getTotals();
      const amountSpan = document.getElementById("checkout-modal-amount");
      if (amountSpan) amountSpan.textContent = `KSh ${totals.total.toLocaleString()}`;
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  },

  closeCheckoutModal: function () {
    const modal = document.getElementById("checkout-modal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  // Confirm simulated order
  confirmSimulatedOrder: function (event) {
    if (event) event.preventDefault();

    const nameInput = document.getElementById("checkout-name");
    const phoneInput = document.getElementById("checkout-phone");
    const addressInput = document.getElementById("checkout-address");

    if (!nameInput || !nameInput.value.trim()) {
      if (typeof showToast === "function") showToast("Please enter your delivery full name.", "error");
      return;
    }
    if (!phoneInput || !phoneInput.value.trim()) {
      if (typeof showToast === "function") showToast("Please provide your Kenyan phone number.", "error");
      return;
    }
    if (!addressInput || !addressInput.value.trim()) {
      if (typeof showToast === "function") showToast("Please provide your delivery address.", "error");
      return;
    }

    const orderId = "MC-" + Math.floor(100000 + Math.random() * 900000);
    const totals = this.getTotals();

    this.closeCheckoutModal();

    // Show celebratory confirmation
    const confirmationModal = document.getElementById("order-confirmed-modal");
    if (confirmationModal) {
      document.getElementById("confirmed-order-id").textContent = orderId;
      document.getElementById("confirmed-order-amount").textContent = `KSh ${totals.total.toLocaleString()}`;
      confirmationModal.classList.add("active");
    }

    // Clear cart
    const emptyState = { items: [], coupon: null, discountRate: 0 };
    this.saveState(emptyState);
    this.renderDrawer();
    this.renderCartPage();

    if (typeof showToast === "function") {
      showToast(`Thank you! Order ${orderId} placed successfully! 🌸`, "success");
    }
  }
};

// Auto-init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  MidevaCart.updateBadges();
  MidevaCart.renderDrawer();
  MidevaCart.renderCartPage();

  // Close drawer on overlay click
  const overlay = document.getElementById("cart-drawer-overlay");
  if (overlay) {
    overlay.addEventListener("click", () => MidevaCart.closeDrawer());
  }
});

// Export to window
if (typeof window !== "undefined") {
  window.MidevaCart = MidevaCart;
}
