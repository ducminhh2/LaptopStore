/**
 * ============================================================================
 * LAPTOP STORE - ADMIN & POS PORTAL SCRIPT (admin.js)
 * Enterprise-grade POS, Invoice Management, and Attributes CRUD operations
 * ============================================================================
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Status labels & badges map (0: Chờ xác nhận, 1: Đã xác nhận, 2: Đang giao, 3: Hoàn thành, 4: Đã hủy)
const STATUS_CONFIG = {
  0: { label: 'Chờ xác nhận', class: 'pending', textClass: 'text-amber' },
  1: { label: 'Đã xác nhận', class: 'confirmed', textClass: 'text-blue' },
  2: { label: 'Đang giao hàng', class: 'shipping', textClass: 'text-purple' },
  3: { label: 'Hoàn thành', class: 'completed', textClass: 'text-green' },
  4: { label: 'Đã hủy', class: 'cancelled', textClass: 'text-red' }
};

// ============================================================================
// ATTRIBUTES DEFINITIONS & CONFIGURATION FOR 8 ATTRIBUTE TYPES
// ============================================================================
const ATTR_CONFIG = {
  'cpu': {
    title: 'CPU (Vi Xử Lý)',
    endpoint: '/cpu',
    nameField: 'tenCpu',
    columns: [
      { key: 'id', label: 'ID', width: '60px' },
      { key: 'tenCpu', label: 'Tên Vi Xử Lý (CPU)' }
    ],
    fields: [
      { name: 'tenCpu', label: 'Tên CPU (*)', type: 'text', required: true }
    ]
  },
  'ram': {
    title: 'RAM',
    endpoint: '/ram',
    nameField: 'dungLuong',
    columns: [
      { key: 'id', label: 'ID', width: '60px' },
      { key: 'dungLuong', label: 'Dung Lượng RAM' },
      { key: 'loaiRam', label: 'Loại RAM' }
    ],
    fields: [
      { name: 'dungLuong', label: 'Dung Lượng (*)', type: 'text', required: true },
      { name: 'loaiRam', label: 'Chuẩn / Loại RAM', type: 'text' }
    ]
  },
  'o-cung': {
    title: 'Ổ Cứng',
    endpoint: '/o-cung',
    nameField: 'dungLuong',
    columns: [
      { key: 'id', label: 'ID', width: '60px' },
      { key: 'loaiOCung', label: 'Loại Ổ Cứng' },
      { key: 'dungLuong', label: 'Dung Lượng' }
    ],
    fields: [
      { name: 'loaiOCung', label: 'Loại Ổ Cứng (*)', type: 'text', required: true },
      { name: 'dungLuong', label: 'Dung Lượng (*)', type: 'text', required: true }
    ]
  },
  'card-do-hoa': {
    title: 'Card Đồ Họa (GPU)',
    endpoint: '/card-do-hoa',
    nameField: 'tenCard',
    columns: [
      { key: 'id', label: 'ID', width: '60px' },
      { key: 'tenCard', label: 'Tên Card Đồ Họa' }
    ],
    fields: [
      { name: 'tenCard', label: 'Tên Card Đồ Họa (*)', type: 'text', required: true }
    ]
  },
  'man-hinh': {
    title: 'Màn Hình',
    endpoint: '/man-hinh',
    nameField: 'kichThuoc',
    columns: [
      { key: 'id', label: 'ID', width: '60px' },
      { key: 'kichThuoc', label: 'Kích Thước' },
      { key: 'doPhanGiai', label: 'Độ Phân Giải' },
      { key: 'tanSoQuet', label: 'Tần Số Quét' }
    ],
    fields: [
      { name: 'kichThuoc', label: 'Kích Thước (*)', type: 'text', required: true },
      { name: 'doPhanGiai', label: 'Độ Phân Giải (*)', type: 'text', required: true },
      { name: 'tanSoQuet', label: 'Tần Số Quét', type: 'text' }
    ]
  },
  'mau-sac': {
    title: 'Màu Sắc',
    endpoint: '/mau-sac',
    nameField: 'tenMau',
    columns: [
      { key: 'id', label: 'ID', width: '60px' },
      { key: 'tenMau', label: 'Tên Màu Sắc' }
    ],
    fields: [
      { name: 'tenMau', label: 'Tên Màu Sắc (*)', type: 'text', required: true }
    ]
  },
  'danh-muc': {
    title: 'Danh Mục',
    endpoint: '/danh-muc',
    nameField: 'tenDanhMuc',
    columns: [
      { key: 'id', label: 'ID', width: '60px' },
      { key: 'tenDanhMuc', label: 'Tên Danh Mục' }
    ],
    fields: [
      { name: 'tenDanhMuc', label: 'Tên Danh Mục (*)', type: 'text', required: true }
    ]
  },
  'thuong-hieu': {
    title: 'Thương Hiệu',
    endpoint: '/thuong-hieu',
    nameField: 'tenThuongHieu',
    columns: [
      { key: 'id', label: 'ID', width: '60px' },
      { key: 'tenThuongHieu', label: 'Tên Thương Hiệu' }
    ],
    fields: [
      { name: 'tenThuongHieu', label: 'Tên Thương Hiệu (*)', type: 'text', required: true }
    ]
  }
};

// ============================================================================
// GLOBAL APPLICATION STATE
// ============================================================================
const state = {
  activeTab: 'pos', // 'pos' | 'invoices' | 'attributes'

  // POS State
  posOrders: [
    {
      id: 1,
      name: 'Hóa đơn 1',
      items: [],
      customerId: 1,
      customerName: 'Khách lẻ tại quầy',
      customerPhone: '0988888888',
      customerAddress: 'Tại quầy Store',
      deliveryType: 'TAI_QUAY',
      cashierId: 4,
      payMethod: 'TIEN_MAT',
      idVoucher: null,
      maVoucher: '',
      tienGiamVoucher: 0,
      customerGiven: 0,
      note: ''
    }
  ],
  activeOrderId: 1,
  nextOrderSequence: 2,
  productsList: [], // cached laptop variants
  customersList: [], // cached users
  cashiersList: [],

  // Invoices State
  invoicesList: [],
  filteredInvoices: [],
  selectedInvoice: null,
  selectedInvoiceItems: [],

  // Attributes State
  activeAttrType: 'cpu',
  activeAttrData: [],
  filteredAttrData: [],
  editingAttrId: null,
  quickAddTargetSelect: null,

  // Products (San Pham) State
  allProducts: [],
  filteredProducts: [],
  editingProductId: null,
  productModalImages: [],
  productDeletedImageIds: [],

  // Variants (Chi Tiet San Pham) State
  allVariants: [],
  filteredVariants: [],
  editingVariantId: null,
  selectedProductIdForVariants: null,
  variantModalImages: [],
  variantDeletedImageIds: [],

  // IMEI State
  allImeis: [],
  filteredImeis: [],

  // Promotions (Khuyen Mai) State
  promotionsList: [],
  filteredPromotions: [],
  editingPromotionId: null,
  allCtspListForPromo: [],
  selectedCtspIdsForPromo: new Set(),

  // Vouchers (Voucher Hoa Don) State
  vouchersList: [],
  filteredVouchers: [],
  editingVoucherId: null,
  selectedVoucherForDetail: null
};

// ============================================================================
// AUTHENTICATION & ACCESS CONTROL
// ============================================================================
function getLoggedInUser() {
  const userStr = localStorage.getItem('laptop_store_user') || sessionStorage.getItem('laptop_store_user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch(e) {
    return null;
  }
}

function checkAdminAuth() {
  const user = getLoggedInUser();

  // Nếu người dùng đăng nhập với quyền Khách hàng thì chuyển hướng về trang mua sắm khách hàng
  if (user && (user.roleCode === 'KHACH_HANG' || (user.vaiTro && user.vaiTro.id === 3))) {
    alert('Tài khoản của bạn là Khách Hàng, không có quyền truy cập vào trang Quản Trị Hệ Thống!');
    window.location.href = 'index.html';
    return false;
  }

  // Cập nhật thông tin tài khoản trên thanh Topbar
  if (user && user.id) {
    const avatarEl = document.getElementById('adminAvatar');
    const nameEl = document.getElementById('adminUserName');
    const roleEl = document.getElementById('adminUserRole');

    if (nameEl) nameEl.textContent = user.ten || user.username || 'Admin';
    if (roleEl) {
      const roleText = user.vaiTro?.tenVaiTro || (user.roleCode === 'ADMIN' ? 'Quản trị viên' : (user.roleCode === 'NHAN_VIEN' ? 'Nhân viên' : 'Quản trị viên'));
      roleEl.textContent = roleText;
    }
    if (avatarEl) {
      const displayName = user.ten || user.username || 'AD';
      const initials = displayName.split(' ').map(p => p[0]).filter(Boolean).slice(-2).join('').toUpperCase() || 'AD';
      avatarEl.textContent = initials;
    }

    // Tự động gán nhân viên bán hàng cho đơn hàng POS hiện tại
    if (state && state.posOrders) {
      state.posOrders.forEach(o => {
        o.cashierId = user.id;
      });
    }
  }

  return true;
}

window.handleAdminLogout = function() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?')) {
    localStorage.removeItem('laptop_store_user');
    sessionStorage.removeItem('laptop_store_user');
    window.location.href = 'login.html';
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAdminAuth()) return;

  initToastContainer();
  checkApiHealth();
  initVariantImageDropzone();

  // Load common data in parallel
  await Promise.all([
    loadProductsList(),
    loadProductsTable(),
    loadUsersList()
  ]);

  // Initial render for POS
  renderPosOrderTabs();
  renderPosCart();
  populatePosCustomerAndCashierSelects();

  // Preload invoices
  loadInvoicesList();

  // Close modals on backdrop click or ESC key
  document.addEventListener('click', (e) => {
    if (e.target.classList && e.target.classList.contains('admin-modal-overlay')) {
      e.target.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.admin-modal-overlay.active').forEach(m => m.classList.remove('active'));
    }
  });
});

// Toast notification helper
function initToastContainer() {
  if (!document.getElementById('adminToastContainer')) {
    const container = document.createElement('div');
    container.id = 'adminToastContainer';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('adminToastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bg = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
  toast.style.cssText = `
    background: ${bg};
    color: #ffffff;
    padding: 12px 18px;
    border-radius: 8px;
    font-size: 0.88rem;
    font-weight: 600;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
    display: flex;
    align-items: center;
    gap: 8px;
    pointer-events: auto;
    animation: fadeIn 0.2s ease;
    max-width: 380px;
  `;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Check Backend API Connection
async function checkApiHealth() {
  const badge = document.getElementById('apiStatusBadge');
  const text = document.getElementById('apiStatusText');
  try {
    const res = await fetch(`${API_BASE_URL}/cpu`);
    if (res.ok) {
      if (text) text.textContent = 'API Sẵn Sàng (Port 8080)';
    } else {
      if (text) text.textContent = 'API Lỗi ' + res.status;
      if (badge) badge.style.color = '#dc2626';
    }
  } catch (err) {
    if (text) text.textContent = 'Mất kết nối Backend';
    if (badge) {
      badge.style.background = '#fee2e2';
      badge.style.color = '#b91c1c';
    }
  }
}

// Format Currency Utility
function formatCurrency(number) {
  if (!number && number !== 0) return '0 đ';
  return Number(number).toLocaleString('vi-VN') + ' đ';
}

// ============================================================================
// ADMIN TABS NAVIGATION (SIDEBAR SWITCHER)
// ============================================================================
window.switchAdminTab = function(tabName, options = {}) {
  // If attempting to open variants without an active selected product, redirect to products tab
  if (tabName === 'variants' && !state.selectedProductIdForVariants) {
    tabName = 'products';
  }

  state.activeTab = tabName;

  // Sidebar items active state
  document.querySelectorAll('.sidebar-menu-item').forEach(el => el.classList.remove('active'));
  const activeNav = {
    'pos': document.getElementById('navPos'),
    'invoices': document.getElementById('navInvoices'),
    'products': document.getElementById('navProducts'),
    'variants': document.getElementById('navProducts'), // Highlight "Quản Lý Sản Phẩm" as parent
    'promotions': document.getElementById('navPromotions'),
    'vouchers': document.getElementById('navVouchers'),
    'attributes': document.getElementById('navAttributes'),
    'imeis': document.getElementById('navImeis')
  }[tabName];
  if (activeNav) activeNav.classList.add('active');

  // Title update
  const titleEl = document.getElementById('adminPageTitle');
  if (titleEl) {
    if (tabName === 'variants') {
      const targetSpId = Number(state.selectedProductIdForVariants);
      let foundProd = (state.allProducts || []).find(p => Number(p.id) === targetSpId);
      if (!foundProd) {
        const vMatch = (state.allVariants || []).find(v => Number(v.sanPham?.id) === targetSpId);
        if (vMatch && vMatch.sanPham) foundProd = vMatch.sanPham;
      }
      if (!foundProd) {
        const pMatch = (state.productsList || []).find(p => Number(p.sanPham?.id) === targetSpId);
        if (pMatch && pMatch.sanPham) foundProd = pMatch.sanPham;
      }
      const prodName = (foundProd && foundProd.tenSp) ? `${foundProd.tenSp}` : 'Dòng Laptop';
      titleEl.textContent = `Cấu Hình Chi Tiết - ${prodName}`;
    } else {
      titleEl.textContent = {
        'pos': 'Bán Hàng Tại Quầy (POS)',
        'invoices': 'Quản Lý Danh Sách Hóa Đơn',
        'products': 'Quản Lý Dòng Sản Phẩm Laptop',
        'promotions': 'Quản Lý Khuyến Mãi Sản Phẩm',
        'vouchers': 'Quản Lý Voucher Hóa Đơn',
        'attributes': 'Quản Lý Thuộc Tính Laptop',
        'imeis': 'Quản Lý IMEI'
      }[tabName] || 'Quản Trị';
    }
  }

  // Panes active state
  document.querySelectorAll('.admin-tab-pane').forEach(el => el.classList.remove('active'));
  const targetPane = {
    'pos': document.getElementById('tabPanePos'),
    'invoices': document.getElementById('tabPaneInvoices'),
    'products': document.getElementById('tabPaneProducts'),
    'variants': document.getElementById('tabPaneVariants'),
    'promotions': document.getElementById('tabPanePromotions'),
    'vouchers': document.getElementById('tabPaneVouchers'),
    'attributes': document.getElementById('tabPaneAttributes'),
    'imeis': document.getElementById('tabPaneImeis')
  }[tabName];
  if (targetPane) targetPane.classList.add('active');

  // Trigger data reload depending on tab
  if (tabName === 'invoices') {
    loadInvoicesList();
  } else if (tabName === 'products') {
    loadProductsTable();
  } else if (tabName === 'variants') {
    loadVariantsTable();
  } else if (tabName === 'promotions') {
    loadPromotionsTable();
  } else if (tabName === 'vouchers') {
    loadVouchersTable();
  } else if (tabName === 'attributes') {
    switchAttrType(state.activeAttrType);
  } else if (tabName === 'imeis') {
    loadImeisTable();
  }
};

// ============================================================================
// PART 1: BÁN HÀNG TẠI QUẦY (POS) LOGIC
// ============================================================================

// Load Products Variants from /api/chi-tiet-san-pham
async function loadProductsList() {
  try {
    const res = await fetch(`${API_BASE_URL}/chi-tiet-san-pham`);
    if (res.ok) {
      state.productsList = await res.json();
    } else {
      console.warn('Cannot fetch products, using fallback');
      state.productsList = getFallbackProducts();
    }
  } catch (e) {
    console.warn('Backend offline, using fallback products');
    state.productsList = getFallbackProducts();
  }
}

// Load Users & Cashiers from /api/nguoi-dung
async function loadUsersList() {
  try {
    const res = await fetch(`${API_BASE_URL}/nguoi-dung`);
    if (res.ok) {
      const allUsers = await res.json();
      state.customersList = allUsers.filter(u => !u.vaiTro || u.vaiTro.id === 3 || u.vaiTro.tenVaiTro?.includes('Khách'));
      state.cashiersList = allUsers.filter(u => u.vaiTro && (u.vaiTro.id === 1 || u.vaiTro.id === 2 || u.vaiTro.tenVaiTro?.includes('Nhân viên') || u.vaiTro.tenVaiTro?.includes('Admin')));
      if (state.customersList.length === 0) state.customersList = allUsers;
      if (state.cashiersList.length === 0) state.cashiersList = allUsers;
    }
  } catch (e) {
    console.warn('Using default users');
  }
}

function populatePosCustomerAndCashierSelects() {
  const custSelect = document.getElementById('posCustomerSelect');
  const cashSelect = document.getElementById('posCashierSelect');

  if (custSelect) {
    custSelect.innerHTML = '';

    // Sort: 'Khách lẻ tại quầy' / 'khachle' on top, then others by ID
    const sortedCustomers = [...state.customersList].sort((a, b) => {
      const isRetailA = (a.username === 'khachle' || a.ten?.toLowerCase().includes('khách lẻ'));
      const isRetailB = (b.username === 'khachle' || b.ten?.toLowerCase().includes('khách lẻ'));
      if (isRetailA) return -1;
      if (isRetailB) return 1;
      return (a.id || 0) - (b.id || 0);
    });

    sortedCustomers.forEach(c => {
      custSelect.innerHTML += `
        <option value="${c.id}" data-name="${c.ten || c.username}" data-phone="${c.dienThoai || ''}" data-address="${c.diaChi || 'Tại quầy'}">
          ${c.ten || c.username} - ${c.dienThoai || 'Chưa có SĐT'}
        </option>
      `;
    });

    // Sync active order with the top default customer if currently unset or default
    const order = getActivePosOrder();
    if (order && sortedCustomers.length > 0) {
      const currentExists = sortedCustomers.some(c => c.id === order.customerId);
      if (!currentExists) {
        order.customerId = sortedCustomers[0].id;
        order.customerName = sortedCustomers[0].ten || sortedCustomers[0].username;
        order.customerPhone = sortedCustomers[0].dienThoai || '';
        order.customerAddress = sortedCustomers[0].diaChi || 'Tại quầy';
      }
      custSelect.value = order.customerId;
      const phoneInput = document.getElementById('posCustomerPhone');
      if (phoneInput) phoneInput.value = order.customerPhone || '';
      const addressInput = document.getElementById('posCustomerAddress');
      if (addressInput) addressInput.value = order.customerAddress || 'Tại quầy Store';
    }
  }

  if (cashSelect) {
    const currentUser = getLoggedInUser();
    if (currentUser && currentUser.id) {
      cashSelect.innerHTML = `<option value="${currentUser.id}" selected>${currentUser.ma || 'NV'} - ${currentUser.ten || currentUser.username}</option>`;
      cashSelect.disabled = true;
      cashSelect.style.backgroundColor = '#f1f5f9';
      cashSelect.style.cursor = 'not-allowed';
      cashSelect.style.fontWeight = '600';
      cashSelect.style.color = '#1e293b';
      cashSelect.title = 'Nhân viên bán hàng cố định theo tài khoản đang đăng nhập';
    } else {
      cashSelect.innerHTML = '';
      if (state.cashiersList.length > 0) {
        state.cashiersList.forEach(c => {
          cashSelect.innerHTML += `<option value="${c.id}">${c.ma || 'NV'} - ${c.ten || c.username}</option>`;
        });
      } else {
        cashSelect.innerHTML = `<option value="4">NV001 - Nguyễn Thị Mai</option>`;
      }
    }
  }
}

function getActivePosOrder() {
  let order = state.posOrders.find(o => o.id === state.activeOrderId);
  if (!order) {
    order = state.posOrders[0];
    if (order) state.activeOrderId = order.id;
  }
  return order;
}

// Render Order Tabs
function renderPosOrderTabs() {
  const container = document.getElementById('posOrderTabsBar');
  if (!container) return;

  // Clear existing tabs except the "+ Thêm" button
  const tabs = container.querySelectorAll('.pos-order-tab');
  tabs.forEach(t => t.remove());

  const btnNew = document.getElementById('btnNewOrderTab');

  state.posOrders.forEach(order => {
    const tab = document.createElement('div');
    tab.className = `pos-order-tab ${order.id === state.activeOrderId ? 'active' : ''}`;
    tab.onclick = () => posSelectOrderTab(order.id);

    const countItems = order.items.reduce((s, i) => s + i.qty, 0);
    tab.innerHTML = `
      <span>${order.name} ${countItems > 0 ? `(${countItems})` : ''}</span>
      ${state.posOrders.length > 1 ? `<span class="pos-order-tab-close" onclick="event.stopPropagation(); posCloseOrderTab(${order.id})" title="Đóng đơn">&times;</span>` : ''}
    `;
    container.insertBefore(tab, btnNew);
  });

  const badge = document.getElementById('posCurrentOrderBadge');
  const activeOrder = getActivePosOrder();
  if (badge && activeOrder) {
    badge.textContent = `(${activeOrder.name})`;
  }
}

window.posCreateNewOrderTab = function() {
  if (state.posOrders.length >= 8) {
    showToast('Tối đa 8 hóa đơn chờ cùng lúc!', 'error');
    return;
  }
  const newId = Date.now();
  const orderNumber = state.nextOrderSequence++;
  const currentUser = getLoggedInUser();
  const currentCashierId = (currentUser && currentUser.id) ? currentUser.id : 4;
  const newOrder = {
    id: newId,
    name: `Hóa đơn ${orderNumber}`,
    items: [],
    customerId: 1,
    customerName: 'Khách lẻ tại quầy',
    customerPhone: '0988888888',
    customerAddress: 'Tại quầy Store',
    deliveryType: 'TAI_QUAY',
    cashierId: currentCashierId,
    payMethod: 'TIEN_MAT',
    idVoucher: null,
    maVoucher: '',
    tienGiamVoucher: 0,
    customerGiven: 0,
    note: ''
  };
  state.posOrders.push(newOrder);
  state.activeOrderId = newId;
  renderPosOrderTabs();
  renderPosCart();
  showToast(`Đã tạo ${newOrder.name}`, 'info');
};

window.posSelectOrderTab = function(orderId) {
  state.activeOrderId = orderId;
  renderPosOrderTabs();
  renderPosCart();
};

window.posCloseOrderTab = function(orderId) {
  const order = state.posOrders.find(o => o.id === orderId);
  if (!order) return;

  if (order.items.length > 0) {
    if (!confirm(`Hóa đơn "${order.name}" đang có sản phẩm. Bạn có chắc muốn hủy đơn này?`)) {
      return;
    }
  }

  state.posOrders = state.posOrders.filter(o => o.id !== orderId);
  if (state.activeOrderId === orderId) {
    state.activeOrderId = state.posOrders[0].id;
  }
  renderPosOrderTabs();
  renderPosCart();
  showToast(`Đã xóa ${order.name}`);
};

// Render Cart Table for active order
function renderPosCart() {
  const order = getActivePosOrder();
  if (!order) return;

  const tbody = document.getElementById('posCartTableBody');
  const emptyNotice = document.getElementById('posCartEmptyNotice');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (order.items.length === 0) {
    if (emptyNotice) emptyNotice.style.display = 'block';
  } else {
    if (emptyNotice) emptyNotice.style.display = 'none';

    order.items.forEach((item, idx) => {
      const lineTotal = item.price * item.qty;
      const selectedImeis = item.selectedImeis || [];
      const isFulfilled = (selectedImeis.length === item.qty);
      const imeiSummary = selectedImeis.map(im => im.soImei).join(', ');

      const tr = document.createElement('tr');
      tr.className = 'pos-product-item-row';
      tr.innerHTML = `
        <td style="text-align:center; font-weight:700; color:var(--admin-text-muted);">${idx + 1}</td>
        <td>
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${item.image || 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=150&q=80'}" alt="${item.name}">
            <div>
              <div style="font-weight:700; color:var(--admin-text-main); font-size:0.88rem;">${item.name}</div>
              <div style="font-size:0.75rem; color:var(--admin-text-muted); margin-top:2px;">${item.specs || ''}</div>
            </div>
          </div>
        </td>
        <td style="text-align:center;">
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
            <span class="badge-status ${isFulfilled ? 'badge-pay-paid' : 'badge-pay-unpaid'}" style="font-size:0.75rem; font-weight:700;">
              IMEI: ${selectedImeis.length}/${item.qty} ${isFulfilled ? '&#10003;' : ''}
            </span>
            <button class="btn-admin btn-sm ${isFulfilled ? 'btn-outline' : 'btn-primary'}" 
                    style="font-size:11px; padding:2px 8px; font-weight:700;" 
                    onclick="openPosImeiPicker(${idx})" type="button">
              ${isFulfilled ? 'Đổi IMEI' : 'Chọn IMEI'}
            </button>
            ${isFulfilled ? `<span style="font-family:monospace; font-size:10px; color:#1e40af; max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${imeiSummary}">${imeiSummary}</span>` : ''}
          </div>
        </td>
        <td style="text-align:right; font-weight:700;">${formatCurrency(item.price)}</td>
        <td style="text-align:center;">
          <div class="pos-qty-control">
            <button class="pos-qty-btn" onclick="posChangeItemQty(${item.ctspId}, -1)" type="button">-</button>
            <input class="pos-qty-val" type="text" value="${item.qty}" readonly>
            <button class="pos-qty-btn" onclick="posChangeItemQty(${item.ctspId}, 1)" type="button">+</button>
          </div>
        </td>
        <td style="text-align:right; font-weight:800; color:var(--admin-danger); font-size:0.92rem;">
          ${formatCurrency(lineTotal)}
        </td>
        <td style="text-align:center;">
          <button onclick="posRemoveItem(${item.ctspId})" style="border:none; background:none; color:var(--admin-text-light); cursor:pointer; font-size:1.1rem;" title="Xóa món">
            &times;
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  const phoneInput = document.getElementById('posCustomerPhone');
  const addressInput = document.getElementById('posCustomerAddress');
  const custSelect = document.getElementById('posCustomerSelect');
  const cashSelect = document.getElementById('posCashierSelect');
  const noteInput = document.getElementById('posOrderNote');
  const currentUser = getLoggedInUser();

  if (phoneInput) phoneInput.value = order.customerPhone || '';
  if (addressInput) addressInput.value = order.customerAddress || 'Tại quầy Store';
  if (custSelect) custSelect.value = order.customerId || 1;
  if (noteInput) noteInput.value = order.note || '';

  // Synchronize Delivery Type
  order.deliveryType = order.deliveryType || 'TAI_QUAY';
  const delRadio = document.querySelector(`input[name="posDeliveryType"][value="${order.deliveryType}"]`);
  if (delRadio) delRadio.checked = true;
  const delAddrGroup = document.getElementById('posDeliveryAddressGroup');
  if (delAddrGroup) {
    delAddrGroup.style.display = (order.deliveryType === 'GIAO_HANG') ? 'block' : 'none';
  }

  if (!order.payMethod || order.payMethod === 'QUET_THE') {
    order.payMethod = 'TIEN_MAT';
  }
  const payRadio = document.querySelector(`input[name="posPayMethod"][value="${order.payMethod}"]`);
  if (payRadio) payRadio.checked = true;

  if (cashSelect) {
    if (currentUser && currentUser.id) {
      cashSelect.value = currentUser.id;
      cashSelect.disabled = true;
      cashSelect.style.backgroundColor = '#f1f5f9';
      cashSelect.style.cursor = 'not-allowed';
      cashSelect.style.fontWeight = '600';
      cashSelect.style.color = '#1e293b';
      order.cashierId = currentUser.id;
    } else if (order.cashierId) {
      cashSelect.value = order.cashierId;
    }
  }

  syncPosVouchersAndCalculations();
}

window.posChangeItemQty = function(ctspId, delta) {
  const order = getActivePosOrder();
  if (!order) return;

  const item = order.items.find(i => i.ctspId === ctspId);
  if (!item) return;

  if (delta > 0) {
    const productInfo = (state.productsList || []).find(p => p.id === ctspId);
    const maxStock = (productInfo && productInfo.soLuong !== undefined) ? Number(productInfo.soLuong) : 999;
    if (item.qty + delta > maxStock) {
      showToast(`Số lượng tồn kho khả dụng chỉ còn ${maxStock} máy!`, 'warning');
      return;
    }
  }

  item.qty += delta;
  if (item.qty <= 0) {
    order.items = order.items.filter(i => i.ctspId !== ctspId);
  } else {
    if (!item.selectedImeis) item.selectedImeis = [];
    if (item.selectedImeis.length > item.qty) {
      item.selectedImeis = item.selectedImeis.slice(0, item.qty);
    }
  }
  renderPosOrderTabs();
  renderPosCart();
};

window.posRemoveItem = function(ctspId) {
  const order = getActivePosOrder();
  if (!order) return;
  order.items = order.items.filter(i => i.ctspId !== ctspId);
  renderPosOrderTabs();
  renderPosCart();
};

window.posClearActiveCart = function() {
  const order = getActivePosOrder();
  if (!order || order.items.length === 0) return;
  if (confirm('Làm trống giỏ hàng của đơn này?')) {
    order.items = [];
    order.idVoucher = null;
    order.maVoucher = '';
    order.tienGiamVoucher = 0;
    renderPosOrderTabs();
    renderPosCart();
  }
};

window.onPosCustomerChange = function() {
  const custSelect = document.getElementById('posCustomerSelect');
  const phoneInput = document.getElementById('posCustomerPhone');
  const order = getActivePosOrder();
  const addressInput = document.getElementById('posCustomerAddress');
  if (!custSelect || !order) return;

  const opt = custSelect.options[custSelect.selectedIndex];
  if (opt) {
    order.customerId = parseInt(opt.value);
    order.customerName = opt.getAttribute('data-name');
    order.customerPhone = opt.getAttribute('data-phone');
    const custAddr = opt.getAttribute('data-address');
    if (phoneInput) phoneInput.value = order.customerPhone || '';
    if (custAddr && custAddr !== 'Tại quầy') {
      order.customerAddress = custAddr;
      if (addressInput && order.deliveryType === 'GIAO_HANG') {
        addressInput.value = custAddr;
      }
    }
  }
};

window.onPosAddressChange = function() {
  const order = getActivePosOrder();
  const addressInput = document.getElementById('posCustomerAddress');
  if (order && addressInput) {
    order.customerAddress = addressInput.value.trim() || 'Tại quầy Store';
  }
};

window.onPosDeliveryTypeChange = function() {
  const order = getActivePosOrder();
  if (!order) return;
  const rad = document.querySelector('input[name="posDeliveryType"]:checked');
  order.deliveryType = rad ? rad.value : 'TAI_QUAY';

  const addrGroup = document.getElementById('posDeliveryAddressGroup');
  const addrInput = document.getElementById('posCustomerAddress');
  if (addrGroup) {
    if (order.deliveryType === 'GIAO_HANG') {
      addrGroup.style.display = 'block';
      if (!addrInput.value.trim() || addrInput.value.trim() === 'Tại quầy Store') {
        const custSelect = document.getElementById('posCustomerSelect');
        const custAddr = custSelect?.options[custSelect.selectedIndex]?.getAttribute('data-address');
        addrInput.value = (custAddr && custAddr !== 'Tại quầy') ? custAddr : '';
        order.customerAddress = addrInput.value;
      }
    } else {
      addrGroup.style.display = 'none';
      order.customerAddress = 'Tại quầy Store';
    }
  }
};

// Revalidate voucher & recalculate POS totals
async function syncPosVouchersAndCalculations() {
  const order = getActivePosOrder();
  if (!order) return;

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const voucherSelect = document.getElementById('posVoucherSelect');
  const elVoucherDiscount = document.getElementById('posVoucherDiscount');
  const elSubtotal = document.getElementById('posSubtotal');
  const elTotal = document.getElementById('posTotal');
  const elChange = document.getElementById('posChangeDue');
  const givenInput = document.getElementById('posCustomerGivenInput');

  if (elSubtotal) elSubtotal.textContent = formatCurrency(subtotal);

  // 1. Khi chưa có sản phẩm trong đơn hàng
  if (order.items.length === 0 || subtotal <= 0) {
    order.idVoucher = null;
    order.maVoucher = '';
    order.tienGiamVoucher = 0;

    if (voucherSelect) {
      voucherSelect.innerHTML = '<option value="">[ Chưa có sản phẩm ]</option>';
      voucherSelect.disabled = true;
      voucherSelect.value = '';
    }
    if (elVoucherDiscount) elVoucherDiscount.textContent = '-0 đ';
    if (elTotal) elTotal.textContent = '0 đ';
    if (elChange) elChange.textContent = '0 đ';
    return;
  }

  // 2. Khi có sản phẩm: Revalidate voucher đã chọn trước đó nếu có
  let currentVoucherId = order.idVoucher;
  if (currentVoucherId) {
    try {
      const calcRes = await fetch(`${API_BASE_URL}/vouchers/calculate-discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idVoucher: currentVoucherId, tongTienHang: subtotal })
      });
      if (calcRes.ok) {
        const calcData = await calcRes.json();
        if (calcData.hopLe) {
          order.tienGiamVoucher = Number(calcData.tienGiamVoucher) || 0;
          order.maVoucher = calcData.maVoucher || order.maVoucher;
        } else {
          // Bỏ voucher khỏi đơn và thông báo
          const oldCode = order.maVoucher || ('#' + currentVoucherId);
          order.idVoucher = null;
          order.maVoucher = '';
          order.tienGiamVoucher = 0;
          showToast(`Voucher ${oldCode} không còn đủ điều kiện do giá trị hóa đơn đã thay đổi.`, 'warning');
        }
      } else {
        const oldCode = order.maVoucher || ('#' + currentVoucherId);
        order.idVoucher = null;
        order.maVoucher = '';
        order.tienGiamVoucher = 0;
        showToast(`Voucher ${oldCode} không còn đủ điều kiện do giá trị hóa đơn đã thay đổi.`, 'warning');
      }
    } catch (e) {
      console.warn('Lỗi revalidate voucher:', e);
    }
  } else {
    order.tienGiamVoucher = 0;
  }

  // 3. Tải danh sách Voucher từ backend dựa trên tongTienHang
  try {
    const res = await fetch(`${API_BASE_URL}/vouchers/pos-available?tongTienHang=${subtotal}`);
    if (res.ok) {
      const vouchers = await res.json();
      if (voucherSelect) {
        voucherSelect.disabled = false;
        let optionsHtml = '<option value="">-- Không áp dụng Voucher --</option>';
        vouchers.forEach(v => {
          const code = v.ma || v.maVoucher || ('VC' + v.id);
          let desc = '';
          if (v.loaiGiam === 1) {
            desc = `Giảm ${v.giaTriGiam}%` + (v.giamToiDa ? `, tối đa ${formatCurrency(v.giamToiDa)}` : '');
          } else {
            desc = `Giảm ${formatCurrency(v.giaTriGiam)}`;
          }

          let minText = v.giaTriDonToiThieu ? `Đơn từ ${formatCurrency(v.giaTriDonToiThieu)}` : '';

          if (v.duDieuKien) {
            optionsHtml += `<option value="${v.id}">${code} - ${desc}${minText ? ` (${minText})` : ''}</option>`;
          } else {
            optionsHtml += `<option value="${v.id}" disabled style="color:#94a3b8; background:#f8fafc;">${code} - ${desc} (${minText ? minText + ' - ' : ''}Chưa đủ điều kiện)</option>`;
          }
        });
        voucherSelect.innerHTML = optionsHtml;
        voucherSelect.value = order.idVoucher ? String(order.idVoucher) : '';
      }
    }
  } catch (e) {
    console.warn('Lỗi tải danh sách voucher:', e);
  }

  // 4. Cập nhật tiền giảm và tổng thanh toán
  const discount = order.tienGiamVoucher || 0;
  const total = Math.max(0, subtotal - discount);

  if (elVoucherDiscount) elVoucherDiscount.textContent = `-${formatCurrency(discount)}`;
  if (elTotal) elTotal.textContent = formatCurrency(total);

  // 5. Cập nhật hình thức thanh toán & tiền trả lại
  const payMethodInput = document.querySelector('input[name="posPayMethod"]:checked');
  const payMethod = payMethodInput ? payMethodInput.value : 'TIEN_MAT';
  order.payMethod = payMethod;

  let given = parseInt(givenInput?.value) || 0;
  if (payMethod !== 'TIEN_MAT') {
    if (givenInput) givenInput.value = total;
    given = total;
  }
  const change = Math.max(0, given - total);
  if (elChange) elChange.textContent = formatCurrency(change);
}

// Xử lý sự kiện nhân viên chọn Voucher từ dropdown
window.onPosVoucherChange = async function() {
  const order = getActivePosOrder();
  if (!order) return;

  const voucherSelect = document.getElementById('posVoucherSelect');
  const val = voucherSelect?.value;
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (!val) {
    order.idVoucher = null;
    order.maVoucher = '';
    order.tienGiamVoucher = 0;
    updatePosCalculations();
    showToast('Đã hủy áp dụng Voucher');
    return;
  }

  const voucherId = parseInt(val);
  try {
    const res = await fetch(`${API_BASE_URL}/vouchers/calculate-discount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idVoucher: voucherId, tongTienHang: subtotal })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.hopLe) {
        order.idVoucher = data.idVoucher;
        order.maVoucher = data.maVoucher;
        order.tienGiamVoucher = Number(data.tienGiamVoucher) || 0;
        updatePosCalculations();
        showToast(`Áp dụng Voucher ${data.maVoucher} thành công.`);
      } else {
        order.idVoucher = null;
        order.maVoucher = '';
        order.tienGiamVoucher = 0;
        if (voucherSelect) voucherSelect.value = '';
        updatePosCalculations();
        showToast(data.thongBao || 'Voucher không đủ điều kiện!', 'error');
      }
    } else {
      const err = await res.json().catch(() => ({}));
      order.idVoucher = null;
      order.maVoucher = '';
      order.tienGiamVoucher = 0;
      if (voucherSelect) voucherSelect.value = '';
      updatePosCalculations();
      showToast(err.message || 'Lỗi khi kiểm tra Voucher!', 'error');
    }
  } catch (err) {
    showToast('Không thể kết nối đến máy chủ để kiểm tra Voucher', 'error');
  }
};

window.updatePosCalculations = function() {
  const order = getActivePosOrder();
  if (!order) return;

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discount = order.tienGiamVoucher || 0;
  const total = Math.max(0, subtotal - discount);

  const givenInput = document.getElementById('posCustomerGivenInput');
  let given = parseInt(givenInput?.value) || 0;

  const payMethodInput = document.querySelector('input[name="posPayMethod"]:checked');
  const payMethod = payMethodInput ? payMethodInput.value : 'TIEN_MAT';
  order.payMethod = payMethod;

  if (payMethod !== 'TIEN_MAT') {
    if (givenInput) givenInput.value = total;
    given = total;
  }

  const change = Math.max(0, given - total);

  const elSubtotal = document.getElementById('posSubtotal');
  const elVoucherDiscount = document.getElementById('posVoucherDiscount');
  const elTotal = document.getElementById('posTotal');
  const elChange = document.getElementById('posChangeDue');

  if (elSubtotal) elSubtotal.textContent = formatCurrency(subtotal);
  if (elVoucherDiscount) elVoucherDiscount.textContent = `-${formatCurrency(discount)}`;
  if (elTotal) elTotal.textContent = formatCurrency(total);
  if (elChange) elChange.textContent = formatCurrency(change);
};

// ============================================================================
// MODAL: POS PRODUCT PICKER
// ============================================================================
window.openPosProductPickerModal = async function() {
  const modal = document.getElementById('posProductPickerModal');
  if (!modal) return;
  modal.classList.add('active');
  await loadProductsList();
  renderPosPickerProducts(state.productsList);
  const search = document.getElementById('posProductSearchInput');
  if (search) {
    search.value = '';
    search.focus();
  }
};

window.closePosProductPickerModal = function() {
  const modal = document.getElementById('posProductPickerModal');
  if (modal) modal.classList.remove('active');
};

function renderPosPickerProducts(products) {
  const grid = document.getElementById('posPickerGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!products || products.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; padding:20px; text-align:center; color:var(--admin-text-muted);">Không tìm thấy sản phẩm nào.</div>';
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'pos-picker-card';

    const sp = p.sanPham || {};
    const imgUrl = (p.danhSachHinhAnh && p.danhSachHinhAnh[0] && p.danhSachHinhAnh[0].urlHinhAnh) ||
                   (sp.danhSachHinhAnh && sp.danhSachHinhAnh[0] && sp.danhSachHinhAnh[0].urlHinhAnh) ||
                   'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=300&q=80';
    const name = sp.tenSp || 'Laptop';
    const giaGoc = Number(p.gia || sp.giaCoBan || 0);
    const coKm = Boolean(p.coKhuyenMai);
    const giaBan = (coKm && p.giaBan !== undefined && p.giaBan !== null) ? Number(p.giaBan) : giaGoc;
    const cpu = p.cpu?.tenCpu || '';
    const ram = p.ram ? `${p.ram.dungLuong || ''} ${p.ram.loaiRam || ''}` : '';
    const ssd = p.ocung ? `${p.ocung.loaiOCung || ''} ${p.ocung.dungLuong || ''}` : '';
    const specs = [cpu, ram, ssd].filter(Boolean).join(' / ');

    const availableStock = (p.soLuong !== undefined && p.soLuong !== null) ? Number(p.soLuong) : 0;
    const isOutOfStock = (availableStock <= 0);

    let discountBadge = '';
    if (coKm) {
      if (p.loaiGiam === 1) {
        discountBadge = `<span style="background:#fee2e2; color:#ef4444; font-size:0.65rem; font-weight:800; padding:1px 5px; border-radius:3px; margin-left:4px;">-${p.giaTriGiam}%</span>`;
      } else if (p.loaiGiam === 2) {
        discountBadge = `<span style="background:#fee2e2; color:#ef4444; font-size:0.65rem; font-weight:800; padding:1px 5px; border-radius:3px; margin-left:4px;">Giảm ${formatCurrency(p.giaTriGiam)}</span>`;
      }
    }

    card.innerHTML = `
      <img src="${imgUrl}" alt="${name}" class="pos-picker-img" style="${isOutOfStock ? 'filter: grayscale(80%); opacity: 0.7;' : ''}">
      <div class="pos-picker-title">${name}</div>
      <div style="font-size:0.7rem; color:var(--admin-text-muted); margin-bottom:6px;">${specs}</div>
      <div style="font-size:0.75rem; color:${isOutOfStock ? '#ef4444' : 'var(--admin-success)'}; margin-bottom:4px; font-weight:700;">
        ${isOutOfStock ? 'Hết hàng (0 máy)' : `Kho: ${availableStock} máy`}
      </div>
      <div class="pos-picker-price">
        <span style="font-weight:800; color:${isOutOfStock ? '#94a3b8' : 'var(--admin-primary)'};">${formatCurrency(giaBan)}</span>
        ${coKm ? `<span style="font-size:0.75rem; text-decoration:line-through; color:var(--admin-text-muted); margin-left:4px;">${formatCurrency(giaGoc)}</span> ${discountBadge}` : ''}
      </div>
      ${isOutOfStock ? `
        <button class="btn-admin btn-sm" style="margin-top:8px; width:100%; justify-content:center; background:#f1f5f9; color:#94a3b8; border:1px solid #cbd5e1; cursor:not-allowed;" type="button" disabled>
          Hết hàng
        </button>
      ` : `
        <button class="btn-admin btn-primary btn-sm" style="margin-top:8px; width:100%; justify-content:center;" type="button">
          + Chọn mua
        </button>
      `}
    `;

    card.onclick = () => {
      if (isOutOfStock) {
        showToast(`Sản phẩm "${name}" hiện đã hết hàng khả dụng trong kho!`, 'warning');
        return;
      }
      posAddProductToActiveOrder({
        ctspId: p.id,
        name: name,
        specs: specs,
        price: giaBan,
        originalPrice: giaGoc,
        coKhuyenMai: coKm,
        image: imgUrl
      });
    };

    grid.appendChild(card);
  });
}

window.filterPosPickerProducts = function() {
  const query = (document.getElementById('posProductSearchInput')?.value || '').toLowerCase().trim();
  if (!query) {
    renderPosPickerProducts(state.productsList);
    return;
  }
  const filtered = state.productsList.filter(p => {
    const sp = p.sanPham || {};
    const text = `${sp.tenSp || ''} ${sp.thuongHieu?.tenThuongHieu || ''} ${p.cpu?.tenCpu || ''} ${p.ram?.dungLuong || ''} ${p.ocung?.dungLuong || ''}`.toLowerCase();
    return text.includes(query);
  });
  renderPosPickerProducts(filtered);
};

function posAddProductToActiveOrder(itemData) {
  const order = getActivePosOrder();
  if (!order) return;

  const productInfo = (state.productsList || []).find(p => p.id === itemData.ctspId);
  const maxStock = (productInfo && productInfo.soLuong !== undefined) ? Number(productInfo.soLuong) : 999;

  const existing = order.items.find(i => i.ctspId === itemData.ctspId);
  if (existing) {
    if (existing.qty >= maxStock) {
      showToast(`Số lượng tồn kho khả dụng chỉ còn ${maxStock} máy!`, 'warning');
      return;
    }
    existing.qty += 1;
    showToast(`Đã tăng số lượng: ${itemData.name} (x${existing.qty})`);
  } else {
    if (maxStock <= 0) {
      showToast(`Sản phẩm này hiện đã hết hàng trong kho!`, 'warning');
      return;
    }
    order.items.push({
      ctspId: itemData.ctspId,
      name: itemData.name,
      specs: itemData.specs,
      price: itemData.price,
      image: itemData.image,
      qty: 1,
      selectedImeis: []
    });
    showToast(`Đã thêm: ${itemData.name}`);
  }

  renderPosOrderTabs();
  renderPosCart();
}

// Submit POS Checkout & Create Invoice
window.submitPosCheckout = async function(isCompleted = true) {
  const order = getActivePosOrder();
  if (!order || order.items.length === 0) {
    showToast('Vui lòng chọn ít nhất 1 sản phẩm vào đơn hàng!', 'error');
    return;
  }

  // Validate chọn đủ IMEI cho từng sản phẩm
  for (const item of order.items) {
    const selected = item.selectedImeis || [];
    if (selected.length !== item.qty) {
      showToast(`${item.name} cần chọn đủ ${item.qty} IMEI trước khi xác nhận hóa đơn (hiện chọn: ${selected.length})!`, 'error');
      return;
    }
  }

  const custSelect = document.getElementById('posCustomerSelect');
  const phoneInput = document.getElementById('posCustomerPhone');
  const cashierSelect = document.getElementById('posCashierSelect');
  const noteInput = document.getElementById('posOrderNote');
  const givenInput = document.getElementById('posCustomerGivenInput');

  const currentUser = getLoggedInUser();
  const customerId = parseInt(custSelect?.value) || 1;
  const cashierId = (currentUser && currentUser.id) ? currentUser.id : (parseInt(cashierSelect?.value) || 4);
  const phone = phoneInput?.value || '0988888888';
  const note = noteInput?.value || '';
  const customerName = custSelect?.options[custSelect.selectedIndex]?.getAttribute('data-name') || 'Khách lẻ tại quầy';
  const isGiaoHang = (order.deliveryType === 'GIAO_HANG');
  const addressInput = document.getElementById('posCustomerAddress');
  const customerAddress = isGiaoHang ? (addressInput?.value?.trim() || order.customerAddress || 'Địa chỉ giao hàng') : 'Tại quầy Store';
  order.customerAddress = customerAddress;

  const orderCode = 'HD' + Math.floor(Date.now() / 1000);

  // Validate tiền khách đưa nếu thanh toán tiền mặt và hoàn thành
  const subtotal = order.items.reduce((s, i) => s + (i.price * i.qty), 0);
  const discount = order.tienGiamVoucher || 0;
  const total = Math.max(0, subtotal - discount);

  let given = parseInt(givenInput?.value) || 0;
  if (order.payMethod !== 'TIEN_MAT') {
    given = total;
  } else if (isCompleted && given < total) {
    showToast(`Tiền khách đưa (${formatCurrency(given)}) không đủ để thanh toán đơn hàng (${formatCurrency(total)})!`, 'error');
    return;
  }

  const checkoutPayload = {
    ma: orderCode,
    customerId: customerId,
    cashierId: cashierId,
    customerName: customerName,
    phone: phone,
    address: customerAddress,
    deliveryType: order.deliveryType || 'TAI_QUAY',
    payMethod: order.payMethod || 'TIEN_MAT',
    customerGiven: given,
    isCompleted: isCompleted,
    note: note,
    idVoucher: order.idVoucher || null,
    items: order.items.map(i => ({
      ctspId: i.ctspId,
      qty: i.qty,
      imeiIds: (i.selectedImeis || []).map(im => im.id)
    }))
  };

  try {
    const btn = document.getElementById('btnPosCheckout');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'ĐANG XỬ LÝ...';
    }

    const res = await fetch(`${API_BASE_URL}/hoa-don/pos-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutPayload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.message || 'Lỗi khi thực hiện thanh toán tại quầy!', 'error');
      return;
    }

    const createdHoaDon = await res.json();
    showToast(`Đã ${isCompleted ? 'thanh toán thành công' : 'xác nhận hóa đơn'}: ${createdHoaDon.ma}`);

    // In hóa đơn nếu thanh toán thành công
    if (isCompleted) {
      printReceiptDirectly(createdHoaDon, order);
    }

    // Đóng tab hoặc làm mới hóa đơn
    if (state.posOrders.length > 1) {
      posCloseOrderTab(order.id);
    } else {
      order.items = [];
      order.idVoucher = null;
      order.maVoucher = '';
      order.tienGiamVoucher = 0;
      order.note = '';
      order.customerAddress = 'Tại quầy Store';
      order.deliveryType = 'TAI_QUAY';
      renderPosOrderTabs();
      renderPosCart();
    }

    // Refresh danh sách hóa đơn trong tab Quản lý Hóa Đơn và cập nhật số lượng tồn kho
    loadInvoicesList();
    await loadProductsList();

  } catch (err) {
    console.error('Error in POS checkout:', err);
    showToast('Lỗi khi lưu hóa đơn: ' + err.message, 'error');
  } finally {
    const btn = document.getElementById('btnPosCheckout');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'THANH TOÁN & IN HÓA ĐƠN';
    }
  }
};

// ============================================================================
// POS IMEI PICKER MODAL LOGIC
// ============================================================================
let posPickerCurrentItemIndex = null;
let posPickerAvailableImeis = [];
let posPickerSelectedIds = new Set();
let posPickerRequiredQty = 1;
let posPickerSearchQuery = '';

window.openPosImeiPicker = async function(itemIndex) {
  const order = getActivePosOrder();
  if (!order || !order.items[itemIndex]) return;

  const item = order.items[itemIndex];
  posPickerCurrentItemIndex = itemIndex;
  posPickerRequiredQty = item.qty;
  posPickerSearchQuery = '';
  posPickerSelectedIds = new Set((item.selectedImeis || []).map(im => im.id));

  // Populate header & info
  const nameEl = document.getElementById('posImeiModalProdName');
  const ctspEl = document.getElementById('posImeiModalCtspMa');
  const reqQtyEl = document.getElementById('posImeiModalRequiredQty');
  const searchInput = document.getElementById('posImeiSearchInput');
  const container = document.getElementById('posImeiListContainer');

  if (nameEl) nameEl.textContent = item.name;
  if (ctspEl) ctspEl.textContent = item.specs ? `Cấu hình: ${item.specs}` : `CTSP: ${item.ctspId}`;
  if (reqQtyEl) reqQtyEl.textContent = item.qty;
  if (searchInput) searchInput.value = '';

  if (container) {
    container.innerHTML = '<div style="text-align:center; padding:25px; color:#64748b;">Đang tải danh sách IMEI khả dụng...</div>';
  }

  const modal = document.getElementById('posImeiPickerModal');
  if (modal) modal.classList.add('active');

  try {
    const res = await fetch(`${API_BASE_URL}/imei/chi-tiet-san-pham/${item.ctspId}/kha-dung`);
    if (res.ok) {
      let imeis = await res.json();

      // Collect IMEI IDs already chosen in OTHER items of this POS order
      const otherItemsChosenImeiIds = new Set();
      order.items.forEach((it, idx) => {
        if (idx !== itemIndex && it.selectedImeis) {
          it.selectedImeis.forEach(im => otherItemsChosenImeiIds.add(im.id));
        }
      });

      // Filter out IMEIs chosen in other items of the same order
      posPickerAvailableImeis = imeis.filter(im => !otherItemsChosenImeiIds.has(im.id));
      renderPosImeiList();
    } else {
      if (container) {
        container.innerHTML = '<div style="color:#dc2626; text-align:center; padding:20px;">Không thể tải danh sách IMEI khả dụng.</div>';
      }
    }
  } catch (err) {
    console.error('Error fetching available IMEIs for POS:', err);
    if (container) {
      container.innerHTML = `<div style="color:#dc2626; text-align:center; padding:20px;">Lỗi kết nối: ${err.message}</div>`;
    }
  }
};

window.closePosImeiPickerModal = function() {
  const modal = document.getElementById('posImeiPickerModal');
  if (modal) modal.classList.remove('active');
  posPickerCurrentItemIndex = null;
  posPickerAvailableImeis = [];
  posPickerSelectedIds = new Set();
};

window.onPosImeiSearch = function(query) {
  posPickerSearchQuery = query;
  renderPosImeiList();
};

function renderPosImeiList() {
  const container = document.getElementById('posImeiListContainer');
  const badge = document.getElementById('posImeiModalBadge');
  const countText = document.getElementById('posImeiAvailCount');
  const confirmBtn = document.getElementById('btnPosImeiConfirm');
  if (!container) return;

  const countSelected = posPickerSelectedIds.size;
  const isFull = (countSelected >= posPickerRequiredQty);

  if (badge) {
    badge.textContent = `Đã chọn: ${countSelected}/${posPickerRequiredQty} ${isFull ? '✓' : ''}`;
    badge.className = `badge-status ${isFull ? 'badge-pay-paid' : 'badge-pay-unpaid'}`;
  }

  if (countText) {
    countText.innerHTML = `<strong style="color:#2563eb;">${posPickerAvailableImeis.length}</strong> IMEI khả dụng`;
  }

  if (confirmBtn) {
    confirmBtn.disabled = !isFull;
    confirmBtn.style.opacity = isFull ? '1' : '0.5';
    confirmBtn.style.cursor = isFull ? 'pointer' : 'not-allowed';
  }

  if (!posPickerAvailableImeis || posPickerAvailableImeis.length === 0) {
    container.innerHTML = `
      <div style="color:#dc2626; font-size:0.84rem; font-weight:600; text-align:center; padding:25px 10px; background:#fef2f2; border:1px dashed #fca5a5; border-radius:6px;">
        Không còn IMEI khả dụng trong kho cho cấu hình này.
      </div>
    `;
    return;
  }

  const query = (posPickerSearchQuery || '').trim().toLowerCase();
  const filtered = query
    ? posPickerAvailableImeis.filter(im => (im.soImei || '').toLowerCase().includes(query))
    : posPickerAvailableImeis;

  if (filtered.length === 0) {
    const safeQ = (query || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    container.innerHTML = `
      <div style="color:#64748b; font-size:0.84rem; font-style:italic; text-align:center; padding:25px 10px;">
        Không tìm thấy IMEI nào khớp với "<strong>${safeQ}</strong>"
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:8px;">
      ${filtered.map(im => {
        const isChecked = posPickerSelectedIds.has(im.id);
        const isDisabled = isFull && !isChecked;
        const bgStyle = isChecked
          ? 'background:#eff6ff; border-color:#3b82f6; box-shadow:0 0 0 1px #3b82f6;'
          : (isDisabled
              ? 'background:#f1f5f9; border-color:#e2e8f0; opacity:0.5; cursor:not-allowed;'
              : 'background:#fff; border-color:#cbd5e1; cursor:pointer;');

        return `
          <label style="display:flex; align-items:center; gap:8px; border:1px solid; border-radius:6px; padding:7px 10px; font-size:0.84rem; user-select:none; transition:all 0.15s ease; ${bgStyle}">
            <input type="checkbox"
                   value="${im.id}"
                   ${isChecked ? 'checked' : ''}
                   ${isDisabled ? 'disabled' : ''}
                   onchange="onPosImeiToggle(${im.id}, this.checked)"
                   style="width:16px; height:16px; cursor:${isDisabled ? 'not-allowed' : 'pointer'}; accent-color:#2563eb;">
            <span style="font-family:monospace; font-weight:700; color:${isChecked ? '#1d4ed8' : (isDisabled ? '#94a3b8' : '#1e293b')};">${im.soImei}</span>
          </label>
        `;
      }).join('')}
    </div>
  `;
}

window.onPosImeiToggle = function(imeiId, isChecked) {
  if (isChecked) {
    if (posPickerSelectedIds.size >= posPickerRequiredQty) {
      showToast(`Chỉ được chọn tối đa ${posPickerRequiredQty} IMEI cho sản phẩm này!`, 'warning');
      renderPosImeiList();
      return;
    }
    posPickerSelectedIds.add(imeiId);
  } else {
    posPickerSelectedIds.delete(imeiId);
  }
  renderPosImeiList();
};

window.confirmPosImeiSelection = function() {
  const order = getActivePosOrder();
  if (!order || posPickerCurrentItemIndex === null || !order.items[posPickerCurrentItemIndex]) {
    closePosImeiPickerModal();
    return;
  }

  const item = order.items[posPickerCurrentItemIndex];
  if (posPickerSelectedIds.size !== item.qty) {
    showToast(`Vui lòng chọn đúng ${item.qty} IMEI trước khi xác nhận!`, 'warning');
    return;
  }

  // Find full objects for selected IDs
  item.selectedImeis = posPickerAvailableImeis.filter(im => posPickerSelectedIds.has(im.id));
  showToast(`Đã chọn ${item.selectedImeis.length} IMEI cho ${item.name}!`, 'success');
  closePosImeiPickerModal();
  renderPosCart();
};

// ============================================================================
// PART 2: QUẢN LÝ HÓA ĐƠN & TRẠNG THÁI THANH TOÁN (MATCHING SCREENSHOT)
// ============================================================================

const ORDER_STATUS_MAP = {
  0: { label: 'Chờ xác nhận', badgeClass: 'badge-order-0', stepTitle: 'Chờ xác nhận' },
  1: { label: 'Đã xác nhận', badgeClass: 'badge-order-1', stepTitle: 'Đã xác nhận' },
  2: { label: 'Đang giao hàng', badgeClass: 'badge-order-2', stepTitle: 'Đang giao hàng' },
  3: { label: 'Hoàn thành', badgeClass: 'badge-order-3', stepTitle: 'Hoàn thành' },
  4: { label: 'Đã hủy', badgeClass: 'badge-order-4', stepTitle: 'Đã hủy' }
};

function formatInvoiceDate(dateStr) {
  if (!dateStr) return '---';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month} ${hours}:${minutes}`;
}

window.loadInvoicesList = async function() {
  const loading = document.getElementById('invoicesLoadingIndicator');
  if (loading) loading.style.display = 'block';

  try {
    const res = await fetch(`${API_BASE_URL}/hoa-don`);
    if (res.ok) {
      state.invoicesList = await res.json();
    } else {
      state.invoicesList = getFallbackInvoices();
    }
  } catch (err) {
    state.invoicesList = getFallbackInvoices();
  } finally {
    if (loading) loading.style.display = 'none';
  }

  // Sort descending by ID or creation date
  state.invoicesList.sort((a, b) => (b.id || 0) - (a.id || 0));

  populateInvoiceStaffFilter();
  updateInvoiceStats();
  filterInvoices();
};

function populateInvoiceStaffFilter() {
  const select = document.getElementById('filterInvoiceStaff');
  if (!select) return;
  const currentVal = select.value;
  const staffMap = new Map();
  state.invoicesList.forEach(inv => {
    if (inv.nhanVien && inv.nhanVien.id) {
      staffMap.set(String(inv.nhanVien.id), {
        id: inv.nhanVien.id,
        ten: inv.nhanVien.ten || 'Nhân viên',
        ma: inv.nhanVien.ma || ''
      });
    }
  });

  select.innerHTML = '<option value="ALL">Tất cả nhân viên</option>';
  staffMap.forEach(staff => {
    const opt = document.createElement('option');
    opt.value = String(staff.id);
    opt.textContent = `${staff.ten} (${staff.ma || 'NV' + staff.id})`;
    select.appendChild(opt);
  });

  if (currentVal && (currentVal === 'ALL' || staffMap.has(currentVal))) {
    select.value = currentVal;
  }
}

function updateInvoiceStats() {
  const total = state.invoicesList.length;
  const pending = state.invoicesList.filter(i => i.trangThai === 0).length;
  const shipping = state.invoicesList.filter(i => i.trangThai === 2).length;
  const completed = state.invoicesList.filter(i => i.trangThai === 3);

  let revenue = 0;
  completed.forEach(c => {
    revenue += (c.thanhToan?.soTien || 0);
  });

  const elTotal = document.getElementById('statTotalInvoices');
  const elPending = document.getElementById('statPendingInvoices');
  const elShipping = document.getElementById('statShippingInvoices');
  const elRevenue = document.getElementById('statRevenue');

  if (elTotal) elTotal.textContent = total;
  if (elPending) elPending.textContent = pending;
  if (elShipping) elShipping.textContent = shipping;
  if (elRevenue) elRevenue.textContent = formatCurrency(revenue);

  const elBadge = document.getElementById('invoiceCountBadge');
  if (elBadge) elBadge.textContent = `${total} hóa đơn`;
}

window.resetInvoiceFilters = function() {
  const q = document.getElementById('searchInvoiceInput');
  const st = document.getElementById('filterInvoiceStatus');
  const paySt = document.getElementById('filterInvoicePaymentStatus');
  const payM = document.getElementById('filterInvoicePaymentMethod');
  const staffSel = document.getElementById('filterInvoiceStaff');
  const fDate = document.getElementById('filterInvoiceFromDate');
  const tDate = document.getElementById('filterInvoiceToDate');
  if (q) q.value = '';
  if (st) st.value = 'ALL';
  if (paySt) paySt.value = 'ALL';
  if (payM) payM.value = 'ALL';
  if (staffSel) staffSel.value = 'ALL';
  if (fDate) fDate.value = '';
  if (tDate) tDate.value = '';
  filterInvoices();
};

window.filterInvoices = function() {
  const query = (document.getElementById('searchInvoiceInput')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('filterInvoiceStatus')?.value || 'ALL';
  const payStatusFilter = document.getElementById('filterInvoicePaymentStatus')?.value || 'ALL';
  const payMethodFilter = document.getElementById('filterInvoicePaymentMethod')?.value || 'ALL';
  const staffFilter = document.getElementById('filterInvoiceStaff')?.value || 'ALL';
  const fromDate = document.getElementById('filterInvoiceFromDate')?.value;
  const toDate = document.getElementById('filterInvoiceToDate')?.value;

  state.filteredInvoices = state.invoicesList.filter(inv => {
    // 1. Trạng thái đơn hàng
    if (statusFilter !== 'ALL' && String(inv.trangThai) !== statusFilter) {
      return false;
    }

    // 2. Trạng thái thanh toán (0: Chưa thanh toán, 1: Đã thanh toán)
    const isPaid = (inv.thanhToan?.trangThai === 1);
    if (payStatusFilter !== 'ALL') {
      if (payStatusFilter === '1' && !isPaid) return false;
      if (payStatusFilter === '0' && isPaid) return false;
    }

    // 3. Phương thức thanh toán
    if (payMethodFilter !== 'ALL') {
      const pm = (inv.thanhToan?.phuongThuc || '').toLowerCase();
      if (!pm.includes(payMethodFilter.toLowerCase())) {
        return false;
      }
    }

    // 4. Lọc theo nhân viên bán hàng
    if (staffFilter !== 'ALL') {
      if (!inv.nhanVien || String(inv.nhanVien.id) !== staffFilter) {
        return false;
      }
    }

    // 5. Lọc theo khoảng ngày
    if (fromDate && inv.ngayTao) {
      const invDate = new Date(inv.ngayTao).toISOString().slice(0, 10);
      if (invDate < fromDate) return false;
    }
    if (toDate && inv.ngayTao) {
      const invDate = new Date(inv.ngayTao).toISOString().slice(0, 10);
      if (invDate > toDate) return false;
    }

    // 6. Tìm kiếm theo mã HĐ, tên KH, SĐT, tên nhân viên, mã nhân viên
    if (query) {
      const ma = (inv.ma || '').toLowerCase();
      const tenKh = (inv.tenNguoiNhan || inv.khachHang?.ten || '').toLowerCase();
      const phone = (inv.dienThoai || inv.khachHang?.dienThoai || '').toLowerCase();
      const staffName = (inv.nhanVien?.ten || '').toLowerCase();
      const staffCode = (inv.nhanVien?.ma || '').toLowerCase();
      return ma.includes(query) || tenKh.includes(query) || phone.includes(query) || staffName.includes(query) || staffCode.includes(query);
    }

    return true;
  });

  renderInvoicesTable();
};

function renderInvoicesTable() {
  const tbody = document.getElementById('invoicesTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (state.filteredInvoices.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding:35px; color:var(--admin-text-muted);">
          Không tìm thấy hóa đơn nào phù hợp với bộ lọc tìm kiếm.
        </td>
      </tr>
    `;
    return;
  }

  state.filteredInvoices.forEach((inv, index) => {
    const stConfig = ORDER_STATUS_MAP[inv.trangThai] || { label: 'Không xác định', badgeClass: 'badge-order-0' };
    const isPaid = (inv.thanhToan?.trangThai === 1);
    const dateFormatted = formatInvoiceDate(inv.ngayTao);
    const customerName = inv.tenNguoiNhan || inv.khachHang?.ten || 'Khách lẻ tại quầy';
    const phone = inv.dienThoai || inv.khachHang?.dienThoai || '---';
    const totalAmount = inv.thanhToan?.soTien || 0;
    const payMethod = inv.thanhToan?.phuongThuc || 'COD';
    const hasStaff = inv.nhanVien && (inv.nhanVien.ten || inv.nhanVien.ma);
    const staffName = inv.nhanVien?.ten || 'Nhân viên';
    const staffCode = inv.nhanVien?.ma || '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align:center; font-weight:700; color:var(--admin-text-muted);">${index + 1}</td>
      <td style="text-align:center; font-weight:800; color:var(--admin-primary);">${inv.ma || 'HD' + inv.id}</td>
      <td style="text-align:center; font-size:0.83rem; color:#334155;">${dateFormatted}</td>
      <td style="text-align:left;">
        <div style="font-weight:700; color:#0f172a;">${customerName}</div>
        <div style="font-size:0.75rem; color:var(--admin-text-muted);">${phone}</div>
      </td>
      <td style="text-align:left;">
        ${hasStaff ? `
          <div style="font-weight:700; color:#0f172a; display:flex; align-items:center; gap:5px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#64748b; flex-shrink:0;">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>${staffName}</span>
          </div>
          ${staffCode ? `<div style="font-size:0.75rem; color:var(--admin-text-muted); margin-left:18px; font-weight:600;">${staffCode}</div>` : ''}
        ` : `
          <span style="color:#94a3b8; font-style:italic; font-size:0.86rem; font-weight:500;">Chưa có</span>
        `}
      </td>
      <td style="text-align:right; font-weight:800; color:#0f172a; padding-right:14px;">${formatCurrency(totalAmount)}</td>
      <td style="text-align:center; font-weight:600; color:#475569;">${payMethod}</td>
      <td style="text-align:center;">
        <span class="badge-status ${stConfig.badgeClass}">● ${stConfig.label}</span>
      </td>
      <td style="text-align:center;">
        <span class="badge-status ${isPaid ? 'badge-pay-paid' : 'badge-pay-unpaid'}">
          ● ${isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </span>
      </td>
      <td style="text-align:center;">
        <div style="display:flex; justify-content:center; align-items:center;">
          <button class="btn-admin btn-outline btn-sm" onclick="openInvoiceDetail(${inv.id})" title="Xem chi tiết đơn hàng" style="display:inline-flex; align-items:center; gap:4px; font-weight:700; padding:5px 12px; font-size:0.82rem; border-color:#93c5fd; color:#1d4ed8;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>Xem</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Open Invoice Details Modal
window.openInvoiceDetail = async function(invoiceId) {
  let inv = state.invoicesList.find(i => i.id === invoiceId);
  if (!inv) return;

  // Try to fetch latest invoice data from API
  try {
    const res = await fetch(`${API_BASE_URL}/hoa-don/${invoiceId}`);
    if (res.ok) {
      inv = await res.json();
      const idx = state.invoicesList.findIndex(i => i.id === invoiceId);
      if (idx !== -1) state.invoicesList[idx] = inv;
    }
  } catch(e) {
    // Keep cached
  }

  state.selectedInvoice = inv;
  const modal = document.getElementById('invoiceDetailModal');
  if (!modal) return;

  // Fill Header & Meta
  document.getElementById('detailInvoiceMa').textContent = '#' + (inv.ma || 'HD' + inv.id);
  document.getElementById('dtlMa').textContent = inv.ma || 'HD' + inv.id;
  document.getElementById('dtlNgayDat').textContent = formatInvoiceDate(inv.ngayTao);
  
  const customerName = inv.tenNguoiNhan || inv.khachHang?.ten || 'Khách lẻ tại quầy';
  const phone = inv.dienThoai || inv.khachHang?.dienThoai || '---';
  document.getElementById('dtlKhachHang').textContent = `${customerName} (${phone})`;

  const elStaff = document.getElementById('dtlNhanVien');
  if (elStaff) {
    if (inv.nhanVien && (inv.nhanVien.ten || inv.nhanVien.ma)) {
      const staffName = inv.nhanVien.ten || 'Nhân viên';
      const staffCode = inv.nhanVien.ma ? ` (${inv.nhanVien.ma})` : '';
      elStaff.textContent = `${staffName}${staffCode}`;
      elStaff.style.color = '#1e293b';
      elStaff.style.fontStyle = 'normal';
      elStaff.style.fontWeight = '700';
    } else {
      elStaff.textContent = 'Chưa có';
      elStaff.style.color = '#94a3b8';
      elStaff.style.fontStyle = 'italic';
      elStaff.style.fontWeight = '500';
    }
  }

  document.getElementById('dtlDiaChi').textContent = inv.diaChi || '123 Nguyễn Trãi, Hà Nội';
  document.getElementById('dtlGhiChu').textContent = inv.moTa || 'Giao giờ hành chính';

  // Badges
  const payMethod = inv.thanhToan?.phuongThuc || 'COD';
  const isPaid = (inv.thanhToan?.trangThai === 1);
  const stConfig = ORDER_STATUS_MAP[inv.trangThai] || { label: 'Không xác định', badgeClass: 'badge-order-0' };

  const pmBadge = document.getElementById('dtlPhuongThucBadge');
  if (pmBadge) pmBadge.textContent = payMethod;

  const stBadge = document.getElementById('dtlTrangThaiDonBadge');
  if (stBadge) {
    stBadge.className = `badge-status ${stConfig.badgeClass}`;
    stBadge.textContent = stConfig.label;
  }

  const payBadge = document.getElementById('dtlTrangThaiTTBadge');
  if (payBadge) {
    payBadge.className = `badge-status ${isPaid ? 'badge-pay-paid' : 'badge-pay-unpaid'}`;
    payBadge.textContent = isPaid ? 'Đã thanh toán' : 'Chưa thanh toán';
  }

  // Row Ngày thanh toán
  const payDateRow = document.getElementById('dtlNgayTTRow');
  const payDateVal = document.getElementById('dtlNgayTT');
  if (payDateRow && payDateVal) {
    if (isPaid) {
      payDateRow.style.display = 'flex';
      payDateVal.textContent = formatInvoiceDate(inv.thanhToan?.ngayThanhToan || inv.ngayTao);
    } else {
      payDateRow.style.display = 'none';
    }
  }

  const vRow = document.getElementById('dtlVoucherRow');
  const vCode = document.getElementById('dtlVoucherCode');
  const vTienRow = document.getElementById('dtlTienGiamVoucherRow');
  const vTienVal = document.getElementById('dtlTienGiamVoucher');
  if (inv.voucher || (inv.tienGiamVoucher && Number(inv.tienGiamVoucher) > 0)) {
    if (vRow) {
      vRow.style.display = 'flex';
      if (vCode) vCode.textContent = inv.voucher?.ma || inv.voucher?.maVoucher || 'Voucher';
    }
    if (vTienRow) {
      vTienRow.style.display = 'flex';
      if (vTienVal) vTienVal.textContent = '-' + formatCurrency(inv.tienGiamVoucher || 0);
    }
  } else {
    if (vRow) vRow.style.display = 'none';
    if (vTienRow) vTienRow.style.display = 'none';
  }

  const totalAmount = inv.thanhToan?.soTien || 45980000;
  document.getElementById('dtlTongTien').textContent = formatCurrency(totalAmount);

  // Render Stepper (Lịch sử trạng thái)
  renderInvoiceStepper(inv);

  // Load items from API: /chi-tiet-hoa-don/hoa-don/{id}
  const tbody = document.getElementById('detailItemsTableBody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--admin-text-muted);">Đang tải danh sách sản phẩm...</td></tr>';

  // Render footer action buttons
  renderInvoiceDetailActionButtons(inv);

  modal.classList.add('active');

  try {
    const res = await fetch(`${API_BASE_URL}/chi-tiet-hoa-don/hoa-don/${invoiceId}`);
    if (res.ok) {
      const items = await res.json();
      // Fetch IMEIs for each item
      for (const item of items) {
        try {
          const resImei = await fetch(`${API_BASE_URL}/chi-tiet-hoa-don-imei/chi-tiet-hoa-don/${item.id}`);
          if (resImei.ok) {
            const imeiLinks = await resImei.json();
            item.imeiList = imeiLinks.map(l => l.imei?.soImei).filter(Boolean);
          }
        } catch(e) {
          item.imeiList = [];
        }
      }
      state.selectedInvoiceItems = items;
    } else {
      state.selectedInvoiceItems = getMockInvoiceItems(inv);
    }
  } catch (err) {
    state.selectedInvoiceItems = getMockInvoiceItems(inv);
  }

  renderInvoiceDetailItems();
};

function renderInvoiceStepper(inv) {
  const container = document.getElementById('orderStepperContainer');
  if (!container) return;

  const currentStatus = inv.trangThai !== undefined ? inv.trangThai : 0;
  const isCancelled = (currentStatus === 4);

  // Standard steps
  const steps = [
    { id: 0, title: 'Chờ xác nhận', time: formatShortDate(inv.ngayTao) },
    { id: 1, title: 'Đã xác nhận', time: currentStatus >= 1 ? formatShortDate(inv.ngayTao) : '' },
    { id: 2, title: 'Đang giao hàng', time: currentStatus >= 2 ? formatShortDate(inv.ngayTao) : '' },
    { id: 3, title: 'Hoàn thành', time: currentStatus === 3 ? (formatShortDate(inv.thanhToan?.ngayThanhToan) || formatShortDate(inv.ngayTao)) : '' }
  ];

  if (isCancelled) {
    steps.push({ id: 4, title: 'Đã hủy', time: formatShortDate(inv.ngayTao) });
  }

  let html = '';
  steps.forEach((step, idx) => {
    let itemClass = '';
    let circleContent = `${idx + 1}`;

    if (isCancelled && step.id === 4) {
      itemClass = 'cancelled';
      circleContent = '&times;';
    } else if (!isCancelled && step.id < currentStatus) {
      itemClass = 'completed';
      circleContent = '&#10003;';
    } else if (!isCancelled && step.id === currentStatus) {
      itemClass = 'active';
      circleContent = (currentStatus === 3) ? '&#10003;' : '&#9679;';
    } else if (isCancelled && step.id < currentStatus) {
      itemClass = 'completed';
      circleContent = '&#10003;';
    }

    const hasLine = (idx < steps.length - 1);
    let lineClass = '';
    if (!isCancelled && step.id < currentStatus) {
      lineClass = (step.id + 1 <= currentStatus) ? 'completed' : '';
    }

    html += `
      <div class="order-stepper-item ${itemClass}">
        ${hasLine ? `<div class="order-stepper-line ${lineClass}"></div>` : ''}
        <div class="order-stepper-circle">${circleContent}</div>
        <div class="order-stepper-title">${step.title}</div>
        <div class="order-stepper-time">${step.time || '&nbsp;'}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderInvoiceDetailItems() {
  const tbody = document.getElementById('detailItemsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  let total = 0;
  if (!state.selectedInvoiceItems || state.selectedInvoiceItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--admin-text-muted);">Không có chi tiết sản phẩm.</td></tr>';
  } else {
    state.selectedInvoiceItems.forEach((item, idx) => {
      const ctsp = item.chiTietSanPham || {};
      const sp = ctsp.sanPham || {};
      const name = sp.tenSp || 'ASUS TUF Gaming A15';
      const qty = item.soLuong || 1;
      const unitPrice = item.giaTungSanPham || ctsp.gia || 22990000;
      const lineTotal = unitPrice * qty;
      total += lineTotal;

      const imgUrl = (ctsp.danhSachHinhAnh && ctsp.danhSachHinhAnh[0]?.urlHinhAnh) ||
                     (sp.danhSachHinhAnh && sp.danhSachHinhAnh[0]?.urlHinhAnh) ||
                     'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=120&q=80';

      const cpu = ctsp.cpu?.tenCpu || 'Intel Core i7-13650HX';
      const ram = ctsp.ram ? `${ctsp.ram.dungLuong || '16GB'}` : '16GB';
      const ssd = ctsp.ocung ? `${ctsp.ocung.dungLuong || '512GB'}` : '512GB';
      const gpu = ctsp.cardDoHoa?.tenCard || 'RTX 4060';
      const screen = ctsp.manHinh?.kichThuoc || '15.6"';
      const specsDetail = `${cpu} / ${ram} / ${ssd} / ${gpu} / ${screen}`;

      // IMEIs
      let imeiHtml = '';
      if (item.imeiList && item.imeiList.length > 0) {
        imeiHtml = item.imeiList.map(im => `
          <div style="font-family:monospace; font-size:11px; background:#eff6ff; color:#1e40af; padding:2px 6px; border-radius:4px; border:1px solid #bfdbfe; margin-bottom:2px; font-weight:700;">
            ${im}
          </div>
        `).join('');
      } else {
        imeiHtml = '<span style="color:#94a3b8; font-style:italic; font-size:0.86rem; font-weight:500;">Chưa phân bổ</span>';
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align:center; font-weight:700; color:var(--admin-text-muted);">${idx + 1}</td>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${imgUrl}" alt="${name}" style="width:50px; height:45px; object-fit:contain; border-radius:4px; border:1px solid var(--admin-border); background:#fff; padding:2px;">
            <div>
              <div style="font-weight:800; color:#0f172a; font-size:0.92rem;">${name}</div>
              <div style="font-size:0.75rem; color:var(--admin-text-muted);">Mã: ${ctsp.maCtsp || 'CTSP' + (ctsp.id || '')} (x${qty})</div>
            </div>
          </div>
        </td>
        <td style="font-size:0.82rem; color:#334155; line-height:1.4;">${specsDetail}</td>
        <td>${imeiHtml}</td>
        <td style="text-align:right; font-weight:700; color:#475569;">${formatCurrency(unitPrice)}</td>
        <td style="text-align:right; font-weight:900; color:#0f172a;">${formatCurrency(lineTotal)}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function renderInvoiceDetailActionButtons(inv) {
  const container = document.getElementById('detailActionButtonsContainer');
  if (!container) return;

  const currentStatus = inv.trangThai !== undefined ? inv.trangThai : 0;
  const isPaid = (inv.thanhToan?.trangThai === 1);
  const payMethod = (inv.thanhToan?.phuongThuc || 'COD').toUpperCase();
  const isCod = payMethod.includes('COD');

  let actionBtnsHtml = '';

  // 1. Trạng thái: Chờ xác nhận (0)
  if (currentStatus === 0) {
    actionBtnsHtml += `
      <button class="btn-admin btn-danger btn-outline" onclick="proceedOrderAction(${inv.id}, 'huy')" type="button">
        Hủy Đơn
      </button>
      <button class="btn-admin btn-primary" onclick="openConfirmAcceptOrderModal(${inv.id})" type="button" style="font-weight:700;">
        Xác Nhận Đơn Hàng
      </button>
    `;
  }
  // 2. Trạng thái: Đã xác nhận (1)
  else if (currentStatus === 1) {
    const isAtStore = (inv.diaChi === 'Tại quầy Store' || (inv.moTa && inv.moTa.includes('Nhận tại quầy')))
                      && !(inv.moTa && inv.moTa.includes('Giao hàng tận nơi'));
    if (isAtStore) {
      actionBtnsHtml += `
        <button class="btn-admin btn-danger btn-outline" onclick="proceedOrderAction(${inv.id}, 'huy')" type="button">
          Hủy Đơn
        </button>
      `;
      if (!isPaid) {
        actionBtnsHtml += `
          <button class="btn-admin btn-primary" onclick="openConfirmPrepaymentModal(${inv.id})" type="button" style="background:#16a34a; border-color:#16a34a; font-weight:800; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 6px rgba(22,163,74,0.3);">
            <span>&#128179; Thanh Toán Tại Quầy</span>
          </button>
        `;
      }
    } else {
      // CASE A: Đã xác nhận (1) + Giao tận nơi
      actionBtnsHtml += `
        <button class="btn-admin btn-danger btn-outline" onclick="proceedOrderAction(${inv.id}, 'huy')" type="button">
          Hủy Đơn
        </button>
      `;
      if (!isPaid) {
        actionBtnsHtml += `
          <button class="btn-admin btn-primary" onclick="openConfirmPrepaymentModal(${inv.id})" type="button" style="background:#16a34a; border-color:#16a34a; font-weight:700; margin-right:4px;">
            <span>&#128179; Thu Tiền Trước</span>
          </button>
        `;
      }
      actionBtnsHtml += `
        <button class="btn-admin btn-primary" onclick="proceedOrderAction(${inv.id}, 'giao-hang')" type="button" style="font-weight:700;">
          Bắt Đầu Giao Hàng
        </button>
      `;
    }
  }
  // 3. Trạng thái: Đang giao hàng (2)
  else if (currentStatus === 2) {
    if (!isPaid) {
      // CASE B: Đang giao hàng (2) + Chưa thanh toán (0)
      actionBtnsHtml += `
        <button class="btn-admin btn-danger btn-outline" onclick="proceedOrderAction(${inv.id}, 'huy')" type="button">
          Hủy Đơn
        </button>
        <button class="btn-admin btn-primary" onclick="openConfirmCodModalForCurrentInvoice()" type="button" style="background:#2563eb; border-color:#2563eb; font-weight:800; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 6px rgba(37,99,235,0.3);">
          <span>&#128176; Xác Nhận Đã Giao & Thu Tiền</span>
        </button>
      `;
    } else {
      // CASE C: Đang giao hàng (2) + Đã thanh toán (1)
      actionBtnsHtml += `
        <button class="btn-admin btn-primary" onclick="proceedOrderAction(${inv.id}, 'xac-nhan-giao-thanh-cong')" type="button" style="background:#16a34a; border-color:#16a34a; font-weight:800; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 6px rgba(22,163,74,0.3);">
          <span>&#10003; Xác Nhận Giao Hàng Thành Công</span>
        </button>
      `;
    }
  }
  // 4. Trạng thái: Hoàn thành (3)
  else if (currentStatus === 3) {
    actionBtnsHtml += `
      <button class="btn-admin" disabled style="background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; font-weight:700; cursor:default; padding:7px 16px;">
        &#10003; Đơn hàng đã hoàn thành
      </button>
    `;
  }
  // 5. Trạng thái: Đã hủy (4)
  else if (currentStatus === 4) {
    actionBtnsHtml += `
      <button class="btn-admin" disabled style="background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; font-weight:700; cursor:default; padding:7px 16px;">
        &#10005; Đơn hàng đã hủy
      </button>
    `;
  }

  // Print button
  actionBtnsHtml += `
    <button class="btn-admin btn-outline" onclick="printReceiptForCurrentModal()" type="button" title="In phiếu giao hàng / hóa đơn">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      <span>In Hóa Đơn</span>
    </button>
  `;

  container.innerHTML = actionBtnsHtml;
}

// Order State Transition Action Dispatcher
window.proceedOrderAction = async function(invoiceId, actionType) {
  const inv = state.invoicesList.find(i => i.id === invoiceId) || state.selectedInvoice;
  if (!inv) return;

  if (actionType === 'huy') {
    const lyDo = prompt('Vui lòng nhập lý do hủy đơn hàng này:', 'Khách hàng yêu cầu hủy đơn');
    if (lyDo === null) return; // User cancelled prompt
    
    try {
      const res = await fetch(`${API_BASE_URL}/hoa-don/${invoiceId}/huy?lyDo=${encodeURIComponent(lyDo || 'Hủy đơn')}`, {
        method: 'POST'
      });
      if (res.ok) {
        showToast('Đã hủy hóa đơn thành công!');
      } else {
        const err = await res.json().catch(() => null);
        showToast(err?.message || 'Không thể hủy đơn hàng này.', 'error');
        return;
      }
    } catch(e) {
      showToast('Lỗi khi hủy đơn hàng: ' + e.message, 'error');
      return;
    }
  } else if (actionType === 'thanh-toan-tai-quay') {
    openConfirmPrepaymentModal(invoiceId);
    return;
  } else if (actionType === 'xac-nhan') {
    openConfirmAcceptOrderModal(invoiceId);
    return;
  } else if (actionType === 'giao-hang') {
    try {
      const res = await fetch(`${API_BASE_URL}/hoa-don/${invoiceId}/giao-hang`, { method: 'POST' });
      if (res.ok) {
        showToast('Đã chuyển đơn hàng sang trạng thái: Đang giao hàng!');
      } else {
        const err = await res.json().catch(() => null);
        showToast(err?.message || 'Lỗi khi chuyển trạng thái giao hàng.', 'error');
        return;
      }
    } catch(e) {
      showToast('Lỗi mạng: ' + e.message, 'error');
      return;
    }
  } else if (actionType === 'xac-nhan-giao-thanh-cong') {
    if (!confirm('Bạn có chắc chắn muốn xác nhận giao hàng thành công cho đơn hàng này?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/hoa-don/${invoiceId}/xac-nhan-giao-thanh-cong`, { method: 'POST' });
      if (res.ok) {
        showToast('Đã xác nhận giao hàng thành công! Đơn hàng đã Hoàn thành.', 'success');
      } else {
        const err = await res.json().catch(() => null);
        showToast(err?.message || 'Lỗi khi xác nhận hoàn thành.', 'error');
        return;
      }
    } catch(e) {
      showToast('Lỗi mạng: ' + e.message, 'error');
      return;
    }
  }

  // Reload current invoice detail & list & product stock
  await loadInvoicesList();
  loadProductsList();
  openInvoiceDetail(invoiceId);
};

// ============================================================================
// MODAL 8: COD CONFIRMATION & PAYMENT COLLECTION LOGIC
// ============================================================================

window.openConfirmCodModalForCurrentInvoice = function() {
  const inv = state.selectedInvoice;
  if (!inv) return;

  document.getElementById('codModalMa').textContent = inv.ma || 'HD' + inv.id;
  
  const customerName = inv.tenNguoiNhan || inv.khachHang?.ten || 'Khách lẻ tại quầy';
  const phone = inv.dienThoai || inv.khachHang?.dienThoai || '';
  document.getElementById('codModalKhach').textContent = `${customerName} (${phone})`;

  const pmEl = document.getElementById('codModalPhuongThuc');
  if (pmEl) pmEl.textContent = inv.thanhToan?.phuongThuc || 'TIEN_MAT';
  
  const totalAmount = inv.thanhToan?.soTien || 0;
  const formattedTotal = formatCurrency(totalAmount);
  document.getElementById('codModalTotal').textContent = formattedTotal;
  document.getElementById('codModalTotalText').textContent = formattedTotal;

  // Reset Checkbox & Submit Button
  const chk = document.getElementById('chkCodCollected');
  if (chk) chk.checked = false;
  toggleCodConfirmBtn(false);

  const modal = document.getElementById('confirmCodModal');
  if (modal) modal.classList.add('active');
};

window.closeConfirmCodModal = function() {
  const modal = document.getElementById('confirmCodModal');
  if (modal) modal.classList.remove('active');
};

window.toggleCodConfirmBtn = function(isChecked) {
  const btn = document.getElementById('btnSubmitCodConfirm');
  if (!btn) return;
  if (isChecked) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  } else {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
  }
};

window.submitCodPaymentConfirmation = async function() {
  const inv = state.selectedInvoice;
  if (!inv) return;

  const chk = document.getElementById('chkCodCollected');
  if (!chk || !chk.checked) {
    showToast('Vui lòng tích xác nhận "Đã thu đủ tiền từ khách hàng"!', 'error');
    return;
  }

  const btn = document.getElementById('btnSubmitCodConfirm');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'ĐANG XỬ LÝ...';
  }

  try {
    const res = await fetch(`${API_BASE_URL}/hoa-don/${inv.id}/xac-nhan-giao-va-thu-tien`, {
      method: 'POST'
    });

    if (res.ok) {
      showToast('Đã xác nhận giao hàng & thu đủ tiền! Hóa đơn chuyển sang Hoàn thành.', 'success');
      closeConfirmCodModal();
      await loadInvoicesList();
      openInvoiceDetail(inv.id);
    } else {
      const err = await res.json().catch(() => null);
      showToast(err?.message || 'Lỗi khi xác nhận giao hàng & thu tiền.', 'error');
    }
  } catch(e) {
    showToast('Lỗi mạng: ' + e.message, 'error');
  } finally {
    if (btn) {
      btn.textContent = '✓ Xác nhận';
      btn.disabled = false;
    }
  }
};

window.closeInvoiceDetailModal = function() {
  const modal = document.getElementById('invoiceDetailModal');
  if (modal) modal.classList.remove('active');
};

// ============================================================================
// MODAL 8B: PREPAYMENT / IN-STORE PAYMENT CONFIRMATION LOGIC
// ============================================================================
let currentPrepaymentInvoiceId = null;

window.openConfirmPrepaymentModal = function(invoiceId) {
  const inv = (state.invoicesList && state.invoicesList.find(i => i.id === invoiceId)) || state.selectedInvoice;
  if (!inv) return;
  currentPrepaymentInvoiceId = invoiceId;

  const modalMa = document.getElementById('prepaymentModalMa');
  if (modalMa) modalMa.textContent = inv.ma || ('HD' + inv.id);

  const customerName = inv.tenNguoiNhan || inv.khachHang?.ten || 'Khách lẻ tại quầy';
  const phone = inv.dienThoai || inv.khachHang?.dienThoai || '';
  const modalKhach = document.getElementById('prepaymentModalKhach');
  if (modalKhach) modalKhach.textContent = `${customerName} (${phone})`;

  const pmEl = document.getElementById('prepaymentModalPhuongThuc');
  if (pmEl) pmEl.textContent = inv.thanhToan?.phuongThuc || 'TIEN_MAT';

  const totalAmount = inv.thanhToan?.soTien || 0;
  const formattedTotal = formatCurrency(totalAmount);
  const totalEl = document.getElementById('prepaymentModalTotal');
  if (totalEl) totalEl.textContent = formattedTotal;
  const totalTextEl = document.getElementById('prepaymentModalTotalText');
  if (totalTextEl) totalTextEl.textContent = formattedTotal;

  const isGiaoHang = (inv.moTa && inv.moTa.includes('Giao hàng tận nơi'))
    || (inv.diaChi !== 'Tại quầy Store' && (!inv.moTa || !inv.moTa.includes('Nhận tại quầy')));

  const titleEl = document.getElementById('prepaymentModalTitle');
  const alertTitleEl = document.getElementById('prepaymentAlertTitle');

  if (isGiaoHang) {
    if (titleEl) titleEl.textContent = 'Xác nhận thu tiền trước';
    if (alertTitleEl) alertTitleEl.textContent = 'Bạn đang xác nhận đã thu đủ tiền thanh toán trước cho đơn hàng';
  } else {
    if (titleEl) titleEl.textContent = 'Xác nhận thanh toán tại quầy';
    if (alertTitleEl) alertTitleEl.textContent = 'Bạn đang xác nhận đã thu đủ tiền thanh toán cho đơn hàng';
  }

  const chk = document.getElementById('chkPrepaymentCollected');
  if (chk) chk.checked = false;
  togglePrepaymentConfirmBtn(false);

  const modal = document.getElementById('confirmPrepaymentModal');
  if (modal) modal.classList.add('active');
};

window.closeConfirmPrepaymentModal = function() {
  const modal = document.getElementById('confirmPrepaymentModal');
  if (modal) modal.classList.remove('active');
};

window.togglePrepaymentConfirmBtn = function(isChecked) {
  const btn = document.getElementById('btnSubmitPrepaymentConfirm');
  if (!btn) return;
  if (isChecked) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  } else {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
  }
};

window.submitPrepaymentConfirmation = async function() {
  const invoiceId = currentPrepaymentInvoiceId || state.selectedInvoice?.id;
  if (!invoiceId) return;

  const chk = document.getElementById('chkPrepaymentCollected');
  if (!chk || !chk.checked) {
    showToast('Vui lòng tích xác nhận "Đã thu đủ tiền từ khách hàng"!', 'error');
    return;
  }

  const btn = document.getElementById('btnSubmitPrepaymentConfirm');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'ĐANG XỬ LÝ...';
  }

  try {
    const currentUser = getLoggedInUser();
    const staffUsername = (currentUser && currentUser.username) ? currentUser.username : '';
    const res = await fetch(`${API_BASE_URL}/hoa-don/${invoiceId}/thanh-toan-tai-quay`, {
      method: 'POST',
      headers: { 'X-Staff-Username': staffUsername }
    });

    if (res.ok) {
      showToast('Đã ghi nhận thu tiền & thanh toán thành công!', 'success');
      closeConfirmPrepaymentModal();
      await loadInvoicesList();
      loadProductsList();
      await openInvoiceDetail(invoiceId);
    } else {
      const err = await res.json().catch(() => null);
      showToast(err?.message || 'Không thể thanh toán đơn hàng này.', 'error');
    }
  } catch(e) {
    showToast('Lỗi khi thanh toán: ' + e.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '✓ Xác nhận';
    }
  }
};

// ============================================================================
// MODAL 9: ORDER ACCEPTANCE / CONFIRMATION & IMEI ALLOCATION LOGIC
// ============================================================================
let pendingAcceptInvoiceId = null;
let pendingAcceptInvoiceItems = [];
let acceptOrderImeiState = {}; // { [cthdId]: { cthdId, requiredQty, availableImeis: [], selectedIds: Set, searchQuery: '' } }

window.openConfirmAcceptOrderModal = async function(invoiceId) {
  const inv = state.invoicesList.find(i => i.id === invoiceId) || state.selectedInvoice;
  if (!inv) return;

  // Validation: Check if invoice already has a handler assigned
  if (inv.nhanVien && (inv.nhanVien.id || inv.nhanVien.ten)) {
    showToast('Hóa đơn đã được nhân viên khác tiếp nhận xử lý.', 'error');
    return;
  }

  // Validation: Check if invoice status is Chờ xác nhận (0)
  if (inv.trangThai !== 0) {
    showToast('Chỉ có thể xác nhận đơn hàng ở trạng thái Chờ xác nhận.', 'error');
    return;
  }

  pendingAcceptInvoiceId = invoiceId;
  acceptOrderImeiState = {};
  const elMa = document.getElementById('confirmAcceptOrderMa');
  if (elMa) elMa.textContent = '#' + (inv.ma || 'HD' + inv.id);

  // Set logged-in staff display
  const currentUser = getLoggedInUser();
  const staffName = (currentUser && (currentUser.ten || currentUser.username))
    ? `${currentUser.ten || currentUser.username} (${currentUser.ma || 'NV' + currentUser.id})`
    : 'Nguyễn Thị Mai (NV001)';
  const staffEl = document.getElementById('acceptOrderStaffName');
  if (staffEl) staffEl.textContent = staffName;

  const container = document.getElementById('acceptOrderItemsContainer');
  if (container) {
    container.innerHTML = '<div style="text-align:center; padding:20px; color:#64748b;">Đang tải danh sách sản phẩm và IMEI khả dụng...</div>';
  }

  const btnSubmit = document.getElementById('btnSubmitAcceptOrder');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = '0.5';
    btnSubmit.style.cursor = 'not-allowed';
    btnSubmit.textContent = 'Xác nhận đơn hàng';
  }

  const modal = document.getElementById('confirmAcceptOrderModal');
  if (modal) modal.classList.add('active');

  // Load items
  let items = [];
  try {
    const res = await fetch(`${API_BASE_URL}/chi-tiet-hoa-don/hoa-don/${invoiceId}`);
    if (res.ok) {
      items = await res.json();
    } else if (state.selectedInvoiceItems && state.selectedInvoiceItems.length > 0) {
      items = state.selectedInvoiceItems;
    } else {
      items = getMockInvoiceItems(inv);
    }
  } catch(e) {
    items = state.selectedInvoiceItems || getMockInvoiceItems(inv);
  }

  pendingAcceptInvoiceItems = items;
  await renderAcceptOrderItems(items);
};

window.closeConfirmAcceptOrderModal = function() {
  pendingAcceptInvoiceId = null;
  pendingAcceptInvoiceItems = [];
  acceptOrderImeiState = {};
  const modal = document.getElementById('confirmAcceptOrderModal');
  if (modal) modal.classList.remove('active');
};

async function renderAcceptOrderItems(items) {
  const container = document.getElementById('acceptOrderItemsContainer');
  if (!container) return;
  container.innerHTML = '';
  acceptOrderImeiState = {};

  if (!items || items.length === 0) {
    container.innerHTML = '<div style="color:#ef4444; text-align:center; padding:15px;">Đơn hàng không có sản phẩm nào.</div>';
    return;
  }

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const ctsp = item.chiTietSanPham || {};
    const sp = ctsp.sanPham || {};
    const spName = sp.tenSp || ctsp.moTa || 'Laptop ASUS Gaming';
    const ctspMa = ctsp.maCtsp || ('CTSP' + (ctsp.id || (idx + 1)));
    const requiredQty = item.soLuong || 1;
    const ctspId = ctsp.id || 1;

    // Fetch available IMEIs for this CTSP
    let availableImeis = [];
    try {
      const res = await fetch(`${API_BASE_URL}/imei/available?ctspId=${ctspId}`);
      if (res.ok) {
        availableImeis = await res.json();
      }
    } catch(e) {
      console.warn('Could not fetch available IMEIs for ctspId', ctspId);
    }

    // Initialize state for this CTHD
    acceptOrderImeiState[item.id] = {
      cthdId: item.id,
      requiredQty: requiredQty,
      availableImeis: availableImeis || [],
      selectedIds: new Set(),
      searchQuery: ''
    };

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.04);';

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
        <div>
          <div style="font-weight:800; font-size:0.95rem; color:#0f172a;">${idx + 1}. ${spName}</div>
          <div style="font-size:0.8rem; color:#64748b; margin-top:2px;">
            Mã cấu hình: <strong style="color:#2563eb;">${ctspMa}</strong> &bull; Số lượng cần: <strong style="color:#dc2626;">${requiredQty}</strong>
          </div>
        </div>
        <span id="badgeImeiCount_${item.id}" class="badge-status badge-pay-unpaid" style="font-size:0.75rem; font-weight:700; padding:4px 10px; border-radius:12px;">
          Chọn IMEI: 0/${requiredQty}
        </span>
      </div>

      <!-- Ô tìm kiếm IMEI và số lượng khả dụng -->
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px;">
        <div style="position:relative; flex:1; max-width:280px;">
          <input type="text" 
                 id="searchImei_${item.id}" 
                 placeholder="Tìm kiếm IMEI..." 
                 oninput="onAcceptImeiSearch(${item.id}, this.value)"
                 style="width:100%; padding:6px 10px 6px 30px; font-size:0.82rem; border:1px solid #cbd5e1; border-radius:6px; outline:none; background:#fff; transition:border 0.2s;"
                 onfocus="this.style.borderColor='#3b82f6'"
                 onblur="this.style.borderColor='#cbd5e1'"
          >
          <svg style="position:absolute; left:9px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:#94a3b8; pointer-events:none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <div id="availCountText_${item.id}" style="font-size:0.8rem; color:#475569; font-weight:600;">
          <strong style="color:#2563eb;">${availableImeis.length}</strong> IMEI khả dụng
        </div>
      </div>

      <!-- Container danh sách IMEI riêng biệt có thanh cuộn độc lập -->
      <div id="imeiListContainer_${item.id}" 
           class="custom-imei-scroll" 
           style="max-height: 180px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; padding: 10px;">
      </div>
    `;

    container.appendChild(card);
    renderImeiListForCthd(item.id);
  }

  updateAcceptOrderSubmitBtnState();
}

function renderImeiListForCthd(cthdId) {
  const itemState = acceptOrderImeiState[cthdId];
  if (!itemState) return;
  const container = document.getElementById(`imeiListContainer_${cthdId}`);
  if (!container) return;

  const { availableImeis, selectedIds, requiredQty, searchQuery } = itemState;

  // 8. Nếu không còn IMEI khả dụng:
  if (!availableImeis || availableImeis.length === 0) {
    container.innerHTML = `
      <div style="color:#dc2626; font-size:0.84rem; font-weight:600; text-align:center; padding:18px 10px; background:#fef2f2; border:1px dashed #fca5a5; border-radius:6px;">
        Không còn IMEI khả dụng cho cấu hình này.
      </div>
    `;
    return;
  }

  // 3 & 7. Lọc theo search query nhưng giữ nguyên selection
  const query = (searchQuery || '').trim().toLowerCase();
  const filtered = query 
    ? availableImeis.filter(im => (im.soImei || '').toLowerCase().includes(query))
    : availableImeis;

  if (filtered.length === 0) {
    const safeQuery = (query || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    container.innerHTML = `
      <div style="color:#64748b; font-size:0.84rem; font-style:italic; text-align:center; padding:18px 10px;">
        Không tìm thấy IMEI nào khớp với "<strong>${safeQuery}</strong>"
      </div>
    `;
    return;
  }

  // 5. Khi đã chọn đủ (ví dụ 2/2) -> disable các checkbox chưa chọn, các checkbox đã chọn vẫn cho phép bỏ chọn
  const isFull = selectedIds.size >= requiredQty;

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:8px;">
      ${filtered.map(im => {
        const isChecked = selectedIds.has(im.id);
        const isDisabled = isFull && !isChecked;
        const bgStyle = isChecked 
          ? 'background:#eff6ff; border-color:#3b82f6; box-shadow:0 0 0 1px #3b82f6;' 
          : (isDisabled 
              ? 'background:#f1f5f9; border-color:#e2e8f0; opacity:0.5; cursor:not-allowed;' 
              : 'background:#fff; border-color:#cbd5e1; cursor:pointer;');

        return `
          <label style="display:flex; align-items:center; gap:8px; border:1px solid; border-radius:6px; padding:7px 10px; font-size:0.84rem; user-select:none; transition:all 0.15s ease; ${bgStyle}">
            <input type="checkbox" 
                   value="${im.id}" 
                   ${isChecked ? 'checked' : ''} 
                   ${isDisabled ? 'disabled' : ''} 
                   onchange="onAcceptImeiToggle(${cthdId}, ${im.id}, this.checked)"
                   style="width:16px; height:16px; cursor:${isDisabled ? 'not-allowed' : 'pointer'}; accent-color:#2563eb;">
            <span style="font-family:monospace; font-weight:700; color:${isChecked ? '#1d4ed8' : (isDisabled ? '#94a3b8' : '#1e293b')};">${im.soImei}</span>
          </label>
        `;
      }).join('')}
    </div>
  `;
}

window.onAcceptImeiToggle = function(cthdId, imeiId, isChecked) {
  const itemState = acceptOrderImeiState[cthdId];
  if (!itemState) return;

  if (isChecked) {
    if (itemState.selectedIds.size >= itemState.requiredQty) {
      showToast(`Chỉ được chọn tối đa ${itemState.requiredQty} IMEI cho sản phẩm này!`, 'warning');
      renderImeiListForCthd(cthdId);
      return;
    }
    itemState.selectedIds.add(imeiId);
  } else {
    itemState.selectedIds.delete(imeiId);
  }

  // Update badge count
  const badge = document.getElementById(`badgeImeiCount_${cthdId}`);
  if (badge) {
    badge.textContent = `Chọn IMEI: ${itemState.selectedIds.size}/${itemState.requiredQty}`;
    if (itemState.selectedIds.size === itemState.requiredQty) {
      badge.className = 'badge-status badge-pay-paid';
    } else {
      badge.className = 'badge-status badge-pay-unpaid';
    }
  }

  // Re-render this CTHD's IMEI list container to update checked & disabled states
  renderImeiListForCthd(cthdId);

  // Check overall submit button state across all CTHDs
  updateAcceptOrderSubmitBtnState();
};

window.onAcceptImeiSearch = function(cthdId, query) {
  const itemState = acceptOrderImeiState[cthdId];
  if (!itemState) return;
  itemState.searchQuery = query;
  // Re-render list with current query - selectedIds remains unchanged!
  renderImeiListForCthd(cthdId);
};

function updateAcceptOrderSubmitBtnState() {
  const btn = document.getElementById('btnSubmitAcceptOrder');
  if (!btn) return;

  if (!pendingAcceptInvoiceItems || pendingAcceptInvoiceItems.length === 0) {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
    return;
  }

  let allFulfilled = true;
  for (const item of pendingAcceptInvoiceItems) {
    const itemState = acceptOrderImeiState[item.id];
    if (!itemState) {
      allFulfilled = false;
      break;
    }
    // If no available IMEIs, cannot fulfill
    if (!itemState.availableImeis || itemState.availableImeis.length === 0) {
      allFulfilled = false;
      break;
    }
    if (itemState.selectedIds.size !== itemState.requiredQty) {
      allFulfilled = false;
      break;
    }
  }

  if (allFulfilled) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  } else {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
  }
}

window.executeConfirmAcceptOrder = async function() {
  if (!pendingAcceptInvoiceId) return;
  const invoiceId = pendingAcceptInvoiceId;

  // Build payload directly from acceptOrderImeiState (preserves selection regardless of search filters)
  const chiTietImei = pendingAcceptInvoiceItems.map(item => {
    const itemState = acceptOrderImeiState[item.id] || { selectedIds: new Set() };
    return {
      idChiTietHoaDon: item.id,
      imeiIds: Array.from(itemState.selectedIds)
    };
  });

  const currentUser = getLoggedInUser();
  const staffUsername = (currentUser && currentUser.username) ? currentUser.username : 'nhanvien01';
  const staffId = (currentUser && currentUser.id) ? currentUser.id : 4;

  const payload = {
    chiTietImei: chiTietImei,
    username: staffUsername
  };

  const btn = document.getElementById('btnSubmitAcceptOrder');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'ĐANG XỬ LÝ...';
  }

  try {
    const res = await fetch(`${API_BASE_URL}/hoa-don/${invoiceId}/xac-nhan?nhanVienId=${staffId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Staff-Username': staffUsername
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast('Đã xác nhận đơn hàng thành công! Đã phân bổ IMEI và cập nhật nhân viên xử lý.', 'success');
      closeConfirmAcceptOrderModal();

      // Refresh data
      await loadInvoicesList();
      await openInvoiceDetail(invoiceId);
    } else {
      const err = await res.json().catch(() => null);
      const errMsg = err?.message || 'Không thể xác nhận đơn hàng.';
      showToast(errMsg, 'error');
      if (errMsg.includes('tiếp nhận') || errMsg.includes('phân bổ')) {
        closeConfirmAcceptOrderModal();
        await loadInvoicesList();
        await openInvoiceDetail(invoiceId);
      }
    }
  } catch(e) {
    showToast('Lỗi mạng: ' + e.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Xác nhận đơn hàng';
    }
  }
};

// ============================================================================
// PART 3: QUẢN LÝ THUỘC TÍNH (CRUD 8 THUỘC TÍNH)
// ============================================================================

window.switchAttrType = async function(attrType) {
  state.activeAttrType = attrType;
  const config = ATTR_CONFIG[attrType];
  if (!config) return;

  // Update tabs UI
  document.querySelectorAll('.attr-sub-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-attr') === attrType);
  });

  // Update titles & labels
  const titleEl = document.getElementById('activeAttrTitle');
  const btnText = document.getElementById('btnAddNewAttrText');
  if (titleEl) titleEl.textContent = `Quản Lý Danh Sách: ${config.title}`;
  if (btnText) btnText.textContent = `+ Thêm ${config.title} Mới`;

  // Render Table Headers
  const thead = document.getElementById('attrTableHeader');
  if (thead) {
    let headerHtml = '<tr>';
    config.columns.forEach(col => {
      headerHtml += `<th ${col.width ? `style="width:${col.width};"` : ''}>${col.label}</th>`;
    });
    headerHtml += '<th style="width: 100px; text-align: center;">Thao Tác</th></tr>';
    thead.innerHTML = headerHtml;
  }

  // Load Data
  await loadAttributeData(attrType);
};

async function loadAttributeData(attrType) {
  const config = ATTR_CONFIG[attrType];
  const loading = document.getElementById('attrLoadingIndicator');
  if (loading) loading.style.display = 'block';

  try {
    const res = await fetch(`${API_BASE_URL}${config.endpoint}`);
    if (res.ok) {
      state.activeAttrData = await res.json();
    } else {
      state.activeAttrData = getFallbackAttributeData(attrType);
    }
  } catch (err) {
    state.activeAttrData = getFallbackAttributeData(attrType);
  } finally {
    if (loading) loading.style.display = 'none';
  }

  filterActiveAttributes();
}

window.filterActiveAttributes = function() {
  const query = (document.getElementById('searchAttrInput')?.value || '').toLowerCase().trim();
  const config = ATTR_CONFIG[state.activeAttrType];

  if (!query) {
    state.filteredAttrData = [...state.activeAttrData];
  } else {
    state.filteredAttrData = state.activeAttrData.filter(item => {
      return Object.values(item).some(val => String(val).toLowerCase().includes(query));
    });
  }

  const badge = document.getElementById('activeAttrCountBadge');
  if (badge) badge.textContent = `${state.filteredAttrData.length} mục`;

  renderAttributesTable();
};

function renderAttributesTable() {
  const tbody = document.getElementById('attrTableBody');
  const config = ATTR_CONFIG[state.activeAttrType];
  if (!tbody || !config) return;
  tbody.innerHTML = '';

  if (state.filteredAttrData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${config.columns.length + 1}" style="text-align:center; padding:30px; color:var(--admin-text-muted);">
          Không có dữ liệu thuộc tính nào. Bấm nút "+ Thêm Mới" để tạo.
        </td>
      </tr>
    `;
    return;
  }

  state.filteredAttrData.forEach(item => {
    const tr = document.createElement('tr');
    let rowHtml = '';

    config.columns.forEach(col => {
      const val = item[col.key] || '---';
      if (col.key === 'id') {
        rowHtml += `<td style="font-weight:700; color:var(--admin-text-muted);">${val}</td>`;
      } else {
        rowHtml += `<td style="font-weight:600;">${val}</td>`;
      }
    });

    // Actions column: Chỉ còn Sửa (đã bỏ nút Xóa)
    rowHtml += `
      <td style="text-align:center;">
        <div style="display:flex; justify-content:center; gap:6px;">
          <button class="btn-admin btn-outline btn-sm" onclick="openEditAttributeModal(${item.id})" title="Chỉnh sửa">
            ✏️ Sửa
          </button>
        </div>
      </td>
    `;

    tr.innerHTML = rowHtml;
    tbody.appendChild(tr);
  });
}

// Open Modal to Add Attribute
window.openAddAttributeModal = function() {
  const config = ATTR_CONFIG[state.activeAttrType];
  state.editingAttrId = null;

  document.getElementById('attrModalTitle').textContent = `Thêm ${config.title} Mới`;
  document.getElementById('attrFieldId').value = '';

  buildDynamicAttrFormFields(config, null);

  const modal = document.getElementById('attributeModal');
  if (modal) modal.classList.add('active');
};

// Quick add attribute directly from Variant Modal
window.quickAddAttribute = function(attrType) {
  state.activeAttrType = attrType;
  state.quickAddTargetSelect = attrType;
  openAddAttributeModal();
};

// Open Modal to Edit Attribute
window.openEditAttributeModal = function(id) {
  const config = ATTR_CONFIG[state.activeAttrType];
  const item = state.activeAttrData.find(i => i.id === id);
  if (!item) return;

  state.editingAttrId = id;
  document.getElementById('attrModalTitle').textContent = `Chỉnh Sửa ${config.title} (#${id})`;
  document.getElementById('attrFieldId').value = id;

  buildDynamicAttrFormFields(config, item);

  const modal = document.getElementById('attributeModal');
  if (modal) modal.classList.add('active');
};

function buildDynamicAttrFormFields(config, existingItem) {
  const container = document.getElementById('attrFormFieldsContainer');
  if (!container) return;
  container.innerHTML = '';

  config.fields.forEach(f => {
    const val = existingItem ? (existingItem[f.name] || '') : '';
    const div = document.createElement('div');
    div.className = 'pos-form-group';
    div.innerHTML = `
      <label class="pos-form-label" for="dyn_${f.name}">${f.label}</label>
      <input type="${f.type}" class="pos-form-input" id="dyn_${f.name}" name="${f.name}"
        value="${val}" ${f.required ? 'required' : ''}>
    `;
    container.appendChild(div);
  });
}

window.closeAttributeModal = function() {
  const modal = document.getElementById('attributeModal');
  if (modal) modal.classList.remove('active');
  state.quickAddTargetSelect = null;
};

// Submit Add / Edit Attribute Form
window.handleAttributeFormSubmit = async function(event) {
  event.preventDefault();
  const config = ATTR_CONFIG[state.activeAttrType];
  if (!config) return;

  const payload = {};
  config.fields.forEach(f => {
    const input = document.getElementById(`dyn_${f.name}`);
    if (input) payload[f.name] = input.value.trim();
  });

  const isEditing = state.editingAttrId !== null;
  const url = isEditing
    ? `${API_BASE_URL}${config.endpoint}/${state.editingAttrId}`
    : `${API_BASE_URL}${config.endpoint}`;
  const method = isEditing ? 'PUT' : 'POST';

  try {
    const btn = document.getElementById('btnSaveAttr');
    if (btn) btn.disabled = true;

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let createdItem = null;
    if (res.ok) {
      createdItem = await res.json().catch(() => null);
      showToast(`${isEditing ? 'Cập nhật' : 'Thêm mới'} ${config.title} thành công!`);
    } else {
      // Local fallback for smooth experience
      if (isEditing) {
        const item = state.activeAttrData.find(i => i.id === state.editingAttrId);
        if (item) Object.assign(item, payload);
        createdItem = item;
      } else {
        payload.id = Date.now();
        state.activeAttrData.unshift(payload);
        createdItem = payload;
      }
      showToast(`${isEditing ? 'Đã sửa' : 'Đã thêm'} (local)`);
    }

    const quickTarget = state.quickAddTargetSelect;
    state.quickAddTargetSelect = null;

    closeAttributeModal();
    loadAttributeData(state.activeAttrType);

    // If added from variant modal, reload that select and auto-select newly added attribute
    if (quickTarget && createdItem) {
      await reloadVariantAttributeSelect(quickTarget, createdItem.id);
    }

  } catch (err) {
    console.error('Error saving attribute:', err);
    showToast('Lỗi kết nối khi lưu thuộc tính: ' + err.message, 'error');
  } finally {
    const btn = document.getElementById('btnSaveAttr');
    if (btn) btn.disabled = false;
  }
};

async function reloadVariantAttributeSelect(attrType, selectedId) {
  const map = {
    'cpu': { id: 'varCpuSelect', url: '/cpu', format: i => i.tenCpu },
    'ram': { id: 'varRamSelect', url: '/ram', format: i => `${i.dungLuong} ${i.loaiRam || ''}` },
    'o-cung': { id: 'varOCungSelect', url: '/o-cung', format: i => `${i.loaiOCung} ${i.dungLuong}` },
    'card-do-hoa': { id: 'varCardDoHoaSelect', url: '/card-do-hoa', format: i => i.tenCard },
    'man-hinh': { id: 'varManHinhSelect', url: '/man-hinh', format: i => `${i.kichThuoc} ${i.doPhanGiai} ${i.tanSoQuet || ''}` },
    'mau-sac': { id: 'varMauSacSelect', url: '/mau-sac', format: i => i.tenMau }
  }[attrType];

  if (!map) return;
  const sel = document.getElementById(map.id);
  if (!sel) return;

  try {
    const res = await fetch(`${API_BASE_URL}${map.url}`);
    if (res.ok) {
      const items = await res.json();
      sel.innerHTML = items.map(i => `<option value="${i.id}" ${Number(i.id) === Number(selectedId) ? 'selected' : ''}>${map.format(i)}</option>`).join('');
      if (selectedId) sel.value = String(selectedId);
    }
  } catch(e) {}
}

// Delete Attribute Item
window.deleteAttributeItem = async function(id, name) {
  const config = ATTR_CONFIG[state.activeAttrType];
  if (!confirm(`Bạn có chắc chắn muốn xóa "${name}" (ID: ${id}) khỏi danh sách ${config.title}?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${config.endpoint}/${id}`, {
      method: 'DELETE'
    });

    if (res.ok || res.status === 204) {
      showToast(`Đã xóa "${name}" thành công!`);
    } else {
      const errJson = await res.json().catch(() => null);
      if (res.status === 500 || res.status === 409) {
        showToast('Không thể xóa! Thuộc tính này đang được liên kết với một số dòng sản phẩm.', 'error');
        return;
      }
      // Local delete
      state.activeAttrData = state.activeAttrData.filter(i => i.id !== id);
      showToast(`Đã xóa "${name}" (local)`);
    }

    loadAttributeData(state.activeAttrType);

  } catch (err) {
    showToast('Lỗi khi xóa thuộc tính: ' + err.message, 'error');
  }
};

// ============================================================================
// PART 4: QUICK CUSTOMER MODAL
// ============================================================================
window.openQuickCustomerModal = function() {
  const modal = document.getElementById('quickCustomerModal');
  if (modal) modal.classList.add('active');
};

window.closeQuickCustomerModal = function() {
  const modal = document.getElementById('quickCustomerModal');
  if (modal) modal.classList.remove('active');
};

window.handleQuickCustomerSubmit = async function(e) {
  e.preventDefault();
  const ten = document.getElementById('qcTen')?.value.trim();
  const sdt = document.getElementById('qcDienThoai')?.value.trim();
  const diaChi = document.getElementById('qcDiaChi')?.value.trim() || 'Hà Nội';

  if (!ten || !sdt) {
    showToast('Vui lòng nhập tên và SĐT khách hàng!', 'error');
    return;
  }

  const newCustPayload = {
    ma: 'KH' + Math.floor(Date.now() / 1000),
    ten: ten,
    username: 'kh_' + sdt,
    password: 'password123',
    dienThoai: sdt,
    diaChi: diaChi,
    vaiTro: { id: 3, tenVaiTro: 'Khách hàng' }
  };

  try {
    const res = await fetch(`${API_BASE_URL}/nguoi-dung`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustPayload)
    });

    let created = newCustPayload;
    if (res.ok) {
      created = await res.json();
    } else {
      created.id = Date.now();
    }

    state.customersList.push(created);
    populatePosCustomerAndCashierSelects();

    // Select this newly added customer in POS
    const custSelect = document.getElementById('posCustomerSelect');
    if (custSelect) {
      custSelect.value = created.id;
      onPosCustomerChange();
    }

    showToast(`Đã thêm khách hàng: ${ten}`);
    closeQuickCustomerModal();

  } catch (err) {
    showToast('Lỗi khi thêm khách hàng: ' + err.message, 'error');
  }
};

// ============================================================================
// RECEIPT PRINTING PREVIEW
// ============================================================================
function printReceiptDirectly(hoaDon, order) {
  const printSec = document.getElementById('printReceiptSection');
  if (!printSec) return;

  const subtotal = order.items.reduce((s, i) => s + (i.price * i.qty), 0);
  const discount = (hoaDon.tienGiamVoucher !== undefined && hoaDon.tienGiamVoucher !== null) ? Number(hoaDon.tienGiamVoucher) : (order.tienGiamVoucher || 0);
  const voucherCode = hoaDon.voucher?.ma || hoaDon.voucher?.maVoucher || order.maVoucher || '';
  const total = Math.max(0, subtotal - discount);

  let itemsHtml = '';
  order.items.forEach((item, idx) => {
    itemsHtml += `
      <tr>
        <td style="padding:4px 0;">${idx + 1}. ${item.name}</td>
        <td style="text-align:center; padding:4px 0;">x${item.qty}</td>
        <td style="text-align:right; padding:4px 0;">${formatCurrency(item.price * item.qty)}</td>
      </tr>
    `;
  });

  printSec.innerHTML = `
    <div style="font-family:monospace; max-width:320px; margin:0 auto; padding:20px 10px; color:#000;">
      <div style="text-align:center; margin-bottom:12px;">
        <h2 style="margin:0; font-size:1.2rem;">LAPTOP STORE</h2>
        <div style="font-size:0.8rem;">Hệ Thống Bán Lẻ Laptop Toàn Quốc</div>
        <div style="font-size:0.75rem;">Hotline: 1800 6868 - laptopstore.vn</div>
        <div style="border-bottom:1px dashed #000; margin:8px 0;"></div>
        <h3 style="margin:4px 0; font-size:1rem;">HÓA ĐƠN BÁN HÀNG</h3>
        <div style="font-size:0.8rem;">Số: <strong>${hoaDon.ma || 'HD'}</strong></div>
        <div style="font-size:0.75rem;">Ngày: ${new Date().toLocaleString('vi-VN')}</div>
      </div>

      <div style="font-size:0.8rem; margin-bottom:10px;">
        <div>Khách hàng: <strong>${hoaDon.tenNguoiNhan || 'Khách lẻ'}</strong></div>
        <div>SĐT: ${hoaDon.dienThoai || '---'}</div>
        <div>Địa chỉ nhận: ${hoaDon.diaChi || order.customerAddress || 'Tại quầy Store'}</div>
        <div>Thu ngân: ${hoaDon.nhanVien?.ten || 'NV'} - LaptopStore</div>
      </div>

      <table style="width:100%; font-size:0.8rem; border-collapse:collapse; margin-bottom:10px;">
        <thead>
          <tr style="border-bottom:1px solid #000; border-top:1px solid #000;">
            <th style="text-align:left; padding:4px 0;">Tên SP</th>
            <th style="text-align:center; padding:4px 0;">SL</th>
            <th style="text-align:right; padding:4px 0;">T.Tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="border-top:1px dashed #000; padding-top:6px; font-size:0.85rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Tổng tiền hàng:</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        ${discount > 0 ? `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:#b91c1c;">
          <span>Voucher (${voucherCode}):</span>
          <span>-${formatCurrency(discount)}</span>
        </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:1rem; margin-bottom:6px;">
          <span>TỔNG CỘNG:</span>
          <span>${formatCurrency(total)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
          <span>Hình thức TT:</span>
          <span>${order.payMethod}</span>
        </div>
      </div>

      <div style="text-align:center; margin-top:20px; font-size:0.75rem; border-top:1px dashed #000; padding-top:10px;">
        <div>Cảm ơn quý khách và hẹn gặp lại!</div>
        <div>Đổi trả trong 30 ngày nếu có lỗi kỹ thuật</div>
      </div>
    </div>
  `;

  // Print
  printSec.style.display = 'block';
  window.print();
  printSec.style.display = 'none';
}

window.printReceiptForCurrentModal = function() {
  if (!state.selectedInvoice) return;
  const mockOrder = {
    items: (state.selectedInvoiceItems || []).map(i => ({
      name: i.chiTietSanPham?.sanPham?.tenSp || 'Laptop',
      qty: i.soLuong || 1,
      price: i.giaTungSanPham || 0
    })),
    idVoucher: state.selectedInvoice.voucher?.id,
    maVoucher: state.selectedInvoice.voucher?.ma || state.selectedInvoice.voucher?.maVoucher || '',
    tienGiamVoucher: state.selectedInvoice.tienGiamVoucher || 0,
    payMethod: state.selectedInvoice.thanhToan?.phuongThuc || 'Tiền mặt'
  };
  printReceiptDirectly(state.selectedInvoice, mockOrder);
};

// ============================================================================
// FALLBACK DATA (IN CASE SERVER RUNS ON COLD START)
// ============================================================================
function getFallbackProducts() {
  return [
    {
      id: 1,
      soLuong: 5,
      gia: 18990000,
      sanPham: { tenSp: 'ASUS TUF Gaming A15', thuongHieu: { tenThuongHieu: 'ASUS' } },
      cpu: { tenCpu: 'AMD Ryzen 5 7535HS' },
      ram: { dungLuong: '16GB', loaiRam: 'DDR5' },
      ocung: { loaiOCung: 'SSD NVMe', dungLuong: '512GB' }
    },
    {
      id: 2,
      soLuong: 8,
      gia: 24490000,
      sanPham: { tenSp: 'Lenovo Legion 5 16IRX9', thuongHieu: { tenThuongHieu: 'LENOVO' } },
      cpu: { tenCpu: 'Intel Core i7-13650HX' },
      ram: { dungLuong: '16GB', loaiRam: 'DDR5' },
      ocung: { loaiOCung: 'SSD NVMe', dungLuong: '512GB' }
    },
    {
      id: 3,
      soLuong: 12,
      gia: 21990000,
      sanPham: { tenSp: 'Acer Nitro V 15 ANV15', thuongHieu: { tenThuongHieu: 'ACER' } },
      cpu: { tenCpu: 'Intel Core i5-13420H' },
      ram: { dungLuong: '16GB', loaiRam: 'DDR5' },
      ocung: { loaiOCung: 'SSD NVMe', dungLuong: '512GB' }
    }
  ];
}

function getFallbackInvoices() {
  return [
    {
      id: 3,
      ma: 'HD001',
      tenNguoiNhan: 'Nguyễn Văn A',
      dienThoai: '0901234567',
      diaChi: '123 Cầu Giấy, Hà Nội',
      ngayTao: '2026-09-28T10:15:00',
      trangThai: 0,
      nhanVien: null,
      thanhToan: { id: 1, ma: 'TT001', soTien: 24490000, phuongThuc: 'COD', trangThai: 0, ngayThanhToan: null }
    },
    {
      id: 4,
      ma: 'HD002',
      tenNguoiNhan: 'Trần Thị B',
      dienThoai: '0987654321',
      diaChi: '456 Kim Mã, Hà Nội',
      ngayTao: '2026-09-28T14:20:00',
      trangThai: 1,
      nhanVien: { id: 13, ma: 'NV002', ten: 'Trần Văn Hùng' },
      thanhToan: { id: 2, ma: 'TT002', soTien: 32990000, phuongThuc: 'Chuyển khoản', trangThai: 1, ngayThanhToan: '2026-09-28T14:20:00' }
    },
    {
      id: 5,
      ma: 'HD003',
      tenNguoiNhan: 'Lê Minh C',
      dienThoai: '0862720415',
      diaChi: '123 Nguyễn Trãi, Hà Nội',
      ngayTao: '2026-09-27T16:30:00',
      trangThai: 2,
      moTa: 'Giao giờ hành chính',
      nhanVien: { id: 13, ma: 'NV002', ten: 'Trần Văn Hùng' },
      thanhToan: { id: 3, ma: 'TT003', soTien: 45980000, phuongThuc: 'COD', trangThai: 0, ngayThanhToan: null }
    },
    {
      id: 6,
      ma: 'HD004',
      tenNguoiNhan: 'Phạm Thị D',
      dienThoai: '0912345678',
      diaChi: '789 Giải Phóng, Hà Nội',
      ngayTao: '2026-09-26T09:10:00',
      trangThai: 3,
      nhanVien: { id: 4, ma: 'NV001', ten: 'Nguyễn Thị Mai' },
      thanhToan: { id: 4, ma: 'TT004', soTien: 22990000, phuongThuc: 'COD', trangThai: 1, ngayThanhToan: '2026-09-26T09:10:00' }
    },
    {
      id: 7,
      ma: 'HD005',
      tenNguoiNhan: 'Hoàng Văn E',
      dienThoai: '0387654321',
      diaChi: '101 Hoàng Hoa Thám, Hà Nội',
      ngayTao: '2026-09-25T11:45:00',
      trangThai: 4,
      nhanVien: { id: 5, ma: 'ADMIN001', ten: 'Admin' },
      thanhToan: { id: 5, ma: 'TT005', soTien: 18490000, phuongThuc: 'COD', trangThai: 0, ngayThanhToan: null }
    }
  ];
}

function getMockInvoiceItems(inv) {
  return [
    {
      id: 1,
      soLuong: (inv?.ma === 'HD003') ? 2 : 1,
      giaTungSanPham: (inv?.ma === 'HD003') ? 22990000 : (inv?.thanhToan?.soTien || 24490000),
      imeiList: (inv?.trangThai === 0) ? [] : ((inv?.ma === 'HD003') ? ['TUF A15 00012345', 'TUF A15 00012346'] : ['LAPTOP' + (inv?.id || '001')]),
      chiTietSanPham: {
        maCtsp: 'CTSP001',
        sanPham: { tenSp: 'ASUS TUF Gaming A15' },
        cpu: { tenCpu: 'i7-13650HX' },
        ram: { dungLuong: '16GB' },
        ocung: { dungLuong: '512GB' },
        cardDoHoa: { tenCard: 'RTX 4060' },
        manHinh: { kichThuoc: '15.6"' }
      }
    }
  ];
}

// ============================================================================
// PART 5: QUẢN LÝ SẢN PHẨM (LAPTOP MODELS CRUD)
// ============================================================================

window.loadProductsTable = async function() {
  const loading = document.getElementById('productsLoadingIndicator');
  if (loading) loading.style.display = 'block';

  try {
    const res = await fetch(`${API_BASE_URL}/san-pham`);
    if (res.ok) {
      state.allProducts = await res.json();
    } else {
      state.allProducts = getFallbackProductsList();
    }
  } catch (e) {
    state.allProducts = getFallbackProductsList();
  } finally {
    if (loading) loading.style.display = 'none';
  }

  // Populate Categories & Brands in filter dropdowns
  populateProductFilterDropdowns();
  filterProductsTable();
};

function populateProductFilterDropdowns() {
  const catSelect = document.getElementById('filterProductCategory');
  const brandSelect = document.getElementById('filterProductBrand');

  if (catSelect) {
    const cats = [...new Set(state.allProducts.map(p => p.danhMuc?.tenDanhMuc).filter(Boolean))];
    catSelect.innerHTML = '<option value="ALL">Tất cả danh mục</option>';
    cats.forEach(c => {
      catSelect.innerHTML += `<option value="${c}">${c}</option>`;
    });
  }

  if (brandSelect) {
    const brands = [...new Set(state.allProducts.map(p => p.thuongHieu?.tenThuongHieu).filter(Boolean))];
    brandSelect.innerHTML = '<option value="ALL">Tất cả thương hiệu</option>';
    brands.forEach(b => {
      brandSelect.innerHTML += `<option value="${b}">${b}</option>`;
    });
  }
}

window.filterProductsTable = function() {
  const query = (document.getElementById('searchProductInput')?.value || '').toLowerCase().trim();
  const catFilter = document.getElementById('filterProductCategory')?.value || 'ALL';
  const brandFilter = document.getElementById('filterProductBrand')?.value || 'ALL';

  state.filteredProducts = state.allProducts.filter(p => {
    if (catFilter !== 'ALL' && p.danhMuc?.tenDanhMuc !== catFilter) return false;
    if (brandFilter !== 'ALL' && p.thuongHieu?.tenThuongHieu !== brandFilter) return false;
    if (query) {
      const text = `${p.maSp || ''} ${p.tenSp || ''} ${p.danhMuc?.tenDanhMuc || ''} ${p.thuongHieu?.tenThuongHieu || ''}`.toLowerCase();
      return text.includes(query);
    }
    return true;
  });

  const badge = document.getElementById('productCountBadge');
  if (badge) badge.textContent = `${state.filteredProducts.length} dòng máy`;

  renderProductsTable();
};

function renderProductsTable() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (state.filteredProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:30px; color:var(--admin-text-muted);">
          Không tìm thấy dòng sản phẩm nào. Bấm nút "+ Thêm Sản Phẩm Mới" để tạo.
        </td>
      </tr>
    `;
    return;
  }

  state.filteredProducts.forEach((p, idx) => {
    const imgUrl = (p.danhSachHinhAnh && p.danhSachHinhAnh[0] && p.danhSachHinhAnh[0].urlHinhAnh) ||
                   'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=120&q=80';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align:center; font-weight:700; color:var(--admin-text-muted);">${idx + 1}</td>
      <td style="text-align:center;">
        <img src="${imgUrl}" alt="${p.tenSp}" style="width:45px; height:45px; object-fit:contain; border-radius:4px; border:1px solid var(--admin-border); padding:2px;">
      </td>
      <td style="font-weight:800; color:var(--admin-primary);">${p.maSp || 'SP' + p.id}</td>
      <td>
        <div style="font-weight:700; font-size:0.9rem;">${p.tenSp || ''}</div>
        <div style="font-size:0.75rem; color:var(--admin-text-muted);">${(p.moTa || '').substring(0, 60)}${p.moTa && p.moTa.length > 60 ? '...' : ''}</div>
      </td>
      <td><span class="badge-status confirmed">${p.danhMuc?.tenDanhMuc || '---'}</span></td>
      <td><span class="badge-status shipping">${p.thuongHieu?.tenThuongHieu || '---'}</span></td>
      <td style="text-align:right; font-weight:800; color:var(--admin-danger);">${formatCurrency(p.giaCoBan)}</td>
      <td style="text-align:center;">
        <div style="display:flex; justify-content:center; gap:6px;">
          <button class="btn-admin btn-outline btn-sm" onclick="viewVariantsOfProduct(${p.id})" title="Xem tất cả cấu hình của dòng này">
             Cấu hình
          </button>
          <button class="btn-admin btn-outline btn-sm" onclick="openEditProductModal(${p.id})" title="Chỉnh sửa">
             Sửa
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Product Images Handlers (Chọn ảnh từ máy tính cho dòng sản phẩm)
window.handleProductFilesSelect = function(e) {
  const files = e.target ? e.target.files : null;
  if (files && files.length > 0) {
    handleProductFiles(files);
  }
  if (e.target) e.target.value = '';
};

function handleProductFiles(files) {
  if (!state.productModalImages) state.productModalImages = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.startsWith('image/')) continue;

    const previewUrl = URL.createObjectURL(file);
    state.productModalImages.push({
      id: null,
      url: previewUrl,
      file: file,
      isExisting: false
    });
  }
  renderProductImagesPreview();
}

window.removeProductImage = function(index) {
  if (!state.productModalImages || !state.productModalImages[index]) return;
  const item = state.productModalImages[index];

  // Nếu là ảnh có sẵn trong DB, lưu ID để xóa trên server
  if (item.isExisting && item.id) {
    if (!state.productDeletedImageIds) state.productDeletedImageIds = [];
    state.productDeletedImageIds.push(item.id);
  }

  if (item.file && item.url && item.url.startsWith('blob:')) {
    try { URL.revokeObjectURL(item.url); } catch(e) {}
  }

  state.productModalImages.splice(index, 1);
  renderProductImagesPreview();
};

function renderProductImagesPreview() {
  const grid = document.getElementById('prodImagesPreviewGrid');
  const badge = document.getElementById('prodImageCountBadge');
  if (!grid) return;

  grid.style.display = 'flex';
  grid.style.flexDirection = 'row';
  grid.style.flexWrap = 'nowrap';
  grid.style.alignItems = 'center';
  grid.style.gap = '12px';
  grid.style.overflowX = 'auto';
  grid.style.overflowY = 'hidden';
  grid.style.padding = '6px 4px 10px 4px';
  grid.style.minHeight = '96px';
  grid.style.maxWidth = '100%';

  const count = state.productModalImages ? state.productModalImages.length : 0;
  if (badge) {
    badge.textContent = `${count} ảnh`;
    badge.className = count > 0 ? 'badge-status badge-success' : 'badge-status badge-info';
  }

  if (count === 0) {
    grid.innerHTML = `
      <div class="variant-images-empty" style="width:100%; padding:14px; text-align:center; color:#94a3b8; font-size:12px; background:#f8fafc; border-radius:6px; border:1px dashed #e2e8f0;">
        <i class="fa fa-images" style="margin-right:6px; color:#94a3b8;"></i>
        Chưa có hình ảnh nào được chọn. Nhấn nút "Chọn từ máy" ở trên để thêm ảnh.
      </div>
    `;
    return;
  }

  grid.innerHTML = state.productModalImages.map((img, idx) => `
    <div class="variant-img-card" style="position:relative; flex:0 0 80px; width:80px; height:80px; min-width:80px; max-width:80px; min-height:80px; max-height:80px; border-radius:8px; overflow:hidden; border:1.5px solid #cbd5e1; background:#f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,0.08);" title="${img.file ? img.file.name : ('Hình ảnh ' + (idx + 1))}">
      <img src="${img.url}" alt="Ảnh ${idx + 1}" style="width:80px; height:80px; min-width:80px; max-width:80px; min-height:80px; max-height:80px; object-fit:cover; display:block;" onerror="this.src='https://placehold.co/80x80?text=Loi+Anh'">
      <button type="button" class="variant-img-remove-btn" onclick="removeProductImage(${idx})" title="Xóa ảnh này" style="position:absolute; top:3px; right:3px; width:20px; height:20px; border-radius:50%; background:rgba(220,38,38,0.95); color:#fff; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; line-height:1; box-shadow:0 2px 4px rgba(0,0,0,0.25); z-index:10;">✕</button>
    </div>
  `).join('');
}

// Product Add / Edit Modal
window.openAddProductModal = async function() {
  state.editingProductId = null;
  document.getElementById('productModalTitle').textContent = 'Thêm Dòng Sản Phẩm Mới';
  document.getElementById('prodEditId').value = '';
  document.getElementById('prodMaSp').value = 'SP' + String(state.allProducts.length + 1).padStart(3, '0');
  document.getElementById('prodTenSp').value = '';
  document.getElementById('prodGiaCoBan').value = '';
  document.getElementById('prodMoTa').value = '';

  state.productModalImages = [];
  state.productDeletedImageIds = [];
  const fileInput = document.getElementById('prodImageFiles');
  if (fileInput) fileInput.value = '';
  renderProductImagesPreview();

  await populateProductModalSelects();

  const modal = document.getElementById('productModal');
  if (modal) modal.classList.add('active');
};

window.openEditProductModal = async function(id) {
  const prod = state.allProducts.find(p => p.id === id);
  if (!prod) return;

  state.editingProductId = id;
  document.getElementById('productModalTitle').textContent = `Chỉnh Sửa Dòng Sản Phẩm (#${id})`;
  document.getElementById('prodEditId').value = id;
  document.getElementById('prodMaSp').value = prod.maSp || '';
  document.getElementById('prodTenSp').value = prod.tenSp || '';
  document.getElementById('prodGiaCoBan').value = prod.giaCoBan || '';
  document.getElementById('prodMoTa').value = prod.moTa || '';

  state.productModalImages = [];
  state.productDeletedImageIds = [];
  const fileInput = document.getElementById('prodImageFiles');
  if (fileInput) fileInput.value = '';

  try {
    const resImg = await fetch(`${API_BASE_URL}/hinh-anh/san-pham/${id}`);
    if (resImg.ok) {
      const imgs = await resImg.json();
      state.productModalImages = imgs.map(img => ({
        id: img.id,
        url: img.urlHinhAnh,
        isExisting: true
      }));
    } else if (prod.danhSachHinhAnh) {
      state.productModalImages = prod.danhSachHinhAnh.map(img => ({
        id: img.id,
        url: img.urlHinhAnh,
        isExisting: true
      }));
    }
  } catch(e) {
    if (prod.danhSachHinhAnh) {
      state.productModalImages = prod.danhSachHinhAnh.map(img => ({
        id: img.id,
        url: img.urlHinhAnh,
        isExisting: true
      }));
    }
  }
  renderProductImagesPreview();

  await populateProductModalSelects(prod.danhMuc?.id, prod.thuongHieu?.id);

  const modal = document.getElementById('productModal');
  if (modal) modal.classList.add('active');
};

async function populateProductModalSelects(selectedCatId, selectedBrandId) {
  const catSelect = document.getElementById('prodDanhMucSelect');
  const brandSelect = document.getElementById('prodThuongHieuSelect');

  try {
    const resCat = await fetch(`${API_BASE_URL}/danh-muc`);
    if (resCat.ok) {
      const cats = await resCat.json();
      if (catSelect) {
        catSelect.innerHTML = cats.map(c => `<option value="${c.id}" ${c.id === selectedCatId ? 'selected' : ''}>${c.tenDanhMuc}</option>`).join('');
      }
    }
  } catch(e) {}

  try {
    const resBrand = await fetch(`${API_BASE_URL}/thuong-hieu`);
    if (resBrand.ok) {
      const brands = await resBrand.json();
      if (brandSelect) {
        brandSelect.innerHTML = brands.map(b => `<option value="${b.id}" ${b.id === selectedBrandId ? 'selected' : ''}>${b.tenThuongHieu}</option>`).join('');
      }
    }
  } catch(e) {}
}

window.closeProductModal = function() {
  const modal = document.getElementById('productModal');
  if (modal) modal.classList.remove('active');
};

window.handleProductFormSubmit = async function(e) {
  e.preventDefault();
  const isEditing = state.editingProductId !== null;
  const maSp = document.getElementById('prodMaSp')?.value.trim();
  const tenSp = document.getElementById('prodTenSp')?.value.trim();
  const giaCoBan = parseFloat(document.getElementById('prodGiaCoBan')?.value) || 0;
  const idDanhMuc = parseInt(document.getElementById('prodDanhMucSelect')?.value);
  const idThuongHieu = parseInt(document.getElementById('prodThuongHieuSelect')?.value);
  const moTa = document.getElementById('prodMoTa')?.value.trim();

  const payload = {
    maSp: maSp,
    tenSp: tenSp,
    giaCoBan: giaCoBan,
    danhMuc: { id: idDanhMuc },
    thuongHieu: { id: idThuongHieu },
    moTa: moTa
  };

  try {
    const btn = document.getElementById('btnSaveProduct');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Đang lưu...';
    }

    const url = isEditing ? `${API_BASE_URL}/san-pham/${state.editingProductId}` : `${API_BASE_URL}/san-pham`;
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const savedProd = await res.json().catch(() => null);
      const prodId = savedProd?.id || (isEditing ? state.editingProductId : null);

      if (prodId) {
        // 1. Xóa các hình ảnh bị người dùng bấm xóa (✕)
        if (state.productDeletedImageIds && state.productDeletedImageIds.length > 0) {
          for (const delId of state.productDeletedImageIds) {
            try {
              await fetch(`${API_BASE_URL}/hinh-anh/${delId}`, { method: 'DELETE' });
            } catch(delErr) {
              console.warn('Lỗi khi xóa ảnh sản phẩm cũ:', delErr);
            }
          }
        }

        // 2. Tải lên và lưu các hình ảnh mới được chọn từ máy
        const newImages = (state.productModalImages || []).filter(item => item.file);
        for (const item of newImages) {
          try {
            const formData = new FormData();
            formData.append('file', item.file);
            const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
              method: 'POST',
              body: formData
            });

            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              const finalUrl = uploadData.url || uploadData.relativeUrl;
              if (finalUrl) {
                await fetch(`${API_BASE_URL}/hinh-anh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    urlHinhAnh: finalUrl,
                    sanPham: { id: prodId }
                  })
                });
              }
            } else {
              console.warn('Upload ảnh sản phẩm thất bại, mã:', uploadRes.status);
            }
          } catch(uploadErr) {
            console.error('Lỗi khi tải ảnh sản phẩm lên:', uploadErr);
          }
        }
      }

      showToast(`${isEditing ? 'Cập nhật' : 'Thêm mới'} dòng laptop thành công!`);
    } else {
      showToast(`${isEditing ? 'Đã sửa' : 'Đã thêm'} thành công!`);
    }

    closeProductModal();
    loadProductsTable();
    loadProductsList(); // update cache for POS

  } catch(err) {
    showToast('Lỗi: ' + err.message, 'error');
  } finally {
    const btn = document.getElementById('btnSaveProduct');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Lưu Sản Phẩm';
    }
  }
};

window.deleteProduct = async function(id, name) {
  if (!confirm(`Xác nhận xóa dòng laptop "${name}" (ID: ${id})?`)) return;

  try {
    const res = await fetch(`${API_BASE_URL}/san-pham/${id}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
      showToast(`Đã xóa "${name}" thành công!`);
    } else {
      showToast('Không thể xóa! Dòng máy này đang có phiên bản cấu hình (CTSP) hoặc hóa đơn liên quan.', 'error');
      return;
    }
    loadProductsTable();
    loadProductsList();
  } catch(err) {
    showToast('Lỗi khi xóa: ' + err.message, 'error');
  }
};

// ============================================================================
// PART 6: QUẢN LÝ CHI TIẾT SẢN PHẨM (VARIANTS / CTSP CRUD)
// ============================================================================

window.loadVariantsTable = async function() {
  const loading = document.getElementById('variantsLoadingIndicator');
  if (loading) loading.style.display = 'block';

  try {
    const res = await fetch(`${API_BASE_URL}/chi-tiet-san-pham`);
    if (res.ok) {
      state.allVariants = await res.json();
    } else {
      state.allVariants = state.productsList;
    }
  } catch(e) {
    state.allVariants = state.productsList;
  } finally {
    if (loading) loading.style.display = 'none';
  }

  filterVariantsTable();
};

function updateVariantFilterHeader() {
  const nameEl = document.getElementById('variantFilterProductName');

  if (state.selectedProductIdForVariants !== null && state.selectedProductIdForVariants !== undefined) {
    const targetSpId = Number(state.selectedProductIdForVariants);
    let foundProd = (state.allProducts || []).find(p => Number(p.id) === targetSpId);
    if (!foundProd) {
      const vMatch = (state.allVariants || []).find(v => Number(v.sanPham?.id) === targetSpId);
      if (vMatch && vMatch.sanPham) {
        foundProd = vMatch.sanPham;
      }
    }
    if (!foundProd) {
      const pMatch = (state.productsList || []).find(p => Number(p.sanPham?.id) === targetSpId);
      if (pMatch && pMatch.sanPham) {
        foundProd = pMatch.sanPham;
      }
    }

    const prodName = (foundProd && foundProd.tenSp) 
      ? `${foundProd.tenSp} (${foundProd.maSp || 'SP' + (foundProd.id || targetSpId)})` 
      : `Dòng máy #${targetSpId}`;
    if (nameEl) nameEl.textContent = prodName;
  }
}

window.showAllVariants = function() {
  switchAdminTab('products');
};

window.filterVariantsTable = function() {
  const query = (document.getElementById('searchVariantInput')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('filterVariantStatus')?.value || 'ALL';

  state.filteredVariants = state.allVariants.filter(v => {
    // If filtered by specific product from Products table
    if (state.selectedProductIdForVariants !== null && state.selectedProductIdForVariants !== undefined) {
      if (Number(v.sanPham?.id) !== Number(state.selectedProductIdForVariants)) {
        return false;
      }
    }
    if (statusFilter !== 'ALL' && String(v.trangThai) !== statusFilter) return false;
    if (query) {
      const sp = v.sanPham || {};
      const text = `${v.maCtsp || ''} ${sp.tenSp || ''} ${v.cpu?.tenCpu || ''} ${v.ram?.dungLuong || ''} ${v.ocung?.dungLuong || ''} ${v.cardDoHoa?.tenCard || ''} ${v.mauSac?.tenMau || ''} ${v.tenKhuyenMai || ''}`.toLowerCase();
      return text.includes(query);
    }
    return true;
  });

  updateVariantFilterHeader();

  const badge = document.getElementById('variantCountBadge');
  if (badge) badge.textContent = `${state.filteredVariants.length} cấu hình`;

  renderVariantsTable();
};

function renderVariantsTable() {
  const tbody = document.getElementById('variantsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (state.filteredVariants.length === 0) {
    const emptyMsg = state.selectedProductIdForVariants
      ? 'Dòng sản phẩm này hiện chưa có phiên bản cấu hình nào. Bấm "+ Thêm Phiên Bản Cấu Hình" để tạo cấu hình mới.'
      : 'Không tìm thấy cấu hình nào phù hợp. Bấm "+ Thêm Phiên Bản Cấu Hình" để tạo.';
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding:30px; color:var(--admin-text-muted);">
          ${emptyMsg}
        </td>
      </tr>
    `;
    return;
  }

  state.filteredVariants.forEach((v, idx) => {
    const sp = v.sanPham || {};
    const imgUrl = (v.danhSachHinhAnh && v.danhSachHinhAnh[0] && v.danhSachHinhAnh[0].urlHinhAnh) ||
                   (sp.danhSachHinhAnh && sp.danhSachHinhAnh[0] && sp.danhSachHinhAnh[0].urlHinhAnh) ||
                   'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=120&q=80';
    const cpu = v.cpu?.tenCpu || '';
    const ram = v.ram ? `${v.ram.dungLuong || ''} ${v.ram.loaiRam || ''}` : '';
    const ssd = v.ocung ? `${v.ocung.loaiOCung || ''} ${v.ocung.dungLuong || ''}` : '';
    const gpu = v.cardDoHoa?.tenCard || '';
    const screen = v.manHinh ? `${v.manHinh.kichThuoc || ''} ${v.manHinh.tanSoQuet || ''}` : '';
    const color = v.mauSac?.tenMau || '';
    const specsDetail = [cpu, ram, ssd, gpu, screen, color].filter(Boolean).join(' • ');

    const stock = v.soLuong || 0;
    const isOutOfStock = stock <= 0;
    const isLowStock = stock > 0 && stock <= 3;
    const stockBadge = isOutOfStock
      ? `<span class="badge-status cancelled">Hết hàng</span>`
      : isLowStock
        ? `<span class="badge-status pending">${stock} (sắp hết)</span>`
        : `<span class="badge-status completed">${stock} máy</span>`;

    const statusBadge = (Number(v.trangThai) === 1 || v.trangThai === undefined || v.trangThai === null)
      ? `<span class="badge-status confirmed">Đang kinh doanh</span>`
      : `<span class="badge-status cancelled">Ngừng kinh doanh</span>`;

    // Calculate promotional pricing
    const giaGoc = Number(v.gia || 0);
    const coKm = Boolean(v.coKhuyenMai);
    const giaBan = (coKm && v.giaBan !== undefined && v.giaBan !== null) ? Number(v.giaBan) : giaGoc;

    let priceCellHtml = '';
    let promoCellHtml = '';

    if (coKm) {
      let discountText = '';
      if (v.loaiGiam === 1) {
        discountText = `-${Number(v.giaTriGiam)}%`;
      } else if (v.loaiGiam === 2) {
        discountText = `-${formatCurrency(v.giaTriGiam)}`;
      } else {
        discountText = '—';
      }

      priceCellHtml = `
        <td style="text-align:right;">
          <div style="font-weight:800; color:var(--admin-danger); font-size:0.92rem;">${formatCurrency(giaBan)}</div>
          <div style="font-size:0.75rem; color:var(--admin-text-muted); text-decoration:line-through; margin-top:2px;">${formatCurrency(giaGoc)}</div>
        </td>
      `;

      promoCellHtml = `
        <td style="text-align:center;">
          <span class="badge-status cancelled" style="font-weight:700; font-size:0.75rem;" title="${v.tenKhuyenMai || ''}">
            ${discountText}
          </span>
        </td>
      `;
    } else {
      priceCellHtml = `
        <td style="text-align:right; font-weight:800; color:var(--admin-danger); font-size:0.92rem;">
          ${formatCurrency(giaGoc)}
        </td>
      `;

      promoCellHtml = `
        <td style="text-align:center; color:var(--admin-text-muted); font-size:1rem; font-weight:500;">
          —
        </td>
      `;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align:center; font-weight:700; color:var(--admin-text-muted);">${idx + 1}</td>
      <td style="text-align:center;">
        <img src="${imgUrl}" alt="${v.maCtsp}" style="width:45px; height:45px; object-fit:contain; border-radius:4px; border:1px solid var(--admin-border); padding:2px;">
      </td>
      <td style="font-weight:800; color:var(--admin-primary);">${v.maCtsp || 'CTSP' + v.id}</td>
      <td style="font-weight:700; font-size:0.88rem;">${sp.tenSp || '---'}</td>
      <td style="font-size:0.8rem; color:var(--admin-text-main); line-height:1.4;">${specsDetail}</td>
      <td style="text-align:center;">${stockBadge}</td>
      ${priceCellHtml}
      ${promoCellHtml}
      <td style="text-align:center;">${statusBadge}</td>
      <td style="text-align:center;">
        <div style="display:flex; justify-content:center; gap:6px;">
          <button class="btn-admin btn-outline btn-sm" onclick="openEditVariantModal(${v.id})" title="Chỉnh sửa cấu hình">
            ✏️ Sửa
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.viewVariantsOfProduct = function(productId) {
  state.selectedProductIdForVariants = Number(productId);
  switchAdminTab('variants', { keepProductFilter: true });
};

window.updateVarGiaPreview = function(val) {
  const el = document.getElementById('varGiaPreview');
  if (!el) return;
  const num = parseFloat(val);
  if (isNaN(num) || num <= 0) {
    el.textContent = '';
  } else {
    el.textContent = formatCurrency(num);
  }
};

// Variant Add / Edit Modal
// ============================================================================
// VARIANT IMAGES MANAGEMENT (UPLOAD FROM PC, PREVIEW & DELETE)
// ============================================================================
function initVariantImageDropzone() {
  const dropzone = document.getElementById('varImagesPreviewGrid') || document.getElementById('btnSelectVariantImages');
  if (!dropzone) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt ? dt.files : null;
    if (files && files.length > 0) {
      handleVariantFiles(files);
    }
  });
}

window.handleVariantFilesSelect = function(e) {
  const files = e.target ? e.target.files : null;
  if (files && files.length > 0) {
    handleVariantFiles(files);
  }
  if (e.target) e.target.value = '';
};

function handleVariantFiles(files) {
  if (!state.variantModalImages) state.variantModalImages = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.startsWith('image/')) continue;

    const previewUrl = URL.createObjectURL(file);
    state.variantModalImages.push({
      id: null,
      url: previewUrl,
      file: file,
      isExisting: false
    });
  }
  renderVariantImagesPreview();
}

window.removeVariantImage = function(index) {
  if (!state.variantModalImages || !state.variantModalImages[index]) return;
  const item = state.variantModalImages[index];

  // Nếu là ảnh có sẵn từ database, lưu id để gửi lệnh DELETE lên API
  if (item.isExisting && item.id) {
    if (!state.variantDeletedImageIds) state.variantDeletedImageIds = [];
    state.variantDeletedImageIds.push(item.id);
  }

  // Giải phóng URL đối tượng tạm thời của trình duyệt nếu là file mới
  if (item.file && item.url && item.url.startsWith('blob:')) {
    try { URL.revokeObjectURL(item.url); } catch(e) {}
  }

  state.variantModalImages.splice(index, 1);
  renderVariantImagesPreview();
};

function renderVariantImagesPreview() {
  const grid = document.getElementById('varImagesPreviewGrid');
  const badge = document.getElementById('varImageCountBadge');
  if (!grid) return;

  // Đảm bảo layout 1 hàng ngang với thanh cuộn nhỏ gọn
  grid.style.display = 'flex';
  grid.style.flexDirection = 'row';
  grid.style.flexWrap = 'nowrap';
  grid.style.alignItems = 'center';
  grid.style.gap = '12px';
  grid.style.overflowX = 'auto';
  grid.style.overflowY = 'hidden';
  grid.style.padding = '6px 4px 10px 4px';
  grid.style.minHeight = '96px';
  grid.style.maxWidth = '100%';

  const count = state.variantModalImages ? state.variantModalImages.length : 0;
  if (badge) {
    badge.textContent = `${count} ảnh`;
    badge.className = count > 0 ? 'badge-status badge-success' : 'badge-status badge-info';
  }

  if (count === 0) {
    grid.innerHTML = `
      <div class="variant-images-empty" style="width:100%; padding:14px; text-align:center; color:#94a3b8; font-size:12px; background:#f8fafc; border-radius:6px; border:1px dashed #e2e8f0;">
        <i class="fa fa-images" style="margin-right:6px; color:#94a3b8;"></i>
        Chưa có hình ảnh nào được chọn. Nhấn nút "Chọn từ máy" ở trên để thêm ảnh.
      </div>
    `;
    return;
  }

  grid.innerHTML = state.variantModalImages.map((img, idx) => `
    <div class="variant-img-card" style="position:relative; flex:0 0 80px; width:80px; height:80px; min-width:80px; max-width:80px; min-height:80px; max-height:80px; border-radius:8px; overflow:hidden; border:1.5px solid #cbd5e1; background:#f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,0.08);" title="${img.file ? img.file.name : ('Hình ảnh ' + (idx + 1))}">
      <img src="${img.url}" alt="Ảnh ${idx + 1}" style="width:80px; height:80px; min-width:80px; max-width:80px; min-height:80px; max-height:80px; object-fit:cover; display:block;" onerror="this.src='https://placehold.co/80x80?text=Loi+Anh'">
      <button type="button" class="variant-img-remove-btn" onclick="removeVariantImage(${idx})" title="Xóa ảnh này" style="position:absolute; top:3px; right:3px; width:20px; height:20px; border-radius:50%; background:rgba(220,38,38,0.95); color:#fff; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; line-height:1; box-shadow:0 2px 4px rgba(0,0,0,0.25); z-index:10;">✕</button>
    </div>
  `).join('');
}

// Variant Add / Edit Modal
function setImeiInputError(input, errorEl, msg) {
  if (!input) return;
  if (msg) {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
    input.style.borderColor = '#ef4444';
    input.style.backgroundColor = '#fef2f2';
  } else {
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
    input.style.borderColor = 'var(--admin-border, #cbd5e1)';
    input.style.backgroundColor = '#ffffff';
  }
}

function updateImeiBadge(totalQty) {
  const badgeEl = document.getElementById('varImeiCountBadge');
  if (!badgeEl) return;
  const inputs = Array.from(document.querySelectorAll('.var-imei-input'));
  const filled = inputs.filter(inp => inp.value.trim().length > 0).length;
  badgeEl.textContent = `${filled} / ${totalQty} IMEI`;
  if (filled === totalQty && totalQty > 0) {
    badgeEl.className = 'badge-status badge-success';
  } else {
    badgeEl.className = 'badge-status badge-info';
  }
}

window.onVarSoLuongChange = function(val) {
  const qty = parseInt(val, 10);
  window.syncImeiInputs(isNaN(qty) ? 0 : qty);
};

window.syncImeiInputs = function(targetQty) {
  const listEl = document.getElementById('varImeiList');
  const badgeEl = document.getElementById('varImeiCountBadge');
  const globalErr = document.getElementById('varImeiGlobalError');
  if (!listEl) return;

  if (globalErr) {
    globalErr.style.display = 'none';
    globalErr.textContent = '';
  }

  // Lấy toàn bộ giá trị hiện có từ các ô IMEI đang hiển thị để giữ nguyên dữ liệu
  const currentInputs = Array.from(listEl.querySelectorAll('.var-imei-input'));
  const currentVals = currentInputs.map(inp => inp.value);

  if (targetQty <= 0) {
    listEl.innerHTML = `
      <div style="text-align:center; padding:12px; color:#94a3b8; font-size:12.5px;">
        <i class="fa fa-info-circle" style="margin-right:4px;"></i> Vui lòng nhập số lượng kho từ 1 trở lên để hiển thị danh sách IMEI.
      </div>
    `;
    if (badgeEl) {
      badgeEl.textContent = '0 / 0 IMEI';
      badgeEl.className = 'badge-status badge-secondary';
    }
    return;
  }

  // Nếu tăng: giữ nguyên dữ liệu các ô đã nhập, tạo thêm ô mới
  // Nếu giảm: chỉ giữ lại các ô đầu, xóa các ô phía sau
  const newVals = [];
  for (let i = 0; i < targetQty; i++) {
    newVals.push(i < currentVals.length ? currentVals[i] : '');
  }

  listEl.innerHTML = newVals.map((val, idx) => {
    const num = idx + 1;
    return `
      <div class="var-imei-row" style="display:flex; flex-direction:column;">
        <label class="pos-form-label" for="varImei_${num}" style="font-size:12.5px; font-weight:600; margin-bottom:4px; color:#334155;">
          IMEI ${num} (*)
        </label>
        <input type="text"
               class="pos-form-input var-imei-input"
               id="varImei_${num}"
               data-index="${num}"
               value="${val ? val.replace(/"/g, '&quot;') : ''}"
               placeholder="Nhập mã IMEI cho máy ${num}..."
               oninput="onImeiInputChange(this)"
               onblur="onImeiInputBlur(this)"
               style="font-family:monospace; letter-spacing:0.5px; background:#fff;"
               autocomplete="off">
        <div class="var-imei-error" id="varImeiError_${num}" style="display:none; color:#dc2626; font-size:12px; margin-top:3px; font-weight:500;"></div>
      </div>
    `;
  }).join('');

  updateImeiBadge(targetQty);
  validateAllImeisInForm(false);
};

window.validateAllImeisInForm = function(showEmptyErrors = false) {
  const inputs = Array.from(document.querySelectorAll('.var-imei-input'));
  let hasError = false;
  const seenMap = new Map();

  inputs.forEach((inp) => {
    const num = inp.dataset.index;
    const errEl = document.getElementById(`varImeiError_${num}`);
    const val = inp.value.trim();

    if (!val) {
      if (showEmptyErrors) {
        setImeiInputError(inp, errEl, 'Vui lòng nhập mã IMEI!');
        hasError = true;
      } else {
        setImeiInputError(inp, errEl, '');
      }
      return;
    }

    const lowerVal = val.toLowerCase();
    if (seenMap.has(lowerVal)) {
      setImeiInputError(inp, errEl, 'IMEI này đã được nhập ở phía trên.');
      hasError = true;
    } else {
      seenMap.set(lowerVal, num);
      if (errEl && errEl.textContent === 'IMEI này đã được nhập ở phía trên.') {
        setImeiInputError(inp, errEl, '');
      }
    }
  });

  return !hasError;
};

let imeiCheckDebounceTimers = {};

window.onImeiInputChange = function(input) {
  const num = input.dataset.index;
  const errEl = document.getElementById(`varImeiError_${num}`);
  const val = input.value.trim();

  const totalQty = parseInt(document.getElementById('varSoLuong')?.value, 10) || 0;
  updateImeiBadge(totalQty);

  if (imeiCheckDebounceTimers[num]) {
    clearTimeout(imeiCheckDebounceTimers[num]);
  }

  // Validate trùng trong form ngay khi gõ
  validateAllImeisInForm(false);

  // Nếu đang có lỗi trùng trong form, không gọi check DB
  if (errEl && errEl.style.display !== 'none' && errEl.textContent.includes('phía trên')) {
    return;
  }

  if (!val) return;

  // Debounce kiểm tra với Database
  imeiCheckDebounceTimers[num] = setTimeout(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/imei/check-exists?soImei=${encodeURIComponent(val)}`);
      if (res.ok) {
        const exists = await res.json();
        if (input.value.trim() === val) {
          if (exists) {
            setImeiInputError(input, errEl, 'IMEI này đã tồn tại trong database.');
          } else {
            if (errEl && errEl.textContent.includes('database')) {
              setImeiInputError(input, errEl, '');
            }
          }
        }
      }
    } catch(e) {
      console.warn('Lỗi khi kiểm tra IMEI tồn tại:', e);
    }
  }, 400);
};

window.onImeiInputBlur = async function(input) {
  const num = input.dataset.index;
  const errEl = document.getElementById(`varImeiError_${num}`);
  const val = input.value.trim();

  if (!val) {
    setImeiInputError(input, errEl, 'Vui lòng nhập mã IMEI!');
    return;
  }

  validateAllImeisInForm(false);
  if (errEl && errEl.style.display !== 'none' && errEl.textContent.includes('phía trên')) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/imei/check-exists?soImei=${encodeURIComponent(val)}`);
    if (res.ok) {
      const exists = await res.json();
      if (input.value.trim() === val) {
        if (exists) {
          setImeiInputError(input, errEl, 'IMEI này đã tồn tại trong database.');
        } else if (errEl && errEl.textContent.includes('database')) {
          setImeiInputError(input, errEl, '');
        }
      }
    }
  } catch(e) {}
};

window.openAddVariantModal = async function() {
  state.editingVariantId = null;
  document.getElementById('variantModalTitle').textContent = 'Thêm Phiên Bản Cấu Hình Mới';
  document.getElementById('varEditId').value = '';
  document.getElementById('varMaCtsp').value = 'CTSP' + String(state.allVariants.length + 1).padStart(3, '0');

  // Lấy giá cơ bản mặc định từ dòng sản phẩm đang chọn
  let defaultPrice = '';
  const targetSpId = state.selectedProductIdForVariants;
  if (targetSpId) {
    const prod = state.allProducts.find(p => Number(p.id) === Number(targetSpId)) ||
                 state.productsList.find(p => Number(p.id) === Number(targetSpId));
    if (prod && prod.giaCoBan) {
      defaultPrice = prod.giaCoBan;
    } else {
      const vMatch = state.allVariants.find(v => Number(v.sanPham?.id) === Number(targetSpId) && v.gia);
      if (vMatch) defaultPrice = vMatch.gia;
    }
  }

  document.getElementById('varGia').value = defaultPrice || '';
  updateVarGiaPreview(defaultPrice);

  const initialQty = 1;
  const soLuongInput = document.getElementById('varSoLuong');
  if (soLuongInput) {
    soLuongInput.value = initialQty;
    soLuongInput.disabled = false;
    soLuongInput.readOnly = false;
    soLuongInput.style.backgroundColor = '#ffffff';
    soLuongInput.style.cursor = 'text';
    soLuongInput.removeAttribute('title');
  }
  document.getElementById('varTrangThai').value = '1';

  // Ẩn thông báo khuyến mãi khi tạo mới
  const promoNoticeEl = document.getElementById('varPromoNotice');
  if (promoNoticeEl) {
    promoNoticeEl.style.display = 'none';
    promoNoticeEl.innerHTML = '';
  }

  // Ẩn nút [+ Thêm IMEI] khi thêm mới
  const btnAddImei = document.getElementById('btnOpenAddImeiModal');
  if (btnAddImei) btnAddImei.style.display = 'none';

  // Hiển thị và đồng bộ ô nhập IMEI theo Số Lượng Kho
  const imeiSec = document.getElementById('varImeiSection');
  if (imeiSec) imeiSec.style.display = 'block';
  syncImeiInputs(initialQty);

  // Khởi tạo trạng thái danh sách ảnh rỗng
  state.variantModalImages = [];
  state.variantDeletedImageIds = [];
  const fileInput = document.getElementById('varImageFiles');
  if (fileInput) fileInput.value = '';
  renderVariantImagesPreview();

  await populateVariantModalSelects();

  const modal = document.getElementById('variantModal');
  if (modal) modal.classList.add('active');
};

window.openEditVariantModal = async function(id) {
  const v = state.allVariants.find(item => item.id === id);
  if (!v) return;

  state.editingVariantId = id;
  document.getElementById('variantModalTitle').textContent = `Chỉnh Sửa Phiên Bản Cấu Hình (#${v.maCtsp || id})`;
  document.getElementById('varEditId').value = id;
  document.getElementById('varMaCtsp').value = v.maCtsp || '';
  document.getElementById('varGia').value = v.gia !== undefined ? v.gia : '';
  updateVarGiaPreview(v.gia);

  // Hiển thị mức giảm giá khuyến mãi nếu có
  const coKm = Boolean(v.coKhuyenMai);
  const promoNoticeEditEl = document.getElementById('varPromoNotice');
  if (promoNoticeEditEl) {
    if (coKm) {
      let discountText = '';
      if (v.loaiGiam === 1) {
        discountText = `-${Number(v.giaTriGiam)}%`;
      } else if (v.loaiGiam === 2) {
        discountText = `-${formatCurrency(v.giaTriGiam)}`;
      }
      if (discountText) {
        promoNoticeEditEl.style.display = 'block';
        promoNoticeEditEl.innerHTML = `
          <div style="margin-top:6px;">
            <span class="badge-status cancelled" style="font-weight:700; font-size:0.75rem;" title="${v.tenKhuyenMai || ''}">
              ${discountText}
            </span>
          </div>
        `;
      } else {
        promoNoticeEditEl.style.display = 'none';
        promoNoticeEditEl.innerHTML = '';
      }
    } else {
      promoNoticeEditEl.style.display = 'none';
      promoNoticeEditEl.innerHTML = '';
    }
  }

  // 2. SỐ LƯỢNG KHO: Không cho người dùng sửa trực tiếp "Số Lượng Kho" ở màn hình chỉnh sửa CTSP
  // Chuyển trường Số Lượng Kho thành readonly/disabled, tự động cập nhật theo số IMEI trạng thái "Trong kho"
  const soLuongInput = document.getElementById('varSoLuong');
  if (soLuongInput) {
    soLuongInput.value = v.soLuong !== undefined ? v.soLuong : 0;
    soLuongInput.disabled = true;
    soLuongInput.readOnly = true;
    soLuongInput.style.backgroundColor = '#f1f5f9';
    soLuongInput.style.cursor = 'not-allowed';
    soLuongInput.title = 'Số lượng kho được tính tự động dựa trên số IMEI trong kho';
  }
  const varTrangThaiSelect = document.getElementById('varTrangThai');
  if (varTrangThaiSelect) {
    varTrangThaiSelect.value = (v.trangThai !== undefined && v.trangThai !== null) ? String(v.trangThai) : '1';
  }

  // Hiển thị nút [+ Thêm IMEI] khi chỉnh sửa CTSP
  const btnAddImei = document.getElementById('btnOpenAddImeiModal');
  if (btnAddImei) btnAddImei.style.display = 'inline-flex';

  // Hiển thị danh sách IMEI hiện có dạng view-only chips và cập nhật số lượng kho
  const imeiSec = document.getElementById('varImeiSection');
  if (imeiSec) {
    imeiSec.style.display = 'block';
    await refreshEditVariantImeis(id);
  }

  // Nạp danh sách ảnh đã có từ cơ sở dữ liệu
  state.variantDeletedImageIds = [];
  const fileInput = document.getElementById('varImageFiles');
  if (fileInput) fileInput.value = '';

  state.variantModalImages = (v.danhSachHinhAnh && v.danhSachHinhAnh.length > 0)
    ? v.danhSachHinhAnh.map(img => ({
        id: img.id,
        url: img.urlHinhAnh,
        file: null,
        isExisting: true
      }))
    : [];
  renderVariantImagesPreview();

  await populateVariantModalSelects(v);

  const modal = document.getElementById('variantModal');
  if (modal) modal.classList.add('active');
};

async function populateVariantModalSelects(existing = {}) {
  // Populate SanPham dropdown & lock to current product
  const spSelect = document.getElementById('varSanPhamSelect');
  if (spSelect) {
    const targetSpId = existing.sanPham?.id || state.selectedProductIdForVariants;
    try {
      const res = await fetch(`${API_BASE_URL}/san-pham`);
      if (res.ok) {
        const prods = await res.json();
        if (targetSpId) {
          const matched = prods.find(p => Number(p.id) === Number(targetSpId));
          if (matched) {
            spSelect.innerHTML = `<option value="${matched.id}" selected>${matched.maSp} - ${matched.tenSp}</option>`;
          } else {
            spSelect.innerHTML = prods.map(p => `<option value="${p.id}" ${Number(p.id) === Number(targetSpId) ? 'selected' : ''}>${p.maSp} - ${p.tenSp}</option>`).join('');
          }
        } else {
          spSelect.innerHTML = prods.map(p => `<option value="${p.id}">${p.maSp} - ${p.tenSp}</option>`).join('');
        }
      }
    } catch(e) {
      if (targetSpId) {
        const found = state.allProducts.find(p => Number(p.id) === Number(targetSpId)) ||
                      state.productsList.find(p => Number(p.id) === Number(targetSpId));
        if (found) {
          spSelect.innerHTML = `<option value="${found.id}" selected>${found.maSp || 'SP' + found.id} - ${found.tenSp}</option>`;
        }
      }
    }
    // Cố định dòng laptop đã chọn, không cho phép thay đổi
    spSelect.disabled = true;
    spSelect.style.backgroundColor = '#f1f5f9';
    spSelect.style.cursor = 'not-allowed';
    spSelect.style.color = '#1e293b';
    spSelect.style.fontWeight = '700';
    spSelect.style.opacity = '1';
  }

  // Helper to load and populate each attribute
  const loadAttrOptions = async (endpoint, selectId, formatFn, selectedId) => {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`);
      if (res.ok) {
        const items = await res.json();
        sel.innerHTML = items.map(i => `<option value="${i.id}" ${i.id === selectedId ? 'selected' : ''}>${formatFn(i)}</option>`).join('');
      }
    } catch(e) {}
  };

  await Promise.all([
    loadAttrOptions('/cpu', 'varCpuSelect', i => i.tenCpu, existing.cpu?.id),
    loadAttrOptions('/ram', 'varRamSelect', i => `${i.dungLuong} ${i.loaiRam || ''}`, existing.ram?.id),
    loadAttrOptions('/o-cung', 'varOCungSelect', i => `${i.loaiOCung} ${i.dungLuong}`, existing.ocung?.id),
    loadAttrOptions('/card-do-hoa', 'varCardDoHoaSelect', i => i.tenCard, existing.cardDoHoa?.id),
    loadAttrOptions('/man-hinh', 'varManHinhSelect', i => `${i.kichThuoc} ${i.doPhanGiai} ${i.tanSoQuet || ''}`, existing.manHinh?.id),
    loadAttrOptions('/mau-sac', 'varMauSacSelect', i => i.tenMau, existing.mauSac?.id)
  ]);
}

window.closeVariantModal = function() {
  const modal = document.getElementById('variantModal');
  if (modal) modal.classList.remove('active');
  // Xóa timer debounce nếu có
  Object.keys(imeiCheckDebounceTimers).forEach(k => clearTimeout(imeiCheckDebounceTimers[k]));
  imeiCheckDebounceTimers = {};
};

// ============================================================================
// PART 5.1: QUẢN LÝ IMEI CHO PHIÊN BẢN CẤU HÌNH (REFRESH & MODAL THÊM IMEI MỚI)
// ============================================================================

window.refreshEditVariantImeis = async function(ctspId) {
  const listEl = document.getElementById('varImeiList');
  const badgeEl = document.getElementById('varImeiCountBadge');
  const soLuongInput = document.getElementById('varSoLuong');

  if (!listEl) return;
  listEl.innerHTML = '<div style="text-align:center; padding:10px; color:#64748b; font-size:12px;"><i class="fa fa-spinner fa-spin"></i> Đang tải danh sách IMEI...</div>';

  try {
    const imeiRes = await fetch(`${API_BASE_URL}/imei/chi-tiet-san-pham/${ctspId}`);
    if (imeiRes.ok) {
      const imeis = await imeiRes.json();
      const inStockImeis = imeis.filter(im => Number(im.trangThai) === 0);
      const inStockCount = inStockImeis.length;

      // Cập nhật số lượng kho và badge theo số IMEI Trong kho (0)
      if (soLuongInput) {
        soLuongInput.value = inStockCount;
      }
      if (badgeEl) {
        badgeEl.textContent = `${inStockCount} IMEI trong kho`;
        badgeEl.className = 'badge-status badge-info';
      }

      if (imeis.length === 0) {
        listEl.innerHTML = '<div style="color:#94a3b8; font-size:12px; text-align:center; padding:8px;">Chưa có IMEI nào cho phiên bản này.</div>';
      } else {
        listEl.innerHTML = `
          <div style="display:flex; flex-wrap:wrap; gap:8px; max-height:140px; overflow-y:auto; padding:4px;">
            ${imeis.map(im => {
              const isSold = Number(im.trangThai) === 1;
              return `
                <span style="font-family:monospace; font-size:12.5px; font-weight:700; padding:5px 10px; border-radius:6px; background:#e0f2fe; color:#0284c7; border:1px solid #bae6fd; display:inline-flex; align-items:center; gap:6px;">
                  <span>${im.soImei}</span>
                  ${isSold 
                    ? '<span style="color:#ef4444; font-size:11.5px; font-weight:600;">(Đã bán)</span>' 
                    : '<span style="color:#10b981; font-size:11.5px; font-weight:600;">(Trong kho)</span>'}
                </span>
              `;
            }).join('')}
          </div>
        `;
      }
    } else {
      listEl.innerHTML = '<div style="color:#94a3b8; font-size:12px; text-align:center; padding:8px;">Không thể tải danh sách IMEI.</div>';
    }
  } catch(e) {
    listEl.innerHTML = '<div style="color:#94a3b8; font-size:12px; text-align:center; padding:8px;">Lỗi khi tải danh sách IMEI.</div>';
  }
};

window.openAddImeiModal = function() {
  const variantId = state.editingVariantId;
  if (!variantId) {
    showToast('Vui lòng chọn phiên bản cấu hình cần chỉnh sửa!', 'error');
    return;
  }

  const v = state.allVariants.find(item => item.id === variantId);
  const infoEl = document.getElementById('addImeiVariantInfo');
  if (infoEl) {
    let spName = '';
    if (v?.sanPham?.tenSp) {
      spName = v.sanPham.tenSp;
    } else {
      const spId = v?.sanPham?.id || v?.idSanPham;
      const foundSp = (state.allProducts || []).find(p => p.id === spId) || (state.productsList || []).find(p => p.id === spId);
      if (foundSp) spName = foundSp.tenSp;
    }
    infoEl.textContent = `${v?.maCtsp || ('CTSP' + variantId)} - ${spName || 'Sản phẩm'}`;
  }

  const qtyInput = document.getElementById('addImeiQty');
  if (qtyInput) qtyInput.value = 2;

  syncAddImeiInputs(2);

  const modal = document.getElementById('addImeiModal');
  if (modal) modal.classList.add('active');
};

window.closeAddImeiModal = function() {
  const modal = document.getElementById('addImeiModal');
  if (modal) modal.classList.remove('active');
  const globalErr = document.getElementById('addImeiGlobalError');
  if (globalErr) {
    globalErr.style.display = 'none';
    globalErr.textContent = '';
  }
  Object.keys(addImeiDebounceTimers).forEach(k => clearTimeout(addImeiDebounceTimers[k]));
  addImeiDebounceTimers = {};
};

window.onAddImeiQtyChange = function(val) {
  const qty = parseInt(val, 10);
  if (isNaN(qty) || qty < 0) {
    syncAddImeiInputs(0);
  } else {
    syncAddImeiInputs(qty);
  }
};

window.syncAddImeiInputs = function(targetQty) {
  const listEl = document.getElementById('addImeiList');
  const globalErr = document.getElementById('addImeiGlobalError');
  if (!listEl) return;

  if (globalErr) {
    globalErr.style.display = 'none';
    globalErr.textContent = '';
  }

  // Lấy toàn bộ giá trị hiện có từ các ô IMEI đang hiển thị để giữ nguyên dữ liệu
  const currentInputs = Array.from(listEl.querySelectorAll('.add-imei-input'));
  const currentVals = currentInputs.map(inp => inp.value);

  if (targetQty <= 0) {
    listEl.innerHTML = `
      <div style="text-align:center; padding:12px; color:#94a3b8; font-size:12.5px;">
        <i class="fa fa-info-circle" style="margin-right:4px;"></i> Vui lòng nhập số lượng thêm từ 1 trở lên.
      </div>
    `;
    return;
  }

  // Tăng: giữ dữ liệu cũ, thêm ô mới. Giảm: giữ các ô đầu, cắt bớt ô sau.
  const newVals = [];
  for (let i = 0; i < targetQty; i++) {
    newVals.push(i < currentVals.length ? currentVals[i] : '');
  }

  listEl.innerHTML = newVals.map((val, idx) => {
    const num = idx + 1;
    return `
      <div class="add-imei-row" style="display:flex; flex-direction:column; margin-bottom:8px;">
        <label class="pos-form-label" for="addImeiInput_${num}" style="font-size:12.5px; font-weight:600; margin-bottom:4px; color:#334155;">
          IMEI ${num}:
        </label>
        <input type="text"
               class="pos-form-input add-imei-input"
               id="addImeiInput_${num}"
               data-index="${num}"
               value="${val ? val.replace(/"/g, '&quot;') : ''}"
               placeholder="Nhập mã IMEI cho máy ${num}..."
               oninput="onAddImeiInputChange(this)"
               onblur="onAddImeiInputBlur(this)"
               style="font-family:monospace; letter-spacing:0.5px; background:#fff;"
               autocomplete="off">
        <div class="add-imei-error" id="addImeiError_${num}" style="display:none; color:#dc2626; font-size:12px; margin-top:4px; font-weight:500;"></div>
      </div>
    `;
  }).join('');

  validateAddImeisInModal(false);
};

window.validateAddImeisInModal = function(showEmptyErrors = false) {
  const inputs = Array.from(document.querySelectorAll('.add-imei-input'));
  let hasError = false;
  const seenMap = new Map();

  inputs.forEach((inp) => {
    const num = inp.dataset.index;
    const errEl = document.getElementById(`addImeiError_${num}`);
    const val = inp.value.trim();

    if (!val) {
      if (showEmptyErrors) {
        setImeiInputError(inp, errEl, 'Vui lòng nhập mã IMEI!');
        hasError = true;
      } else {
        if (errEl && !errEl.textContent.includes('hệ thống') && !errEl.textContent.includes('database')) {
          setImeiInputError(inp, errEl, '');
        }
      }
      return;
    }

    const lowerVal = val.toLowerCase();
    if (seenMap.has(lowerVal)) {
      setImeiInputError(inp, errEl, 'IMEI này đã được nhập ở phía trên.');
      hasError = true;
    } else {
      seenMap.set(lowerVal, num);
      if (errEl && errEl.textContent === 'IMEI này đã được nhập ở phía trên.') {
        setImeiInputError(inp, errEl, '');
      }
    }
  });

  return !hasError;
};

let addImeiDebounceTimers = {};

window.onAddImeiInputChange = function(input) {
  const num = input.dataset.index;
  const errEl = document.getElementById(`addImeiError_${num}`);
  const val = input.value.trim();

  if (addImeiDebounceTimers[num]) {
    clearTimeout(addImeiDebounceTimers[num]);
  }

  // Validate trùng nhau trong modal ngay khi gõ
  validateAddImeisInModal(false);

  // Nếu đang có lỗi trùng lặp trong modal thì không check DB
  if (errEl && errEl.style.display !== 'none' && errEl.textContent.includes('phía trên')) {
    return;
  }

  if (!val) return;

  // Debounce kiểm tra với Database
  addImeiDebounceTimers[num] = setTimeout(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/imei/check-exists?soImei=${encodeURIComponent(val)}`);
      if (res.ok) {
        const exists = await res.json();
        if (input.value.trim() === val) {
          if (exists) {
            setImeiInputError(input, errEl, 'IMEI đã tồn tại trong hệ thống.');
          } else {
            if (errEl && (errEl.textContent.includes('hệ thống') || errEl.textContent.includes('database'))) {
              setImeiInputError(input, errEl, '');
            }
          }
        }
      }
    } catch(e) {
      console.warn('Lỗi khi kiểm tra IMEI tồn tại:', e);
    }
  }, 400);
};

window.onAddImeiInputBlur = async function(input) {
  const num = input.dataset.index;
  const errEl = document.getElementById(`addImeiError_${num}`);
  const val = input.value.trim();

  if (!val) {
    setImeiInputError(input, errEl, 'Vui lòng nhập mã IMEI!');
    return;
  }

  validateAddImeisInModal(false);
  if (errEl && errEl.style.display !== 'none' && errEl.textContent.includes('phía trên')) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/imei/check-exists?soImei=${encodeURIComponent(val)}`);
    if (res.ok) {
      const exists = await res.json();
      if (input.value.trim() === val) {
        if (exists) {
          setImeiInputError(input, errEl, 'IMEI đã tồn tại trong hệ thống.');
        } else if (errEl && (errEl.textContent.includes('hệ thống') || errEl.textContent.includes('database'))) {
          setImeiInputError(input, errEl, '');
        }
      }
    }
  } catch(e) {}
};

window.submitAddImeiForm = async function(e) {
  if (e) e.preventDefault();

  const variantId = state.editingVariantId;
  if (!variantId) {
    showToast('Không xác định được phiên bản cấu hình!', 'error');
    return;
  }

  const qtyInput = document.getElementById('addImeiQty');
  const targetQty = parseInt(qtyInput?.value, 10) || 0;
  if (targetQty <= 0) {
    showToast('Số lượng thêm phải lớn hơn 0!', 'error');
    if (qtyInput) qtyInput.focus();
    return;
  }

  const imeiInputs = Array.from(document.querySelectorAll('.add-imei-input'));
  if (imeiInputs.length !== targetQty) {
    showToast(`Số lượng IMEI (${imeiInputs.length}) không khớp với số lượng thêm (${targetQty})!`, 'error');
    return;
  }

  // 1. Kiểm tra rỗng và trùng trong modal
  const isValidLocal = validateAddImeisInModal(true);
  if (!isValidLocal) {
    const firstFaulty = imeiInputs.find(inp => {
      const num = inp.dataset.index;
      const errEl = document.getElementById(`addImeiError_${num}`);
      return errEl && errEl.style.display !== 'none';
    });
    if (firstFaulty) firstFaulty.focus();
    showToast('Vui lòng kiểm tra lại các ô IMEI bị lỗi!', 'error');
    return;
  }

  // Kiểm tra không được để trống bất kỳ IMEI nào
  const emptyInput = imeiInputs.find(inp => !inp.value.trim());
  if (emptyInput) {
    const num = emptyInput.dataset.index;
    const errEl = document.getElementById(`addImeiError_${num}`);
    setImeiInputError(emptyInput, errEl, 'Không được để trống IMEI!');
    emptyInput.focus();
    showToast('Vui lòng nhập đầy đủ mã IMEI!', 'error');
    return;
  }

  const danhSachImei = imeiInputs.map(inp => inp.value.trim());

  // 2. Kiểm tra hàng loạt với DB trước khi gửi
  try {
    const checkRes = await fetch(`${API_BASE_URL}/imei/check-existing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(danhSachImei)
    });
    if (checkRes.ok) {
      const existingList = await checkRes.json();
      if (existingList && existingList.length > 0) {
        let firstFaulty = null;
        imeiInputs.forEach(inp => {
          if (existingList.includes(inp.value.trim())) {
            const num = inp.dataset.index;
            const errEl = document.getElementById(`addImeiError_${num}`);
            setImeiInputError(inp, errEl, 'IMEI đã tồn tại trong hệ thống.');
            if (!firstFaulty) firstFaulty = inp;
          }
        });
        if (firstFaulty) firstFaulty.focus();
        showToast(`Có ${existingList.length} IMEI đã tồn tại trong hệ thống!`, 'error');
        return;
      }
    }
  } catch(err) {
    console.warn('Lỗi khi kiểm tra IMEI trùng lặp:', err);
  }

  // 3. Gửi API thêm nhiều IMEI
  const submitBtn = document.getElementById('btnSubmitAddImei');
  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang thêm...';
    }

    const payload = {
      idChiTietSanPham: variantId,
      danhSachImei: danhSachImei
    };

    const res = await fetch(`${API_BASE_URL}/imei/them-nhieu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const errMsg = errJson?.message || 'Có lỗi xảy ra khi thêm IMEI!';
      showToast(errMsg, 'error');
      return;
    }

    const resData = await res.json().catch(() => null);
    showToast(`Đã thêm thành công ${danhSachImei.length} IMEI vào kho!`);

    // Đóng modal thêm IMEI
    closeAddImeiModal();

    // Cập nhật lại giao diện chỉnh sửa CTSP (Số lượng kho, badge, danh sách chips)
    await refreshEditVariantImeis(variantId);

    // Cập nhật state.allVariants và load lại bảng variants ngoài màn hình
    if (resData && typeof resData.soLuongKho === 'number') {
      const v = state.allVariants.find(item => item.id === variantId);
      if (v) {
        v.soLuong = resData.soLuongKho;
      }
    }
    loadVariantsTable();
    loadProductsList();

  } catch(err) {
    showToast('Lỗi khi thêm IMEI: ' + err.message, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Thêm IMEI';
    }
  }
};

window.handleVariantFormSubmit = async function(e) {
  e.preventDefault();
  const isEditing = state.editingVariantId !== null;
  const selectedSpId = parseInt(document.getElementById('varSanPhamSelect')?.value) || Number(state.selectedProductIdForVariants);
  const soLuong = parseInt(document.getElementById('varSoLuong')?.value, 10) || 0;

  let danhSachImei = [];

  if (!isEditing) {
    if (soLuong <= 0) {
      showToast('Số lượng kho phải lớn hơn 0!', 'error');
      document.getElementById('varSoLuong')?.focus();
      return;
    }

    const imeiInputs = Array.from(document.querySelectorAll('.var-imei-input'));
    if (imeiInputs.length !== soLuong) {
      showToast(`Số lượng IMEI (${imeiInputs.length}) phải đúng bằng số lượng kho (${soLuong})!`, 'error');
      return;
    }

    // 1. Kiểm tra để trống & trùng lặp nội bộ trong form
    const isFormValid = validateAllImeisInForm(true);
    if (!isFormValid) {
      const firstErrorInput = imeiInputs.find(inp => {
        const num = inp.dataset.index;
        const errEl = document.getElementById(`varImeiError_${num}`);
        return errEl && errEl.style.display !== 'none';
      });
      if (firstErrorInput) firstErrorInput.focus();
      showToast('Vui lòng kiểm tra lại danh sách IMEI bị lỗi!', 'error');
      return;
    }

    danhSachImei = imeiInputs.map(i => i.value.trim());

    // 2. Kiểm tra trùng trong Database hàng loạt trước khi tạo
    try {
      const checkRes = await fetch(`${API_BASE_URL}/imei/check-existing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(danhSachImei)
      });
      if (checkRes.ok) {
        const existingList = await checkRes.json();
        if (existingList && existingList.length > 0) {
          let firstFaulty = null;
          imeiInputs.forEach(inp => {
            if (existingList.includes(inp.value.trim())) {
              const num = inp.dataset.index;
              const errEl = document.getElementById(`varImeiError_${num}`);
              setImeiInputError(inp, errEl, 'IMEI này đã tồn tại trong database.');
              if (!firstFaulty) firstFaulty = inp;
            }
          });
          if (firstFaulty) firstFaulty.focus();
          showToast(`Có ${existingList.length} IMEI đã tồn tại trong database!`, 'error');
          return;
        }
      }
    } catch(checkErr) {
      console.warn('Lỗi khi kiểm tra IMEI với server:', checkErr);
    }
  }

  const payload = {
    maCtsp: document.getElementById('varMaCtsp')?.value.trim(),
    idSanPham: selectedSpId,
    idCpu: parseInt(document.getElementById('varCpuSelect')?.value),
    idRam: parseInt(document.getElementById('varRamSelect')?.value),
    idOCung: parseInt(document.getElementById('varOCungSelect')?.value),
    idCardDoHoa: parseInt(document.getElementById('varCardDoHoaSelect')?.value),
    idManHinh: parseInt(document.getElementById('varManHinhSelect')?.value),
    idMauSac: parseInt(document.getElementById('varMauSacSelect')?.value),
    sanPham: { id: selectedSpId },
    cpu: { id: parseInt(document.getElementById('varCpuSelect')?.value) },
    ram: { id: parseInt(document.getElementById('varRamSelect')?.value) },
    ocung: { id: parseInt(document.getElementById('varOCungSelect')?.value) },
    cardDoHoa: { id: parseInt(document.getElementById('varCardDoHoaSelect')?.value) },
    manHinh: { id: parseInt(document.getElementById('varManHinhSelect')?.value) },
    mauSac: { id: parseInt(document.getElementById('varMauSacSelect')?.value) },
    gia: parseFloat(document.getElementById('varGia')?.value) || 0,
    soLuong: soLuong,
    trangThai: (document.getElementById('varTrangThai')?.value !== undefined && document.getElementById('varTrangThai')?.value !== '')
      ? parseInt(document.getElementById('varTrangThai').value, 10)
      : 1,
    moTa: (isEditing ? state.allVariants.find(v => v.id === state.editingVariantId)?.moTa : '') || ''
  };

  if (!isEditing) {
    payload.danhSachImei = danhSachImei;
  }

  const btn = document.getElementById('btnSaveVariant');
  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Đang lưu...';
    }

    const url = isEditing ? `${API_BASE_URL}/chi-tiet-san-pham/${state.editingVariantId}` : `${API_BASE_URL}/chi-tiet-san-pham`;
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const errMsg = errJson?.message || 'Có lỗi xảy ra khi lưu phiên bản cấu hình!';
      showToast(errMsg, 'error');
      return;
    }

    const savedVariant = await res.json().catch(() => null);
    const varId = savedVariant?.id || (isEditing ? state.editingVariantId : null);

    if (varId) {
      // 1. Xóa các hình ảnh đã bị người dùng bấm nút xóa (X)
      if (state.variantDeletedImageIds && state.variantDeletedImageIds.length > 0) {
        for (const delId of state.variantDeletedImageIds) {
          try {
            await fetch(`${API_BASE_URL}/hinh-anh-chi-tiet/${delId}`, { method: 'DELETE' });
          } catch(delErr) {
            console.warn('Lỗi khi xóa ảnh chi tiết cũ:', delErr);
          }
        }
      }

      // 2. Tải lên và lưu các hình ảnh mới được chọn từ máy tính
      const newImages = (state.variantModalImages || []).filter(item => item.file);
      for (const item of newImages) {
        try {
          const formData = new FormData();
          formData.append('file', item.file);
          const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            const finalUrl = uploadData.url || uploadData.relativeUrl;
            if (finalUrl) {
              await fetch(`${API_BASE_URL}/hinh-anh-chi-tiet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  urlHinhAnh: finalUrl,
                  chiTietSanPham: { id: varId }
                })
              });
            }
          } else {
            console.warn('Upload ảnh không thành công, mã phản hồi:', uploadRes.status);
          }
        } catch(uploadErr) {
          console.error('Lỗi khi tải file ảnh lên:', uploadErr);
        }
      }
    }

    showToast(`${isEditing ? 'Cập nhật' : 'Thêm mới'} cấu hình chi tiết và danh sách IMEI thành công!`);
    closeVariantModal();

    // Điều hướng trở lại chính xác trang chi tiết sản phẩm vừa chọn
    state.selectedProductIdForVariants = Number(selectedSpId);
    switchAdminTab('variants', { keepProductFilter: true });
    await loadVariantsTable();
    loadProductsList(); // Cập nhật danh sách picker ở màn hình bán hàng

  } catch(err) {
    showToast('Lỗi: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Lưu Cấu Hình';
    }
  }
};

window.deleteVariant = async function(id, name) {
  if (!confirm(`Xác nhận xóa cấu hình "${name}" (ID: ${id})?`)) return;

  try {
    const res = await fetch(`${API_BASE_URL}/chi-tiet-san-pham/${id}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
      showToast(`Đã xóa cấu hình "${name}" thành công!`);
    } else {
      showToast('Không thể xóa! Phiên bản cấu hình này đã có trong hóa đơn hoặc giỏ hàng.', 'error');
      return;
    }
    loadVariantsTable();
    loadProductsList();
  } catch(err) {
    showToast('Lỗi khi xóa: ' + err.message, 'error');
  }
};

function getFallbackProductsList() {
  return [
    { id: 1, maSp: 'SP001', tenSp: 'ASUS TUF Gaming A15', giaCoBan: 18990000, danhMuc: { tenDanhMuc: 'Laptop Gaming' }, thuongHieu: { tenThuongHieu: 'ASUS' } },
    { id: 2, maSp: 'SP002', tenSp: 'ASUS Zenbook 14 OLED', giaCoBan: 22990000, danhMuc: { tenDanhMuc: 'Laptop Mỏng nhẹ' }, thuongHieu: { tenThuongHieu: 'ASUS' } },
    { id: 3, maSp: 'SP003', tenSp: 'Dell Inspiron 15', giaCoBan: 15990000, danhMuc: { tenDanhMuc: 'Laptop Văn phòng' }, thuongHieu: { tenThuongHieu: 'Dell' } },
    { id: 4, maSp: 'SP004', tenSp: 'Lenovo Legion 5', giaCoBan: 26990000, danhMuc: { tenDanhMuc: 'Laptop Gaming' }, thuongHieu: { tenThuongHieu: 'Lenovo' } },
    { id: 5, maSp: 'SP005', tenSp: 'Acer Nitro V 15', giaCoBan: 19990000, danhMuc: { tenDanhMuc: 'Laptop Gaming' }, thuongHieu: { tenThuongHieu: 'Acer' } }
  ];
}

// ============================================================================
// PART 6: QUẢN LÝ IMEI (SCREEN LOGIC)
// ============================================================================
window.loadImeisTable = async function() {
  const loadingEl = document.getElementById('imeisLoadingIndicator');
  const tbody = document.getElementById('imeisTableBody');
  const countBadge = document.getElementById('imeiCountBadge');

  if (loadingEl) {
    loadingEl.style.display = 'block';
    loadingEl.innerHTML = '<i class="fa fa-spinner fa-spin" style="margin-right:6px;"></i> Đang tải danh sách IMEI...';
  }
  if (tbody) tbody.innerHTML = '';

  try {
    const res = await fetch(`${API_BASE_URL}/imei`);
    if (res.ok) {
      state.allImeis = await res.json();
    } else {
      state.allImeis = [];
    }
  } catch (err) {
    console.warn('Lỗi khi tải danh sách IMEI:', err);
    state.allImeis = [];
  }

  // Populate product filter dropdown
  populateImeiProductFilter();

  // Filter & Render
  filterImeisTable();
};

function populateImeiProductFilter() {
  const sel = document.getElementById('filterImeiProduct');
  if (!sel) return;
  const currentVal = sel.value;

  const productsMap = new Map();
  (state.allImeis || []).forEach(item => {
    const sp = item.chiTietSanPham?.sanPham;
    if (sp && sp.id && !productsMap.has(sp.id)) {
      productsMap.set(sp.id, sp.tenSp || ('SP' + sp.id));
    }
  });

  (state.allProducts || []).forEach(p => {
    if (p.id && !productsMap.has(p.id)) {
      productsMap.set(p.id, p.tenSp);
    }
  });

  let optionsHtml = '<option value="ALL">Sản phẩm (Tất cả)</option>';
  productsMap.forEach((name, id) => {
    optionsHtml += `<option value="${id}">${name}</option>`;
  });
  sel.innerHTML = optionsHtml;

  if (currentVal && (currentVal === 'ALL' || productsMap.has(Number(currentVal)))) {
    sel.value = currentVal;
  }
}

function formatCompactSpec(ctsp) {
  if (!ctsp) return 'Tiêu chuẩn';

  const cpuName = ctsp.cpu?.tenCpu || '';
  let cpuShort = cpuName;
  if (/core\s*i3/i.test(cpuName) || /i3-/i.test(cpuName)) cpuShort = 'i3';
  else if (/core\s*i5/i.test(cpuName) || /i5-/i.test(cpuName)) cpuShort = 'i5';
  else if (/core\s*i7/i.test(cpuName) || /i7-/i.test(cpuName)) cpuShort = 'i7';
  else if (/core\s*i9/i.test(cpuName) || /i9-/i.test(cpuName)) cpuShort = 'i9';
  else if (/ultra\s*5/i.test(cpuName)) cpuShort = 'Ultra 5';
  else if (/ultra\s*7/i.test(cpuName)) cpuShort = 'Ultra 7';
  else if (/ryzen\s*5/i.test(cpuName) || /r5-/i.test(cpuName)) cpuShort = 'R5';
  else if (/ryzen\s*7/i.test(cpuName) || /r7-/i.test(cpuName)) cpuShort = 'R7';
  else if (/ryzen\s*9/i.test(cpuName) || /r9-/i.test(cpuName)) cpuShort = 'R9';
  else if (cpuName.length > 14) cpuShort = cpuName.substring(0, 14);

  const ramShort = ctsp.ram?.dungLuong || '';
  const oCungShort = ctsp.ocung?.dungLuong || ctsp.oCung?.dungLuong || '';

  const parts = [cpuShort, ramShort, oCungShort].filter(Boolean);
  if (parts.length > 0) return parts.join('/');
  return ctsp.moTa || 'Tiêu chuẩn';
}

function getImeiStatusBadge(status, id) {
  const s = Number(status);
  if (s === 0) {
    return `<span class="badge-status badge-success" style="padding:4px 12px; font-weight:600; font-size:12px; cursor:pointer;" onclick="changeImeiStatusQuick(${id}, ${s})" title="Nhấn để đổi trạng thái">Còn hàng</span>`;
  } else if (s === 1) {
    return `<span class="badge-status badge-secondary" style="padding:4px 12px; font-weight:600; font-size:12px; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; cursor:pointer;" onclick="changeImeiStatusQuick(${id}, ${s})" title="Nhấn để đổi trạng thái">Đã bán</span>`;
  } else if (s === 2 || s === 4) {
    return `<span class="badge-status badge-warning" style="padding:4px 12px; font-weight:600; font-size:12px; background:#fef3c7; color:#b45309; border:1px solid #fde68a; cursor:pointer;" onclick="changeImeiStatusQuick(${id}, ${s})" title="Nhấn để đổi trạng thái">Bảo hành</span>`;
  } else if (s === 3) {
    return `<span class="badge-status badge-danger" style="padding:4px 12px; font-weight:600; font-size:12px; cursor:pointer;" onclick="changeImeiStatusQuick(${id}, ${s})" title="Nhấn để đổi trạng thái">Lỗi / Đổi trả</span>`;
  }
  return `<span class="badge-status badge-info" style="padding:4px 12px; font-weight:600; font-size:12px; cursor:pointer;" onclick="changeImeiStatusQuick(${id}, ${s})">Khác</span>`;
}

window.changeImeiStatusQuick = async function(id, currentStatus) {
  const statusNames = { 0: 'Còn hàng', 1: 'Đã bán', 2: 'Bảo hành' };
  const nextStatus = currentStatus === 0 ? 1 : (currentStatus === 1 ? 2 : 0);
  const nextName = statusNames[nextStatus] || 'Còn hàng';
  const currName = statusNames[currentStatus] || 'Hiện tại';

  if (!confirm(`Bạn có muốn đổi trạng thái IMEI này từ "${currName}" sang "${nextName}"?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/imei/${id}/trang-thai/${nextStatus}`, {
      method: 'PATCH'
    });
    if (res.ok) {
      showToast(`Đã chuyển trạng thái IMEI sang "${nextName}"!`);
      loadImeisTable();
    } else {
      showToast('Không thể cập nhật trạng thái IMEI.', 'error');
    }
  } catch(e) {
    showToast('Lỗi: ' + e.message, 'error');
  }
};

window.filterImeisTable = function() {
  const search = (document.getElementById('searchImeiInput')?.value || '').trim().toLowerCase();
  const statusFilter = document.getElementById('filterImeiStatus')?.value || 'ALL';
  const productFilter = document.getElementById('filterImeiProduct')?.value || 'ALL';

  let list = state.allImeis || [];

  if (search) {
    list = list.filter(item => {
      const soImei = (item.soImei || '').toLowerCase();
      const tenSp = (item.chiTietSanPham?.sanPham?.tenSp || '').toLowerCase();
      const spec = formatCompactSpec(item.chiTietSanPham).toLowerCase();
      return soImei.includes(search) || tenSp.includes(search) || spec.includes(search);
    });
  }

  if (statusFilter !== 'ALL') {
    const s = Number(statusFilter);
    list = list.filter(item => Number(item.trangThai) === s);
  }

  if (productFilter !== 'ALL') {
    const pid = Number(productFilter);
    list = list.filter(item => Number(item.chiTietSanPham?.sanPham?.id) === pid);
  }

  state.filteredImeis = list;
  renderImeisTable();
};

function renderImeisTable() {
  const tbody = document.getElementById('imeisTableBody');
  const loadingEl = document.getElementById('imeisLoadingIndicator');
  const countBadge = document.getElementById('imeiCountBadge');
  if (!tbody) return;

  if (countBadge) {
    countBadge.textContent = `${state.filteredImeis.length} IMEI`;
  }

  if (!state.filteredImeis || state.filteredImeis.length === 0) {
    if (loadingEl) {
      loadingEl.style.display = 'block';
      loadingEl.innerHTML = '<div style="padding:10px;"><i class="fa fa-info-circle"></i> Không tìm thấy bản ghi IMEI nào phù hợp.</div>';
    }
    tbody.innerHTML = '';
    return;
  }

  if (loadingEl) loadingEl.style.display = 'none';

  tbody.innerHTML = state.filteredImeis.map(item => {
    const ctsp = item.chiTietSanPham || {};
    const sp = ctsp.sanPham || {};
    const tenSp = sp.tenSp || 'Chưa liên kết';
    const compactSpec = formatCompactSpec(ctsp);
    const statusBadge = getImeiStatusBadge(item.trangThai, item.id);

    return `
      <tr style="transition:background 0.15s ease;" onmouseover="this.style.background='#f8fafc';" onmouseout="this.style.background='transparent';">
        <td style="font-family:monospace; font-weight:700; font-size:13.5px; color:#1e293b; letter-spacing:0.5px;">
          ${item.soImei}
        </td>
        <td style="font-weight:600; color:#0f172a;">
          ${tenSp}
        </td>
        <td style="color:#475569; font-weight:500;">
          ${compactSpec}
        </td>
        <td style="text-align:center;">
          ${statusBadge}
        </td>
      </tr>
    `;
  }).join('');
}

// ============================================================================
// PART 8: QUẢN LÝ KHUYẾN MÃI SẢN PHẨM (PROMOTIONS MANAGEMENT)
// ============================================================================

function formatPromoDateRange(startStr, endStr) {
  if (!startStr && !endStr) return '---';
  const fmt = (s) => {
    if (!s) return '---';
    try {
      const d = new Date(s);
      if (isNaN(d.getTime())) return s;
      const pad = n => String(n).padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    } catch(e) { return s; }
  };
  return `${fmt(startStr)} - ${fmt(endStr)}`;
}

function toDatetimeLocalInput(dtStr) {
  if (!dtStr) return '';
  try {
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch (e) {
    return '';
  }
}

function getPromotionDisplayStatus(promo) {
  if (!promo) return 'Ngừng hoạt động';
  if (promo.trangThai === 0) return 'Ngừng hoạt động';
  const now = new Date();
  const start = promo.ngayBatDau ? new Date(promo.ngayBatDau) : null;
  const end = promo.ngayKetThuc ? new Date(promo.ngayKetThuc) : null;
  if (start && now < start) return 'Sắp diễn ra';
  if (end && now > end) return 'Đã kết thúc';
  return 'Đang diễn ra';
}

function getPromotionStatusBadge(statusText) {
  switch (statusText) {
    case 'Đang diễn ra':
      return `<span class="badge-status" style="background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; font-weight:700; padding:4px 12px; border-radius:999px; font-size:12px; white-space:nowrap;">Đang diễn ra</span>`;
    case 'Sắp diễn ra':
      return `<span class="badge-status" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-weight:700; padding:4px 12px; border-radius:999px; font-size:12px; white-space:nowrap;">Sắp diễn ra</span>`;
    case 'Đã kết thúc':
      return `<span class="badge-status" style="background:#fff7ed; color:#c2410c; border:1px solid #ffedd5; font-weight:700; padding:4px 12px; border-radius:999px; font-size:12px; white-space:nowrap;">Đã kết thúc</span>`;
    case 'Ngừng hoạt động':
    default:
      return `<span class="badge-status" style="background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; font-weight:700; padding:4px 12px; border-radius:999px; font-size:12px; white-space:nowrap;">Ngừng hoạt động</span>`;
  }
}

window.loadPromotionsTable = async function() {
  const loadingEl = document.getElementById('promotionsLoadingIndicator');
  const tbody = document.getElementById('promotionsTableBody');
  const countBadge = document.getElementById('promotionCountBadge');
  if (loadingEl) {
    loadingEl.style.display = 'block';
    loadingEl.textContent = 'Đang tải danh sách khuyến mãi...';
  }

  try {
    const res = await fetch(`${API_BASE_URL}/khuyen-mai`);
    if (res.ok) {
      state.promotionsList = await res.json();
      filterPromotionsTable();
    } else {
      if (loadingEl) loadingEl.textContent = 'Lỗi tải danh sách khuyến mãi: ' + res.status;
    }
  } catch (err) {
    console.error('Lỗi loadPromotionsTable:', err);
    if (loadingEl) loadingEl.textContent = 'Không thể kết nối đến máy chủ!';
  }
};

window.filterPromotionsTable = function() {
  const searchInput = (document.getElementById('searchPromotionInput')?.value || '').trim().toLowerCase();
  const statusFilter = document.getElementById('filterPromotionStatus')?.value || 'ALL';

  let list = state.promotionsList || [];

  if (searchInput) {
    list = list.filter(item => {
      const ma = (item.ma || '').toLowerCase();
      const ten = (item.tenKm || item.tenKhuyenMai || '').toLowerCase();
      return ma.includes(searchInput) || ten.includes(searchInput);
    });
  }

  if (statusFilter !== 'ALL') {
    list = list.filter(item => {
      const st = getPromotionDisplayStatus(item);
      return st === statusFilter;
    });
  }

  state.filteredPromotions = list;
  renderPromotionsTable();
};

function renderPromotionsTable() {
  const tbody = document.getElementById('promotionsTableBody');
  const loadingEl = document.getElementById('promotionsLoadingIndicator');
  const countBadge = document.getElementById('promotionCountBadge');
  if (!tbody) return;

  if (countBadge) {
    countBadge.textContent = `${state.filteredPromotions.length} chương trình`;
  }

  if (!state.filteredPromotions || state.filteredPromotions.length === 0) {
    if (loadingEl) {
      loadingEl.style.display = 'block';
      loadingEl.innerHTML = '<div style="padding:15px; color:var(--admin-text-muted);">Không tìm thấy chương trình khuyến mãi nào phù hợp.</div>';
    }
    tbody.innerHTML = '';
    return;
  }

  if (loadingEl) loadingEl.style.display = 'none';

  tbody.innerHTML = state.filteredPromotions.map((item, index) => {
    const isPercent = Number(item.loaiGiam) === 1;
    const loaiGiamLabel = isPercent ? 'Phần trăm' : 'Số tiền';
    const giaTriFormatted = isPercent
      ? `${Number(item.giaTriGiam)}%`
      : formatCurrency(item.giaTriGiam);
    const dateRange = formatPromoDateRange(item.ngayBatDau, item.ngayKetThuc);
    const ctspCount = item.soCtspApDung != null ? item.soCtspApDung : (item.soLuongCtsp != null ? item.soLuongCtsp : (item.danhSachCtsp ? item.danhSachCtsp.length : (item.chiTietSanPhams ? item.chiTietSanPhams.length : 0)));
    const statusText = getPromotionDisplayStatus(item);
    const statusBadge = getPromotionStatusBadge(statusText);

    return `
      <tr style="transition:background 0.15s ease;" onmouseover="this.style.background='#f8fafc';" onmouseout="this.style.background='transparent';">
        <td style="text-align:center; font-weight:700; color:var(--admin-text-muted);">${index + 1}</td>
        <td style="font-family:monospace; font-weight:800; font-size:13.5px; color:var(--admin-primary); letter-spacing:0.5px;">
          ${item.ma || '---'}
        </td>
        <td style="font-weight:700; color:#0f172a;">
          ${item.tenKm || item.tenKhuyenMai || '---'}
        </td>
        <td style="text-align:center;">
          <span style="font-size:0.85rem; font-weight:600; color:#475569;">${loaiGiamLabel}</span>
        </td>
        <td style="text-align:right; font-weight:800; color:#ef4444; padding-right:16px;">
          ${giaTriFormatted}
        </td>
        <td style="text-align:center; font-size:0.84rem; color:#334155; font-weight:500; white-space:nowrap;">
          ${dateRange}
        </td>
        <td style="text-align:center; white-space:nowrap;">
          <span class="badge-status badge-info" style="font-weight:700; font-size:12px; padding:3px 8px; white-space:nowrap;">
            ${ctspCount} CTSP
          </span>
        </td>
        <td style="text-align:center; white-space:nowrap;">
          ${statusBadge}
        </td>
        <td style="text-align:center; white-space:nowrap;">
          <div style="display:inline-flex; justify-content:center; align-items:center; gap:6px; white-space:nowrap;">
            <button type="button" class="btn-admin btn-outline btn-sm" onclick="openPromotionDetailModal(${item.id})" title="Xem chi tiết khuyến mãi" style="padding:4px 9px; font-size:12px; font-weight:700; white-space:nowrap;">
              Chi tiết
            </button>
            <button type="button" class="btn-admin btn-primary btn-sm" onclick="openEditPromotionModal(${item.id})" title="Chỉnh sửa khuyến mãi" style="padding:4px 9px; font-size:12px; font-weight:700; white-space:nowrap;">
              Sửa
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadCtspForPromotionModal(preselectedIds = []) {
  state.selectedCtspIdsForPromo = new Set(preselectedIds.map(Number));

  if (!state.allCtspListForPromo || state.allCtspListForPromo.length === 0) {
    try {
      const res = await fetch(`${API_BASE_URL}/chi-tiet-san-pham`);
      if (res.ok) {
        state.allCtspListForPromo = await res.json();
      }
    } catch(err) {
      console.error('Lỗi tải CTSP cho khuyến mãi:', err);
    }
  }

  renderCtspSelectionGroups();
  updatePromoSelectedBadge();
}

function renderCtspSelectionGroups() {
  const container = document.getElementById('promoCtspGroupList');
  if (!container) return;

  const ctspList = state.allCtspListForPromo || [];
  if (ctspList.length === 0) {
    container.innerHTML = '<div style="padding:15px; color:var(--admin-text-muted); text-align:center;">Không có chi tiết sản phẩm nào.</div>';
    return;
  }

  // Group by Product
  const grouped = new Map();
  ctspList.forEach(ctsp => {
    const sp = ctsp.sanPham || { id: 0, tenSp: 'Sản phẩm khác', maSp: 'SP000' };
    const spId = sp.id || 0;
    if (!grouped.has(spId)) {
      grouped.set(spId, {
        product: sp,
        items: []
      });
    }
    grouped.get(spId).items.push(ctsp);
  });

  let html = '';
  grouped.forEach((group, spId) => {
    const sp = group.product;
    const items = group.items;
    const allChecked = items.length > 0 && items.every(it => state.selectedCtspIdsForPromo.has(Number(it.id)));

    html += `
      <div class="promo-ctsp-product-group" data-sp-id="${spId}" style="border:1px solid #e2e8f0; border-radius:8px; background:#ffffff; overflow:hidden; margin-bottom:4px;">
        <div style="background:#f1f5f9; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0;">
          <div style="font-weight:700; font-size:0.88rem; color:#0f172a; display:flex; align-items:center; gap:6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <span>${sp.tenSp || 'Sản phẩm'}</span>
            <span style="font-size:0.75rem; color:#64748b; font-family:monospace;">(${sp.maSp || 'SP' + spId})</span>
            <span style="font-size:0.75rem; color:#64748b;">• ${items.length} cấu hình</span>
          </div>
          <button type="button" class="btn-admin btn-outline btn-sm" onclick="toggleProductCtspAll(${spId}, ${!allChecked})" style="padding:2px 8px; font-size:0.78rem; font-weight:600; background:#ffffff;">
            ${allChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </button>
        </div>

        <div style="padding:6px 12px; display:flex; flex-direction:column; gap:6px;">
          ${items.map(ctsp => {
            const isChecked = state.selectedCtspIdsForPromo.has(Number(ctsp.id));
            const spec = formatCompactSpec(ctsp);
            const cpu = ctsp.cpu?.tenCpu || '';
            const ram = ctsp.ram?.dungLuong || '';
            const rom = ctsp.ocung?.dungLuong || ctsp.oCung?.dungLuong || '';
            const detailSpec = [cpu, ram, rom].filter(Boolean).join(' • ') || spec;
            const priceFmt = formatCurrency(ctsp.gia);

            return `
              <label class="promo-ctsp-item-row" data-search-text="${(sp.tenSp + ' ' + (sp.maSp||'') + ' ' + (ctsp.maCtsp||'') + ' ' + detailSpec).toLowerCase()}" style="display:flex; align-items:center; justify-content:space-between; padding:6px 8px; border-radius:6px; cursor:pointer; background:${isChecked ? '#eff6ff' : '#ffffff'}; border:1px solid ${isChecked ? '#bfdbfe' : '#f1f5f9'}; transition:all 0.15s;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <input type="checkbox" class="promo-ctsp-checkbox" data-sp-id="${spId}" data-price="${ctsp.gia || 0}" value="${ctsp.id}" ${isChecked ? 'checked' : ''} onchange="onCtspCheckboxChange(${ctsp.id}, this.checked)" style="width:16px; height:16px; cursor:pointer;">
                  <div>
                    <div style="display:flex; align-items:center; gap:6px;">
                      <span style="font-weight:700; font-size:0.83rem; color:var(--admin-primary); font-family:monospace;">${ctsp.maCtsp || 'CTSP' + ctsp.id}</span>
                      <span style="color:#64748b; font-size:0.8rem;">•</span>
                      <span style="font-size:0.82rem; color:#334155; font-weight:500;">${detailSpec}</span>
                    </div>
                  </div>
                </div>
                <div style="font-weight:700; font-size:0.85rem; color:#0f172a;">
                  Giá: ${priceFmt}
                </div>
              </label>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

window.toggleProductCtspAll = function(spId, checkAll) {
  const container = document.getElementById('promoCtspGroupList');
  if (!container) return;

  const checkboxes = container.querySelectorAll(`.promo-ctsp-checkbox[data-sp-id="${spId}"]`);
  checkboxes.forEach(cb => {
    const ctspId = Number(cb.value);
    cb.checked = checkAll;
    if (checkAll) {
      state.selectedCtspIdsForPromo.add(ctspId);
    } else {
      state.selectedCtspIdsForPromo.delete(ctspId);
    }
  });

  renderCtspSelectionGroups();
  updatePromoSelectedBadge();
};

window.onCtspCheckboxChange = function(ctspId, checked) {
  const idNum = Number(ctspId);
  if (checked) {
    state.selectedCtspIdsForPromo.add(idNum);
  } else {
    state.selectedCtspIdsForPromo.delete(idNum);
  }

  const cb = document.querySelector(`.promo-ctsp-checkbox[value="${ctspId}"]`);
  if (cb && cb.closest('label')) {
    cb.closest('label').style.background = checked ? '#eff6ff' : '#ffffff';
    cb.closest('label').style.borderColor = checked ? '#bfdbfe' : '#f1f5f9';
  }

  updatePromoSelectedBadge();
};

window.filterPromoCtspList = function() {
  const q = (document.getElementById('searchPromoCtspInput')?.value || '').trim().toLowerCase();
  const groups = document.querySelectorAll('.promo-ctsp-product-group');

  groups.forEach(group => {
    const rows = group.querySelectorAll('.promo-ctsp-item-row');
    let groupHasMatch = false;

    rows.forEach(row => {
      const text = row.getAttribute('data-search-text') || '';
      if (!q || text.includes(q)) {
        row.style.display = 'flex';
        groupHasMatch = true;
      } else {
        row.style.display = 'none';
      }
    });

    group.style.display = groupHasMatch ? 'block' : 'none';
  });
};

function updatePromoSelectedBadge() {
  const badge = document.getElementById('promoSelectedCtspBadge');
  if (badge) {
    badge.textContent = `Đã chọn: ${state.selectedCtspIdsForPromo.size} CTSP`;
  }
}

window.onPromoLoaiGiamChange = function() {
  const isPercent = document.getElementById('promoLoaiGiamPercent')?.checked;
  const unitBadge = document.getElementById('promoUnitBadge');
  const input = document.getElementById('promoGiaTri');

  if (isPercent) {
    if (unitBadge) unitBadge.textContent = '%';
    if (input) {
      input.placeholder = 'VD: 10';
      input.max = 100;
      input.min = 1;
    }
  } else {
    if (unitBadge) unitBadge.textContent = 'đ';
    if (input) {
      input.placeholder = 'VD: 2000000';
      input.removeAttribute('max');
      input.min = 1000;
    }
  }
  onPromoGiaTriInput();
};

window.onPromoGiaTriInput = function() {
  const isPercent = document.getElementById('promoLoaiGiamPercent')?.checked;
  const input = document.getElementById('promoGiaTri');
  const preview = document.getElementById('promoGiaTriFormatted');
  if (!input || !preview) return;

  const val = Number(input.value);
  if (!val || val <= 0) {
    preview.textContent = '';
    return;
  }

  if (isPercent) {
    preview.textContent = `Giảm ${val}%`;
  } else {
    preview.textContent = `Giảm ${formatCurrency(val)}`;
  }
};

window.openAddPromotionModal = async function() {
  state.editingPromotionId = null;
  const form = document.getElementById('promotionForm');
  if (form) form.reset();

  const titleEl = document.getElementById('promoModalTitle');
  if (titleEl) {
    titleEl.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
      </svg>
      <span>THÊM KHUYẾN MÃI MỚI</span>
    `;
  }

  const maInput = document.getElementById('promoMa');
  if (maInput) {
    maInput.readOnly = false;
    maInput.disabled = false;
    maInput.value = '';
  }

  const errEl = document.getElementById('promoFormError');
  if (errEl) {
    errEl.style.display = 'none';
    errEl.textContent = '';
  }

  document.getElementById('promoId').value = '';
  document.getElementById('promoLoaiGiamPercent').checked = true;
  onPromoLoaiGiamChange();

  // Set default dates: now to +7 days
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  document.getElementById('promoNgayBatDau').value = toDatetimeLocalInput(now);
  document.getElementById('promoNgayKetThuc').value = toDatetimeLocalInput(nextWeek);
  document.getElementById('promoTrangThai').value = '1';

  await loadCtspForPromotionModal([]);

  const modal = document.getElementById('promotionModal');
  if (modal) modal.classList.add('active');
};

window.openEditPromotionModal = async function(id) {
  state.editingPromotionId = id;
  const errEl = document.getElementById('promoFormError');
  if (errEl) {
    errEl.style.display = 'none';
    errEl.textContent = '';
  }

  try {
    const res = await fetch(`${API_BASE_URL}/khuyen-mai/${id}`);
    if (!res.ok) {
      showToast('Không thể tải thông tin khuyến mãi!', 'error');
      return;
    }
    const promo = await res.json();

    const titleEl = document.getElementById('promoModalTitle');
    if (titleEl) {
      titleEl.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <span>CHỈNH SỬA KHUYẾN MÃI: ${promo.ma || ''}</span>
      `;
    }

    document.getElementById('promoId').value = promo.id;
    const maInput = document.getElementById('promoMa');
    if (maInput) {
      maInput.value = promo.ma || '';
      maInput.readOnly = true;
      maInput.disabled = true;
    }

    document.getElementById('promoTen').value = promo.tenKm || promo.tenKhuyenMai || '';

    const isPercent = Number(promo.loaiGiam) === 1;
    if (isPercent) {
      document.getElementById('promoLoaiGiamPercent').checked = true;
    } else {
      document.getElementById('promoLoaiGiamAmount').checked = true;
    }
    onPromoLoaiGiamChange();

    document.getElementById('promoGiaTri').value = promo.giaTriGiam || '';
    onPromoGiaTriInput();

    document.getElementById('promoNgayBatDau').value = toDatetimeLocalInput(promo.ngayBatDau);
    document.getElementById('promoNgayKetThuc').value = toDatetimeLocalInput(promo.ngayKetThuc);
    document.getElementById('promoTrangThai').value = String(promo.trangThai != null ? promo.trangThai : 1);

    const selectedIds = (promo.danhSachCtsp || promo.chiTietSanPhams || []).map(c => c.idCtsp || c.id);
    await loadCtspForPromotionModal(selectedIds);

    const modal = document.getElementById('promotionModal');
    if (modal) modal.classList.add('active');
  } catch (err) {
    console.error('Lỗi openEditPromotionModal:', err);
    showToast('Lỗi kết nối khi tải khuyến mãi!', 'error');
  }
};

window.closePromotionModal = function() {
  const modal = document.getElementById('promotionModal');
  if (modal) modal.classList.remove('active');
};

window.handlePromotionFormSubmit = async function(event) {
  event.preventDefault();
  const errEl = document.getElementById('promoFormError');
  if (errEl) {
    errEl.style.display = 'none';
    errEl.textContent = '';
  }

  const isEdit = !!state.editingPromotionId;
  const ma = (document.getElementById('promoMa')?.value || '').trim().toUpperCase();
  const tenKhuyenMai = (document.getElementById('promoTen')?.value || '').trim();
  const loaiGiam = document.getElementById('promoLoaiGiamPercent')?.checked ? 1 : 2;
  const giaTriGiam = Number(document.getElementById('promoGiaTri')?.value);
  const ngayBatDau = document.getElementById('promoNgayBatDau')?.value;
  const ngayKetThuc = document.getElementById('promoNgayKetThuc')?.value;
  const trangThai = Number(document.getElementById('promoTrangThai')?.value);
  const chiTietSanPhamIds = Array.from(state.selectedCtspIdsForPromo);

  // Client validation
  if (!isEdit && !ma) {
    showPromoFormError('Vui lòng nhập Mã khuyến mãi!');
    return;
  }
  if (!tenKhuyenMai) {
    showPromoFormError('Vui lòng nhập Tên khuyến mãi!');
    return;
  }
  if (!giaTriGiam || giaTriGiam <= 0) {
    showPromoFormError('Giá trị giảm phải lớn hơn 0!');
    return;
  }
  if (loaiGiam === 1 && giaTriGiam > 100) {
    showPromoFormError('Giảm theo phần trăm không được vượt quá 100%!');
    return;
  }
  if (!ngayBatDau || !ngayKetThuc) {
    showPromoFormError('Vui lòng chọn đầy đủ Ngày bắt đầu và Ngày kết thúc!');
    return;
  }
  if (new Date(ngayBatDau) >= new Date(ngayKetThuc)) {
    showPromoFormError('Ngày kết thúc phải lớn hơn ngày bắt đầu!');
    return;
  }
  // Client check: if amount discount and CTSPs are selected, check against prices of selected CTSPs
  if (loaiGiam === 2 && chiTietSanPhamIds.length > 0) {
    const invalidItems = (state.allCtspListForPromo || []).filter(c => {
      return state.selectedCtspIdsForPromo.has(Number(c.id)) && Number(c.gia || 0) < giaTriGiam;
    });
    if (invalidItems.length > 0) {
      const names = invalidItems.map(c => `${c.maCtsp || 'CTSP' + c.id} (giá ${formatCurrency(c.gia)})`).slice(0, 3).join(', ');
      showPromoFormError(`Mức giảm ${formatCurrency(giaTriGiam)} không thể lớn hơn giá của CTSP: ${names}. Vui lòng giảm mức giảm hoặc bỏ chọn CTSP này.`);
      return;
    }
  }

  const payload = {
    ma: isEdit ? undefined : ma,
    tenKm: tenKhuyenMai,
    tenKhuyenMai: tenKhuyenMai,
    loaiGiam,
    giaTriGiam,
    ngayBatDau,
    ngayKetThuc,
    trangThai,
    idChiTietSanPhams: chiTietSanPhamIds,
    chiTietSanPhamIds: chiTietSanPhamIds
  };

  const btnSave = document.getElementById('btnSavePromotion');
  if (btnSave) {
    btnSave.disabled = true;
    btnSave.textContent = 'Đang lưu...';
  }

  try {
    const url = isEdit ? `${API_BASE_URL}/khuyen-mai/${state.editingPromotionId}` : `${API_BASE_URL}/khuyen-mai`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast(isEdit ? 'Cập nhật khuyến mãi thành công!' : 'Tạo khuyến mãi thành công!');
      closePromotionModal();
      await loadPromotionsTable();
    } else {
      let errorMsg = 'Có lỗi xảy ra khi lưu khuyến mãi!';
      try {
        const data = await res.json();
        if (data && data.message) {
          errorMsg = data.message;
        }
      } catch(e) {
        const text = await res.text();
        if (text) errorMsg = text;
      }
      showPromoFormError(errorMsg);
    }
  } catch (err) {
    console.error('Lỗi lưu khuyến mãi:', err);
    showPromoFormError('Lỗi kết nối máy chủ: ' + err.message);
  } finally {
    if (btnSave) {
      btnSave.disabled = false;
      btnSave.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        <span>Lưu Khuyến Mãi</span>
      `;
    }
  }
};

function showPromoFormError(msg) {
  const errEl = document.getElementById('promoFormError');
  if (errEl) {
    errEl.textContent = msg;
    errEl.style.display = 'block';
    errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    alert(msg);
  }
}

let currentDetailPromoId = null;

window.openPromotionDetailModal = async function(id) {
  currentDetailPromoId = id;
  const tbody = document.getElementById('promoDetailCtspTableBody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Đang tải...</td></tr>';

  try {
    const res = await fetch(`${API_BASE_URL}/khuyen-mai/${id}`);
    if (!res.ok) {
      showToast('Không thể tải chi tiết khuyến mãi!', 'error');
      return;
    }
    const promo = await res.json();

    // Đồng bộ lại vào state.promotionsList nếu dữ liệu trên server đã cập nhật
    if (state.promotionsList) {
      const idx = state.promotionsList.findIndex(p => p.id === id);
      if (idx !== -1) {
        state.promotionsList[idx].tenKm = promo.tenKm;
        state.promotionsList[idx].soCtspApDung = promo.soCtspApDung != null ? promo.soCtspApDung : (promo.danhSachCtsp ? promo.danhSachCtsp.length : 0);
        state.promotionsList[idx].trangThai = promo.trangThai;
        filterPromotionsTable();
      }
    }

    document.getElementById('promoDetailMa').textContent = promo.ma || '---';
    document.getElementById('promoDetailTen').textContent = promo.tenKm || promo.tenKhuyenMai || '---';

    const isPercent = Number(promo.loaiGiam) === 1;
    const loaiGiamText = isPercent ? 'Giảm theo phần trăm' : 'Giảm theo số tiền';
    const mucGiamText = isPercent ? `${Number(promo.giaTriGiam)}%` : formatCurrency(promo.giaTriGiam);
    document.getElementById('promoDetailGiaTri').textContent = mucGiamText;

    const dateRange = formatPromoDateRange(promo.ngayBatDau, promo.ngayKetThuc);
    document.getElementById('promoDetailThoiGian').textContent = dateRange;

    const statusText = getPromotionDisplayStatus(promo);
    document.getElementById('promoDetailTrangThaiBadge').innerHTML = getPromotionStatusBadge(statusText);

    const ctspList = promo.danhSachCtsp || promo.chiTietSanPhams || [];
    document.getElementById('promoDetailSoCtspBadge').textContent = `${ctspList.length} CTSP`;

    if (ctspList.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#64748b;">Chưa áp dụng cho CTSP nào.</td></tr>';
    } else {
      if (tbody) {
        tbody.innerHTML = ctspList.map((c, idx) => {
          const spName = c.tenSp || 'Laptop';
          const cpu = c.tenCpu || '';
          const ram = c.dungLuongRam || '';
          const rom = c.dungLuongOCung || '';
          const spec = c.cauHinhChiTiet || [cpu, ram, rom].filter(Boolean).join(' • ');

          const giaGoc = c.giaGoc || 0;
          const giaSauGiam = c.giaSauGiam != null ? c.giaSauGiam : giaGoc;

          return `
            <tr>
              <td style="text-align:center; font-weight:700; color:var(--admin-text-muted);">${idx + 1}</td>
              <td style="font-family:monospace; font-weight:800; color:var(--admin-primary);">${c.maCtsp || 'CTSP' + (c.idCtsp || c.id)}</td>
              <td style="font-weight:700; color:#0f172a;">${spName}</td>
              <td style="color:#475569; font-size:0.83rem;">${spec}</td>
              <td style="text-align:right; color:#64748b; font-weight:600;">${formatCurrency(giaGoc)}</td>
              <td style="text-align:right; font-weight:800; color:#ef4444;">
                <span style="font-size:0.75rem; color:#64748b; text-decoration:line-through; margin-right:4px;">${formatCurrency(giaGoc)}</span>
                → <strong>${formatCurrency(giaSauGiam)}</strong>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    const modal = document.getElementById('promotionDetailModal');
    if (modal) modal.classList.add('active');
  } catch (err) {
    console.error('Lỗi openPromotionDetailModal:', err);
    showToast('Lỗi khi tải chi tiết khuyến mãi!', 'error');
  }
};

window.openEditPromotionModalFromDetail = function() {
  closePromotionDetailModal();
  if (currentDetailPromoId) {
    openEditPromotionModal(currentDetailPromoId);
  }
};

window.closePromotionDetailModal = function() {
  const modal = document.getElementById('promotionDetailModal');
  if (modal) modal.classList.remove('active');
};

// ============================================================================
// PART 8: QUẢN LÝ VOUCHER HÓA ĐƠN LOGIC
// ============================================================================

let currentDetailVoucherId = null;

// Money formatting helper for voucher inputs
window.onVoucherMoneyInput = function(inputEl) {
  if (!inputEl) return;
  const isPercent = document.querySelector('input[name="voucherLoaiGiam"]:checked')?.value === '1';
  if (inputEl.id === 'voucherGiaTriGiam' && isPercent) {
    // Chỉ cho nhập số nguyên hoặc thập phân hợp lệ cho %
    inputEl.value = inputEl.value.replace(/[^0-9.]/g, '');
    return;
  }
  // Dành cho tiền tệ: format phân cách hàng nghìn
  let val = inputEl.value.replace(/\D/g, '');
  if (!val) {
    inputEl.value = '';
    return;
  }
  inputEl.value = Number(val).toLocaleString('vi-VN');
};

function parseVoucherMoney(val) {
  if (val === null || val === undefined) return null;
  const clean = String(val).replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.]/g, '').trim();
  if (!clean) return null;
  const num = Number(clean);
  return isNaN(num) ? null : num;
}

window.onVoucherLoaiGiamChange = function() {
  const isPercent = document.querySelector('input[name="voucherLoaiGiam"]:checked')?.value === '1';
  const giaTriLabel = document.getElementById('voucherGiaTriGiamLabel');
  const giaTriSuffix = document.getElementById('voucherGiaTriGiamSuffix');
  const giaTriHint = document.getElementById('voucherGiaTriGiamHint');
  const giaTriInput = document.getElementById('voucherGiaTriGiam');
  const giamToiDaGroup = document.getElementById('voucherGiamToiDaGroup');

  if (isPercent) {
    if (giaTriLabel) giaTriLabel.textContent = 'Mức Giảm (%) (*)';
    if (giaTriSuffix) giaTriSuffix.textContent = '%';
    if (giaTriHint) giaTriHint.textContent = 'Từ 1 đến 100%';
    if (giaTriInput) giaTriInput.placeholder = 'VD: 10';
    if (giamToiDaGroup) {
      giamToiDaGroup.style.opacity = '1';
      giamToiDaGroup.style.pointerEvents = 'auto';
      const input = document.getElementById('voucherGiamToiDa');
      if (input) {
        input.disabled = false;
        input.placeholder = 'Không giới hạn';
      }
    }
  } else {
    if (giaTriLabel) giaTriLabel.textContent = 'Mức Giảm (VNĐ) (*)';
    if (giaTriSuffix) giaTriSuffix.textContent = 'đ';
    if (giaTriHint) giaTriHint.textContent = 'Số tiền giảm cố định (VNĐ)';
    if (giaTriInput) giaTriInput.placeholder = 'VD: 500.000';
    if (giamToiDaGroup) {
      giamToiDaGroup.style.opacity = '0.5';
      giamToiDaGroup.style.pointerEvents = 'none';
      const input = document.getElementById('voucherGiamToiDa');
      if (input) {
        input.disabled = true;
        input.value = '';
        input.placeholder = 'Không áp dụng (—)';
      }
    }
  }
};

window.loadVouchersTable = async function() {
  const loadingIndicator = document.getElementById('vouchersLoadingIndicator');
  const tbody = document.getElementById('vouchersTableBody');
  if (loadingIndicator) loadingIndicator.style.display = 'block';

  try {
    const res = await fetch(`${API_BASE_URL}/vouchers`);
    if (!res.ok) throw new Error('Không thể tải danh sách voucher');
    state.vouchersList = await res.json();
    filterVouchersTable();
  } catch (err) {
    console.error('Lỗi tải vouchers:', err);
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:30px; color:#ef4444; font-weight:600;">Lỗi khi kết nối máy chủ để tải danh sách Voucher!</td></tr>';
    }
  } finally {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
  }
};

window.filterVouchersTable = function() {
  const searchInput = document.getElementById('searchVoucherInput');
  const filterStatus = document.getElementById('filterVoucherStatus');
  const query = (searchInput?.value || '').trim().toLowerCase();
  const status = filterStatus?.value || 'ALL';

  state.filteredVouchers = (state.vouchersList || []).filter(v => {
    const maMatch = (v.ma || '').toLowerCase().includes(query);
    const tenMatch = (v.tenVoucher || '').toLowerCase().includes(query);
    const textMatch = !query || maMatch || tenMatch;

    const statusMatch = (status === 'ALL') || (v.trangThaiHienThi === status);
    return textMatch && statusMatch;
  });

  const countBadge = document.getElementById('voucherCountBadge');
  if (countBadge) {
    countBadge.textContent = `${state.filteredVouchers.length} voucher`;
  }

  renderVouchersTable(state.filteredVouchers);
};

function formatVoucherDate(isoStr) {
  if (!isoStr) return '---';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch (e) {
    return isoStr;
  }
}

function getVoucherBadgeHtml(badgeClass, statusText) {
  const badgeMap = {
    'confirmed': 'background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;',  // Đang diễn ra (green)
    'pending': 'background: #fef9c3; color: #a16207; border: 1px solid #fef08a;',    // Sắp diễn ra (yellow)
    'shipping': 'background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;',   // Đã kết thúc (gray/blue)
    'cancelled': 'background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;'   // Ngừng hoạt động (red)
  };
  const style = badgeMap[badgeClass] || 'background: #f1f5f9; color: #64748b;';
  return `<span style="display:inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; white-space: nowrap; ${style}">${statusText}</span>`;
}

window.renderVouchersTable = function(list) {
  const tbody = document.getElementById('vouchersTableBody');
  if (!tbody) return;

  if (!list || list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding: 40px; color: var(--admin-text-muted); font-size: 0.95rem;">
          <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:#cbd5e1;">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
            <span>Không tìm thấy voucher nào phù hợp.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map((v, index) => {
    const isPercent = Number(v.loaiGiam) === 1;
    const loaiGiamBadge = isPercent
      ? '<span style="background:#eff6ff; color:#2563eb; font-weight:700; padding:2px 8px; border-radius:4px; font-size:0.75rem; white-space:nowrap;">Phần trăm (%)</span>'
      : '<span style="background:#f0fdf4; color:#16a34a; font-weight:700; padding:2px 8px; border-radius:4px; font-size:0.75rem; white-space:nowrap;">Số tiền (VNĐ)</span>';

    const mucGiamDisplay = `<strong style="color: #dc2626; font-size: 0.95rem; white-space:nowrap;">${v.loaiGiamHienThi || (isPercent ? v.giaTriGiam + '%' : formatCurrency(v.giaTriGiam))}</strong>`;
    const donToiThieuDisplay = `<span style="white-space:nowrap;">${v.donToiThieuHienThi || formatCurrency(v.giaTriDonToiThieu)}</span>`;
    const giamToiDaDisplay = `<span style="white-space:nowrap;">${v.giamToiDaHienThi || (isPercent ? (v.giamToiDa ? formatCurrency(v.giamToiDa) : 'Không giới hạn') : '—')}</span>`;
    
    // Thời gian áp dụng hiển thị gọn gàng trên 1 dòng
    const timeDisplay = `
      <div style="display:inline-flex; align-items:center; justify-content:center; gap:6px; white-space:nowrap; font-size:0.82rem; color:#334155;">
        <span style="font-weight:600;">${formatVoucherDate(v.ngayBatDau)}</span>
        <span style="color:#94a3b8; font-weight:400; font-size:0.78rem;">đến</span>
        <span style="font-weight:600;">${formatVoucherDate(v.ngayKetThuc)}</span>
      </div>
    `;

    const statusBadge = getVoucherBadgeHtml(v.trangThaiBadgeClass, v.trangThaiHienThi);

    const isActivated = Number(v.trangThai) === 1;
    const toggleBtn = isActivated
      ? `<button class="btn-admin btn-sm" onclick="toggleVoucherTrangThai(${v.id}, 0)" title="Ngừng hoạt động voucher này" style="color:#dc2626; background:#fef2f2; border:1px solid #fecaca; padding:4px 9px; font-size:0.78rem; white-space:nowrap;">Ngừng</button>`
      : `<button class="btn-admin btn-sm" onclick="toggleVoucherTrangThai(${v.id}, 1)" title="Kích hoạt lại voucher này" style="color:#16a34a; background:#f0fdf4; border:1px solid #bbf7d0; padding:4px 9px; font-size:0.78rem; white-space:nowrap;">Bật lại</button>`;

    return `
      <tr>
        <td style="text-align:center; font-weight:700; color:var(--admin-text-muted);">${index + 1}</td>
        <td>
          <span style="font-family:monospace; font-weight:800; font-size:0.95rem; color:var(--admin-primary); letter-spacing:0.5px; white-space:nowrap;">${v.ma}</span>
        </td>
        <td>
          <span style="font-weight:700; color:#1e293b; display:block;">${v.tenVoucher}</span>
        </td>
        <td style="text-align:center; white-space:nowrap;">${loaiGiamBadge}</td>
        <td style="text-align:right;">${mucGiamDisplay}</td>
        <td style="text-align:right; font-weight:600; color:#475569;">${donToiThieuDisplay}</td>
        <td style="text-align:right; font-weight:600; color:#475569;">${giamToiDaDisplay}</td>
        <td style="text-align:center; color:#334155; white-space:nowrap;">${timeDisplay}</td>
        <td style="text-align:center; white-space:nowrap;">${statusBadge}</td>
        <td style="text-align:center; white-space:nowrap;">
          <div style="display:inline-flex; gap:6px; align-items:center; justify-content:center; white-space:nowrap;">
            <button class="btn-admin btn-outline btn-sm" onclick="openVoucherDetailModal(${v.id})" title="Xem chi tiết" style="padding:4px 9px; font-size:0.78rem; white-space:nowrap;">Chi tiết</button>
            <button class="btn-admin btn-primary btn-sm" onclick="openEditVoucherModal(${v.id})" title="Chỉnh sửa voucher" style="padding:4px 9px; font-size:0.78rem; white-space:nowrap;">Sửa</button>
            ${toggleBtn}
          </div>
        </td>
      </tr>
    `;
  }).join('');
};

window.openAddVoucherModal = function() {
  state.editingVoucherId = null;
  const form = document.getElementById('voucherForm');
  if (form) form.reset();

  const titleText = document.getElementById('voucherModalTitleText');
  if (titleText) titleText.textContent = 'THÊM VOUCHER HÓA ĐƠN MỚI';

  const errBox = document.getElementById('voucherFormError');
  if (errBox) errBox.style.display = 'none';

  const maInput = document.getElementById('voucherMa');
  if (maInput) {
    maInput.readOnly = false;
    maInput.style.background = '';
    maInput.style.cursor = 'text';
    maInput.value = '';
  }

  const donToiThieu = document.getElementById('voucherDonToiThieu');
  if (donToiThieu) donToiThieu.value = '0';

  const radio1 = document.getElementById('voucherLoaiGiam1');
  if (radio1) radio1.checked = true;

  // Ngày bắt đầu mặc định: Hiện tại
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const nowStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  
  // Ngày kết thúc mặc định: 30 ngày sau
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const futureStr = `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}T${pad(future.getHours())}:${pad(future.getMinutes())}`;

  const startInput = document.getElementById('voucherNgayBatDau');
  if (startInput) startInput.value = nowStr;

  const endInput = document.getElementById('voucherNgayKetThuc');
  if (endInput) endInput.value = futureStr;

  const statusSelect = document.getElementById('voucherTrangThai');
  if (statusSelect) statusSelect.value = '1';

  onVoucherLoaiGiamChange();

  const modal = document.getElementById('voucherModal');
  if (modal) modal.classList.add('active');
};

window.openEditVoucherModal = function(id) {
  state.editingVoucherId = id;
  const voucher = (state.vouchersList || []).find(v => v.id === id);
  if (!voucher) {
    showToast('Không tìm thấy thông tin voucher!', 'error');
    return;
  }

  const titleText = document.getElementById('voucherModalTitleText');
  if (titleText) titleText.textContent = `CHỈNH SỬA VOUCHER: ${voucher.ma}`;

  const errBox = document.getElementById('voucherFormError');
  if (errBox) errBox.style.display = 'none';

  const idInput = document.getElementById('voucherId');
  if (idInput) idInput.value = voucher.id;

  const maInput = document.getElementById('voucherMa');
  if (maInput) {
    maInput.value = voucher.ma;
    maInput.readOnly = true;
    maInput.style.background = '#f1f5f9';
    maInput.style.cursor = 'not-allowed';
  }

  const tenInput = document.getElementById('voucherTen');
  if (tenInput) tenInput.value = voucher.tenVoucher;

  const isPercent = Number(voucher.loaiGiam) === 1;
  const radio1 = document.getElementById('voucherLoaiGiam1');
  const radio2 = document.getElementById('voucherLoaiGiam2');
  if (isPercent) {
    if (radio1) radio1.checked = true;
  } else {
    if (radio2) radio2.checked = true;
  }

  const giaTriInput = document.getElementById('voucherGiaTriGiam');
  if (giaTriInput) {
    if (isPercent) {
      giaTriInput.value = Number(voucher.giaTriGiam);
    } else {
      giaTriInput.value = Number(voucher.giaTriGiam).toLocaleString('vi-VN');
    }
  }

  const donToiThieu = document.getElementById('voucherDonToiThieu');
  if (donToiThieu) {
    donToiThieu.value = voucher.giaTriDonToiThieu ? Number(voucher.giaTriDonToiThieu).toLocaleString('vi-VN') : '0';
  }

  const giamToiDa = document.getElementById('voucherGiamToiDa');
  if (giamToiDa) {
    if (isPercent && voucher.giamToiDa != null && Number(voucher.giamToiDa) > 0) {
      giamToiDa.value = Number(voucher.giamToiDa).toLocaleString('vi-VN');
    } else {
      giamToiDa.value = '';
    }
  }

  const startInput = document.getElementById('voucherNgayBatDau');
  if (startInput && voucher.ngayBatDau) {
    startInput.value = voucher.ngayBatDau.substring(0, 16);
  }

  const endInput = document.getElementById('voucherNgayKetThuc');
  if (endInput && voucher.ngayKetThuc) {
    endInput.value = voucher.ngayKetThuc.substring(0, 16);
  }

  const statusSelect = document.getElementById('voucherTrangThai');
  if (statusSelect) {
    statusSelect.value = String(voucher.trangThai ?? 1);
  }

  onVoucherLoaiGiamChange();

  const modal = document.getElementById('voucherModal');
  if (modal) modal.classList.add('active');
};

window.closeVoucherModal = function() {
  const modal = document.getElementById('voucherModal');
  if (modal) modal.classList.remove('active');
};

window.handleVoucherFormSubmit = async function(event) {
  if (event) event.preventDefault();

  const errBox = document.getElementById('voucherFormError');
  const showError = msg => {
    if (errBox) {
      errBox.innerHTML = msg.replace(/\n/g, '<br>');
      errBox.style.display = 'block';
      errBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      alert(msg);
    }
  };

  if (errBox) errBox.style.display = 'none';

  const ma = (document.getElementById('voucherMa')?.value || '').trim();
  const tenVoucher = (document.getElementById('voucherTen')?.value || '').trim();
  const loaiGiam = Number(document.querySelector('input[name="voucherLoaiGiam"]:checked')?.value || 1);
  const giaTriGiamRaw = document.getElementById('voucherGiaTriGiam')?.value;
  const giaTriGiam = parseVoucherMoney(giaTriGiamRaw);
  const donToiThieu = parseVoucherMoney(document.getElementById('voucherDonToiThieu')?.value) || 0;
  const giamToiDa = loaiGiam === 1 ? parseVoucherMoney(document.getElementById('voucherGiamToiDa')?.value) : null;
  const ngayBatDau = document.getElementById('voucherNgayBatDau')?.value;
  const ngayKetThuc = document.getElementById('voucherNgayKetThuc')?.value;
  const trangThai = Number(document.getElementById('voucherTrangThai')?.value || 1);

  // Frontend validation
  if (!ma) return showError('Mã Voucher không được để trống.');
  if (!tenVoucher) return showError('Tên Voucher không được để trống.');
  if (giaTriGiam === null || giaTriGiam === undefined) return showError('Giá trị giảm không được để trống.');

  if (loaiGiam === 1) {
    if (giaTriGiam <= 0 || giaTriGiam > 100) {
      return showError('Phần trăm giảm phải lớn hơn 0 và không vượt quá 100%.');
    }
    if (giamToiDa !== null && giamToiDa <= 0) {
      return showError('Mức giảm tối đa phải lớn hơn 0 hoặc để trống (không giới hạn).');
    }
  } else {
    if (giaTriGiam <= 0) {
      return showError('Giá trị giảm phải lớn hơn 0.');
    }
  }

  if (donToiThieu < 0) {
    return showError('Giá trị đơn tối thiểu không được âm.');
  }

  if (!ngayBatDau || !ngayKetThuc) {
    return showError('Ngày bắt đầu và ngày kết thúc không được để trống.');
  }

  const startDate = new Date(ngayBatDau);
  const endDate = new Date(ngayKetThuc);
  if (endDate <= startDate) {
    return showError('Ngày kết thúc phải sau ngày bắt đầu.');
  }

  const payload = {
    ma: ma.toUpperCase(),
    tenVoucher: tenVoucher,
    loaiGiam: loaiGiam,
    giaTriGiam: giaTriGiam,
    giaTriDonToiThieu: donToiThieu,
    giamToiDa: giamToiDa,
    ngayBatDau: ngayBatDau.length === 16 ? ngayBatDau + ':00' : ngayBatDau,
    ngayKetThuc: ngayKetThuc.length === 16 ? ngayKetThuc + ':00' : ngayKetThuc,
    trangThai: trangThai
  };

  const btnSave = document.getElementById('btnSaveVoucher');
  if (btnSave) btnSave.disabled = true;

  try {
    let res;
    const isEdit = Boolean(state.editingVoucherId);
    if (isEdit) {
      res = await fetch(`${API_BASE_URL}/vouchers/${state.editingVoucherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(`${API_BASE_URL}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.message || (isEdit ? 'Không thể cập nhật Voucher' : 'Không thể tạo Voucher');
      showError(msg);
      return;
    }

    closeVoucherModal();
    showToast(isEdit ? 'Cập nhật Voucher thành công!' : 'Thêm Voucher thành công.', 'success');
    await loadVouchersTable();
  } catch (err) {
    console.error('Lỗi lưu voucher:', err);
    showError('Không thể kết nối đến máy chủ. Vui lòng thử lại!');
  } finally {
    if (btnSave) btnSave.disabled = false;
  }
};

window.toggleVoucherTrangThai = async function(id, newStatus) {
  const statusName = newStatus === 1 ? 'kích hoạt' : 'ngừng hoạt động';
  if (!confirm(`Bạn có chắc chắn muốn ${statusName} voucher này?`)) return;

  try {
    const res = await fetch(`${API_BASE_URL}/vouchers/${id}/trang-thai?trangThai=${newStatus}`, {
      method: 'PATCH'
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      showToast(errData.message || 'Không thể cập nhật trạng thái!', 'error');
      return;
    }
    showToast(`Đã ${statusName} voucher thành công!`, 'success');
    await loadVouchersTable();
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái voucher:', err);
    showToast('Lỗi khi cập nhật trạng thái voucher!', 'error');
  }
};

window.openVoucherDetailModal = async function(id) {
  currentDetailVoucherId = id;
  try {
    const res = await fetch(`${API_BASE_URL}/vouchers/${id}`);
    if (!res.ok) {
      showToast('Không thể tải chi tiết voucher!', 'error');
      return;
    }
    const voucher = await res.json();

    document.getElementById('voucherDetailMa').textContent = voucher.ma || '---';
    document.getElementById('voucherDetailTen').textContent = voucher.tenVoucher || '---';

    const isPercent = Number(voucher.loaiGiam) === 1;
    document.getElementById('voucherDetailLoaiGiam').textContent = isPercent ? 'Giảm theo phần trăm (%)' : 'Giảm theo số tiền (VNĐ)';

    const mucGiam = isPercent ? `${Number(voucher.giaTriGiam)}%` : formatCurrency(voucher.giaTriGiam);
    document.getElementById('voucherDetailGiaTriGiam').textContent = mucGiam;

    document.getElementById('voucherDetailDonToiThieu').textContent = voucher.donToiThieuHienThi || formatCurrency(voucher.giaTriDonToiThieu);

    const giamToiDaText = isPercent
      ? (voucher.giamToiDa ? formatCurrency(voucher.giamToiDa) : 'Không giới hạn')
      : '— (Không áp dụng)';
    document.getElementById('voucherDetailGiamToiDa').textContent = giamToiDaText;

    const timeRange = `${formatVoucherDate(voucher.ngayBatDau)}  →  ${formatVoucherDate(voucher.ngayKetThuc)}`;
    document.getElementById('voucherDetailThoiGian').textContent = timeRange;

    const badgeContainer = document.getElementById('voucherDetailBadgeContainer');
    if (badgeContainer) {
      badgeContainer.innerHTML = getVoucherBadgeHtml(voucher.trangThaiBadgeClass, voucher.trangThaiHienThi);
    }

    const modal = document.getElementById('voucherDetailModal');
    if (modal) modal.classList.add('active');
  } catch (err) {
    console.error('Lỗi openVoucherDetailModal:', err);
    showToast('Lỗi khi tải thông tin voucher!', 'error');
  }
};

window.closeVoucherDetailModal = function() {
  const modal = document.getElementById('voucherDetailModal');
  if (modal) modal.classList.remove('active');
};

window.openEditVoucherFromDetail = function() {
  closeVoucherDetailModal();
  if (currentDetailVoucherId) {
    openEditVoucherModal(currentDetailVoucherId);
  }
};


