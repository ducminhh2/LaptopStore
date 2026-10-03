/**
 * Laptop Store - Order Detail Script (Chi Tiết Đơn Hàng Phía Khách Hàng)
 * Frontend JavaScript for customer order detail view.
 * READ-ONLY implementation.
 */

const API_BASE_URL = 'http://localhost:8080/api';

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
  loadOrderDetail();
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
      headerAuth.onclick = () => window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }

    if (topbarAuth) {
      topbarAuth.innerHTML = `
        <a href="login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}" style="color: #ffffff; background: #2563eb; padding: 4px 12px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
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

// Tải dữ liệu chi tiết đơn hàng
async function loadOrderDetail() {
  const loadingEl = document.getElementById('detailLoading');
  const errorEl = document.getElementById('detailErrorState');
  const mainContentEl = document.getElementById('detailMainContent');
  const errorTitle = document.getElementById('errorTitle');
  const errorMessage = document.getElementById('errorMessage');

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('id');

  if (!orderId) {
    loadingEl.style.display = 'none';
    errorTitle.textContent = 'Mã đơn hàng không hợp lệ';
    errorMessage.textContent = 'Đường dẫn không chứa thông tin mã hóa đơn cần tra cứu.';
    errorEl.style.display = 'block';
    return;
  }

  const user = getCurrentUser();
  if (!user || !user.id) {
    loadingEl.style.display = 'none';
    errorTitle.textContent = 'Yêu cầu đăng nhập';
    errorMessage.textContent = 'Vui lòng đăng nhập tài khoản khách hàng để truy cập chi tiết đơn hàng.';
    errorEl.style.display = 'block';
    return;
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-Id': user.id.toString()
    };

    const response = await fetch(`${API_BASE_URL}/hoa-don/lich-su/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });

    if (response.status === 401) {
      loadingEl.style.display = 'none';
      errorTitle.textContent = 'Phiên đăng nhập đã hết hạn';
      errorMessage.textContent = 'Vui lòng đăng nhập lại để tiếp tục xem chi tiết đơn hàng.';
      errorEl.style.display = 'block';
      return;
    }

    if (response.status === 404 || response.status === 403) {
      loadingEl.style.display = 'none';
      errorTitle.textContent = 'Không tìm thấy đơn hàng';
      errorMessage.textContent = 'Đơn hàng không tồn tại hoặc bạn không có quyền xem thông tin đơn hàng này.';
      errorEl.style.display = 'block';
      return;
    }

    if (!response.ok) {
      throw new Error(`Lỗi tải dữ liệu (${response.status})`);
    }

    const order = await response.json();
    loadingEl.style.display = 'none';
    mainContentEl.style.display = 'flex';

    renderOrderDetailData(order);

  } catch (error) {
    console.error('Error fetching order detail:', error);
    loadingEl.style.display = 'none';
    errorTitle.textContent = 'Lỗi kết nối';
    errorMessage.textContent = error.message || 'Không thể tải thông tin chi tiết đơn hàng vào lúc này.';
    errorEl.style.display = 'block';
  }
}

// Render dữ liệu chi tiết lên giao diện
function renderOrderDetailData(order) {
  const maDon = order.maHoaDon ? order.maHoaDon : `HD${order.idHoaDon}`;
  document.title = `Chi Tiết Đơn Hàng #${maDon} - Laptop Store`;

  // Breadcrumb & Master Title
  const breadcrumbEl = document.getElementById('breadcrumbOrderCode');
  if (breadcrumbEl) breadcrumbEl.textContent = `Đơn hàng #${maDon}`;

  document.getElementById('orderTitleMa').textContent = `#${maDon}`;
  document.getElementById('orderNgayDat').textContent = order.ngayTaoFormatted || '--/--/----';

  // Badges: Order status
  const orderStatusBadge = document.getElementById('orderStatusBadge');
  if (orderStatusBadge) {
    orderStatusBadge.textContent = order.trangThaiHienThi || 'Chờ xác nhận';
    orderStatusBadge.className = `status-badge ${order.trangThaiBadgeClass || 'badge-pending'}`;
  }

  // Badges: Payment status
  const orderPayStatusBadge = document.getElementById('orderPayStatusBadge');
  if (orderPayStatusBadge) {
    orderPayStatusBadge.textContent = order.trangThaiThanhToanHienThi || 'Chưa thanh toán';
    orderPayStatusBadge.className = `status-badge ${order.trangThaiThanhToanBadgeClass || 'badge-unpaid'}`;
  }

  // Section 1: Recipient Snapshot Information
  document.getElementById('recipientName').textContent = order.tenNguoiNhan || 'Khách lẻ';
  document.getElementById('recipientPhone').textContent = order.dienThoai || (order.tenNguoiNhan?.includes('Khách lẻ') ? 'Không có' : '---');
  document.getElementById('recipientAddress').textContent = order.diaChi || '---';
  document.getElementById('recipientNote').textContent = order.moTa || 'Không có ghi chú';

  // Staff (Nhân viên)
  const staffRow = document.getElementById('staffRow');
  const staffName = document.getElementById('staffName');
  if (order.tenNhanVien) {
    staffRow.style.display = 'flex';
    staffName.textContent = order.tenNhanVien;
  } else {
    staffRow.style.display = 'none';
  }

  // Section 2: Product Items & IMEIs
  const productContainer = document.getElementById('detailProductItems');
  const itemCountDisplay = document.getElementById('itemCountDisplay');
  const items = Array.isArray(order.items) ? order.items : [];
  itemCountDisplay.textContent = items.length.toString();

  productContainer.innerHTML = '';
  items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'order-product-row';

    // Xử lý danh sách IMEI
    let imeiHtml = '';
    const imeis = Array.isArray(item.imeis) ? item.imeis : [];
    if (imeis.length > 0) {
      const chips = imeis.map(im => `<span class="imei-chip"> ${escapeHtml(im)}</span>`).join('');
      let extraInfo = '';
      if (item.soLuong && imeis.length < item.soLuong) {
        extraInfo = `<span style="color:#d97706; font-size:0.8rem; margin-left:8px; font-weight:600;">(Đã phân bổ ${imeis.length}/${item.soLuong} máy)</span>`;
      }
      imeiHtml = `
        <div class="product-imei-box">
          <div class="imei-box-title">
            <svg style="width:14px; height:14px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>
            <span>Mã IMEI / Serial được cấp:</span>
            ${extraInfo}
          </div>
          <div class="imei-chips-container">
            ${chips}
          </div>
        </div>
      `;
    } else {
      if (order.trangThai === 4) {
        imeiHtml = `
          <div class="product-imei-box unallocated" style="border-left-color: #ef4444; background: #fff5f5;">
            <div class="imei-box-title" style="color: #991b1b;">
              <svg style="width:14px; height:14px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              <span>IMEI / Serial:</span>
            </div>
            <span class="imei-unallocated-text" style="color: #b91c1c; font-style: normal; font-weight: 600;">Đã giải phóng do đơn hàng bị hủy</span>
          </div>
        `;
      } else {
        imeiHtml = `
          <div class="product-imei-box unallocated">
            <div class="imei-box-title" style="color: #64748b;">
              <svg style="width:14px; height:14px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>IMEI / Serial:</span>
            </div>
            <span class="imei-unallocated-text">chưa có</span>
          </div>
        `;
      }
    }

    itemEl.innerHTML = `
      <img src="${escapeHtml(item.hinhAnh)}" alt="${escapeHtml(item.tenSanPham)}" class="order-product-thumb" onerror="this.src='https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'">
      <div class="order-product-info">
        <div class="order-product-name">${escapeHtml(item.tenSanPham)}</div>
        ${item.cauHinh ? `<div class="order-product-spec">${escapeHtml(item.cauHinh)}</div>` : ''}
        <div class="order-product-pricing">
          <span class="order-product-price">${formatMoney(item.giaMua)}</span>
          <span class="order-product-qty">× ${item.soLuong || 1}</span>
        </div>
        ${imeiHtml}
      </div>
      <div class="order-product-subtotal">
        ${formatMoney(item.thanhTien)}
      </div>
    `;

    productContainer.appendChild(itemEl);
  });

  // Section 3: Payment Breakdown
  document.getElementById('payMethodVal').textContent = order.phuongThucThanhToanHienThi || 'Thanh toán khi nhận hàng (COD)';

  // Ngày thanh toán (nếu đã thanh toán)
  const payDateRow = document.getElementById('payDateRow');
  const payDateVal = document.getElementById('payDateVal');
  if (order.trangThaiThanhToan === 1 && order.ngayThanhToanFormatted) {
    payDateRow.style.display = 'table-row';
    payDateVal.textContent = order.ngayThanhToanFormatted;
  } else {
    payDateRow.style.display = 'none';
  }

  // Tạm tính
  document.getElementById('subtotalVal').textContent = formatMoney(order.tongTienHang);

  // Voucher
  const voucherRow = document.getElementById('voucherRow');
  const voucherCodeVal = document.getElementById('voucherCodeVal');
  const voucherDiscountVal = document.getElementById('voucherDiscountVal');

  if (order.tienGiamVoucher && Number(order.tienGiamVoucher) > 0) {
    voucherRow.style.display = 'table-row';
    voucherCodeVal.textContent = order.maVoucher || 'Voucher';
    voucherDiscountVal.textContent = '-' + formatMoney(order.tienGiamVoucher);
  } else {
    voucherRow.style.display = 'none';
  }

  // Tổng thanh toán
  document.getElementById('grandTotalVal').textContent = formatMoney(order.tongThanhToan);

  // Lưu thông tin đơn hàng hiện tại
  currentOrderData = order;

  // Điều kiện hiển thị nút [HỦY ĐƠN]:
  // (trangThai == 0 || trangThai == 1) && trangThaiThanhToan == 0
  const cancelContainer = document.getElementById('cancelOrderActionContainer');
  if (cancelContainer) {
    const canCancel = (order.trangThai === 0 || order.trangThai === 1) && order.trangThaiThanhToan === 0;
    cancelContainer.style.display = canCancel ? 'block' : 'none';
  }
}

// Biến lưu trữ dữ liệu đơn hàng đang xem
let currentOrderData = null;

// Modal Hủy Đơn Hàng
window.openCancelModal = function() {
  if (!currentOrderData) return;
  const modal = document.getElementById('cancelConfirmModal');
  const modalMa = document.getElementById('modalCancelOrderMa');
  const alertEl = document.getElementById('cancelModalAlert');
  if (modalMa) {
    modalMa.textContent = `#${currentOrderData.maHoaDon || ('HD' + currentOrderData.idHoaDon)}`;
  }
  if (alertEl) {
    alertEl.style.display = 'none';
    alertEl.textContent = '';
  }
  if (modal) {
    modal.style.display = 'flex';
  }
};

window.closeCancelModal = function() {
  const modal = document.getElementById('cancelConfirmModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// Gửi yêu cầu hủy đơn hàng lên backend
window.submitCancelOrder = async function() {
  if (!currentOrderData || !currentOrderData.idHoaDon) return;
  const user = getCurrentUser();
  if (!user || !user.id) {
    alert('Vui lòng đăng nhập tài khoản để thực hiện hủy đơn hàng.');
    window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }

  const btnConfirm = document.getElementById('btnConfirmCancelSubmit');
  const btnBack = document.getElementById('btnCancelModalBack');
  const alertEl = document.getElementById('cancelModalAlert');

  // Khóa nút tránh click đúp (Double-click protection)
  if (btnConfirm) {
    btnConfirm.disabled = true;
    btnConfirm.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:6px;"></span>ĐANG HỦY...';
  }
  if (btnBack) btnBack.disabled = true;
  if (alertEl) {
    alertEl.style.display = 'none';
    alertEl.textContent = '';
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-Id': user.id.toString()
    };

    const response = await fetch(`${API_BASE_URL}/hoa-don/don-hang/${encodeURIComponent(currentOrderData.idHoaDon)}/huy`, {
      method: 'POST',
      headers: headers,
      credentials: 'include'
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errMsg = data.message || `Hủy đơn hàng không thành công (mã lỗi ${response.status}).`;
      throw new Error(errMsg);
    }

    // Đóng modal và thông báo thành công
    closeCancelModal();
    alert('Hủy đơn hàng thành công.');

    // Tải lại chi tiết đơn hàng để cập nhật trạng thái "Đã hủy"
    await loadOrderDetail();

  } catch (error) {
    console.error('Error cancelling order:', error);
    if (alertEl) {
      alertEl.textContent = error.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.';
      alertEl.style.display = 'block';
    } else {
      alert(error.message || 'Không thể hủy đơn hàng.');
    }
  } finally {
    if (btnConfirm) {
      btnConfirm.disabled = false;
      btnConfirm.textContent = 'XÁC NHẬN HỦY';
    }
    if (btnBack) btnBack.disabled = false;
  }
};

// Dropdown tài khoản người dùng
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
