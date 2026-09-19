const API_BASE = "http://localhost:8080";

const state = {
  products: [],
  categories: [],
  brands: [],
  cart: JSON.parse(localStorage.getItem("laptop-cart") || "[]"),
  selectedCategory: "",
  selectedBrand: "",
  search: "",
};

const elements = {
  productGrid: document.getElementById("productGrid"),
  categoryFilter: document.getElementById("categoryFilter"),
  brandFilter: document.getElementById("brandFilter"),
  searchInput: document.getElementById("searchInput"),
  cartCount: document.getElementById("cart-count"),
  cartItems: document.getElementById("cartItems"),
  cartTotal: document.getElementById("cartTotal"),
  cartPanel: document.getElementById("cartPanel"),
  productModal: document.getElementById("productModal"),
  modalContent: document.getElementById("modalContent"),
};

function formatPrice(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(number);
}

function saveCart() {
  localStorage.setItem("laptop-cart", JSON.stringify(state.cart));
  renderCart();
}

function getProductImage(productId) {
  const fallback = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80";

  if (!productId) return fallback;

  const variant = [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=80",
  ];

  return variant[productId % variant.length] || fallback;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

async function loadCategories() {
  try {
    const categories = await fetchJson(`${API_BASE}/api/danh-muc`);
    state.categories = categories;

    elements.categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>';
    categories.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.tenDanhMuc;
      elements.categoryFilter.appendChild(option);
    });
  } catch (error) {
    console.error("Không tải được danh mục:", error);
  }
}

async function loadBrands() {
  try {
    const brands = await fetchJson(`${API_BASE}/api/thuong-hieu`);
    state.brands = brands;

    elements.brandFilter.innerHTML = '<option value="">Tất cả thương hiệu</option>';
    brands.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.tenThuongHieu;
      elements.brandFilter.appendChild(option);
    });
  } catch (error) {
    console.error("Không tải được thương hiệu:", error);
  }
}

async function loadProducts() {
  try {
    const products = await fetchJson(`${API_BASE}/api/san-pham`);
    state.products = products;
    renderProducts();
  } catch (error) {
    console.error("Không tải được sản phẩm:", error);
    elements.productGrid.innerHTML = `
      <div class="empty-state">
        <h3>Không thể kết nối đến backend</h3>
        <p>Vui lòng chạy server Spring Boot tại <strong>http://localhost:8080</strong>.</p>
      </div>
    `;
  }
}

function getFilteredProducts() {
  return state.products.filter((product) => {
    const search = state.search.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (product.tenSp || "").toLowerCase().includes(search) ||
      (product.maSp || "").toLowerCase().includes(search);

    const matchesCategory =
      !state.selectedCategory || String(product.danhMuc?.id) === String(state.selectedCategory);

    const matchesBrand =
      !state.selectedBrand || String(product.thuongHieu?.id) === String(state.selectedBrand);

    return matchesSearch && matchesCategory && matchesBrand;
  });
}

function renderProducts() {
  const products = getFilteredProducts();

  if (!products.length) {
    elements.productGrid.innerHTML = `
      <div class="empty-state">
        <h3>Không tìm thấy sản phẩm phù hợp</h3>
        <p>Thử thay đổi từ khóa hoặc bộ lọc.</p>
      </div>
    `;
    return;
  }

  elements.productGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <img class="product-image" src="${getProductImage(product.id)}" alt="${product.tenSp}" />
          <div class="product-body">
            <div class="product-meta">
              <span>${product.danhMuc?.tenDanhMuc || "Danh mục"}</span>
              <span>${product.thuongHieu?.tenThuongHieu || "Thương hiệu"}</span>
            </div>
            <h3>${product.tenSp}</h3>
            <div class="product-price">
              <span class="price-value">${formatPrice(product.giaCoBan || 0)}</span>
              <span class="stock">${product.maSp || "SP"}</span>
            </div>
            <div class="product-actions">
              <button class="detail-btn" data-id="${product.id}">Chi tiết</button>
              <button class="add-btn" data-id="${product.id}">Thêm</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll(".detail-btn").forEach((button) => {
    button.addEventListener("click", () => openProductModal(Number(button.dataset.id)));
  });

  document.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.id)));
  });
}

async function openProductModal(productId) {
  try {
    const product = state.products.find((item) => item.id === productId);
    if (!product) return;

    const variantResponse = await fetchJson(`${API_BASE}/api/chi-tiet-san-pham/san-pham/${productId}`);
    const variations = Array.isArray(variantResponse) ? variantResponse : [];

    const mainImage = getProductImage(productId);
    const detailHtml = `
      <div class="modal-image-wrap">
        <img class="modal-image" src="${mainImage}" alt="${product.tenSp}" />
      </div>
      <div class="modal-info">
        <div class="tiny-label">${product.thuongHieu?.tenThuongHieu || "Laptop"}</div>
        <h2>${product.tenSp}</h2>
        <div class="price">${formatPrice(product.giaCoBan || 0)}</div>
        <p>${product.moTa || "Laptop được thiết kế phù hợp cho học tập, làm việc và giải trí hàng ngày."}</p>

        <div class="meta-list">
          <div class="meta-item">
            <span>Danh mục</span>
            <strong>${product.danhMuc?.tenDanhMuc || "Chưa có"}</strong>
          </div>
          <div class="meta-item">
            <span>Mã sản phẩm</span>
            <strong>${product.maSp || "N/A"}</strong>
          </div>
          <div class="meta-item">
            <span>Phiên bản</span>
            <strong>${variations[0]?.maCtsp || "Standard"}</strong>
          </div>
          <div class="meta-item">
            <span>Tồn kho</span>
            <strong>${variations[0]?.soLuong ?? 0}</strong>
          </div>
        </div>

        <button class="btn primary full" data-product-id="${product.id}">Thêm vào giỏ hàng</button>
      </div>
    `;

    elements.modalContent.innerHTML = detailHtml;
    elements.productModal.classList.remove("hidden");
    elements.productModal.setAttribute("aria-hidden", "false");

    const addButton = elements.modalContent.querySelector(".btn.primary");
    addButton.addEventListener("click", () => addToCart(productId));
  } catch (error) {
    console.error("Không tải chi tiết sản phẩm:", error);
    elements.modalContent.innerHTML = `
      <div class="modal-info">
        <h2>Không thể mở chi tiết</h2>
        <p>Vui lòng thử lại sau.</p>
      </div>
    `;
    elements.productModal.classList.remove("hidden");
  }
}

function addToCart(productId) {
  const existing = state.cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  elements.cartPanel.classList.remove("hidden");
  closeModal();
}

function renderCart() {
  const cartDetails = state.cart
    .map((item) => {
      const product = state.products.find((p) => p.id === item.id);
      if (!product) return null;
      return {
        ...product,
        quantity: item.quantity,
      };
    })
    .filter(Boolean);

  elements.cartCount.textContent = cartDetails.reduce((sum, item) => sum + item.quantity, 0);

  if (!cartDetails.length) {
    elements.cartItems.innerHTML = '<p class="empty-cart">Chưa có sản phẩm trong giỏ hàng.</p>';
    elements.cartTotal.textContent = "0đ";
    return;
  }

  const total = cartDetails.reduce((sum, item) => sum + Number(item.giaCoBan || 0) * item.quantity, 0);

  elements.cartItems.innerHTML = cartDetails
    .map(
      (item) => `
        <div class="cart-item">
          <img src="${getProductImage(item.id)}" alt="${item.tenSp}" />
          <div style="flex:1">
            <h4>${item.tenSp}</h4>
            <p>Số lượng: ${item.quantity}</p>
            <strong>${formatPrice((item.giaCoBan || 0) * item.quantity)}</strong>
          </div>
        </div>
      `
    )
    .join("");

  elements.cartTotal.textContent = formatPrice(total);
}

function closeModal() {
  elements.productModal.classList.add("hidden");
  elements.productModal.setAttribute("aria-hidden", "true");
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProducts();
  });

  elements.categoryFilter.addEventListener("change", (event) => {
    state.selectedCategory = event.target.value;
    renderProducts();
  });

  elements.brandFilter.addEventListener("change", (event) => {
    state.selectedBrand = event.target.value;
    renderProducts();
  });

  document.querySelector(".cart-button").addEventListener("click", () => {
    elements.cartPanel.classList.toggle("hidden");
  });

  document.getElementById("closeCart").addEventListener("click", () => {
    elements.cartPanel.classList.add("hidden");
  });

  document.querySelector(".modal-close").addEventListener("click", closeModal);
  document.querySelector(".modal-backdrop").addEventListener("click", closeModal);
}

async function init() {
  bindEvents();
  renderCart();

  await Promise.all([loadCategories(), loadBrands(), loadProducts()]);
}

init();

window.addEventListener("storage", () => {
  state.cart = JSON.parse(localStorage.getItem("laptop-cart") || "[]");
  renderCart();
});

window.addEventListener("DOMContentLoaded", () => {
  renderCart();
});

