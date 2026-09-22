/* ==========================================================================
   LaptopStore - Single Page Application Core Controller
   Interfaces: 1. Customer (Người dùng) | 2. Admin & Staff (Quản trị viên)
   ========================================================================== */

// --- Global Application State ---
const state = {
  currentUserRole: 'customer', // 'customer' (Người dùng) | 'admin' (Quản trị viên & Nhân viên)
  currentUser: { id: 1, ten: 'Nguyễn Văn An' },
  currentView: 'shop', // 'shop' | 'orders' | 'promotions' | 'admin'
  activeCategory: null,
  selectedBrands: [],
  selectedPrices: [],
  searchKeyword: '',
  sortBy: 'default',
  products: [],
  categories: [],
  brands: [],
  cpus: [],
  rams: [],
  oCungs: [],
  cards: [],
  manHinhs: [],
  cart: JSON.parse(localStorage.getItem('laptopstore_cart') || '[]'),
  selectedProduct: null,
  selectedVariant: null,
  orders: [],
  notifications: JSON.parse(localStorage.getItem('laptopstore_notifications') || '[]')
};

// --- Helper Functions ---
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';

  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function saveNotifications() {
  localStorage.setItem('laptopstore_notifications', JSON.stringify(state.notifications));
}

function addNotification(recipient, message, icon = 'fa-bell') {
  state.notifications.unshift({
    id: Date.now() + Math.random(),
    recipient,
    message,
    icon,
    createdAt: new Date().toLocaleString('vi-VN'),
    read: false
  });
  state.notifications = state.notifications.slice(0, 50);
  saveNotifications();
  updateNotificationBadge();
}

function getNotificationsForCurrentUser() {
  const recipient = state.currentUserRole === 'admin' ? 'admin' : `user:${state.currentUser.id}`;
  return state.notifications.filter(notification => notification.recipient === recipient);
}

function updateNotificationBadge() {
  const badge = document.getElementById('notification-badge');
  if (!badge) return;
  const unreadCount = getNotificationsForCurrentUser().filter(notification => !notification.read).length;
  badge.textContent = unreadCount;
  badge.style.display = unreadCount ? 'flex' : 'none';
}

function renderNotificationPanel() {
  const panel = document.getElementById('notification-panel');
  if (!panel) return;

  const notifications = getNotificationsForCurrentUser();
  panel.innerHTML = `
    <div class="notification-panel-header">
      <strong>Thông báo</strong>
      <button type="button" class="notification-mark-read" onclick="markNotificationsRead()">Đánh dấu đã đọc</button>
    </div>
    ${notifications.length ? notifications.map(notification => `
      <div class="notification-item ${notification.read ? '' : 'unread'}">
        <i class="fas ${notification.icon}"></i>
        <div><p>${notification.message}</p><small>${notification.createdAt}</small></div>
      </div>
    `).join('') : '<p class="notification-empty">Chưa có thông báo.</p>'}
  `;
}

window.markNotificationsRead = function() {
  const recipient = state.currentUserRole === 'admin' ? 'admin' : `user:${state.currentUser.id}`;
  state.notifications.forEach(notification => {
    if (notification.recipient === recipient) notification.read = true;
  });
  saveNotifications();
  renderNotificationPanel();
  updateNotificationBadge();
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  await loadInitialData();
  setupEventListeners();
  updateCartBadge();
  updateNotificationBadge();
  renderApp();
});

async function loadInitialData() {
  const [prods, cats, brds, cpus, rams, ocungs, cards, screens] = await Promise.all([
    ApiService.getSanPhams(),
    ApiService.getDanhMucs(),
    ApiService.getThuongHieus(),
    ApiService.getCpus(),
    ApiService.getRams(),
    ApiService.getOCungs(),
    ApiService.getCardDoHoas(),
    ApiService.getManHinhs()
  ]);

  state.products = prods || [];
  state.categories = cats || [];
  state.brands = brds || [];
  state.cpus = cpus || [];
  state.rams = rams || [];
  state.oCungs = ocungs || [];
  state.cards = cards || [];
  state.manHinhs = screens || [];
}

function setupEventListeners() {
  // Navigation Links
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-nav');
      switchView(view);
    });
  });

  // Role Switcher (Customer vs Admin & Staff)
  const roleSelect = document.getElementById('role-select');
  if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
      if (state.currentUserRole !== 'admin' && e.target.value === 'admin') {
        e.target.value = 'customer';
        showToast('Bạn không có quyền truy cập giao diện quản trị.', 'error');
        return;
      }
      state.currentUserRole = e.target.value;
      const roleName = state.currentUserRole === 'admin' ? 'Giao diện Quản trị viên & Nhân viên' : 'Giao diện Người dùng';
      showToast(`Đã chuyển đổi sang: ${roleName}`, 'info');
      if (state.currentUserRole === 'admin') {
        switchView('admin');
      } else {
        switchView('shop');
      }
      updateNotificationBadge();
    });
  }

  // Live Search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchKeyword = e.target.value.trim();
      if (state.currentView === 'shop') {
        renderProductCatalog();
      }
    });
  }

  // Cart Drawer Toggle
  document.getElementById('cart-btn')?.addEventListener('click', toggleCartDrawer);
  document.getElementById('close-cart-btn')?.addEventListener('click', toggleCartDrawer);
  document.getElementById('cart-overlay')?.addEventListener('click', toggleCartDrawer);

  document.getElementById('notification-btn')?.addEventListener('click', () => {
    const panel = document.getElementById('notification-panel');
    if (!panel) return;
    panel.hidden = !panel.hidden;
    if (!panel.hidden) renderNotificationPanel();
  });

  // Modal Close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay')?.classList.remove('active');
    });
  });

  // Global Keyboard shortcuts for modal & gallery
  document.addEventListener('keydown', (e) => {
    const activeProductModal = document.getElementById('product-modal')?.classList.contains('active');
    if (activeProductModal) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        window.prevGalleryImage?.();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        window.nextGalleryImage?.();
      } else if (e.key === 'Escape') {
        document.getElementById('product-modal')?.classList.remove('active');
      }
    }
  });
}

function switchView(view) {
  if (view === 'admin' && state.currentUserRole !== 'admin') {
    showToast('Bạn không có quyền truy cập giao diện quản trị.', 'error');
    state.currentView = 'shop';
    return;
  }

  state.currentView = view;
  document.querySelectorAll('.nav-link').forEach(el => {
    if (el.getAttribute('data-nav') === view) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  renderApp();
}

function renderApp() {
  const mainContent = document.getElementById('main-content');
  const heroSection = document.getElementById('hero-section');
  const categorySection = document.getElementById('category-section');
  const sidebar = document.getElementById('sidebar-container');

  // Admin Navigation link visibility
  const adminNav = document.getElementById('nav-admin');
  const roleSelect = document.getElementById('role-select');
  if (adminNav) {
    adminNav.style.display = (state.currentUserRole === 'admin') ? 'flex' : 'none';
  }
  if (roleSelect) {
    roleSelect.value = state.currentUserRole;
    roleSelect.disabled = state.currentUserRole !== 'admin';
    roleSelect.style.display = state.currentUserRole === 'admin' ? 'block' : 'none';
  }

  const aiSection = document.getElementById('ai-section');

  if (state.currentView === 'shop') {
    heroSection.style.display = 'block';
    if (aiSection) aiSection.style.display = 'block';
    categorySection.style.display = 'block';
    sidebar.style.display = 'block';
    mainContent.className = 'main-container';
    renderCategoryChips();
    renderSidebarFilters();
    renderAISection();
    renderProductCatalog();
  } else if (state.currentView === 'orders') {
    heroSection.style.display = 'none';
    if (aiSection) aiSection.style.display = 'none';
    categorySection.style.display = 'none';
    sidebar.style.display = 'none';
    mainContent.className = 'main-container full-width';
    renderMyOrdersView();
  } else if (state.currentView === 'promotions') {
    heroSection.style.display = 'none';
    if (aiSection) aiSection.style.display = 'none';
    categorySection.style.display = 'none';
    sidebar.style.display = 'none';
    mainContent.className = 'main-container full-width';
    renderPromotionsView();
  } else if (state.currentView === 'admin') {
    if (state.currentUserRole !== 'admin') {
      state.currentView = 'shop';
      renderApp();
      return;
    }
    heroSection.style.display = 'none';
    if (aiSection) aiSection.style.display = 'none';
    categorySection.style.display = 'none';
    sidebar.style.display = 'none';
    mainContent.className = 'main-container full-width';
    renderAdminDashboard();
  }
}

// --- Customer View: Shop & Catalog ---
function renderCategoryChips() {
  const container = document.getElementById('category-bar');
  if (!container) return;

  let html = `
    <div class="category-chip ${state.activeCategory === null ? 'active' : ''}" onclick="filterByCategory(null)">
      <i class="fas fa-th-large"></i> Tất cả Laptop
    </div>
  `;

  state.categories.forEach(cat => {
    let icon = 'fa-laptop';
    let chipClass = '';
    if (cat.tenDanhMuc.includes('Gaming')) icon = 'fa-gamepad';
    if (cat.tenDanhMuc.includes('Văn phòng')) icon = 'fa-briefcase';
    if (cat.tenDanhMuc.includes('Đồ họa')) icon = 'fa-palette';
    if (cat.tenDanhMuc.includes('Mỏng nhẹ')) icon = 'fa-feather';
    if (cat.tenDanhMuc.includes('AI') || cat.tenDanhMuc.includes('Copilot')) {
      icon = 'fa-robot';
      chipClass = 'chip-ai';
    }

    html += `
      <div class="category-chip ${chipClass} ${state.activeCategory === cat.id ? 'active' : ''}" onclick="filterByCategory(${cat.id})">
        <i class="fas ${icon}"></i> ${cat.tenDanhMuc}
      </div>
    `;
  });

  container.innerHTML = html;
}

window.filterByCategory = function(catId) {
  state.activeCategory = catId;
  renderCategoryChips();
  renderProductCatalog();
};

// --- AI Laptop Showcase Section ---
function renderAISection() {
  const container = document.getElementById('ai-products-grid');
  if (!container) return;

  // Filter AI/Copilot+ products
  const aiProducts = state.products.filter(p =>
    p.danhMuc && (p.danhMuc.tenDanhMuc.includes('AI') || p.danhMuc.tenDanhMuc.includes('Copilot'))
  );

  if (aiProducts.length === 0) {
    document.getElementById('ai-section').style.display = 'none';
    return;
  }

  container.innerHTML = aiProducts.map(p => {
    const img = p.imageUrl || 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80';
    const brandName = p.thuongHieu ? p.thuongHieu.tenThuongHieu : 'Brand';
    const npuTag = p.moTa && p.moTa.includes('NPU') ? p.moTa.match(/NPU\s*\d+\s*TOPS/i)?.[0] || 'NPU AI' : 'AI Engine';

    return `
      <div class="ai-card" onclick="openProductModal(${p.id})">
        <div class="ai-card-img">
          <img src="${img}" alt="${p.tenSp}" onerror="this.src='https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'">
          <span class="ai-card-npu-tag"><i class="fas fa-microchip"></i> ${npuTag}</span>
        </div>
        <div class="ai-card-body">
          <span class="ai-card-brand">${brandName}</span>
          <h3 class="ai-card-name">${p.tenSp}</h3>
          <p class="ai-card-spec">${p.moTa || 'Laptop AI tích hợp NPU xử lý AI on-device.'}</p>
          <div class="ai-card-footer">
            <span class="ai-card-price">${formatVND(p.giaCoBan)}</span>
            <button class="ai-card-btn"><i class="fas fa-eye"></i> Chi Tiết</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderSidebarFilters() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  let brandHtml = state.brands.map(b => `
    <label class="filter-item">
      <input type="checkbox" value="${b.id}" onchange="toggleBrandFilter(${b.id})" ${state.selectedBrands.includes(b.id) ? 'checked' : ''}>
      <span>${b.tenThuongHieu}</span>
    </label>
  `).join('');

  container.innerHTML = `
    <div class="sidebar glass">
      <div>
        <div class="filter-group-title"><i class="fas fa-filter"></i> Thương Hiệu</div>
        <div class="filter-list">
          ${brandHtml}
        </div>
      </div>

      <div>
        <div class="filter-group-title"><i class="fas fa-tags"></i> Mức Giá</div>
        <div class="filter-list">
          <label class="filter-item">
            <input type="checkbox" onchange="togglePriceFilter('0-15')" ${state.selectedPrices.includes('0-15') ? 'checked' : ''}>
            <span>Dưới 15 triệu</span>
          </label>
          <label class="filter-item">
            <input type="checkbox" onchange="togglePriceFilter('15-20')" ${state.selectedPrices.includes('15-20') ? 'checked' : ''}>
            <span>15 - 20 triệu</span>
          </label>
          <label class="filter-item">
            <input type="checkbox" onchange="togglePriceFilter('20-25')" ${state.selectedPrices.includes('20-25') ? 'checked' : ''}>
            <span>20 - 25 triệu</span>
          </label>
          <label class="filter-item">
            <input type="checkbox" onchange="togglePriceFilter('25-999')" ${state.selectedPrices.includes('25-999') ? 'checked' : ''}>
            <span>Trên 25 triệu</span>
          </label>
        </div>
      </div>
    </div>
  `;
}

window.toggleBrandFilter = function(brandId) {
  const index = state.selectedBrands.indexOf(brandId);
  if (index > -1) {
    state.selectedBrands.splice(index, 1);
  } else {
    state.selectedBrands.push(brandId);
  }
  renderProductCatalog();
};

window.togglePriceFilter = function(range) {
  const index = state.selectedPrices.indexOf(range);
  if (index > -1) {
    state.selectedPrices.splice(index, 1);
  } else {
    state.selectedPrices.push(range);
  }
  renderProductCatalog();
};

function renderProductCatalog() {
  const catalogView = document.getElementById('catalog-view');
  if (!catalogView) return;

  let filtered = [...state.products];

  // Search keyword filter
  if (state.searchKeyword) {
    const kw = state.searchKeyword.toLowerCase();
    filtered = filtered.filter(p => 
      p.tenSp.toLowerCase().includes(kw) || 
      p.maSp.toLowerCase().includes(kw) ||
      (p.moTa && p.moTa.toLowerCase().includes(kw))
    );
  }

  // Category filter
  if (state.activeCategory !== null) {
    filtered = filtered.filter(p => p.danhMuc && p.danhMuc.id === state.activeCategory);
  }

  // Brand filter
  if (state.selectedBrands.length > 0) {
    filtered = filtered.filter(p => p.thuongHieu && state.selectedBrands.includes(p.thuongHieu.id));
  }

  // Price range filter
  if (state.selectedPrices.length > 0) {
    filtered = filtered.filter(p => {
      const priceM = (p.giaCoBan || 0) / 1000000;
      return state.selectedPrices.some(range => {
        if (range === '0-15') return priceM < 15;
        if (range === '15-20') return priceM >= 15 && priceM <= 20;
        if (range === '20-25') return priceM >= 20 && priceM <= 25;
        if (range === '25-999') return priceM > 25;
        return true;
      });
    });
  }

  // Sorting
  if (state.sortBy === 'price-asc') {
    filtered.sort((a, b) => (a.giaCoBan || 0) - (b.giaCoBan || 0));
  } else if (state.sortBy === 'price-desc') {
    filtered.sort((a, b) => (b.giaCoBan || 0) - (a.giaCoBan || 0));
  } else if (state.sortBy === 'name-asc') {
    filtered.sort((a, b) => a.tenSp.localeCompare(b.tenSp));
  }

  // Helper: Extract all images for a product or variant
  window.getProductImageList = function(product, variant = null) {
    let list = [];
    // 1. Variant specific images
    if (variant && variant.danhSachHinhAnh && variant.danhSachHinhAnh.length > 0) {
      list = variant.danhSachHinhAnh.map(img => typeof img === 'string' ? img : (img.urlHinhAnh || img.url || img.imageUrl)).filter(Boolean);
    }
    // 2. Product danhSachHinhAnh
    if (list.length === 0 && product && product.danhSachHinhAnh && product.danhSachHinhAnh.length > 0) {
      list = product.danhSachHinhAnh.map(img => typeof img === 'string' ? img : (img.urlHinhAnh || img.url || img.imageUrl)).filter(Boolean);
    }
    // 3. Product images array
    if (list.length === 0 && product && Array.isArray(product.images) && product.images.length > 0) {
      list = product.images.filter(Boolean);
    }
    // 4. Product single imageUrl
    if (list.length === 0 && product && product.imageUrl) {
      list = [product.imageUrl];
    }
    // 5. Fallback
    if (list.length === 0) {
      list = ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'];
    }
    return list;
  };

  // Card Image Slider Helpers
  if (!state.cardImageIndexes) state.cardImageIndexes = {};

  window.changeCardImage = function(productId, delta) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    const images = getProductImageList(product);
    if (images.length <= 1) return;

    let currentIndex = state.cardImageIndexes[productId] || 0;
    currentIndex = (currentIndex + delta + images.length) % images.length;
    setCardImage(productId, currentIndex);
  };

  window.setCardImage = function(productId, index) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    const images = getProductImageList(product);
    if (!images[index]) return;

    state.cardImageIndexes[productId] = index;
    const imgEl = document.getElementById(`card-img-${productId}`);
    if (imgEl) {
      imgEl.src = images[index];
    }
    const dotsContainer = document.getElementById(`card-dots-${productId}`);
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.card-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
      });
    }
  };

  let cardsHtml = '';
  if (filtered.length === 0) {
    cardsHtml = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
        <i class="fas fa-laptop-code" style="font-size: 3rem; color: var(--text-dim); margin-bottom: 1rem;"></i>
        <h3>Không tìm thấy sản phẩm phù hợp</h3>
        <p style="color: var(--text-muted);">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
      </div>
    `;
  } else {
    cardsHtml = filtered.map(p => {
      const images = getProductImageList(p);
      const activeIdx = state.cardImageIndexes[p.id] || 0;
      const initialImg = images[activeIdx] || images[0];
      const hasMultiple = images.length > 1;

      const catName = p.danhMuc ? p.danhMuc.tenDanhMuc : 'Laptop';
      const brandName = p.thuongHieu ? p.thuongHieu.tenThuongHieu : 'Brand';
      const isAI = p.danhMuc && (p.danhMuc.tenDanhMuc.includes('AI') || p.danhMuc.tenDanhMuc.includes('Copilot'));
      const badgeClass = isAI ? 'product-badge badge-ai-tag' : 'product-badge';
      const badgeIcon = isAI ? '<i class="fas fa-robot"></i> ' : '';

      return `
        <div class="product-card">
          <span class="${badgeClass}">${badgeIcon}${catName}</span>
          <div class="product-img-wrap">
            <img id="card-img-${p.id}" src="${initialImg}" alt="${p.tenSp}" onerror="this.src='https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'">
            ${hasMultiple ? `
              <span class="img-count-badge" title="Sản phẩm có ${images.length} ảnh">
                <i class="fas fa-images"></i> ${images.length}
              </span>
              <button type="button" class="card-img-btn prev" onclick="event.stopPropagation(); changeCardImage(${p.id}, -1)" title="Ảnh trước">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button type="button" class="card-img-btn next" onclick="event.stopPropagation(); changeCardImage(${p.id}, 1)" title="Ảnh kế tiếp">
                <i class="fas fa-chevron-right"></i>
              </button>
              <div class="card-dots" id="card-dots-${p.id}">
                ${images.map((_, idx) => `
                  <span class="card-dot ${idx === activeIdx ? 'active' : ''}" onclick="event.stopPropagation(); setCardImage(${p.id}, ${idx})"></span>
                `).join('')}
              </div>
            ` : ''}
          </div>
          <div class="product-body">
            <span class="product-brand">${brandName}</span>
            <h3 class="product-name">${p.tenSp}</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${p.moTa || 'Laptop chính hãng, cấu hình mượt mà, bảo hành 24 tháng.'}
            </p>
            <div class="product-footer">
              <span class="product-price">${formatVND(p.giaCoBan || 0)}</span>
              <button class="btn btn-primary btn-sm" onclick="openProductModal(${p.id})">
                <i class="fas fa-eye"></i> Xem Chi Tiết
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  catalogView.innerHTML = `
    <div class="catalog-header">
      <h2 class="catalog-title">Sản Phẩm Cửa Hàng (${filtered.length})</h2>
      <select id="sort-select" class="sort-select" onchange="state.sortBy=this.value; renderProductCatalog();">
        <option value="default" ${state.sortBy === 'default' ? 'selected' : ''}>Sắp xếp: Mặc định</option>
        <option value="price-asc" ${state.sortBy === 'price-asc' ? 'selected' : ''}>Giá: Thấp đến Cao</option>
        <option value="price-desc" ${state.sortBy === 'price-desc' ? 'selected' : ''}>Giá: Cao đến Thấp</option>
        <option value="name-asc" ${state.sortBy === 'name-asc' ? 'selected' : ''}>Tên A - Z</option>
      </select>
    </div>
    <div class="product-grid">
      ${cardsHtml}
    </div>
  `;
}

// --- Customer Product Modal & Gallery State ---
state.currentGalleryImages = [];
state.currentGalleryIndex = 0;

window.setGalleryIndex = function(index) {
  if (!state.currentGalleryImages || state.currentGalleryImages.length === 0) return;
  if (index < 0) index = state.currentGalleryImages.length - 1;
  if (index >= state.currentGalleryImages.length) index = 0;
  state.currentGalleryIndex = index;

  const mainImgEl = document.getElementById('modal-gallery-main');
  const counterEl = document.getElementById('modal-gallery-counter');
  if (mainImgEl) {
    mainImgEl.classList.remove('fade-in');
    void mainImgEl.offsetWidth; // trigger reflow
    mainImgEl.src = state.currentGalleryImages[index];
    mainImgEl.classList.add('fade-in');
  }
  if (counterEl) {
    counterEl.innerText = `${index + 1} / ${state.currentGalleryImages.length}`;
  }
  document.querySelectorAll('.detail-thumb-item').forEach((thumb, idx) => {
    thumb.classList.toggle('active', idx === index);
  });
};

window.nextGalleryImage = function() {
  setGalleryIndex(state.currentGalleryIndex + 1);
};

window.prevGalleryImage = function() {
  setGalleryIndex(state.currentGalleryIndex - 1);
};

window.updateGalleryForCurrentState = function() {
  state.currentGalleryImages = getProductImageList(state.selectedProduct, state.selectedVariant);
  state.currentGalleryIndex = 0;

  const galleryContainer = document.getElementById('modal-gallery-container');
  if (!galleryContainer) return;

  const hasMultiple = state.currentGalleryImages.length > 1;

  galleryContainer.innerHTML = `
    <div class="detail-main-img-wrap">
      <div class="detail-main-img">
        <img id="modal-gallery-main" src="${state.currentGalleryImages[0]}" alt="${state.selectedProduct?.tenSp || 'Laptop'}" onerror="this.src='https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'">
      </div>
      ${hasMultiple ? `
        <button type="button" class="gallery-nav-btn prev" onclick="prevGalleryImage()" title="Ảnh trước"><i class="fas fa-chevron-left"></i></button>
        <button type="button" class="gallery-nav-btn next" onclick="nextGalleryImage()" title="Ảnh kế tiếp"><i class="fas fa-chevron-right"></i></button>
        <div id="modal-gallery-counter" class="gallery-counter">1 / ${state.currentGalleryImages.length}</div>
      ` : ''}
    </div>
    ${hasMultiple ? `
      <div class="detail-thumbnails">
        ${state.currentGalleryImages.map((img, idx) => `
          <div class="detail-thumb-item ${idx === 0 ? 'active' : ''}" onclick="setGalleryIndex(${idx})">
            <img src="${img}" alt="Thumbnail ${idx + 1}" onerror="this.src='https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'">
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
};

// --- CTSP Detailed Specifications Renderer ---
window.renderVariantSpecs = function(v, product) {
  if (!v) {
    return `
      <div class="ctsp-specs-card">
        <div class="ctsp-specs-header">
          <div class="ctsp-specs-title">
            <i class="fas fa-microchip"></i> Thông Số Kỹ Thuật Chi Tiết (CTSP)
          </div>
        </div>
        <div class="ctsp-specs-empty">
          <i class="fas fa-info-circle"></i> Đang tải thông số kỹ thuật chi tiết của sản phẩm...
        </div>
      </div>
    `;
  }

  // Vi xử lý (CPU)
  const cpuVal = v.cpu?.tenCpu || 'Đang cập nhật';

  // Bộ nhớ RAM
  let ramVal = 'Đang cập nhật';
  if (v.ram) {
    ramVal = `${v.ram.dungLuong || ''} ${v.ram.loaiRam || ''}`.trim();
  }

  // Ổ cứng lưu trữ
  const oc = v.oCung || v.ocung;
  let oCungVal = 'Đang cập nhật';
  if (oc) {
    oCungVal = `${oc.loaiOCung || ''} ${oc.dungLuong || ''}`.trim();
  }

  // Card đồ họa (GPU)
  const gpuVal = v.cardDoHoa?.tenCard || 'Đang cập nhật';

  // Màn hình hiển thị
  let screenVal = 'Đang cập nhật';
  if (v.manHinh) {
    const parts = [
      v.manHinh.kichThuoc,
      v.manHinh.doPhanGiai ? `(${v.manHinh.doPhanGiai})` : '',
      v.manHinh.tanSoQuet
    ].filter(Boolean);
    screenVal = parts.join(' - ');
  }

  // Màu sắc
  const colorVal = v.mauSac?.tenMau || 'Tiêu chuẩn';

  // Mã phiên bản SKU
  const codeVal = v.maCtsp || `CTSP00${v.id}`;

  // Tình trạng kho hàng
  const stockQty = v.soLuong != null ? v.soLuong : 0;
  const isAvailable = stockQty > 0;
  const stockText = isAvailable ? `Còn ${stockQty} máy sẵn hàng` : `Tạm hết hàng`;
  const stockClass = isAvailable ? 'in-stock' : 'out-stock';

  return `
    <div class="ctsp-specs-card">
      <div class="ctsp-specs-header">
        <div class="ctsp-specs-title">
          <i class="fas fa-sliders-h"></i> Thông Số Kỹ Thuật Chi Tiết (CTSP)
        </div>
        <div class="stock-badge ${stockClass}">
          <span class="stock-dot"></span>
          <span>${stockText}</span>
        </div>
      </div>

      <div class="specs-grid">
        <div class="spec-row">
          <div class="spec-label"><i class="fas fa-microchip spec-icon"></i> Vi xử lý (CPU)</div>
          <div class="spec-value highlight">${cpuVal}</div>
        </div>
        <div class="spec-row">
          <div class="spec-label"><i class="fas fa-memory spec-icon"></i> Bộ nhớ RAM</div>
          <div class="spec-value highlight">${ramVal}</div>
        </div>
        <div class="spec-row">
          <div class="spec-label"><i class="fas fa-hard-drive spec-icon"></i> Ổ cứng lưu trữ</div>
          <div class="spec-value highlight">${oCungVal}</div>
        </div>
        <div class="spec-row">
          <div class="spec-label"><i class="fas fa-gamepad spec-icon"></i> Card đồ họa (GPU)</div>
          <div class="spec-value highlight">${gpuVal}</div>
        </div>
        <div class="spec-row">
          <div class="spec-label"><i class="fas fa-desktop spec-icon"></i> Màn hình hiển thị</div>
          <div class="spec-value">${screenVal}</div>
        </div>
        <div class="spec-row">
          <div class="spec-label"><i class="fas fa-palette spec-icon"></i> Màu sắc phiên bản</div>
          <div class="spec-value">${colorVal}</div>
        </div>
        <div class="spec-row">
          <div class="spec-label"><i class="fas fa-barcode spec-icon"></i> Mã cấu hình (SKU)</div>
          <div class="spec-value"><code>${codeVal}</code></div>
        </div>
        <div class="spec-row">
          <div class="spec-label"><i class="fas fa-shield-alt spec-icon"></i> Bảo hành chính hãng</div>
          <div class="spec-value">24 tháng toàn quốc</div>
        </div>
      </div>

      ${v.moTa ? `
        <div class="ctsp-spec-summary">
          <i class="fas fa-info-circle"></i>
          <span><strong>Ghi chú cấu hình:</strong> ${v.moTa}</span>
        </div>
      ` : ''}
    </div>
  `;
};

window.openProductModal = async function(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.selectedProduct = product;
  const variants = await ApiService.getChiTietBySanPhamId(productId);
  state.selectedVariant = (variants && variants.length > 0) ? variants[0] : null;

  const modalOverlay = document.getElementById('product-modal');
  const modalBody = document.getElementById('product-modal-body');
  if (!modalOverlay || !modalBody) return;

  let variantsHtml = '';
  if (variants && variants.length > 0) {
    variantsHtml = `
      <div class="variant-selector">
        <span class="variant-title">Chọn cấu hình chi tiết / Màu sắc:</span>
        <div class="variant-options">
          ${variants.map((v, idx) => `
            <div class="variant-chip ${idx === 0 ? 'active' : ''}" onclick="selectVariant(this, ${v.id})">
              ${v.mauSac ? `🎨 ${v.mauSac.tenMau} - ` : ''}${v.cpu ? v.cpu.tenCpu : ''} / ${v.ram ? v.ram.dungLuong : ''} / ${v.oCung || v.ocung ? (v.oCung || v.ocung).dungLuong : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  modalBody.innerHTML = `
    <div class="product-detail-grid">
      <div class="detail-gallery" id="modal-gallery-container">
        <!-- Interactive Multi-image Gallery Rendered Dynamically -->
      </div>

      <div class="detail-info">
        <span style="color: var(--primary); font-weight: 700; text-transform: uppercase;">${product.thuongHieu ? product.thuongHieu.tenThuongHieu : ''}</span>
        <h2 style="font-size: 1.8rem; font-weight: 800; margin: 0.25rem 0 1rem 0;">${product.tenSp}</h2>
        
        <div style="font-size: 2rem; font-weight: 800; color: var(--primary); margin-bottom: 1rem;" id="modal-price">
          ${formatVND(state.selectedVariant ? state.selectedVariant.gia : product.giaCoBan)}
        </div>

        <p style="color: var(--text-muted); margin-bottom: 1.25rem;">
          ${product.moTa || 'Laptop chất lượng cao, bảo hành chính hãng toàn quốc 24 tháng.'}
        </p>

        ${variantsHtml}

        <div id="modal-specs-container">
          ${renderVariantSpecs(state.selectedVariant, product)}
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button class="btn btn-primary" onclick="addToCartFromModal()">
            <i class="fas fa-cart-plus"></i> Thêm Vào Giỏ Hàng
          </button>
          <button class="btn btn-secondary" onclick="buyNowFromModal()">
            <i class="fas fa-bolt"></i> Mua Ngay
          </button>
        </div>
      </div>
    </div>
  `;

  // Render multi-image gallery
  updateGalleryForCurrentState();

  modalOverlay.classList.add('active');
};

window.selectVariant = async function(element, variantId) {
  document.querySelectorAll('.variant-chip').forEach(c => c.classList.remove('active'));
  element.classList.add('active');
  const allVariants = await ApiService.getChiTietBySanPhamId(state.selectedProduct.id);
  state.selectedVariant = allVariants.find(v => v.id === variantId);
  if (state.selectedVariant) {
    document.getElementById('modal-price').innerText = formatVND(state.selectedVariant.gia);
    // Dynamically update gallery if this variant has specific photos!
    updateGalleryForCurrentState();
    // Dynamically update all CTSP specifications!
    const specsContainer = document.getElementById('modal-specs-container');
    if (specsContainer) {
      specsContainer.innerHTML = renderVariantSpecs(state.selectedVariant, state.selectedProduct);
    }
  }
};

window.addToCartFromModal = function() {
  if (!state.selectedProduct) return;

  const currentImages = (state.currentGalleryImages && state.currentGalleryImages.length > 0)
    ? state.currentGalleryImages
    : getProductImageList(state.selectedProduct, state.selectedVariant);
  const activeImg = currentImages[state.currentGalleryIndex] || currentImages[0];

  const item = {
    productId: state.selectedProduct.id,
    variantId: state.selectedVariant ? state.selectedVariant.id : null,
    name: state.selectedProduct.tenSp,
    price: state.selectedVariant ? state.selectedVariant.gia : state.selectedProduct.giaCoBan,
    spec: state.selectedVariant ? state.selectedVariant.moTa : 'Cấu hình tiêu chuẩn',
    image: activeImg,
    quantity: 1
  };

  const existingIndex = state.cart.findIndex(c => c.productId === item.productId && c.variantId === item.variantId);
  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += 1;
  } else {
    state.cart.push(item);
  }

  saveCart();
  updateCartBadge();
  showToast(`Đã thêm "${item.name}" vào giỏ hàng!`, 'success');
  document.getElementById('product-modal')?.classList.remove('active');
};

window.buyNowFromModal = function() {
  addToCartFromModal();
  toggleCartDrawer();
};

// --- Cart & Drawer Functions ---
function saveCart() {
  localStorage.setItem('laptopstore_cart', JSON.stringify(state.cart));
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = totalQty;
  }
}

function toggleCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');

  const isActive = drawer?.classList.contains('active');
  if (isActive) {
    drawer?.classList.remove('active');
    overlay?.classList.remove('active');
  } else {
    renderCartDrawerContent();
    drawer?.classList.add('active');
    overlay?.classList.add('active');
  }
}

function renderCartDrawerContent() {
  const body = document.getElementById('cart-drawer-body');
  const totalEl = document.getElementById('cart-total-price');

  if (!body) return;

  if (state.cart.length === 0) {
    body.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 1rem; color: var(--text-dim);"></i>
        <p>Giỏ hàng của bạn đang trống</p>
      </div>
    `;
    if (totalEl) totalEl.innerText = formatVND(0);
    return;
  }

  let total = 0;
  body.innerHTML = state.cart.map((item, idx) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    return `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${item.spec}</div>
          <div class="cart-item-price">${formatVND(item.price)}</div>
          <div class="qty-btn-group">
            <button class="qty-btn" onclick="updateCartQty(${idx}, -1)">-</button>
            <span style="font-size: 0.85rem; font-weight: 700;">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
          </div>
        </div>
        <button style="background: none; color: var(--danger);" onclick="removeCartItem(${idx})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }).join('');

  if (totalEl) totalEl.innerText = formatVND(total);
}

window.updateCartQty = function(index, change) {
  if (state.cart[index]) {
    state.cart[index].quantity += change;
    if (state.cart[index].quantity <= 0) {
      state.cart.splice(index, 1);
    }
    saveCart();
    updateCartBadge();
    renderCartDrawerContent();
  }
};

window.removeCartItem = function(index) {
  state.cart.splice(index, 1);
  saveCart();
  updateCartBadge();
  renderCartDrawerContent();
  showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
};

window.openCheckoutModal = function() {
  if (state.cart.length === 0) {
    showToast('Giỏ hàng trống! Hãy thêm sản phẩm trước khi thanh toán.', 'error');
    return;
  }
  toggleCartDrawer();

  const modal = document.getElementById('checkout-modal');
  const totalAmount = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  document.getElementById('checkout-total-price').innerText = formatVND(totalAmount);
  modal?.classList.add('active');
};

window.processCheckout = async function(e) {
  e.preventDefault();

  const name = document.getElementById('checkout-name').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();
  const address = document.getElementById('checkout-address').value.trim();
  const payment = document.getElementById('checkout-payment').value;

  if (!name || !phone || !address) {
    showToast('Vui lòng nhập đầy đủ thông tin giao hàng!', 'error');
    return;
  }

  const totalAmount = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const newOrder = {
    idKhachHang: state.currentUser.id,
    khachHang: { id: state.currentUser.id },
    tenNguoiNhan: name,
    dienThoai: phone,
    diaChi: address,
    phuongThucThanhToan: payment,
    tongTien: totalAmount,
    sanPhamDaMua: [...state.cart]
  };

  await ApiService.createHoaDon(newOrder);
  addNotification('admin', `Có đơn hàng mới từ ${name}. Vui lòng kiểm tra và xác nhận đơn hàng.`, 'fa-shopping-bag');

  // Clear cart
  state.cart = [];
  saveCart();
  updateCartBadge();

  document.getElementById('checkout-modal')?.classList.remove('active');
  showToast('Đặt hàng thành công! Đơn hàng của bạn đã được ghi nhận.', 'success');
  switchView('orders');
};

// --- Customer Order History ---
async function renderMyOrdersView() {
  const container = document.getElementById('catalog-view');
  if (!container) return;

  const orders = await ApiService.getHoaDonsByCustomer(state.currentUser.id);

  let html = `
    <div style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.8rem; font-weight: 800;"><i class="fas fa-box-open" style="color: var(--primary);"></i> Đơn Hàng Của Tôi</h2>
      <p style="color: var(--text-muted);">Theo dõi lịch sử đơn hàng và trạng thái xử lý giao hàng real-time.</p>
    </div>
  `;

  if (!orders || orders.length === 0) {
    html += `
      <div class="glass" style="text-align: center; padding: 4rem 2rem; border-radius: var(--radius-md);">
        <i class="fas fa-receipt" style="font-size: 3rem; color: var(--text-dim); margin-bottom: 1rem;"></i>
        <h3>Bạn chưa có đơn hàng nào</h3>
        <button class="btn btn-primary" style="margin-top: 1rem;" onclick="switchView('shop')">
          Khám Phá Cửa Hàng Ngay
        </button>
      </div>
    `;
  } else {
    html += `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mã Đơn</th>
              <th>Ngày Đặt</th>
              <th>Người Nhận</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td><strong>${o.ma || 'HD00' + o.id}</strong></td>
                <td>${o.ngayTao || '2026-09-19'}</td>
                <td>${o.tenNguoiNhan || o.tenKhachHang}<br><small style="color: var(--text-dim);">${o.dienThoai}</small></td>
                <td style="color: var(--primary); font-weight: 700;">${formatVND(o.tongTien || 18990000)}</td>
                <td>${getOrderStatusBadge(o.trangThai)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  container.innerHTML = html;
}

function getOrderStatusBadge(status) {
  const s = parseInt(status);
  if (s === 0) return `<span class="badge badge-warning"><i class="fas fa-clock"></i> Chờ xác nhận</span>`;
  if (s === 1) return `<span class="badge badge-info"><i class="fas fa-check"></i> Đã xác nhận</span>`;
  if (s === 2) return `<span class="badge badge-info"><i class="fas fa-truck"></i> Đang giao</span>`;
  if (s === 3) return `<span class="badge badge-success"><i class="fas fa-box-check"></i> Hoàn thành</span>`;
  if (s === 4) return `<span class="badge badge-danger"><i class="fas fa-times-circle"></i> Đã hủy</span>`;
  return `<span class="badge badge-warning">Chờ xử lý</span>`;
}

// --- Customer Promotions View ---
async function renderPromotionsView() {
  const container = document.getElementById('catalog-view');
  if (!container) return;

  const promos = await ApiService.getKhuyenMais();

  container.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <h2 style="font-size: 2rem; font-weight: 800;"><i class="fas fa-gift" style="color: var(--accent-purple);"></i> Chương Trình Khuyến Mãi</h2>
      <p style="color: var(--text-muted);">Tổng hợp mã giảm giá và quà tặng công nghệ hấp dẫn nhất.</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
      ${promos.map(km => `
        <div class="glass" style="padding: 1.5rem; border-radius: var(--radius-md); border-top: 3px solid var(--primary);">
          <span class="badge badge-warning" style="margin-bottom: 0.75rem;">GIẢM ${km.phanTramGiam}%</span>
          <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">${km.tenKm}</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted);">Mã ưu đãi: <strong style="color: var(--primary);">${km.ma}</strong></p>
          <p style="font-size: 0.85rem; color: var(--text-dim); margin-top: 0.5rem;">Áp dụng: ${km.ngayBatDau} đến ${km.ngayKetThuc}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// ==========================================================================
// --- GIAO DIỆN QUẢN TRỊ VIÊN & NHÂN VIÊN (ADMIN DASHBOARD) ---
// ==========================================================================
async function renderAdminDashboard() {
  if (state.currentUserRole !== 'admin') {
    switchView('shop');
    return;
  }

  const container = document.getElementById('catalog-view');
  if (!container) return;

  const orders = await ApiService.getHoaDons();
  const promos = await ApiService.getKhuyenMais();

  container.innerHTML = `
    <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 2rem; font-weight: 800;"><i class="fas fa-user-shield" style="color: var(--primary);"></i> Giao Diện Quản Trị Viên & Nhân Viên</h2>
        <p style="color: var(--text-muted);">Bảng quản lý sản phẩm, thay đổi giá, điều chỉnh khuyến mại và xử lý đơn hàng.</p>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button class="btn btn-primary btn-sm" onclick="showAddProductModal()">
          <i class="fas fa-plus"></i> Thêm Laptop Mới
        </button>
        <button class="btn btn-secondary btn-sm" onclick="showAddPromotionModal()">
          <i class="fas fa-plus-circle"></i> Thêm Khuyến Mại
        </button>
      </div>
    </div>

    <div class="tab-header">
      <button class="tab-btn active" onclick="switchAdminTab('products-tab', event)"><i class="fas fa-laptop"></i> Quản Lý Sản Phẩm & Thay Đổi Giá (${state.products.length})</button>
      <button class="tab-btn" onclick="switchAdminTab('promotions-tab', event)"><i class="fas fa-percentage"></i> Quản Lý & Thay Đổi Khuyến Mại (${promos.length})</button>
      <button class="tab-btn" onclick="switchAdminTab('orders-tab', event)"><i class="fas fa-shopping-bag"></i> Quản Lý Đơn Hàng (${orders.length})</button>
      <button class="tab-btn" onclick="switchAdminTab('inventory-tab', event)"><i class="fas fa-barcode"></i> Quản Lý Kho & IMEI</button>
    </div>

    <div id="admin-tab-content">
      <!-- Dynamic Admin Tab Content -->
    </div>
  `;

  renderAdminProductsTab();
}

window.switchAdminTab = async function(tabId, evt) {
  if (state.currentUserRole !== 'admin') {
    showToast('Bạn không có quyền truy cập khu vực quản trị.', 'error');
    switchView('shop');
    return;
  }

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (evt && evt.target) {
    evt.target.classList.add('active');
  }

  if (tabId === 'products-tab') {
    renderAdminProductsTab();
  } else if (tabId === 'promotions-tab') {
    renderAdminPromotionsTab();
  } else if (tabId === 'orders-tab') {
    const orders = await ApiService.getHoaDons();
    renderAdminOrdersTab(orders);
  } else if (tabId === 'inventory-tab') {
    renderAdminInventoryTab();
  }
};

// --- Tab 1: Product Management & Price Modification ---
function renderAdminProductsTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  content.innerHTML = `
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Mã SP</th>
            <th>Tên Laptop</th>
            <th>Danh Mục</th>
            <th>Thương Hiệu</th>
            <th>Giá Bán Hiện Tại</th>
            <th>Thao Tác Quản Lý</th>
          </tr>
        </thead>
        <tbody>
          ${state.products.map(p => `
            <tr>
              <td><strong>${p.maSp}</strong></td>
              <td>
                <div style="font-weight: 700; color: var(--text-main);">${p.tenSp}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${p.moTa || ''}</div>
              </td>
              <td>${p.danhMuc ? p.danhMuc.tenDanhMuc : ''}</td>
              <td><span class="product-brand">${p.thuongHieu ? p.thuongHieu.tenThuongHieu : ''}</span></td>
              <td style="color: var(--primary); font-weight: 800; font-size: 1.05rem;">${formatVND(p.giaCoBan)}</td>
              <td>
                <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                  <button class="btn btn-secondary btn-sm" onclick="showEditProductModal(${p.id})">
                    <i class="fas fa-edit"></i> Sửa
                  </button>
                  <button class="btn btn-primary btn-sm" onclick="showUpdatePriceModal(${p.id})">
                    <i class="fas fa-dollar-sign"></i> Thay Đổi Giá
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">
                    <i class="fas fa-trash"></i> Xóa
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// --- Product Modal Handlers ---
window.showAddProductModal = function() {
  document.getElementById('product-editor-title').innerHTML = `<i class="fas fa-plus-circle"></i> Thêm Laptop Mới`;
  document.getElementById('edit-prod-id').value = '';
  document.getElementById('edit-prod-code').value = `SP00${state.products.length + 1}`;
  document.getElementById('edit-prod-name').value = '';
  document.getElementById('edit-prod-price').value = '';
  document.getElementById('edit-prod-image').value = '';
  document.getElementById('edit-prod-desc').value = '';

  populateCategoryBrandDropdowns();
  document.getElementById('product-editor-modal')?.classList.add('active');
};

window.showEditProductModal = function(id) {
  const prod = state.products.find(p => p.id === id);
  if (!prod) return;

  document.getElementById('product-editor-title').innerHTML = `<i class="fas fa-edit"></i> Sửa Thông Tin Laptop`;
  document.getElementById('edit-prod-id').value = prod.id;
  document.getElementById('edit-prod-code').value = prod.maSp;
  document.getElementById('edit-prod-name').value = prod.tenSp;
  document.getElementById('edit-prod-price').value = prod.giaCoBan;
  
  const images = getProductImageList(prod);
  document.getElementById('edit-prod-image').value = images.join(', ');
  document.getElementById('edit-prod-desc').value = prod.moTa || '';

  populateCategoryBrandDropdowns(prod.danhMuc?.id, prod.thuongHieu?.id);
  document.getElementById('product-editor-modal')?.classList.add('active');
};

window.showUpdatePriceModal = function(id) {
  const prod = state.products.find(p => p.id === id);
  if (!prod) return;

  const newPriceStr = prompt(`Thay đổi giá bán cho laptop "${prod.tenSp}"\nGiá hiện tại: ${formatVND(prod.giaCoBan)}\n\nNhập giá bán mới (VNĐ):`, prod.giaCoBan);
  if (newPriceStr !== null) {
    const newPrice = parseFloat(newPriceStr);
    if (!isNaN(newPrice) && newPrice >= 0) {
      prod.giaCoBan = newPrice;
      ApiService.updateSanPham(prod.id, prod);
      renderAdminProductsTab();
      showToast(`Đã cập nhật giá bán mới: ${formatVND(newPrice)}`, 'success');
    } else {
      showToast('Giá nhập vào không hợp lệ!', 'error');
    }
  }
};

function populateCategoryBrandDropdowns(selectedCatId, selectedBrandId) {
  const catSelect = document.getElementById('edit-prod-category');
  const brandSelect = document.getElementById('edit-prod-brand');

  if (catSelect) {
    catSelect.innerHTML = state.categories.map(c => `
      <option value="${c.id}" ${c.id === selectedCatId ? 'selected' : ''}>${c.tenDanhMuc}</option>
    `).join('');
  }

  if (brandSelect) {
    brandSelect.innerHTML = state.brands.map(b => `
      <option value="${b.id}" ${b.id === selectedBrandId ? 'selected' : ''}>${b.tenThuongHieu}</option>
    `).join('');
  }
}

window.saveProductForm = async function(e) {
  e.preventDefault();

  const id = document.getElementById('edit-prod-id').value;
  const maSp = document.getElementById('edit-prod-code').value.trim();
  const tenSp = document.getElementById('edit-prod-name').value.trim();
  const catId = parseInt(document.getElementById('edit-prod-category').value);
  const brandId = parseInt(document.getElementById('edit-prod-brand').value);
  const giaCoBan = parseFloat(document.getElementById('edit-prod-price').value);
  const imageUrlRaw = document.getElementById('edit-prod-image').value.trim();
  const moTa = document.getElementById('edit-prod-desc').value.trim();

  const imageUrlList = imageUrlRaw ? imageUrlRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const mainImage = imageUrlList[0] || 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80';
  const danhSachHinhAnh = imageUrlList.map((url, idx) => ({ id: idx + 1, urlHinhAnh: url }));

  const category = state.categories.find(c => c.id === catId);
  const brand = state.brands.find(b => b.id === brandId);

  const prodData = {
    maSp,
    tenSp,
    giaCoBan,
    moTa,
    danhMuc: category,
    thuongHieu: brand,
    imageUrl: mainImage,
    danhSachHinhAnh: danhSachHinhAnh
  };

  if (id) {
    // Update existing product
    await ApiService.updateSanPham(parseInt(id), prodData);
    const index = state.products.findIndex(p => p.id === parseInt(id));
    if (index > -1) {
      state.products[index] = { id: parseInt(id), ...prodData };
    }
    showToast('Cập nhật sản phẩm thành công!', 'success');
  } else {
    // Create new product
    const created = await ApiService.createSanPham(prodData);
    state.products.push(created);
    showToast('Thêm sản phẩm mới thành công!', 'success');
  }

  document.getElementById('product-editor-modal')?.classList.remove('active');
  renderAdminProductsTab();
};

window.deleteProduct = async function(id) {
  if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
    await ApiService.deleteSanPham(id);
    state.products = state.products.filter(p => p.id !== id);
    renderAdminProductsTab();
    showToast('Đã xóa sản phẩm thành công!', 'info');
  }
};

// --- Tab 2: Promotion Management & Discount Changes ---
async function renderAdminPromotionsTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  const promos = await ApiService.getKhuyenMais();

  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3>Quản Lý Chương Trình Khuyến Mại</h3>
      <button class="btn btn-primary btn-sm" onclick="showAddPromotionModal()">
        <i class="fas fa-plus"></i> Thêm Mã Khuyến Mại Mới
      </button>
    </div>

    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Mã KM</th>
            <th>Tên Khuyến Mại</th>
            <th>Phần Trăm Giảm Giá</th>
            <th>Ngày Bắt Đầu</th>
            <th>Ngày Kết Thúc</th>
            <th>Thao Tác Quản Lý</th>
          </tr>
        </thead>
        <tbody>
          ${promos.map(km => `
            <tr>
              <td><strong style="color: var(--primary);">${km.ma}</strong></td>
              <td><strong>${km.tenKm}</strong></td>
              <td><span class="badge badge-warning" style="font-size: 0.9rem;">GIẢM ${km.phanTramGiam}%</span></td>
              <td>${km.ngayBatDau}</td>
              <td>${km.ngayKetThuc}</td>
              <td>
                <div style="display: flex; gap: 0.4rem;">
                  <button class="btn btn-secondary btn-sm" onclick="showEditPromotionModal(${km.id})">
                    <i class="fas fa-edit"></i> Thay Đổi % Giảm & Ngày
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="deletePromotion(${km.id})">
                    <i class="fas fa-trash"></i> Xóa
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

window.showAddPromotionModal = function() {
  document.getElementById('promo-editor-title').innerHTML = `<i class="fas fa-plus-circle"></i> Thêm Khuyến Mại Mới`;
  document.getElementById('edit-promo-id').value = '';
  document.getElementById('edit-promo-code').value = `KM_THU_${new Date().getMonth() + 1}`;
  document.getElementById('edit-promo-name').value = '';
  document.getElementById('edit-promo-discount').value = '10';
  document.getElementById('edit-promo-start').value = new Date().toISOString().substring(0, 10);
  document.getElementById('edit-promo-end').value = new Date(Date.now() + 30*24*60*60*1000).toISOString().substring(0, 10);

  document.getElementById('promotion-editor-modal')?.classList.add('active');
};

window.showEditPromotionModal = async function(id) {
  const promos = await ApiService.getKhuyenMais();
  const km = promos.find(k => k.id === id);
  if (!km) return;

  document.getElementById('promo-editor-title').innerHTML = `<i class="fas fa-edit"></i> Sửa Chương Trình Khuyến Mại`;
  document.getElementById('edit-promo-id').value = km.id;
  document.getElementById('edit-promo-code').value = km.ma;
  document.getElementById('edit-promo-name').value = km.tenKm;
  document.getElementById('edit-promo-discount').value = km.phanTramGiam;
  document.getElementById('edit-promo-start').value = km.ngayBatDau ? km.ngayBatDau.substring(0, 10) : '';
  document.getElementById('edit-promo-end').value = km.ngayKetThuc ? km.ngayKetThuc.substring(0, 10) : '';

  document.getElementById('promotion-editor-modal')?.classList.add('active');
};

window.savePromotionForm = async function(e) {
  e.preventDefault();

  const id = document.getElementById('edit-promo-id').value;
  const ma = document.getElementById('edit-promo-code').value.trim();
  const tenKm = document.getElementById('edit-promo-name').value.trim();
  const phanTramGiam = parseFloat(document.getElementById('edit-promo-discount').value);
  const ngayBatDau = document.getElementById('edit-promo-start').value;
  const ngayKetThuc = document.getElementById('edit-promo-end').value;

  const kmData = { ma, tenKm, phanTramGiam, ngayBatDau, ngayKetThuc };

  if (id) {
    await ApiService.updateKhuyenMai(parseInt(id), kmData);
    showToast('Đã cập nhật khuyến mại!', 'success');
  } else {
    await ApiService.createKhuyenMai(kmData);
    showToast('Đã thêm chương trình khuyến mại mới!', 'success');
  }

  document.getElementById('promotion-editor-modal')?.classList.remove('active');
  renderAdminPromotionsTab();
};

window.deletePromotion = async function(id) {
  if (confirm('Bạn có chắc chắn muốn xóa khuyến mại này?')) {
    await ApiService.deleteKhuyenMai(id);
    renderAdminPromotionsTab();
    showToast('Đã xóa khuyến mại!', 'info');
  }
};

// --- Tab 3: Order Processing ---
function renderAdminOrdersTab(orders) {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  content.innerHTML = `
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Mã HĐ</th>
            <th>Khách Hàng</th>
            <th>Số Điện Thoại</th>
            <th>Địa Chỉ</th>
            <th>Tổng Tiền</th>
            <th>Trạng Thái Hiện Tại</th>
            <th>Cập Nhật Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => `
            <tr>
              <td><strong>${o.ma || 'HD00' + o.id}</strong></td>
              <td>${o.tenNguoiNhan || o.tenKhachHang}</td>
              <td>${o.dienThoai}</td>
              <td>${o.diaChi}</td>
              <td style="color: var(--primary); font-weight: 700;">${formatVND(o.tongTien || 18990000)}</td>
              <td>${getOrderStatusBadge(o.trangThai)}</td>
              <td>
                <select class="form-input" style="padding: 0.3rem 0.5rem; font-size: 0.85rem;" onchange="updateOrderStatus(${o.id}, this.value)">
                  <option value="0" ${o.trangThai == 0 ? 'selected' : ''}>Chờ xác nhận</option>
                  <option value="1" ${o.trangThai == 1 ? 'selected' : ''}>Đã xác nhận</option>
                  <option value="2" ${o.trangThai == 2 ? 'selected' : ''}>Đang giao</option>
                  <option value="3" ${o.trangThai == 3 ? 'selected' : ''}>Hoàn thành</option>
                  <option value="4" ${o.trangThai == 4 ? 'selected' : ''}>Đã hủy</option>
                </select>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

window.updateOrderStatus = async function(orderId, statusVal) {
  const orders = await ApiService.getHoaDons();
  const order = orders.find(item => parseInt(item.id) === parseInt(orderId));
  await ApiService.updateHoaDonStatus(orderId, statusVal);
  if (order && ['1', '3'].includes(String(statusVal))) {
    const customerId = order.idKhachHang || order.khachHang?.id;
    const statusText = String(statusVal) === '1' ? 'đã được xác nhận' : 'đã hoàn thành';
    if (customerId) {
      addNotification(`user:${customerId}`, `Đơn hàng ${order.ma || `HD00${order.id}`} ${statusText}.`, 'fa-check-circle');
    }
  }
  showToast('Cập nhật trạng thái đơn hàng thành công!', 'success');
};

// --- Tab 4: Inventory & IMEI ---
async function renderAdminInventoryTab() {
  const content = document.getElementById('admin-tab-content');
  if (!content) return;

  const imeis = await ApiService.getImeis();

  content.innerHTML = `
    <h3>Danh sách Số IMEI / Serial Vật Lý</h3>
    <div class="data-table-wrap" style="margin-top: 1rem;">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Số IMEI / Serial</th>
            <th>ID Cấu Hình</th>
            <th>Trạng Thái Trong Kho</th>
            <th>Ngày Nhập Kho</th>
          </tr>
        </thead>
        <tbody>
          ${imeis.map(i => `
            <tr>
              <td>${i.id}</td>
              <td><strong style="color: var(--primary);">${i.soImei}</strong></td>
              <td>CTSP #${i.idChiTietSanPham}</td>
              <td>${i.trangThai === 0 ? '<span class="badge badge-success">Trong kho</span>' : '<span class="badge badge-warning">Đã xuất bán</span>'}</td>
              <td>${i.ngayNhap || '2026-09-19'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
