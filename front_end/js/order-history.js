/**
 * Laptop Store - Order History Script (Lịch Sử Đơn Hàng Dành Cho Khách Hàng)
 * Frontend JavaScript for handling customer order history list.
 */

const API_BASE_URL = 'http://localhost:8080/api';

let allOrders = [];
let currentFilter = 'ALL';

// Format tiền tệ VNĐ
function formatMoney(amount) {
  if (amount == null || isNaN(amount)) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';
}

// Escape HTML để bảo mật XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Lấy thông tin user hiện tại từ LocalStorage / SessionStorage
function getCurrentUser() {
  const userStr = localStorage.getItem('laptop_store_user') || sessionStorage.getItem('laptop_store_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
  renderHeaderAuth();
  loadOrderHistory();
});

// Render Header & Topbar Auth
function renderHeaderAuth() {
  const user = getCurrentUser();
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
                ${escapeHtml(user.ten || user.username)}
              </span>
              <span class="action-value" style="font-size:0.75rem; color:#64748b; display:flex; align-items:center; gap:3px;">
                Tài khoản <span style="font-size:0.6rem;">▼</span>
              </span>
            </div>
          </div>

          <div class="user-dropdown-menu" id="userDropdownMenu">
            <div class="user-dropdown-header">
              <div class="user-dropdown-name">${escapeHtml(user.ten || user.username)}</div>
              <div class="user-dropdown-role">${escapeHtml(roleName)}</div>
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
        <span style="font-size:0.75rem; color:#cbd5e1;">Chào, <strong style="color:#fff;">${escapeHtml(user.ten || user.username)}</strong></span>
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
      headerAuth.onclick = () => window.location.href = 'login.html?redirect=order-history.html';
    }

    if (topbarAuth) {
      topbarAuth.innerHTML = `
        <a href="login.html?redirect=order-history.html" style="color: #ffffff; background: #2563eb; padding: 4px 12px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
          🔑 Đăng Nhập / Đăng Ký
        </a>
      `;
    }
  }
}

// Đăng xuất
function logoutUser() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất tài khoản?')) {
    localStorage.removeItem('laptop_store_user');
    sessionStorage.removeItem('laptop_store_user');
    window.location.href = 'login.html';
  }
}

// Tải lịch sử đơn hàng từ Backend API
async function loadOrderHistory() {
  const loadingEl = document.getElementById('historyLoading');
  const guestStateEl = document.getElementById('historyGuestState');
  const emptyStateEl = document.getElementById('historyEmptyState');
  const orderListEl = document.getElementById('historyOrderList');

  const user = getCurrentUser();
  if (!user || !user.id) {
    loadingEl.style.display = 'none';
    guestStateEl.style.display = 'block';
    emptyStateEl.style.display = 'none';
    orderListEl.style.display = 'none';
    return;
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-Id': user.id.toString()
    };

    const response = await fetch(`${API_BASE_URL}/hoa-don/lich-su`, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });

    if (response.status === 401) {
      loadingEl.style.display = 'none';
      guestStateEl.style.display = 'block';
      emptyStateEl.style.display = 'none';
      orderListEl.style.display = 'none';
      return;
    }

    if (!response.ok) {
      throw new Error(`Lỗi tải dữ liệu (${response.status})`);
    }

    const data = await response.json();
    allOrders = Array.isArray(data) ? data : [];

    loadingEl.style.display = 'none';
    updateFilterBadges();

    if (allOrders.length === 0) {
      emptyStateEl.style.display = 'block';
      orderListEl.style.display = 'none';
    } else {
      emptyStateEl.style.display = 'none';
      orderListEl.style.display = 'flex';
      filterOrders('ALL');
    }

  } catch (error) {
    console.error('Error fetching order history:', error);
    loadingEl.innerHTML = `
      <div style="color: #ef4444; font-weight: 700; margin-bottom: 8px;">Không thể tải lịch sử đơn hàng</div>
      <div style="font-size: 0.85rem; color: #64748b;">${escapeHtml(error.message)}</div>
      <button onclick="loadOrderHistory()" style="margin-top: 14px; padding: 8px 18px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
        Thử lại
      </button>
    `;
  }
}

// Cập nhật số lượng đếm trên các Tab Filter
function updateFilterBadges() {
  const counts = {
    ALL: allOrders.length,
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0
  };

  allOrders.forEach(order => {
    const st = order.trangThai;
    if (counts[st] !== undefined) {
      counts[st]++;
    }
  });

  const totalCountEl = document.getElementById('totalOrdersCount');
  if (totalCountEl) totalCountEl.textContent = counts.ALL;

  const badgeAll = document.getElementById('badgeAll');
  if (badgeAll) badgeAll.textContent = counts.ALL;

  for (let i = 0; i <= 4; i++) {
    const badge = document.getElementById(`badge${i}`);
    if (badge) badge.textContent = counts[i];
  }
}

// Lọc đơn hàng theo trạng thái
function filterOrders(status) {
  currentFilter = status;

  // Cập nhật class active trên nút tab
  const tabBtns = document.querySelectorAll('.history-tab-btn');
  tabBtns.forEach(btn => {
    if (btn.getAttribute('data-filter') == status.toString()) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const orderListEl = document.getElementById('historyOrderList');
  if (!orderListEl) return;

  const filteredOrders = (status === 'ALL')
    ? allOrders
    : allOrders.filter(o => o.trangThai === Number(status));

  if (filteredOrders.length === 0) {
    orderListEl.innerHTML = `
      <div class="empty-state-box" style="margin: 20px auto; padding: 40px 20px;">
        <div class="empty-icon-circle" style="width: 56px; height: 56px; margin-bottom: 12px;">
          <svg style="width: 28px; height: 28px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
        </div>
        <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Không có đơn hàng nào</h3>
        <p style="font-size: 0.85rem; color: #64748b;">Chưa có đơn hàng nào trong trạng thái này.</p>
      </div>
    `;
    return;
  }

  // Render danh sách các thẻ đơn hàng
  orderListEl.innerHTML = filteredOrders.map(order => renderOrderCard(order)).join('');
}

// Render một thẻ đơn hàng chi tiết
function renderOrderCard(order) {
  // Trạng thái đơn hàng
  const orderStatusClass = order.trangThaiBadgeClass || 'badge-pending';
  const orderStatusText = order.trangThaiHienThi || 'Chờ xác nhận';

  // Trạng thái thanh toán
  const payStatusClass = order.trangThaiThanhToanBadgeClass || 'badge-unpaid';
  const payStatusText = order.trangThaiThanhToanHienThi || 'Chưa thanh toán';

  // Render danh sách sản phẩm trong đơn
  const itemsHtml = (order.items && order.items.length > 0)
    ? order.items.map(item => `
        <div class="order-item-row">
          <div class="order-item-info">
            <img class="order-item-thumb" 
                 src="${escapeHtml(item.hinhAnh) || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80'}" 
                 alt="${escapeHtml(item.tenSanPham)}"
                 onerror="this.src='https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80';" />
            <div class="order-item-details">
              <div class="order-item-name" title="${escapeHtml(item.tenSanPham)}">
                ${escapeHtml(item.tenSanPham)}
              </div>
              ${item.cauHinh ? `<div class="order-item-specs">${escapeHtml(item.cauHinh)}</div>` : ''}
              <div class="order-item-qty">Số lượng: x${item.soLuong || 1}</div>
            </div>
          </div>
          <div class="order-item-pricing">
            <div class="order-item-price">${formatMoney(item.thanhTien)}</div>
            <div class="order-item-unit-price">${formatMoney(item.giaMua)} / máy</div>
          </div>
        </div>
      `).join('')
    : '<div style="color: #94a3b8; font-size: 0.85rem; padding: 8px 0;">Không có chi tiết sản phẩm</div>';

  // Địa chỉ & Người nhận
  const recipientSummary = `
    <div class="order-shipping-bar">
      <span>🚚 <strong>Người nhận:</strong> ${escapeHtml(order.tenNguoiNhan || 'Khách hàng')} (${escapeHtml(order.dienThoai || 'Chưa có SĐT')})</span>
      <span>•</span>
      <span><strong>Địa chỉ:</strong> ${escapeHtml(order.diaChi || 'Nhận tại cửa hàng')}</span>
      ${order.moTa ? `<span>•</span><span><strong>Ghi chú:</strong> ${escapeHtml(order.moTa)}</span>` : ''}
    </div>
  `;

  // Tiền giảm voucher nếu có
  const hasVoucher = order.tienGiamVoucher && Number(order.tienGiamVoucher) > 0;
  const voucherRow = hasVoucher ? `
    <div class="breakdown-row breakdown-voucher">
      Voucher giảm giá ${order.maVoucher ? `(${escapeHtml(order.maVoucher)})` : ''}: -${formatMoney(order.tienGiamVoucher)}
    </div>
  ` : '';

  return `
    <div class="order-card" id="order-${order.idHoaDon}">
      
      <!-- Order Card Header -->
      <div class="order-card-header">
        <div class="order-header-left">
          <div class="order-code-badge">
            Mã đơn: <span>#${escapeHtml(order.maHoaDon || 'HD' + order.idHoaDon)}</span>
          </div>
          <div class="order-date-text">
            <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            ${escapeHtml(order.ngayTaoFormatted || '')}
          </div>
        </div>

        <div class="order-header-right">
          <span class="badge-status ${payStatusClass}">
            💳 ${escapeHtml(payStatusText)}
          </span>
          <span class="badge-status ${orderStatusClass}">
            ${escapeHtml(orderStatusText)}
          </span>
        </div>
      </div>

      <!-- Order Card Body (Items & Shipping) -->
      <div class="order-card-body">
        <div class="order-items-list">
          ${itemsHtml}
        </div>
        ${recipientSummary}
      </div>

      <!-- Order Card Footer (Pricing & Actions) -->
      <div class="order-card-footer">
        <div class="order-footer-left">
          <div class="order-pay-method">
            <span>Phương thức thanh toán:</span>
            <strong>${escapeHtml(order.phuongThucThanhToanHienThi || 'COD')}</strong>
          </div>
        </div>

        <div class="order-footer-right">
          <div class="order-price-breakdown">
            <div class="breakdown-row">
              Tạm tính (${order.tongSoLuong || 1} sản phẩm): <strong>${formatMoney(order.tongTienHang)}</strong>
            </div>
            ${voucherRow}
            <div class="breakdown-total">
              Tổng thanh toán: ${formatMoney(order.tongThanhToan)}
            </div>
          </div>

          <button class="btn-view-order-detail" onclick="openDetailModal('${escapeHtml(order.maHoaDon)}')">
            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Xem chi tiết
          </button>
        </div>
      </div>

    </div>
  `;
}

// Mở modal thông báo chi tiết đơn hàng (Chuẩn bị giao diện theo yêu cầu)
function openDetailModal(orderCode) {
  const modal = document.getElementById('detailPreviewModal');
  const titleEl = document.getElementById('modalOrderCodeTitle');
  if (titleEl) {
    titleEl.textContent = `Chi tiết đơn hàng #${orderCode}`;
  }
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Đóng modal
function closeDetailModal() {
  const modal = document.getElementById('detailPreviewModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

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

