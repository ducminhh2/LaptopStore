/* ==========================================================================
   LAPTOP STORE - PRODUCT DETAIL SCRIPT (detail.js)
   Loads CTSP details from API and handles interactive gallery, cart & actions
   ========================================================================== */

const API_BASE_URL = 'http://localhost:8080/api';

let currentProduct = null;
let currentImageIndex = 0;
let productImages = [];
let cart = JSON.parse(localStorage.getItem('laptop_store_cart')) || [];

// Fallback data in case server is restarted
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
      { id: 7, urlHinhAnh: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" },
      { id: 8, urlHinhAnh: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80" }
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
  }
];

document.addEventListener('DOMContentLoaded', () => {
  loadProductDetail();
  updateCartBadge();
  setupEventListeners();
});

// Format VND currency
function formatVND(amount) {
  if (!amount && amount !== 0) return '0 đ';
  return Number(amount).toLocaleString('vi-VN') + ' đ';
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
    savedAmount: tienGiam,
    discountPercent: loaiGiam === 1 ? giaTriGiam : (giaGoc > 0 ? Math.round((tienGiam / giaGoc) * 100) : 0),
    discountLabel
  };
}

// Extract valid image list
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
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'
    ];
  }
  return images;
}

// Load and render product detail
async function loadProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id') || urlParams.get('ctspId') || '1', 10);

  try {
    const response = await fetch(`${API_BASE_URL}/chi-tiet-san-pham/${productId}`);
    if (response.ok) {
      currentProduct = await response.json();
    } else {
      throw new Error('Không thể tải từ API');
    }
  } catch (error) {
    console.warn('API error, using fallback product:', error);
    currentProduct = FALLBACK_PRODUCTS.find(p => p.id === productId) || FALLBACK_PRODUCTS[0];
  }

  renderProductDetails(currentProduct);
}

function renderProductDetails(item) {
  if (!item) return;

  const brand = item.sanPham?.thuongHieu?.tenThuongHieu || '';
  let spName = item.sanPham?.tenSp || 'Laptop';
  if (brand && spName.toLowerCase().startsWith(brand.toLowerCase())) {
    spName = spName.substring(brand.length).trim();
  }
  const cpu = item.cpu?.tenCpu ? item.cpu.tenCpu.replace('Intel Core ', '').replace('AMD ', '') : '';
  const gpu = item.cardDoHoa?.tenCard ? item.cardDoHoa.tenCard.replace('NVIDIA GeForce ', '') : '';
  const ram = item.ram?.dungLuong ? item.ram.dungLuong : '';
  const categoryName = item.sanPham?.danhMuc?.tenDanhMuc || 'Laptop';

  // Title matching screenshot: LAPTOP ... (Cấu hình chính hãng)
  const fullTitle = `LAPTOP ${brand.toUpperCase()} ${spName.toUpperCase()} - ${cpu.toUpperCase()} - ${gpu.toUpperCase()} ${ram} (Cấu hình chính hãng)`;

  // Update Breadcrumbs
  document.getElementById('breadcrumbCategory').textContent = categoryName;
  document.getElementById('breadcrumbProduct').textContent = fullTitle;
  document.title = `${fullTitle} - Laptop Store`;

  // Update Title
  document.getElementById('detailTitle').textContent = fullTitle;

  // Update Pricing with real promotion info
  const pricing = getPricingInfo(item);
  const curPriceEl = document.getElementById('detailCurrentPrice');
  const oldPriceEl = document.getElementById('detailOldPrice');
  const saveAmountEl = document.getElementById('detailSaveAmount');

  if (curPriceEl) curPriceEl.textContent = formatVND(pricing.giaBan);

  if (pricing.coKhuyenMai) {
    if (oldPriceEl) {
      oldPriceEl.style.display = 'inline-block';
      oldPriceEl.textContent = formatVND(pricing.giaGoc);
    }
    if (saveAmountEl) {
      saveAmountEl.style.display = 'inline-block';
      saveAmountEl.textContent = `Tiết kiệm: ${formatVND(pricing.tienGiam)} (${pricing.discountLabel})`;
    }
  } else {
    if (oldPriceEl) oldPriceEl.style.display = 'none';
    if (saveAmountEl) saveAmountEl.style.display = 'none';
  }

  // Render variant configurations for this product
  renderProductVariants(item);

  // Update Gallery
  productImages = getProductImages(item);
  currentImageIndex = 0;
  updateMainImage();
  renderThumbnails();

  // Update Specifications list (Checkmarks)
  const specsListEl = document.getElementById('detailSpecsList');
  if (specsListEl) {
    specsListEl.innerHTML = `
      <li>
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        <span><strong>Bộ vi xử lý:</strong> ${item.cpu?.tenCpu || 'Đang cập nhật'}</span>
      </li>
      <li>
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        <span><strong>Bộ nhớ RAM:</strong> ${item.ram?.dungLuong || ''} ${item.ram?.loaiRam || ''} Bus cao đa nhiệm mượt</span>
      </li>
      <li>
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        <span><strong>Ổ cứng lưu trữ:</strong> ${item.ocung?.loaiOCung || ''} ${item.ocung?.dungLuong || ''} chuẩn PCIe tốc độ đọc ghi cực nhanh</span>
      </li>
      <li>
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        <span><strong>Card màn hình:</strong> ${item.cardDoHoa?.tenCard || 'Đang cập nhật'}</span>
      </li>
      <li>
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        <span><strong>Màn hình:</strong> ${item.manHinh?.kichThuoc || ''} độ phân giải ${item.manHinh?.doPhanGiai || ''}, tần số quét ${item.manHinh?.tanSoQuet || 'Chuẩn'}</span>
      </li>
      <li>
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        <span><strong>Màu sắc &amp; Thiết kế:</strong> ${item.mauSac?.tenMau || 'Tiêu chuẩn'} - Thiết kế tản nhiệt kép tối ưu</span>
      </li>
      <li>
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        <span><strong>Tình trạng:</strong> Hàng mới 100% nguyên seal - Sẵn hàng tại kho (${item.soLuong || 1} máy)</span>
      </li>
    `;
  }

  // Load SẢN PHẨM TƯƠNG TỰ
  loadSimilarProducts(item);
}

let allVariantsOfProduct = [];

// Render CTSP variants selector with promotional prices
async function renderProductVariants(currentItem) {
  const container = document.getElementById('detailVariantsContainer');
  if (!container) return;

  const spId = currentItem.sanPham?.id;
  if (!spId) {
    container.innerHTML = '';
    return;
  }

  if (!allVariantsOfProduct || allVariantsOfProduct.length === 0 || allVariantsOfProduct[0].sanPham?.id !== spId) {
    try {
      const res = await fetch(`${API_BASE_URL}/chi-tiet-san-pham/san-pham/${spId}`);
      if (res.ok) {
        allVariantsOfProduct = await res.json();
      } else {
        allVariantsOfProduct = [currentItem];
      }
    } catch (err) {
      console.warn('Cannot fetch variants, using currentItem', err);
      allVariantsOfProduct = [currentItem];
    }
  }

  if (!allVariantsOfProduct || allVariantsOfProduct.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="detail-variants-wrapper">
      <div class="detail-variants-header">
        <span class="detail-variants-title">Chọn cấu hình phiên bản</span>
        <span class="detail-variants-count">${allVariantsOfProduct.length} cấu hình có sẵn</span>
      </div>
      <div class="detail-variants-grid">
        ${allVariantsOfProduct.map(variant => {
          const isActive = variant.id === currentItem.id;
          const pricing = getPricingInfo(variant);
          const cpu = variant.cpu?.tenCpu ? variant.cpu.tenCpu.replace('Intel Core ', '').replace('AMD ', '') : '';
          const ram = variant.ram?.dungLuong || '';
          const ssd = variant.ocung?.dungLuong || '';
          const color = variant.mauSac?.tenMau || '';
          const specText = `${ram} / ${ssd}${color ? ' - ' + color : ''}`;
          
          return `
            <button type="button" class="variant-choice-btn ${isActive ? 'active' : ''}" onclick="selectProductVariant(${variant.id})">
              <span class="variant-spec-title">${specText}</span>
              <span class="variant-sub-spec">${cpu}</span>
              <div class="variant-price-row">
                <span class="variant-sale-price">${formatVND(pricing.giaBan)}</span>
                ${pricing.coKhuyenMai ? `<span class="variant-old-price">${formatVND(pricing.giaGoc)}</span>` : ''}
              </div>
              ${pricing.coKhuyenMai ? `<span class="variant-promo-badge">${pricing.discountLabel}</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Switch CTSP variant dynamically
async function selectProductVariant(variantId) {
  try {
    const res = await fetch(`${API_BASE_URL}/chi-tiet-san-pham/${variantId}`);
    if (res.ok) {
      currentProduct = await res.json();
    } else {
      currentProduct = allVariantsOfProduct.find(v => v.id === variantId) || currentProduct;
    }
  } catch (e) {
    currentProduct = allVariantsOfProduct.find(v => v.id === variantId) || currentProduct;
  }

  // Update URL without full page reload
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set('id', variantId);
  window.history.replaceState({}, '', newUrl.toString());

  // Re-render UI with newly selected CTSP (updates price, promo badge, specs, images)
  renderProductDetails(currentProduct);
}


// Helper to build product title
function getProductDisplayTitle(item) {
  const brand = item.sanPham?.thuongHieu?.tenThuongHieu || '';
  let spName = item.sanPham?.tenSp || 'Laptop';
  if (brand && spName.toLowerCase().startsWith(brand.toLowerCase())) {
    spName = spName.substring(brand.length).trim();
  }
  const cpu = item.cpu?.tenCpu ? item.cpu.tenCpu.replace('Intel Core ', '').replace('AMD ', '') : '';
  const gpu = item.cardDoHoa?.tenCard ? item.cardDoHoa.tenCard.replace('NVIDIA GeForce ', '') : '';
  return `LAPTOP ${brand.toUpperCase()} ${spName.toUpperCase()} - ${cpu.toUpperCase()} - ${gpu.toUpperCase()}`;
}

// Load and render Similar Products (SẢN PHẨM TƯƠNG TỰ)
async function loadSimilarProducts(currentItem) {
  const container = document.getElementById('similarProductsGrid');
  if (!container) return;

  let allProducts = [];
  try {
    const res = await fetch(`${API_BASE_URL}/chi-tiet-san-pham`);
    if (res.ok) {
      allProducts = await res.json();
    } else {
      throw new Error('API offline');
    }
  } catch (err) {
    allProducts = FALLBACK_PRODUCTS;
  }

  // Filter out current product
  let similar = allProducts.filter(p => p.id !== currentItem.id);

  // Prioritize same category
  const currentCatId = currentItem.sanPham?.danhMuc?.id;
  if (currentCatId) {
    similar.sort((a, b) => {
      const aSame = a.sanPham?.danhMuc?.id === currentCatId ? 1 : 0;
      const bSame = b.sanPham?.danhMuc?.id === currentCatId ? 1 : 0;
      return bSame - aSame;
    });
  }

  const displayItems = similar.slice(0, 6);

  if (displayItems.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; padding: 15px; color: var(--text-muted); font-size: 0.85rem;">Không có sản phẩm tương tự.</div>`;
    return;
  }

  container.innerHTML = displayItems.map(item => {
    const title = getProductDisplayTitle(item);
    const pricing = getPricingInfo(item);
    const images = getProductImages(item);
    const inStock = (item.soLuong > 0 && item.trangThai === 1);

    return `
      <div class="similar-card" onclick="window.location.href='chi-tiet-san-pham.html?id=${item.id}'" style="cursor: pointer;">
        <div class="similar-card-img-box">
          <img src="${images[0]}" alt="${item.sanPham?.tenSp}" class="similar-card-img">
          <div class="similar-card-promo-strip">
            CHIẾN GAME ĐỈNH CAO - TẶNG QUÀ SANG
          </div>
        </div>
        <a href="chi-tiet-san-pham.html?id=${item.id}" class="similar-card-title" title="${title}">
          ${title}
        </a>
        <div class="similar-price-row">
          <span class="similar-current-price">${formatVND(pricing.currentPrice)}</span>
          <span class="similar-discount-badge">-${pricing.discountPercent}%</span>
        </div>
        <div class="similar-old-price-row">
          <span class="similar-old-price">${formatVND(pricing.oldPrice)}</span>
        </div>
        <div class="similar-actions-row">
          <button class="btn-similar-add-cart" type="button" onclick="event.stopPropagation(); addToCartFromSimilar(${item.id})">
            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
            THÊM VÀO GIỎ
          </button>
          <span class="similar-stock-badge">${inStock ? 'Còn hàng' : 'Hết hàng'}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Scroll similar products (direction: 1 for next 3 items, -1 for prev 3 items)
function scrollSimilarProducts(direction) {
  const container = document.getElementById('similarProductsGrid');
  if (container) {
    const scrollAmount = container.clientWidth + 12;
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }
}

// Add to cart from similar product card
function addToCartFromSimilar(itemId) {
  const all = (window.allLoadedProducts && window.allLoadedProducts.length) ? window.allLoadedProducts : FALLBACK_PRODUCTS;
  const item = all.find(p => p.id === itemId) || FALLBACK_PRODUCTS.find(p => p.id === itemId);
  if (!item) return;

  const pricing = getPricingInfo(item);
  const images = getProductImages(item);
  const brand = item.sanPham?.thuongHieu?.tenThuongHieu || '';
  const spName = item.sanPham?.tenSp || 'Laptop';
  const title = `LAPTOP ${brand.toUpperCase()} ${spName.toUpperCase()}`;

  const existing = cart.find(c => c.id === itemId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: item.id,
      maCtsp: item.maCtsp,
      title: title,
      price: pricing.currentPrice,
      image: images[0],
      quantity: 1
    });
  }

  saveCart();
  updateCartBadge();
  showToast(`Đã thêm <strong>${title}</strong> vào giỏ hàng!`, 'success');
}

// Gallery controls
function updateMainImage() {
  const mainImgEl = document.getElementById('detailMainImage');
  if (mainImgEl && productImages.length > 0) {
    mainImgEl.src = productImages[currentImageIndex];
  }
  // Update active thumbnail
  const thumbs = document.querySelectorAll('.detail-thumbnail-item');
  thumbs.forEach((thumb, idx) => {
    thumb.classList.toggle('active', idx === currentImageIndex);
  });
}

function renderThumbnails() {
  const container = document.getElementById('detailThumbnailsRow');
  if (!container) return;

  container.innerHTML = productImages.map((img, index) => `
    <div class="detail-thumbnail-item ${index === 0 ? 'active' : ''}" onclick="selectImageIndex(${index})">
      <img src="${img}" alt="Thumbnail ${index + 1}">
    </div>
  `).join('');
}

function selectImageIndex(index) {
  currentImageIndex = index;
  updateMainImage();
}

function navigateGallery(direction) {
  if (productImages.length <= 1) return;
  currentImageIndex = (currentImageIndex + direction + productImages.length) % productImages.length;
  updateMainImage();
}

// Quantity selector
function changeDetailQty(delta) {
  const qtyInput = document.getElementById('detailQtyInput');
  if (!qtyInput) return;
  let val = parseInt(qtyInput.value || '1', 10) + delta;
  if (val < 1) val = 1;
  if (currentProduct && currentProduct.soLuong && val > currentProduct.soLuong) {
    val = currentProduct.soLuong;
    showToast(`Kho chỉ còn ${currentProduct.soLuong} sản phẩm!`);
  }
  qtyInput.value = val;
}

// Action: THÊM VÀO GIỎ HÀNG
function handleAddToCart(openDrawerAfterAdd = false) {
  if (!currentProduct) return;

  const qty = parseInt(document.getElementById('detailQtyInput')?.value || '1', 10);
  const pricing = getPricingInfo(currentProduct);
  const brand = currentProduct.sanPham?.thuongHieu?.tenThuongHieu || '';
  const spName = currentProduct.sanPham?.tenSp || 'Laptop';
  const title = `LAPTOP ${brand.toUpperCase()} ${spName.toUpperCase()}`;

  const existing = cart.find(c => c.id === currentProduct.id);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      id: currentProduct.id,
      maCtsp: currentProduct.maCtsp,
      title: title,
      price: pricing.currentPrice,
      image: productImages[0],
      quantity: qty
    });
  }

  saveCart();
  updateCartBadge();
  showToast(`Đã thêm ${qty}x <strong>${title}</strong> vào giỏ hàng!`, 'success');

  if (openDrawerAfterAdd) {
    openCartDrawer();
  }
}

// Action: MUA NGAY
function handleBuyNow() {
  handleAddToCart(true);
}

// Cart Drawer
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
        <p>Giỏ hàng của bạn đang trống</p>
      </div>
    `;
    if (totalAmountEl) totalAmountEl.textContent = '0 đ';
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
        <button class="cart-item-remove" onclick="removeCartItem(${item.id})">✕</button>
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
}

// Toast
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

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        window.location.href = `index.html?search=${encodeURIComponent(searchInput.value)}`;
      }
    });
  }
}
