/* ==========================================================================
   LAPTOP STORE - CLIENT SCRIPT (app.js)
   Fetches products & specs from Spring Boot backend API
   Handles rendering, filters, image gallery, cart, and modals
   ========================================================================== */

const API_BASE_URL = 'http://localhost:8080/api';

// State management
let allProductDetails = [];
let allCategories = [];
let cart = JSON.parse(localStorage.getItem('laptop_store_cart')) || [];
let currentFilterCategory = 'ALL';

// Fallback data if backend is offline
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    maCtsp: "CTSP001",
    sanPham: {
      id: 1,
      maSp: "SP001",
      tenSp: "ASUS TUF Gaming A15",
      giaCoBan: 18990000.00,
      moTa: "Laptop gaming hiệu năng cao, phù hợp chơi game và học tập.",
      danhMuc: { id: 1, tenDanhMuc: "Laptop Gaming" },
      thuongHieu: { id: 1, tenThuongHieu: "ASUS" },
      danhSachHinhAnh: [
        { id: 6, urlHinhAnh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" },
        { id: 7, urlHinhAnh: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" },
        { id: 8, urlHinhAnh: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    mauSac: { id: 1, tenMau: "Đen Graphite" },
    cpu: { id: 4, tenCpu: "AMD Ryzen 5 7535HS" },
    ram: { id: 3, dungLuong: "16GB", loaiRam: "DDR5" },
    cardDoHoa: { id: 4, tenCard: "NVIDIA GeForce RTX 4050 6GB" },
    manHinh: { id: 3, kichThuoc: "15.6 inch", doPhanGiai: "1920x1080", tanSoQuet: "144Hz" },
    ocung: { id: 2, loaiOCung: "SSD NVMe", dungLuong: "512GB" },
    soLuong: 5,
    gia: 18990000.00,
    moTa: "Ryzen 5 7535HS / RAM 16GB / SSD 512GB / RTX 4050",
    trangThai: 1,
    danhSachHinhAnh: [
      { id: 6, urlHinhAnh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" },
      { id: 7, urlHinhAnh: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    id: 2,
    maCtsp: "CTSP002",
    sanPham: {
      id: 1,
      maSp: "SP001",
      tenSp: "ASUS TUF Gaming A15",
      giaCoBan: 18990000.00,
      moTa: "Laptop gaming hiệu năng cao, phiên bản Ryzen 7 và RTX 4060.",
      danhMuc: { id: 1, tenDanhMuc: "Laptop Gaming" },
      thuongHieu: { id: 1, tenThuongHieu: "ASUS" },
      danhSachHinhAnh: [
        { id: 11, urlHinhAnh: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80" },
        { id: 12, urlHinhAnh: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    mauSac: { id: 1, tenMau: "Đen Mecha" },
    cpu: { id: 5, tenCpu: "AMD Ryzen 7 8845HS" },
    ram: { id: 4, dungLuong: "32GB", loaiRam: "DDR5" },
    cardDoHoa: { id: 5, tenCard: "NVIDIA GeForce RTX 4060 8GB" },
    manHinh: { id: 3, kichThuoc: "15.6 inch", doPhanGiai: "1920x1080", tanSoQuet: "144Hz" },
    ocung: { id: 3, loaiOCung: "SSD NVMe", dungLuong: "1TB" },
    soLuong: 4,
    gia: 24990000.00,
    moTa: "Ryzen 7 8845HS / RAM 32GB / SSD 1TB / RTX 4060",
    trangThai: 1,
    danhSachHinhAnh: [
      { id: 11, urlHinhAnh: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80" },
      { id: 12, urlHinhAnh: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    id: 3,
    maCtsp: "CTSP003",
    sanPham: {
      id: 2,
      maSp: "SP002",
      tenSp: "ASUS Zenbook 14 OLED",
      giaCoBan: 22990000.00,
      moTa: "Laptop mỏng nhẹ với màn hình OLED 120Hz siêu nét, pin cực trâu.",
      danhMuc: { id: 4, tenDanhMuc: "Laptop Mỏng nhẹ" },
      thuongHieu: { id: 1, tenThuongHieu: "ASUS" },
      danhSachHinhAnh: [
        { id: 9, urlHinhAnh: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80" },
        { id: 10, urlHinhAnh: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    mauSac: { id: 2, tenMau: "Xám Bạc" },
    cpu: { id: 3, tenCpu: "Intel Core Ultra 5 125H" },
    ram: { id: 3, dungLuong: "16GB", loaiRam: "DDR5" },
    cardDoHoa: { id: 2, tenCard: "Intel Arc Graphics" },
    manHinh: { id: 2, kichThuoc: "14 inch", doPhanGiai: "2880x1800 OLED", tanSoQuet: "120Hz" },
    ocung: { id: 2, loaiOCung: "SSD NVMe", dungLuong: "512GB" },
    soLuong: 6,
    gia: 22990000.00,
    moTa: "Core Ultra 5 / RAM 16GB / SSD 512GB / Intel Arc OLED",
    trangThai: 1,
    danhSachHinhAnh: [
      { id: 9, urlHinhAnh: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80" },
      { id: 10, urlHinhAnh: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    id: 4,
    maCtsp: "CTSP004",
    sanPham: {
      id: 3,
      maSp: "SP003",
      tenSp: "Dell Inspiron 15",
      giaCoBan: 15990000.00,
      moTa: "Laptop văn phòng bền bỉ, màn hình 15.6 inch sắc nét.",
      danhMuc: { id: 2, tenDanhMuc: "Laptop Văn phòng" },
      thuongHieu: { id: 2, tenThuongHieu: "Dell" },
      danhSachHinhAnh: [
        { id: 12, urlHinhAnh: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" },
        { id: 13, urlHinhAnh: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    mauSac: { id: 3, tenMau: "Bạc Platinum" },
    cpu: { id: 1, tenCpu: "Intel Core i5-13420H" },
    ram: { id: 2, dungLuong: "16GB", loaiRam: "DDR4" },
    cardDoHoa: { id: 1, tenCard: "Intel Iris Xe Graphics" },
    manHinh: { id: 3, kichThuoc: "15.6 inch", doPhanGiai: "1920x1080", tanSoQuet: "120Hz" },
    ocung: { id: 2, loaiOCung: "SSD NVMe", dungLuong: "512GB" },
    soLuong: 3,
    gia: 15990000.00,
    moTa: "Core i5 / RAM 16GB / SSD 512GB / Intel Iris Xe",
    trangThai: 1,
    danhSachHinhAnh: [
      { id: 12, urlHinhAnh: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" },
      { id: 13, urlHinhAnh: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    id: 5,
    maCtsp: "CTSP005",
    sanPham: {
      id: 4,
      maSp: "SP004",
      tenSp: "Lenovo Legion 5",
      giaCoBan: 26990000.00,
      moTa: "Laptop gaming đỉnh cao màn 16 inch 165Hz chuẩn màu đồ họa.",
      danhMuc: { id: 1, tenDanhMuc: "Laptop Gaming" },
      thuongHieu: { id: 3, tenThuongHieu: "Lenovo" },
      danhSachHinhAnh: [
        { id: 15, urlHinhAnh: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80" },
        { id: 16, urlHinhAnh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    mauSac: { id: 2, tenMau: "Xám Storm" },
    cpu: { id: 2, tenCpu: "Intel Core i7-13620H" },
    ram: { id: 4, dungLuong: "32GB", loaiRam: "DDR5" },
    cardDoHoa: { id: 5, tenCard: "NVIDIA GeForce RTX 4060 8GB" },
    manHinh: { id: 4, kichThuoc: "16 inch", doPhanGiai: "2560x1600 2K", tanSoQuet: "165Hz" },
    ocung: { id: 3, loaiOCung: "SSD NVMe", dungLuong: "1TB" },
    soLuong: 4,
    gia: 28990000.00,
    moTa: "Core i7 / RAM 32GB / SSD 1TB / RTX 4060 8GB",
    trangThai: 1,
    danhSachHinhAnh: [
      { id: 15, urlHinhAnh: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80" },
      { id: 16, urlHinhAnh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  {
    id: 6,
    maCtsp: "CTSP006",
    sanPham: {
      id: 5,
      maSp: "SP005",
      tenSp: "Acer Nitro V 15",
      giaCoBan: 19990000.00,
      moTa: "Laptop gaming quốc dân cấu hình RTX 4050 tản nhiệt 2 quạt mát mẻ.",
      danhMuc: { id: 1, tenDanhMuc: "Laptop Gaming" },
      thuongHieu: { id: 4, tenThuongHieu: "Acer" },
      danhSachHinhAnh: [
        { id: 18, urlHinhAnh: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80" },
        { id: 19, urlHinhAnh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    mauSac: { id: 1, tenMau: "Đen Obsidian" },
    cpu: { id: 1, tenCpu: "Intel Core i5-13420H" },
    ram: { id: 3, dungLuong: "16GB", loaiRam: "DDR5" },
    cardDoHoa: { id: 4, tenCard: "NVIDIA GeForce RTX 4050 6GB" },
    manHinh: { id: 3, kichThuoc: "15.6 inch", doPhanGiai: "1920x1080", tanSoQuet: "144Hz" },
    ocung: { id: 2, loaiOCung: "SSD NVMe", dungLuong: "512GB" },
    soLuong: 5,
    gia: 19990000.00,
    moTa: "Core i5 / RAM 16GB / SSD 512GB / RTX 4050 6GB",
    trangThai: 1,
    danhSachHinhAnh: [
      { id: 18, urlHinhAnh: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80" },
      { id: 19, urlHinhAnh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" }
    ]
  }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  renderHeaderAuth();
  fetchInitialData();
  setupEventListeners();
  updateCartBadge();
});

// Format VND currency
function formatVND(amount) {
  if (!amount && amount !== 0) return '0 VNĐ';
  return Number(amount).toLocaleString('vi-VN') + ' VNĐ';
}

// Calculate real promotion pricing from backend
function getPricingInfo(item) {
  const giaGoc = Number(item.gia || item.sanPham?.giaCoBan || 0);
  const coKhuyenMai = Boolean(item.coKhuyenMai);
  const giaBan = (coKhuyenMai && item.giaBan !== undefined && item.giaBan !== null) 
    ? Number(item.giaBan) 
    : giaGoc;
  const loaiGiam = item.loaiGiam;
  const giaTriGiam = item.giaTriGiam ? Number(item.giaTriGiam) : 0;
  const tienGiam = item.tienGiam ? Number(item.tienGiam) : Math.max(0, giaGoc - giaBan);

  let discountLabel = '';
  if (coKhuyenMai) {
    if (loaiGiam === 1) {
      discountLabel = `-${giaTriGiam}%`;
    } else if (loaiGiam === 2) {
      discountLabel = `Giảm ${formatVND(giaTriGiam)}`;
    }
  }

  return {
    currentPrice: giaBan,
    oldPrice: giaGoc,
    giaGoc,
    giaBan,
    coKhuyenMai,
    loaiGiam,
    giaTriGiam,
    tienGiam,
    discountPercent: loaiGiam === 1 ? giaTriGiam : (giaGoc > 0 ? Math.round((tienGiam / giaGoc) * 100) : 0),
    discountLabel
  };
}

// Build rich product display title
function getProductDisplayTitle(item) {
  const brand = item.sanPham?.thuongHieu?.tenThuongHieu || '';
  const spName = item.sanPham?.tenSp || 'Laptop';
  const cpu = item.cpu?.tenCpu ? item.cpu.tenCpu.replace('Intel Core ', '').replace('AMD ', '') : '';
  const gpu = item.cardDoHoa?.tenCard ? item.cardDoHoa.tenCard.replace('NVIDIA GeForce ', '') : '';
  const ram = item.ram?.dungLuong ? item.ram.dungLuong : '';

  // Matching screenshot uppercase title format
  return `LAPTOP ${brand.toUpperCase()} ${spName.toUpperCase()} - ${cpu.toUpperCase()} - ${gpu.toUpperCase()} ${ram}`;
}

// Extract valid image list for product
function getProductImages(item) {
  let images = [];
  if (item.danhSachHinhAnh && item.danhSachHinhAnh.length > 0) {
    images = item.danhSachHinhAnh.map(img => img.urlHinhAnh);
  } else if (item.sanPham?.danhSachHinhAnh && item.sanPham.danhSachHinhAnh.length > 0) {
    images = item.sanPham.danhSachHinhAnh.map(img => img.urlHinhAnh);
  }
  
  if (images.length === 0) {
    images = [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
    ];
  }
  return images;
}

// Fetch data from backend
async function fetchInitialData() {
  const statusBadge = document.getElementById('backendStatusBadge');
  try {
    // 1. Fetch categories
    const catResponse = await fetch(`${API_BASE_URL}/danh-muc`);
    if (catResponse.ok) {
      allCategories = await catResponse.json();
      populateCategoryDropdowns(allCategories);
    }

    // 2. Fetch product details (Chi tiết sản phẩm)
    const ctspResponse = await fetch(`${API_BASE_URL}/chi-tiet-san-pham`);
    if (ctspResponse.ok) {
      const data = await ctspResponse.json();
      allProductDetails = (data && data.length > 0) ? data : FALLBACK_PRODUCTS;
      if (statusBadge) {
        statusBadge.innerHTML = `<span class="status-dot"></span> Backend API: Đã kết nối (${allProductDetails.length} sản phẩm)`;
      }
    } else {
      throw new Error('Không thể tải dữ liệu chi tiết sản phẩm');
    }
  } catch (error) {
    console.warn('API error or server offline. Using enriched mock data:', error);
    allProductDetails = FALLBACK_PRODUCTS;
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="status-dot" style="background:#eab308; box-shadow:0 0 6px #eab308"></span> Dữ liệu mẫu (Backend Port 8080)`;
      statusBadge.style.background = 'rgba(234, 179, 8, 0.2)';
      statusBadge.style.color = '#fef08a';
    }
  }

  // Render product sections
  renderAllSections(allProductDetails);
}

// Populate Category Dropdowns
function populateCategoryDropdowns(categories) {
  const categoryMenu = document.getElementById('categoryMenuPopup');
  const searchSelect = document.getElementById('searchCategorySelect');

  if (categoryMenu) {
    categoryMenu.innerHTML = categories.map(cat => `
      <a href="javascript:void(0)" class="category-menu-item" onclick="filterByCategory('${cat.tenDanhMuc}')">
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
        ${cat.tenDanhMuc}
      </a>
    `).join('');
  }

  if (searchSelect) {
    searchSelect.innerHTML = `<option value="ALL">Tất cả danh mục</option>` + 
      categories.map(cat => `<option value="${cat.id}">${cat.tenDanhMuc}</option>`).join('');
  }
}

// Filter by category from dropdown or popup menu
function filterByCategory(categoryName) {
  const normCat = categoryName.toLowerCase();
  let targetSection = null;

  if (normCat.includes('gaming')) {
    targetSection = document.getElementById('gamingSection');
  } else if (normCat.includes('đồ họa') || normCat.includes('kỹ thuật')) {
    targetSection = document.getElementById('workstationSection');
  } else if (normCat.includes('văn phòng') || normCat.includes('mỏng nhẹ')) {
    targetSection = document.getElementById('officeSection');
  }

  if (targetSection) {
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`Đang xem danh mục: <strong>${categoryName}</strong>`);
  } else {
    const filtered = allProductDetails.filter(it => 
      (it.sanPham?.danhMuc?.tenDanhMuc || '').toLowerCase().includes(normCat)
    );
    renderSection('sectionGamingCards', filtered);
    const banner = document.querySelector('#gamingSection .section-banner-title');
    if (banner) banner.textContent = categoryName.toUpperCase();
    document.getElementById('gamingSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`Đã lọc: <strong>${filtered.length} sản phẩm</strong> thuộc ${categoryName}`);
  }

  const catWrapper = document.querySelector('.category-btn-wrapper');
  if (catWrapper) catWrapper.classList.remove('active');
}

// Render All Sections
function renderAllSections(items) {
  renderSection('sectionGamingCards', filterByGroup(items, 'gaming'));
  renderSection('sectionWorkstationCards', filterByGroup(items, 'workstation'));
  renderSection('sectionOfficeCards', filterByGroup(items, 'office'));
}

// Filter items by section group
function filterByGroup(items, group) {
  if (group === 'gaming') {
    return items.filter(it => {
      const dm = it.sanPham?.danhMuc?.tenDanhMuc?.toLowerCase() || '';
      const name = it.sanPham?.tenSp?.toLowerCase() || '';
      return dm.includes('gaming') || name.includes('tuf') || name.includes('nitro') || name.includes('legion');
    });
  } else if (group === 'workstation') {
    return items.filter(it => {
      const dm = it.sanPham?.danhMuc?.tenDanhMuc?.toLowerCase() || '';
      const ram = it.ram?.dungLuong || '';
      const gpu = it.cardDoHoa?.tenCard?.toLowerCase() || '';
      return dm.includes('đồ họa') || gpu.includes('rtx 4060') || ram.includes('32gb');
    });
  } else if (group === 'office') {
    return items.filter(it => {
      const dm = it.sanPham?.danhMuc?.tenDanhMuc?.toLowerCase() || '';
      const name = it.sanPham?.tenSp?.toLowerCase() || '';
      return dm.includes('văn phòng') || dm.includes('mỏng nhẹ') || name.includes('zenbook') || name.includes('inspiron');
    });
  }
  return items;
}

// Render product cards inside a specific section container
function renderSection(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; padding: 30px; text-align:center; color: var(--text-muted)">Không có sản phẩm nào phù hợp.</div>`;
    return;
  }

  container.innerHTML = items.map((item, index) => createProductCardHTML(item, index)).join('');
}

// Generate Product Card HTML (Exact replica of user's image)
function createProductCardHTML(item, index) {
  const title = getProductDisplayTitle(item);
  const pricing = getPricingInfo(item);
  const images = getProductImages(item);
  const currentImg = images[0] || '';
  const inStock = (item.soLuong > 0 && item.trangThai === 1);

  // Specifications
  const cpuText = item.cpu?.tenCpu ? item.cpu.tenCpu.replace('Intel Core ', '').replace('AMD ', '') : '';
  const ramText = item.ram?.dungLuong || '';
  const gpuText = item.cardDoHoa?.tenCard ? item.cardDoHoa.tenCard.replace('NVIDIA GeForce ', '') : '';
  const screenText = item.manHinh?.kichThuoc || '';

  // Serialized json string for modal
  const itemJson = encodeURIComponent(JSON.stringify(item));

  return `
    <div class="product-card" id="productCard-${item.id}">
      <!-- Image box with micro navigation and promo banner -->
      <div class="product-image-box" onclick="window.location.href='chi-tiet-san-pham.html?id=${item.id}'" style="cursor: pointer;">
        <img src="${currentImg}" alt="${item.sanPham?.tenSp}" class="product-img" id="img-${item.id}" data-current-index="0">
        
        <!-- Image arrows -->
        ${images.length > 1 ? `
          <div class="img-nav-arrow prev" onclick="event.stopPropagation(); changeCardImage(${item.id}, -1)">❮</div>
          <div class="img-nav-arrow next" onclick="event.stopPropagation(); changeCardImage(${item.id}, 1)">❯</div>
        ` : ''}

        <!-- Promotional Strip (Matching Screenshot) -->
        <div class="card-promo-strip">
          🧧 ĐÓN ÁNH TRĂNG VÀNG - MUA LAPTOP RƯỚC QUÀ SANG
        </div>
      </div>

      <!-- Title (2 lines clamp) -->
      <a href="chi-tiet-san-pham.html?id=${item.id}" class="product-title" title="${title}">
        ${title}
      </a>

      <!-- Quick specs tags -->
      <div class="product-quick-specs">
        ${cpuText ? `<span class="spec-badge">${cpuText}</span>` : ''}
        ${ramText ? `<span class="spec-badge">${ramText}</span>` : ''}
        ${gpuText ? `<span class="spec-badge">${gpuText}</span>` : ''}
        ${screenText ? `<span class="spec-badge">${screenText}</span>` : ''}
      </div>

      <!-- Price & Discount -->
      <div class="product-price-row">
        <span class="current-price">${formatVND(pricing.giaBan)}</span>
        ${pricing.coKhuyenMai ? `<span class="discount-badge">${pricing.discountLabel}</span>` : ''}
      </div>
      <div class="old-price-row">
        ${pricing.coKhuyenMai ? `<span class="old-price">${formatVND(pricing.giaGoc)}</span>` : '<span class="old-price" style="visibility:hidden; height:18px;">0</span>'}
      </div>

      <!-- Bottom actions: Add to Cart button & Stock status -->
      <div class="product-card-actions">
        <button class="btn-add-to-cart" onclick="addToCart(${item.id})">
          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
          THÊM VÀO GIỎ
        </button>
        <span class="stock-status-badge ${inStock ? 'in-stock' : 'out-stock'}">
          ${inStock ? 'Còn hàng' : 'Hết hàng'}
        </span>
      </div>
    </div>
  `;
}

// Micro image carousel inside card
function changeCardImage(itemId, direction) {
  const item = allProductDetails.find(p => p.id === itemId);
  if (!item) return;
  const images = getProductImages(item);
  if (images.length <= 1) return;

  const imgEl = document.getElementById(`img-${itemId}`);
  if (!imgEl) return;

  let currentIndex = parseInt(imgEl.getAttribute('data-current-index') || '0', 10);
  currentIndex = (currentIndex + direction + images.length) % images.length;
  imgEl.src = images[currentIndex];
  imgEl.setAttribute('data-current-index', currentIndex);
}

// Sub-filters for section tabs (e.g. "PC GAMING GIÁ RẺ", "PC Core Ultra", etc.)
function applySubFilter(sectionGroup, filterType, btnElement) {
  // Update active pill styling
  const parent = btnElement.parentElement;
  if (parent) {
    parent.querySelectorAll('.filter-tag-pill').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
  }

  let items = filterByGroup(allProductDetails, sectionGroup);

  if (filterType === 'GIA_RE') {
    items = items.filter(it => it.gia <= 20000000);
  } else if (filterType === 'CAO_CAP') {
    items = items.filter(it => it.gia > 20000000);
  } else if (filterType === 'CORE_ULTRA') {
    items = items.filter(it => (it.cpu?.tenCpu?.toLowerCase() || '').includes('ultra') || (it.cpu?.tenCpu?.toLowerCase() || '').includes('ryzen 7'));
  } else if (filterType === 'RTX_4060') {
    items = items.filter(it => (it.cardDoHoa?.tenCard?.toLowerCase() || '').includes('4060'));
  }

  if (sectionGroup === 'gaming') {
    renderSection('sectionGamingCards', items);
  } else if (sectionGroup === 'workstation') {
    renderSection('sectionWorkstationCards', items);
  } else if (sectionGroup === 'office') {
    renderSection('sectionOfficeCards', items);
  }
}

// Search functionality
function handleSearch() {
  const searchInput = document.getElementById('searchInput');
  const catSelect = document.getElementById('searchCategorySelect');
  if (!searchInput) return;

  const query = searchInput.value.trim().toLowerCase();
  const selectedCatId = catSelect ? catSelect.value : 'ALL';

  let filtered = allProductDetails;

  // Filter by category if selected
  if (selectedCatId !== 'ALL') {
    filtered = filtered.filter(it => it.sanPham?.danhMuc?.id == selectedCatId);
  }

  // Filter by keyword
  if (query) {
    filtered = filtered.filter(it => {
      const spName = it.sanPham?.tenSp?.toLowerCase() || '';
      const maSp = it.sanPham?.maSp?.toLowerCase() || '';
      const maCtsp = it.maCtsp?.toLowerCase() || '';
      const cpu = it.cpu?.tenCpu?.toLowerCase() || '';
      const gpu = it.cardDoHoa?.tenCard?.toLowerCase() || '';
      const brand = it.sanPham?.thuongHieu?.tenThuongHieu?.toLowerCase() || '';
      const desc = it.moTa?.toLowerCase() || '';

      return spName.includes(query) || maSp.includes(query) || maCtsp.includes(query) ||
             cpu.includes(query) || gpu.includes(query) || brand.includes(query) || desc.includes(query);
    });
  }

  // Scroll to gaming section and display results there
  const mainSec = document.getElementById('sectionGamingCards');
  if (mainSec) {
    const banner = document.querySelector('#gamingSection .section-banner-title');
    if (banner) banner.textContent = `KẾT QUẢ TÌM KIẾM (${filtered.length})`;
    renderSection('sectionGamingCards', filtered);
    mainSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Quick View Modal
function openProductQuickView(itemJson) {
  const item = JSON.parse(decodeURIComponent(itemJson));
  const modal = document.getElementById('productQuickViewModal');
  if (!modal) return;

  const images = getProductImages(item);
  const pricing = getPricingInfo(item);
  const title = getProductDisplayTitle(item);

  // Set modal content
  document.getElementById('modalMainImage').src = images[0] || '';
  document.getElementById('modalProductTitle').textContent = title;
  document.getElementById('modalMaSp').textContent = item.maCtsp || item.sanPham?.maSp;
  document.getElementById('modalBrand').textContent = item.sanPham?.thuongHieu?.tenThuongHieu || 'Chính hãng';
  document.getElementById('modalCategory').textContent = item.sanPham?.danhMuc?.tenDanhMuc || 'Laptop';
  document.getElementById('modalCurrentPrice').textContent = formatVND(pricing.currentPrice);
  document.getElementById('modalOldPrice').textContent = formatVND(pricing.oldPrice);
  document.getElementById('modalDiscountBadge').textContent = `-${pricing.discountPercent}%`;

  // Specs Table
  document.getElementById('modalCpu').textContent = item.cpu?.tenCpu || 'Đang cập nhật';
  document.getElementById('modalRam').textContent = `${item.ram?.dungLuong || ''} ${item.ram?.loaiRam || ''}`;
  document.getElementById('modalStorage').textContent = `${item.ocung?.loaiOCung || ''} ${item.ocung?.dungLuong || ''}`;
  document.getElementById('modalGpu').textContent = item.cardDoHoa?.tenCard || 'Đang cập nhật';
  document.getElementById('modalScreen').textContent = `${item.manHinh?.kichThuoc || ''} ${item.manHinh?.doPhanGiai || ''} ${item.manHinh?.tanSoQuet || ''}`;
  document.getElementById('modalColor').textContent = item.mauSac?.tenMau || 'Tiêu chuẩn';
  document.getElementById('modalStock').textContent = `${item.soLuong || 0} máy sẵn có tại kho`;

  // Thumbnails
  const thumbsContainer = document.getElementById('modalGalleryThumbs');
  thumbsContainer.innerHTML = images.map((img, idx) => `
    <img src="${img}" class="modal-thumb ${idx === 0 ? 'active' : ''}" onclick="setModalMainImage('${img}', this)">
  `).join('');

  // Add to cart button inside modal
  const addBtn = document.getElementById('modalAddToCartBtn');
  addBtn.onclick = () => {
    const qty = parseInt(document.getElementById('modalQtyInput').value || '1', 10);
    addToCart(item.id, qty);
    closeQuickView();
  };

  modal.classList.add('active');
}

function setModalMainImage(src, thumbEl) {
  document.getElementById('modalMainImage').src = src;
  document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
}

function closeQuickView() {
  const modal = document.getElementById('productQuickViewModal');
  if (modal) modal.classList.remove('active');
}

// Cart Drawer & Management
function addToCart(itemId, quantity = 1) {
  const item = allProductDetails.find(p => p.id === itemId);
  if (!item) return;

  const existing = cart.find(c => c.id === itemId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    const pricing = getPricingInfo(item);
    const images = getProductImages(item);
    cart.push({
      id: item.id,
      maCtsp: item.maCtsp,
      title: getProductDisplayTitle(item),
      price: pricing.currentPrice,
      image: images[0],
      quantity: quantity
    });
  }

  saveCart();
  updateCartBadge();
  showToast(`Đã thêm <strong>${item.sanPham?.tenSp}</strong> vào giỏ hàng!`, 'success');
}

function saveCart() {
  localStorage.setItem('laptop_store_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cartCountBadge');
  if (badge) badge.textContent = totalCount;
}

function openCartDrawer() {
  renderCartDrawer();
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartDrawerOverlay');
  if (drawer && overlay) {
    drawer.classList.add('active');
    overlay.classList.add('active');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartDrawerOverlay');
  if (drawer && overlay) {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
  }
}

function renderCartDrawer() {
  const container = document.getElementById('cartDrawerItems');
  const totalAmountEl = document.getElementById('cartTotalAmount');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-muted)">
        <svg style="width: 48px; height: 48px; color: #cbd5e1; margin-bottom: 12px" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
        <p>Giỏ hàng của bạn đang trống</p>
      </div>
    `;
    if (totalAmountEl) totalAmountEl.textContent = '0 VNĐ';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${formatVND(item.price)}</div>
          <div class="cart-item-qty">
            <button class="cart-qty-btn" onclick="updateItemQuantity(${item.id}, -1)">-</button>
            <span style="font-size: 0.85rem; font-weight: 700; padding: 0 4px">${item.quantity}</span>
            <button class="cart-qty-btn" onclick="updateItemQuantity(${item.id}, 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeCartItem(${item.id})">
          <svg style="width: 18px; height: 18px;" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
    `;
  }).join('');

  if (totalAmountEl) totalAmountEl.textContent = formatVND(total);
}

function updateItemQuantity(itemId, delta) {
  const item = cart.find(c => c.id === itemId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(c => c.id !== itemId);
  }
  saveCart();
  updateCartBadge();
  renderCartDrawer();
}

function removeCartItem(itemId) {
  cart = cart.filter(c => c.id !== itemId);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
  showToast('Đã xóa sản phẩm khỏi giỏ hàng.');
}

// Toast notification
function showToast(message, type = 'default') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg style="width: 18px; height: 18px; color: ${type === 'success' ? '#22c55e' : '#ff4747'}" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Event Listeners
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  }

  // Close modals when clicking overlay
  const quickModal = document.getElementById('productQuickViewModal');
  if (quickModal) {
    quickModal.addEventListener('click', (e) => {
      if (e.target === quickModal) closeQuickView();
    });
  }

  // Toggle Category menu on mobile/click
  const catBtn = document.getElementById('categoryDropdownBtn');
  const catWrapper = document.querySelector('.category-btn-wrapper');
  if (catBtn && catWrapper) {
    catBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      catWrapper.classList.toggle('active');
    });
    document.addEventListener('click', () => catWrapper.classList.remove('active'));
  }
}

// ============================================================================
// AUTHENTICATION & SESSION UI INTEGRATION
// ============================================================================
function renderHeaderAuth() {
  const userStr = localStorage.getItem('laptop_store_user') || sessionStorage.getItem('laptop_store_user');
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch(e) {}

  const headerAuth = document.getElementById('headerAuthAction');
  const topbarAuth = document.getElementById('topbarAuthSlot');

  if (user && user.id) {
    const roleName = user.vaiTro?.tenVaiTro || (user.roleCode === 'ADMIN' ? 'Quản trị viên' : (user.roleCode === 'NHAN_VIEN' ? 'Nhân viên' : 'Khách hàng'));
    const isStaffOrAdmin = user.roleCode === 'ADMIN' || user.roleCode === 'NHAN_VIEN';

    if (headerAuth) {
      headerAuth.innerHTML = `
        <div class="action-icon-circle" style="background:#2563eb; color:#ffffff;">
          <svg style="width:18px; height:18px;" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div class="action-text">
          <span class="action-label" style="font-weight:700; color:#1e293b; max-width:115px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            ${user.ten || user.username}
          </span>
          <span class="action-value" style="color:#ef4444; font-size:11px; cursor:pointer;" onclick="event.stopPropagation(); logoutUser();" title="Đăng xuất khỏi tài khoản">
            Đăng xuất ⎋
          </span>
        </div>
      `;
      headerAuth.onclick = () => {
        if (isStaffOrAdmin) {
          window.location.href = 'admin.html';
        }
      };
    }

    if (topbarAuth) {
      topbarAuth.innerHTML = `
        <span style="font-size:0.75rem; color:#cbd5e1;">Chào, <strong style="color:#fff;">${user.ten || user.username}</strong> (${roleName})</span>
        ${isStaffOrAdmin ? `
          <a href="admin.html" style="color: #ffffff; background: #dc2626; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
            ⚙️ Quản Trị / POS
          </a>
        ` : ''}
        <button onclick="logoutUser()" type="button" style="background:rgba(255,255,255,0.15); border:none; color:#fff; padding:3px 8px; border-radius:4px; font-size:0.75rem; cursor:pointer;">
          Đăng xuất
        </button>
      `;
    }
  } else {
    if (headerAuth) {
      headerAuth.innerHTML = `
        <div class="action-icon-circle">
          <svg style="width:18px; height:18px;" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div class="action-text">
          <span class="action-label">Tài khoản</span>
          <span class="action-value">Đăng nhập</span>
        </div>
      `;
      headerAuth.onclick = () => window.location.href = 'login.html';
    }

    if (topbarAuth) {
      topbarAuth.innerHTML = `
        <a href="login.html" style="color: #ffffff; background: #2563eb; padding: 4px 12px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
          🔑 Đăng Nhập / Đăng Ký
        </a>
      `;
    }
  }
}

window.logoutUser = function() {
  localStorage.removeItem('laptop_store_user');
  sessionStorage.removeItem('laptop_store_user');
  window.location.reload();
};
