/* ==========================================================================
   LAPTOP STORE - CLIENT SCRIPT (app.js)
   Fetches products & specs from Spring Boot backend API
   Handles rendering, filters, image gallery, cart, and modals
   ========================================================================== */

const API_BASE_URL = 'http://localhost:8080/api';

// State management
let allProductDetails = [];
let allCategories = [];
let allBrands = [];
let cart = JSON.parse(localStorage.getItem('laptop_store_cart')) || [];
let currentFilterCategory = 'ALL';
let currentSectionsData = [];
let selectedBrandId = 'ALL';
let selectedPriceRange = 'ALL';
let selectedSortOrder = 'DEFAULT';

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
document.addEventListener('DOMContentLoaded', async () => {
  renderHeaderAuth();
  await initUserCart();
  fetchInitialData();
  setupEventListeners();
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
      discountLabel = `-${formatVND(giaTriGiam)}`;
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
  let spName = item.sanPham?.tenSp || 'Laptop';
  if (brand && spName.toLowerCase().startsWith(brand.toLowerCase())) {
    spName = spName.substring(brand.length).trim();
  }
  const cpu = item.cpu?.tenCpu ? item.cpu.tenCpu.replace('Intel ', '').replace('AMD ', '').trim() : '';
  const gpu = item.cardDoHoa?.tenCard ? item.cardDoHoa.tenCard.replace(/^NVIDIA GeForce /i, '').replace(/^NVIDIA /i, '').trim() : '';
  const ram = item.ram?.dungLuong ? item.ram.dungLuong : '';

  // Matching screenshot uppercase title format
  const brandPart = brand ? brand.toUpperCase() + ' ' : '';
  const cpuPart = cpu ? ` - ${cpu.toUpperCase()}` : '';
  const gpuPart = gpu ? ` - ${gpu.toUpperCase()}` : '';
  const ramPart = ram ? ` ${ram.toUpperCase()}` : '';
  return `LAPTOP ${brandPart}${spName.toUpperCase()}${cpuPart}${gpuPart}${ramPart}`.trim();
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

    // 3. Fetch brands (Thương hiệu)
    try {
      const brandResponse = await fetch(`${API_BASE_URL}/thuong-hieu`);
      if (brandResponse.ok) {
        allBrands = await brandResponse.json();
      }
    } catch (bErr) {
      console.warn('Cannot fetch /thuong-hieu, extracting from products:', bErr);
    }
    if (!allBrands || allBrands.length === 0) {
      const brandMap = new Map();
      allProductDetails.forEach(it => {
        const th = it.sanPham?.thuongHieu;
        if (th && th.id && !brandMap.has(th.id)) {
          brandMap.set(th.id, th);
        }
      });
      allBrands = Array.from(brandMap.values());
    }
    renderBrandFilterPills(allBrands);

    // 4. Fetch dynamic sections by category from backend
    try {
      const secResponse = await fetch(`${API_BASE_URL}/danh-muc/sections?limit=5`);
      if (secResponse.ok) {
        currentSectionsData = await secResponse.json();
      } else {
        currentSectionsData = buildSectionsFromAllProducts(allProductDetails, 5);
      }
    } catch (secErr) {
      console.warn('Cannot fetch /danh-muc/sections, building in memory:', secErr);
      currentSectionsData = buildSectionsFromAllProducts(allProductDetails, 5);
    }

  } catch (error) {
    console.warn('API error or server offline. Using enriched mock data:', error);
    allProductDetails = FALLBACK_PRODUCTS;

    // Fallback brands extraction
    const brandMap = new Map();
    allProductDetails.forEach(it => {
      const th = it.sanPham?.thuongHieu;
      if (th && th.id && !brandMap.has(th.id)) {
        brandMap.set(th.id, th);
      }
    });
    allBrands = Array.from(brandMap.values());
    renderBrandFilterPills(allBrands);

    currentSectionsData = buildSectionsFromAllProducts(allProductDetails, 5);
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="status-dot" style="background:#eab308; box-shadow:0 0 6px #eab308"></span> Dữ liệu mẫu (Backend Port 8080)`;
      statusBadge.style.background = 'rgba(234, 179, 8, 0.2)';
      statusBadge.style.color = '#fef08a';
    }
  }

  // Check URL query parameters (e.g. ?danhMucId=1)
  const urlParams = new URLSearchParams(window.location.search);
  const danhMucId = urlParams.get('danhMucId');
  if (danhMucId) {
    viewAllCategory(danhMucId, false);
  } else {
    renderDynamicSections(currentSectionsData);
  }
}

// Populate Category Dropdowns
function populateCategoryDropdowns(categories) {
  const categoryMenu = document.getElementById('categoryMenuPopup');
  const searchSelect = document.getElementById('searchCategorySelect');

  if (categoryMenu) {
    categoryMenu.innerHTML = categories.map(cat => `
      <a href="javascript:void(0)" class="category-menu-item" onclick="filterByCategory(${cat.id}, '${cat.tenDanhMuc}')">
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

// Build dynamic sections grouping strictly by sanPham.id_danh_muc
function buildSectionsFromAllProducts(items, limit = 5) {
  const catMap = new Map();

  // If categories are already loaded, preserve category ordering
  if (allCategories && allCategories.length > 0) {
    allCategories.forEach(cat => {
      catMap.set(cat.id, { danhMuc: cat, products: [] });
    });
  }

  items.forEach(it => {
    const cat = it.sanPham?.danhMuc;
    if (!cat || !cat.id) return;
    if (!catMap.has(cat.id)) {
      catMap.set(cat.id, { danhMuc: cat, products: [] });
    }
    catMap.get(cat.id).products.push(it);
  });

  const sections = [];
  catMap.forEach(({ danhMuc, products }) => {
    // Only render categories that have at least 1 product
    if (products.length > 0) {
      sections.push({
        danhMuc: danhMuc,
        chiTietSanPhams: products.slice(0, limit),
        totalProducts: products.length
      });
    }
  });
  return sections;
}

// Render dynamic sections on the home page (Number of sections = Number of non-empty categories)
function renderDynamicSections(sections) {
  const container = document.getElementById('dynamicProductSections');
  if (!container) return;

  if (!sections || sections.length === 0) {
    container.innerHTML = `
      <div class="empty-sections-msg">
        <p>Hiện chưa có sản phẩm nào được bày bán trong hệ thống.</p>
      </div>
    `;
    return;
  }

  // Cycle through modern gradient styles for section ribbons
  const gradientClasses = ['', 'blue-gradient', 'purple-gradient'];

  container.innerHTML = sections.map((sec, index) => {
    const cat = sec.danhMuc;
    const gradClass = gradientClasses[index % gradientClasses.length];
    const items = sec.chiTietSanPhams || [];
    const hasMore = (sec.totalProducts && sec.totalProducts > items.length) || items.length > 5;

    return `
      <section class="product-section" id="categorySection-${cat.id}">
        <div class="section-header-bar">
          <div class="section-banner-title ${gradClass}">
            ${cat.tenDanhMuc.toUpperCase()}
          </div>
          <a href="javascript:void(0)" class="view-all-link" onclick="viewAllCategory(${cat.id})" title="Xem tất cả sản phẩm của ${cat.tenDanhMuc}">
            Xem tất cả &gt;&gt;
          </a>
        </div>

        <div class="product-slider-wrapper">
          ${hasMore ? `
            <button class="section-nav-arrow prev" onclick="scrollSection('gridCategory-${cat.id}', -300)" title="Trước">❮</button>
          ` : ''}

          <div class="product-cards-grid" id="gridCategory-${cat.id}">
            ${items.map((item, idx) => createProductCardHTML(item, idx)).join('')}
          </div>

          ${hasMore ? `
            <button class="section-nav-arrow next" onclick="scrollSection('gridCategory-${cat.id}', 300)" title="Sau">❯</button>
          ` : ''}
        </div>
      </section>
    `;
  }).join('');
}

// "Xem tất cả >" mode: Displays all products strictly belonging to the chosen category
function viewAllCategory(danhMucId, pushState = true) {
  const catId = parseInt(danhMucId);
  const container = document.getElementById('dynamicProductSections');
  if (!container) return;

  // Find category metadata
  const cat = allCategories.find(c => c.id === catId) || 
              (allProductDetails.find(p => p.sanPham?.danhMuc?.id === catId)?.sanPham?.danhMuc);
  const catName = cat ? cat.tenDanhMuc : 'Danh mục sản phẩm';

  // Filter all products strictly belonging to this category
  const items = allProductDetails.filter(p => p.sanPham?.danhMuc?.id === catId);

  if (pushState) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('danhMucId', catId);
    window.history.pushState({ danhMucId: catId }, '', newUrl.toString());
  }

  container.innerHTML = `
    <section class="product-section view-all-section">
      <div class="section-header-bar">
        <div class="section-banner-title">
          ${catName.toUpperCase()} <span style="font-weight: 500; font-size: 0.9rem; margin-left: 8px;">(${items.length} sản phẩm)</span>
        </div>
        <button type="button" class="view-all-back-btn" onclick="backToAllSections()">
          <svg style="width:16px;height:16px;" fill="currentColor" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Quay lại trang chủ
        </button>
      </div>

      <div class="product-cards-grid view-all-grid">
        ${items.length > 0 
          ? items.map((item, idx) => createProductCardHTML(item, idx)).join('') 
          : '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-muted);">Hiện chưa có sản phẩm nào thuộc danh mục này.</div>'
        }
      </div>
    </section>
  `;

  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Return from "Xem tất cả" to home sections
function backToAllSections(pushState = true) {
  if (pushState) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('danhMucId');
    window.history.pushState({}, '', newUrl.toString());
  }
  renderDynamicSections(currentSectionsData);
  const container = document.getElementById('dynamicProductSections');
  if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Filter by category from dropdown or popup menu
function filterByCategory(categoryId, categoryName) {
  const catWrapper = document.querySelector('.category-btn-wrapper');
  if (catWrapper) catWrapper.classList.remove('active');

  const secEl = document.getElementById(`categorySection-${categoryId}`);
  if (secEl) {
    secEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`Đang xem danh mục: <strong>${categoryName}</strong>`);
  } else {
    viewAllCategory(categoryId);
  }
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
        <button class="btn-add-to-cart ${!inStock ? 'disabled' : ''}" ${!inStock ? 'disabled' : ''} onclick="${inStock ? `addToCart(${item.id})` : `event.stopPropagation(); showToast('Sản phẩm này hiện đã hết hàng!', 'error')`}" title="${inStock ? 'Thêm vào giỏ hàng' : 'Sản phẩm tạm thời hết hàng'}">
          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
          ${inStock ? 'THÊM VÀO GIỎ' : 'HẾT HÀNG'}
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

// ==========================================================================
// CUSTOMER FILTER LOGIC (Lọc Thương Hiệu, Mức Giá & Sắp Xếp)
// ==========================================================================

function renderBrandFilterPills(brands) {
  const container = document.getElementById('brandFilterList');
  if (!container) return;

  let html = `<button type="button" class="filter-pill-btn ${selectedBrandId === 'ALL' ? 'active' : ''}" data-brand="ALL" onclick="setBrandFilter('ALL')">Tất cả</button>`;

  if (brands && brands.length > 0) {
    brands.forEach(b => {
      const bId = b.id;
      const bName = b.tenThuongHieu || b.ten || 'Thương hiệu';
      const isActive = String(selectedBrandId) === String(bId) ? 'active' : '';
      html += `<button type="button" class="filter-pill-btn ${isActive}" data-brand="${bId}" onclick="setBrandFilter(${bId})">${bName}</button>`;
    });
  }

  container.innerHTML = html;
}

function matchPriceRange(price, rangeKey) {
  const p = Number(price) || 0;
  switch (rangeKey) {
    case 'under15':
      return p < 15000000;
    case '15to20':
      return p >= 15000000 && p <= 20000000;
    case '20to25':
      return p > 20000000 && p <= 25000000;
    case '25to30':
      return p > 25000000 && p <= 30000000;
    case 'above30':
      return p > 30000000;
    case 'ALL':
    default:
      return true;
  }
}

function setBrandFilter(brandId) {
  selectedBrandId = (brandId === 'ALL') ? 'ALL' : brandId;
  const list = document.getElementById('brandFilterList');
  if (list) {
    list.querySelectorAll('.filter-pill-btn').forEach(btn => {
      if (btn.getAttribute('data-brand') === String(brandId)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  applyCustomerFilters();
}

function setPriceFilter(rangeKey) {
  selectedPriceRange = rangeKey;
  const list = document.getElementById('priceFilterList');
  if (list) {
    list.querySelectorAll('.filter-pill-btn').forEach(btn => {
      if (btn.getAttribute('data-price') === rangeKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  applyCustomerFilters();
}

function setSortOrder(sortVal) {
  selectedSortOrder = sortVal;
  applyCustomerFilters();
}

function resetCustomerFilters() {
  selectedBrandId = 'ALL';
  selectedPriceRange = 'ALL';
  selectedSortOrder = 'DEFAULT';

  const brandList = document.getElementById('brandFilterList');
  if (brandList) {
    brandList.querySelectorAll('.filter-pill-btn').forEach(btn => {
      if (btn.getAttribute('data-brand') === 'ALL') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  const priceList = document.getElementById('priceFilterList');
  if (priceList) {
    priceList.querySelectorAll('.filter-pill-btn').forEach(btn => {
      if (btn.getAttribute('data-price') === 'ALL') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  const sortSelect = document.getElementById('filterSortSelect');
  if (sortSelect) sortSelect.value = 'DEFAULT';

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  const catSelect = document.getElementById('searchCategorySelect');
  if (catSelect) catSelect.value = 'ALL';

  applyCustomerFilters();
}

function applyCustomerFilters() {
  const container = document.getElementById('dynamicProductSections');
  if (!container) return;

  const searchInput = document.getElementById('searchInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const catSelect = document.getElementById('searchCategorySelect');
  const selectedCatId = catSelect ? catSelect.value : 'ALL';

  const hasBrandFilter = selectedBrandId !== 'ALL';
  const hasPriceFilter = selectedPriceRange !== 'ALL';
  const hasSort = selectedSortOrder !== 'DEFAULT';
  const hasSearch = !!query;
  const hasCatSelect = selectedCatId !== 'ALL';

  const isFiltering = hasBrandFilter || hasPriceFilter || hasSort || hasSearch || hasCatSelect;

  const statusEl = document.getElementById('filterStatusInfo');
  const resetBtn = document.getElementById('filterResetBtn');

  if (!isFiltering) {
    if (statusEl) {
      statusEl.innerHTML = `<span>Đang hiển thị tất cả sản phẩm theo danh mục</span>`;
    }
    if (resetBtn) {
      resetBtn.style.display = 'none';
    }
    // Check if ?danhMucId is present in URL
    const urlParams = new URLSearchParams(window.location.search);
    const danhMucId = urlParams.get('danhMucId');
    if (danhMucId) {
      viewAllCategory(danhMucId, false);
    } else {
      renderDynamicSections(currentSectionsData);
    }
    return;
  }

  // Show reset button
  if (resetBtn) {
    resetBtn.style.display = 'inline-flex';
  }

  // Filter items
  let filtered = allProductDetails.filter(item => {
    // 1. Filter by Brand
    if (hasBrandFilter) {
      const bId = item.sanPham?.thuongHieu?.id;
      if (String(bId) !== String(selectedBrandId)) return false;
    }

    // 2. Filter by Price Range
    if (hasPriceFilter) {
      const pricing = getPricingInfo(item);
      const currentPrice = pricing.giaBan ?? pricing.currentPrice ?? item.giaBan ?? item.gia ?? 0;
      if (!matchPriceRange(currentPrice, selectedPriceRange)) return false;
    }

    // 3. Filter by Category Dropdown (if selected in search bar)
    if (hasCatSelect) {
      if (item.sanPham?.danhMuc?.id != selectedCatId) return false;
    }

    // 4. Filter by Search Query
    if (hasSearch) {
      const spName = item.sanPham?.tenSp?.toLowerCase() || '';
      const maSp = item.sanPham?.maSp?.toLowerCase() || '';
      const maCtsp = item.maCtsp?.toLowerCase() || '';
      const cpu = item.cpu?.tenCpu?.toLowerCase() || '';
      const gpu = item.cardDoHoa?.tenCard?.toLowerCase() || '';
      const brand = item.sanPham?.thuongHieu?.tenThuongHieu?.toLowerCase() || '';
      const desc = item.moTa?.toLowerCase() || '';

      const matchQuery = spName.includes(query) || maSp.includes(query) || maCtsp.includes(query) ||
                         cpu.includes(query) || gpu.includes(query) || brand.includes(query) || desc.includes(query);
      if (!matchQuery) return false;
    }

    return true;
  });

  // Sort items
  if (selectedSortOrder === 'PRICE_ASC') {
    filtered.sort((a, b) => {
      const pA = getPricingInfo(a).giaBan;
      const pB = getPricingInfo(b).giaBan;
      return pA - pB;
    });
  } else if (selectedSortOrder === 'PRICE_DESC') {
    filtered.sort((a, b) => {
      const pA = getPricingInfo(a).giaBan;
      const pB = getPricingInfo(b).giaBan;
      return pB - pA;
    });
  }

  // Update status info text
  const criteriaBadges = [];
  if (hasBrandFilter) {
    const brandObj = allBrands.find(b => String(b.id) === String(selectedBrandId));
    const bName = brandObj ? (brandObj.tenThuongHieu || brandObj.ten) : `Thương hiệu #${selectedBrandId}`;
    criteriaBadges.push(`Hãng: <strong>${bName}</strong>`);
  }
  if (hasPriceFilter) {
    const priceLabels = {
      'under15': 'Dưới 15 triệu',
      '15to20': '15 - 20 triệu',
      '20to25': '20 - 25 triệu',
      '25to30': '25 - 30 triệu',
      'above30': 'Trên 30 triệu'
    };
    criteriaBadges.push(`Mức giá: <strong>${priceLabels[selectedPriceRange] || selectedPriceRange}</strong>`);
  }
  if (hasSort) {
    const sortLabels = {
      'PRICE_ASC': 'Giá tăng dần ↑',
      'PRICE_DESC': 'Giá giảm dần ↓'
    };
    criteriaBadges.push(`Sắp xếp: <strong>${sortLabels[selectedSortOrder]}</strong>`);
  }
  if (hasSearch) {
    criteriaBadges.push(`Từ khóa: <strong>"${query}"</strong>`);
  }
  if (hasCatSelect) {
    const catObj = allCategories.find(c => String(c.id) === String(selectedCatId));
    const cName = catObj ? catObj.tenDanhMuc : `Danh mục #${selectedCatId}`;
    criteriaBadges.push(`Danh mục: <strong>${cName}</strong>`);
  }

  if (statusEl) {
    statusEl.innerHTML = `
      <span>Tìm thấy <strong>${filtered.length}</strong> sản phẩm phù hợp (${criteriaBadges.join(', ')})</span>
    `;
  }

  // Render filtered product cards
  container.innerHTML = `
    <section class="product-section filter-results-section">
      <div class="section-header-bar">
        <div class="section-banner-title">
          KẾT QUẢ LỌC SẢN PHẨM <span style="font-weight: 500; font-size: 0.9rem; margin-left: 8px;">(${filtered.length} sản phẩm)</span>
        </div>
        <button type="button" class="view-all-back-btn" onclick="resetCustomerFilters()">
          <svg style="width:16px;height:16px;" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          Xóa bộ lọc &amp; Xem theo danh mục
        </button>
      </div>

      <div class="product-cards-grid view-all-grid">
        ${filtered.length > 0 
          ? filtered.map((item, idx) => createProductCardHTML(item, idx)).join('') 
          : `
            <div style="grid-column: 1/-1; padding: 50px 20px; text-align: center; color: var(--text-muted);">
              <div style="font-size: 2.2rem; margin-bottom: 12px;">🔍</div>
              <p style="font-size: 1.05rem; font-weight: 600; color: #475569; margin-bottom: 6px;">Không tìm thấy sản phẩm nào phù hợp!</p>
              <p style="font-size: 0.88rem; color: #94a3b8; margin-bottom: 18px;">Vui lòng thử chọn khoảng giá hoặc thương hiệu khác.</p>
              <button type="button" class="filter-reset-btn" onclick="resetCustomerFilters()" style="margin: 0 auto; padding: 7px 16px; font-size: 0.85rem;">
                ✕ Xóa bộ lọc hiện tại
              </button>
            </div>
          `
        }
      </div>
    </section>
  `;
}

// Search functionality
function handleSearch() {
  applyCustomerFilters();
}

// Window global bindings
window.renderBrandFilterPills = renderBrandFilterPills;
window.setBrandFilter = setBrandFilter;
window.setPriceFilter = setPriceFilter;
window.setSortOrder = setSortOrder;
window.resetCustomerFilters = resetCustomerFilters;
window.applyCustomerFilters = applyCustomerFilters;

// Handle browser back/forward navigation for ?danhMucId=
window.addEventListener('popstate', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const catId = urlParams.get('danhMucId');
  if (catId) {
    viewAllCategory(catId, false);
  } else {
    backToAllSections(false);
  }
});


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
  const inStockModal = (item.soLuong > 0 && item.trangThai === 1);
  if (addBtn) {
    if (!inStockModal) {
      addBtn.disabled = true;
      addBtn.classList.add('disabled');
      addBtn.textContent = 'TẠM HẾT HÀNG';
    } else {
      addBtn.disabled = false;
      addBtn.classList.remove('disabled');
      addBtn.textContent = 'THÊM VÀO GIỎ HÀNG';
      addBtn.onclick = () => {
        const qty = parseInt(document.getElementById('modalQtyInput').value || '1', 10);
        addToCart(item.id, qty);
        closeQuickView();
      };
    }
  }

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

// ==========================================================================
// CART MANAGEMENT (Database Cart khi đã đăng nhập, LocalStorage khi chưa)
// ==========================================================================

function getLoggedInCustomer() {
  const userStr = localStorage.getItem('laptop_store_user') || sessionStorage.getItem('laptop_store_user');
  try {
    const user = userStr ? JSON.parse(userStr) : null;
    return (user && user.id) ? user : null;
  } catch (e) {
    return null;
  }
}

async function initUserCart() {
  const user = getLoggedInCustomer();
  if (user) {
    try {
      const res = await fetch(`${API_BASE_URL}/gio-hang/khach-hang/${user.id}/items`);
      if (res.ok) {
        const dbItems = await res.json();
        cart = dbItems.map(it => {
          const ctsp = it.chiTietSanPham || {};
          const pricing = getPricingInfo(ctsp);
          const images = getProductImages(ctsp);
          return {
            id: ctsp.id,
            chiTietGioHangId: it.id,
            maCtsp: ctsp.maCtsp,
            title: getProductDisplayTitle(ctsp),
            price: it.giaTungSanPham != null ? Number(it.giaTungSanPham) : pricing.currentPrice,
            image: images[0],
            quantity: it.soLuong || 1,
            fromDb: true
          };
        });
      }
    } catch (err) {
      console.warn('Lỗi tải giỏ hàng từ Database:', err);
    }
  } else {
    cart = JSON.parse(localStorage.getItem('laptop_store_cart')) || [];
  }
  updateCartBadge();
}

async function addToCart(itemId, quantity = 1) {
  const item = allProductDetails.find(p => p.id === itemId);
  if (!item) return;

  if (!item.soLuong || item.soLuong <= 0 || item.trangThai !== 1) {
    showToast(`Sản phẩm <strong>${item.sanPham?.tenSp || ''}</strong> hiện đã hết hàng!`, 'error');
    return;
  }

  const user = getLoggedInCustomer();
  if (user) {
    // ĐÃ ĐĂNG NHẬP: Lưu trực tiếp vào Database
    try {
      const res = await fetch(`${API_BASE_URL}/gio-hang/khach-hang/${user.id}/add?ctspId=${itemId}&soLuong=${quantity}`, {
        method: 'POST'
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Không thể thêm sản phẩm vào giỏ hàng Database');
      }
      await initUserCart();
      renderCartDrawer();
      showToast(`Đã thêm <strong>${item.sanPham?.tenSp}</strong> vào giỏ hàng!`, 'success');
    } catch (err) {
      showToast(err.message || 'Lỗi thêm vào giỏ hàng', 'error');
    }
  } else {
    // CHƯA ĐĂNG NHẬP: Lưu vào localStorage
    const existing = cart.find(c => c.id === itemId);
    const currentQtyInCart = existing ? existing.quantity : 0;
    if (currentQtyInCart + quantity > item.soLuong) {
      showToast(`Kho chỉ còn <strong>${item.soLuong}</strong> máy khả dụng!`, 'error');
      return;
    }

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
        quantity: quantity,
        fromDb: false
      });
    }

    saveCart();
    updateCartBadge();
    showToast(`Đã thêm <strong>${item.sanPham?.tenSp}</strong> vào giỏ hàng!`, 'success');
  }
}

function saveCart() {
  const user = getLoggedInCustomer();
  if (!user) {
    localStorage.setItem('laptop_store_cart', JSON.stringify(cart));
  }
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

async function updateItemQuantity(itemId, delta) {
  const item = cart.find(c => c.id === itemId);
  if (!item) return;

  const user = getLoggedInCustomer();
  if (user && item.chiTietGioHangId) {
    // ĐÃ ĐĂNG NHẬP: Gọi API DB
    const newQty = item.quantity + delta;
    try {
      const res = await fetch(`${API_BASE_URL}/gio-hang/khach-hang/${user.id}/item/${item.chiTietGioHangId}/so-luong/${newQty}`, {
        method: 'PUT'
      });
      if (res.ok) {
        await initUserCart();
        renderCartDrawer();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Lỗi cập nhật số lượng', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối khi cập nhật giỏ hàng', 'error');
    }
  } else {
    // CHƯA ĐĂNG NHẬP: Cập nhật trong localStorage
    if (delta > 0) {
      const product = allProductDetails.find(p => p.id === itemId);
      if (product && product.soLuong !== undefined && item.quantity + delta > product.soLuong) {
        showToast(`Kho chỉ còn ${product.soLuong} sản phẩm khả dụng!`);
        return;
      }
    }
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(c => c.id !== itemId);
    }
    saveCart();
    updateCartBadge();
    renderCartDrawer();
  }
}

async function removeCartItem(itemId) {
  const item = cart.find(c => c.id === itemId);
  if (!item) return;

  const user = getLoggedInCustomer();
  if (user && item.chiTietGioHangId) {
    // ĐÃ ĐĂNG NHẬP: Gọi API xóa trong DB
    try {
      const res = await fetch(`${API_BASE_URL}/gio-hang/khach-hang/${user.id}/item/${item.chiTietGioHangId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await initUserCart();
        renderCartDrawer();
        showToast('Đã xóa sản phẩm khỏi giỏ hàng.');
      } else {
        showToast('Không thể xóa sản phẩm khỏi giỏ hàng DB', 'error');
      }
    } catch (e) {
      showToast('Lỗi xóa sản phẩm', 'error');
    }
  } else {
    // CHƯA ĐĂNG NHẬP: Xóa trong localStorage
    cart = cart.filter(c => c.id !== itemId);
    saveCart();
    updateCartBadge();
    renderCartDrawer();
    showToast('Đã xóa sản phẩm khỏi giỏ hàng.');
  }
}

// Xử lý chuyển sang trang thanh toán (Checkout)
function handleProceedToCheckout() {
  const user = getLoggedInCustomer();
  if (!user) {
    showToast('Vui lòng đăng nhập để tiến hành thanh toán!', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html?redirect=checkout.html';
    }, 800);
    return;
  }

  if (!cart || cart.length === 0) {
    showToast('Giỏ hàng của bạn đang trống!', 'warning');
    return;
  }

  window.location.href = 'checkout.html';
}
window.handleProceedToCheckout = handleProceedToCheckout;

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
      headerAuth.onclick = null;
      headerAuth.innerHTML = `
        <div class="user-dropdown-wrapper" id="userAvatarContainer" onclick="toggleUserDropdown(event)">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="action-icon-circle" style="background:#2563eb; color:#ffffff; border-color:#2563eb;">
              <svg style="width:20px; height:20px;" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div class="action-text">
              <span class="action-label" style="font-weight:700; color:#1e293b; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${user.ten || user.username}
              </span>
              <span class="action-value" style="font-size:0.75rem; color:#64748b; display:flex; align-items:center; gap:3px;">
                Tài khoản <span style="font-size:0.6rem;">▼</span>
              </span>
            </div>
          </div>

          <div class="user-dropdown-menu" id="userDropdownMenu">
            <div class="user-dropdown-header">
              <div class="user-dropdown-name">${user.ten || user.username}</div>
              <div class="user-dropdown-role">${roleName}</div>
            </div>
            <a class="user-dropdown-item" href="order-history.html" onclick="event.stopPropagation();">
              <svg style="width:16px; height:16px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Xem đơn hàng của tôi</span>
            </a>
            ${isStaffOrAdmin ? `
              <a class="user-dropdown-item" href="admin.html" onclick="event.stopPropagation();">
                <svg style="width:16px; height:16px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span>Quản trị / POS</span>
              </a>
            ` : ''}
            <div class="user-dropdown-divider"></div>
            <button type="button" class="user-dropdown-item logout-item" onclick="event.stopPropagation(); logoutUser();">
              <svg style="width:16px; height:16px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      `;
    }

    if (topbarAuth) {
      topbarAuth.innerHTML = `
        <span style="font-size:0.75rem; color:#cbd5e1;">Chào, <strong style="color:#fff;">${user.ten || user.username}</strong></span>
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
  localStorage.removeItem('laptop_store_cart'); // Theo nghiệp vụ: giỏ khách vãng lai sau logout bắt đầu trống, không xóa DB
  window.location.reload();
};

window.toggleUserDropdown = function(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('userDropdownMenu');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
};

window.addEventListener('click', function(e) {
  const dropdown = document.getElementById('userDropdownMenu');
  const container = document.getElementById('userAvatarContainer');
  if (dropdown && container && !container.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

