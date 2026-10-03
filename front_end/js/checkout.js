/**
 * checkout.js - Xử lý hiển thị trang Thanh Toán (Checkout)
 * Lấy dữ liệu từ Database giỏ hàng của user đã đăng nhập, tính giá khuyến mãi và kiểm tra tồn kho IMEI.
 */

const API_BASE_URL = 'http://localhost:8080/api';
let checkoutData = null;

// Lấy thông tin user hiện tại từ LocalStorage
function getLoggedInCustomer() {
  const userStr = localStorage.getItem('laptop_store_user') || sessionStorage.getItem('laptop_store_user');
  try {
    const user = userStr ? JSON.parse(userStr) : null;
    return (user && user.id) ? user : null;
  } catch (e) {
    return null;
  }
}

// Định dạng tiền tệ VND
function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';
}

// Hiển thị Toast thông báo
function showToast(message, type = 'default') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg style="width: 18px; height: 18px; color: ${type === 'success' ? '#22c55e' : (type === 'warning' ? '#f59e0b' : '#ff4747')}" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Khởi tạo trang Checkout
async function initCheckout() {
  const user = getLoggedInCustomer();

  // BẢO MẬT & ĐIỀU KIỆN 1: Nếu chưa đăng nhập -> Chuyển về trang đăng nhập
  if (!user) {
    showToast('Vui lòng đăng nhập để truy cập trang thanh toán!', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html?redirect=checkout.html';
    }, 1000);
    return;
  }

  // Render thông tin tài khoản trên header
  renderHeaderUser(user);

  const loadingEl = document.getElementById('checkoutLoading');
  const emptyEl = document.getElementById('checkoutEmptyCart');
  const contentEl = document.getElementById('checkoutContent');

  try {
    // Gọi API Checkout với credentials: 'include' để truyền session cookie
    const res = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.id.toString()
      },
      credentials: 'include'
    });

    if (res.status === 401) {
      showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', 'warning');
      setTimeout(() => {
        window.location.href = 'login.html?redirect=checkout.html';
      }, 1000);
      return;
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error((errData && errData.message) ? errData.message : 'Không thể tải thông tin thanh toán từ hệ thống máy chủ.');
    }

    checkoutData = await res.json();
    loadingEl.style.display = 'none';

    // ĐIỀU KIỆN 2: Nếu giỏ hàng rỗng
    if (!checkoutData.success || !checkoutData.items || checkoutData.items.length === 0) {
      emptyEl.style.display = 'block';
      contentEl.style.display = 'none';
      document.getElementById('checkoutCartBadge').textContent = '0';
      return;
    }

    // Đã có dữ liệu hợp lệ -> Render giao diện Checkout
    emptyEl.style.display = 'none';
    contentEl.style.display = 'grid';
    renderCheckoutData(checkoutData, user);

  } catch (err) {
    console.error('Lỗi khi tải checkout:', err);
    loadingEl.innerHTML = `
      <div style="color: #ef4444; font-weight: 700; margin-bottom: 12px;">Đã xảy ra lỗi khi tải đơn hàng!</div>
      <p style="color: #94a3b8; font-size: 0.9rem;">${err.message}</p>
      <a href="index.html" class="btn-empty-shop" style="margin-top: 16px;">Về trang chủ</a>
    `;
  }
}

// Render dữ liệu vào Form và Danh sách sản phẩm
function renderCheckoutData(data, user) {
  // 1. Điền thông tin người nhận mặc định từ NguoiDung (khách được sửa trên form)
  const nameInput = document.getElementById('recipientName');
  const phoneInput = document.getElementById('recipientPhone');
  const addressInput = document.getElementById('recipientAddress');

  if (nameInput) nameInput.value = data.hoTen || user.ten || '';
  if (phoneInput) phoneInput.value = data.soDienThoai || user.dienThoai || '';
  if (addressInput) addressInput.value = data.diaChi || user.diaChi || '';

  // 2. Render danh sách sản phẩm
  const itemsContainer = document.getElementById('checkoutItemsList');
  if (itemsContainer) {
    itemsContainer.innerHTML = data.items.map(it => {
      const imgUrl = it.hinhAnh || '../images/placeholder-laptop.png';
      const specsHtml = it.cauHinhSummary ? `<div class="checkout-item-specs">${it.cauHinhSummary}</div>` : '';

      const priceHtml = it.coKhuyenMai
        ? `<span class="checkout-item-old-price">${formatCurrency(it.giaGoc)}</span>
           <span class="checkout-item-cur-price">${formatCurrency(it.giaSauKhuyenMai)}</span>`
        : `<span class="checkout-item-cur-price">${formatCurrency(it.giaSauKhuyenMai)}</span>`;

      const warningHtml = it.vuotTonKho
        ? `<div class="stock-warning-banner">
             <svg style="width: 16px; height: 16px; flex-shrink: 0;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
             <span>${it.canhBaoTonKho || 'Vượt tồn kho khả dụng'}</span>
           </div>`
        : '';

      return `
        <div class="checkout-item ${it.vuotTonKho ? 'item-has-warning' : ''}">
          <img src="${imgUrl}" alt="${it.tenSanPham}" class="checkout-item-img" onerror="this.src='../images/placeholder-laptop.png'">
          <div class="checkout-item-details">
            <div>
              <div class="checkout-item-title" title="${it.tenSanPham}">${it.tenSanPham}</div>
              ${specsHtml}
            </div>
            <div>
              <div class="checkout-item-price-row">
                <span class="checkout-item-qty">x${it.soLuong}</span>
                <div class="checkout-item-pricing">
                  ${priceHtml}
                  <div class="checkout-item-total">Thành tiền: <strong>${formatCurrency(it.thanhTien)}</strong></div>
                </div>
              </div>
              ${warningHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. Render danh sách Voucher vào Dropdown
  const voucherSelect = document.getElementById('checkoutVoucherSelect');
  if (voucherSelect) {
    let optionsHtml = '<option value="">Không áp dụng</option>';
    const vouchers = data.vouchers || [];
    vouchers.forEach(v => {
      const isEligible = v.duDieuKien;
      const disabledAttr = isEligible ? '' : 'disabled';
      const label = formatVoucherLabel(v);
      optionsHtml += `<option value="${v.id}" ${disabledAttr}>${label}</option>`;
    });
    voucherSelect.innerHTML = optionsHtml;
    voucherSelect.value = '';
  }

  // 4. Render tổng tiền & số lượng
  document.getElementById('checkoutTotalItemCount').textContent = data.tongSoLuong || 0;
  document.getElementById('checkoutCartBadge').textContent = data.tongSoLuong || 0;
  document.getElementById('checkoutSubtotal').textContent = formatCurrency(data.tongTienHang);
  document.getElementById('checkoutVoucherDiscount').textContent = '0 đ';
  document.getElementById('checkoutVoucherDiscount').style.color = '#15803d';
  document.getElementById('checkoutTotalAmount').textContent = formatCurrency(data.tongTienHang);
  const statusMsg = document.getElementById('voucherStatusMsg');
  if (statusMsg) statusMsg.style.display = 'none';

  // 5. Đảm bảo phương thức thanh toán COD luôn được chọn mặc định
  const codRadio = document.getElementById('paymentCodRadio');
  if (codRadio) {
    codRadio.checked = true;
  }

  // 6. Hiển thị cảnh báo tổng thể nếu có sản phẩm thiếu hàng
  const globalAlert = document.getElementById('checkoutGlobalAlert');
  const alertText = document.getElementById('checkoutGlobalAlertText');
  if (data.coCanhBaoTonKho) {
    globalAlert.style.display = 'flex';
    alertText.textContent = data.thongBaoTonKho || 'Một số sản phẩm trong giỏ hàng hiện vượt quá số lượng tồn kho khả dụng. Vui lòng kiểm tra lại!';
  } else {
    globalAlert.style.display = 'none';
  }
}

// Định dạng hiển thị tên Voucher trong Dropdown
function formatVoucherLabel(v) {
  let label = `${v.ma} - Giảm ${v.loaiGiamHienThi}`;
  if (v.giamToiDa && v.giamToiDa > 0 && v.loaiGiam === 1) {
    label += ` (Tối đa ${formatCurrency(v.giamToiDa)})`;
  }
  if (v.giaTriDonToiThieu && v.giaTriDonToiThieu > 0) {
    label += ` - Đơn từ ${formatCurrency(v.giaTriDonToiThieu)}`;
  }
  if (!v.duDieuKien) {
    label += ` [Chưa đủ điều kiện]`;
  }
  return label;
}

// Xử lý khi khách chọn Voucher từ Dropdown
async function handleSelectVoucher(voucherIdVal) {
  const user = getLoggedInCustomer();
  if (!user) return;

  const voucherId = voucherIdVal ? parseInt(voucherIdVal, 10) : null;
  const statusMsg = document.getElementById('voucherStatusMsg');
  const discountEl = document.getElementById('checkoutVoucherDiscount');
  const totalAmountEl = document.getElementById('checkoutTotalAmount');

  try {
    const res = await fetch(`${API_BASE_URL}/checkout/apply-voucher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.id.toString()
      },
      credentials: 'include',
      body: JSON.stringify({ voucherId })
    });

    const result = await res.json();

    if (res.ok && result.success) {
      if (result.tienGiamVoucher > 0) {
        discountEl.textContent = '-' + formatCurrency(result.tienGiamVoucher);
        discountEl.style.color = '#dc2626';
      } else {
        discountEl.textContent = '0 đ';
        discountEl.style.color = '#15803d';
      }

      totalAmountEl.textContent = formatCurrency(result.tongThanhToan);

      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#15803d';
        statusMsg.textContent = `✓ ${result.message}`;
      }
      if (voucherId) {
        showToast(result.message, 'success');
      }
    } else {
      discountEl.textContent = '0 đ';
      discountEl.style.color = '#15803d';
      totalAmountEl.textContent = formatCurrency(result.tamTinh || checkoutData.tongTienHang);

      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#dc2626';
        statusMsg.textContent = `✗ ${result.message || 'Không thể áp dụng Voucher này.'}`;
      }
      showToast(result.message || 'Voucher không hợp lệ!', 'warning');
    }
  } catch (err) {
    console.error('Lỗi khi áp dụng Voucher:', err);
    showToast('Lỗi kết nối khi kiểm tra Voucher!', 'error');
  }
}
window.handleSelectVoucher = handleSelectVoucher;

// Xử lý sự kiện bấm nút [ĐẶT HÀNG]
async function handlePlaceOrder() {
  const user = getLoggedInCustomer();
  if (!user) {
    showToast('Vui lòng đăng nhập để tiến hành đặt hàng!', 'warning');
    return;
  }

  const nameInput = document.getElementById('recipientName');
  const phoneInput = document.getElementById('recipientPhone');
  const addressInput = document.getElementById('recipientAddress');
  const noteInput = document.getElementById('orderNotes');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const address = addressInput ? addressInput.value.trim() : '';
  const note = noteInput ? noteInput.value.trim() : '';

  if (!name) {
    showToast('Vui lòng nhập họ và tên người nhận hàng!', 'warning');
    nameInput?.focus();
    return;
  }
  if (!phone) {
    showToast('Vui lòng nhập số điện thoại người nhận hàng!', 'warning');
    phoneInput?.focus();
    return;
  }
  const cleanPhone = phone.replace(/[\s.-]/g, '');
  if (!/^[0-9]{10}$/.test(cleanPhone)) {
    showToast('Số điện thoại nhận hàng không hợp lệ (yêu cầu đúng 10 chữ số)!', 'warning');
    phoneInput?.focus();
    return;
  }
  if (!address) {
    showToast('Vui lòng nhập địa chỉ giao hàng!', 'warning');
    addressInput?.focus();
    return;
  }

  // Cảnh báo nếu tồn kho không đủ
  if (checkoutData && checkoutData.coCanhBaoTonKho) {
    showToast('Đơn hàng có sản phẩm vượt quá tồn kho khả dụng. Vui lòng quay lại giỏ hàng điều chỉnh số lượng!', 'warning');
    return;
  }

  const voucherSelect = document.getElementById('checkoutVoucherSelect');
  const voucherId = voucherSelect && voucherSelect.value ? parseInt(voucherSelect.value, 10) : null;
  const payMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'COD';

  const btn = document.getElementById('btnPlaceOrder');
  const originalBtnHtml = btn ? btn.innerHTML : 'ĐẶT HÀNG';

  try {
    // Chống double click
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.7';
      btn.innerHTML = `
        <svg style="width: 20px; height: 20px; animation: spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        ĐANG ĐẶT HÀNG...
      `;
    }

    const payload = {
      tenNguoiNhan: name,
      dienThoai: cleanPhone,
      diaChi: address,
      ghiChu: note,
      voucherId: voucherId,
      phuongThucThanhToan: payMethod
    };

    const res = await fetch(`${API_BASE_URL}/checkout/dat-hang`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.id.toString()
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (res.ok && result.success) {
      showToast(result.message || 'Đặt hàng thành công!', 'success');
      // Xóa giỏ hàng local nếu có
      localStorage.removeItem('laptop_store_cart');

      // Chuyển hướng sang trang đặt hàng thành công
      setTimeout(() => {
        window.location.href = `order-success.html?orderCode=${encodeURIComponent(result.maHoaDon || '')}&total=${encodeURIComponent(result.tongThanhToan || 0)}`;
      }, 600);
    } else {
      showToast(result.message || 'Đặt hàng thất bại. Vui lòng thử lại!', 'warning');
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.innerHTML = originalBtnHtml;
      }
    }
  } catch (err) {
    console.error('Lỗi khi đặt hàng:', err);
    showToast('Lỗi kết nối khi gửi yêu cầu đặt hàng!', 'error');
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.innerHTML = originalBtnHtml;
    }
  }
}
window.handlePlaceOrder = handlePlaceOrder;
window.handlePlaceOrderPlaceholder = handlePlaceOrder;

// Hiển thị tài khoản người dùng trên header
function renderHeaderUser(user) {
  const slot = document.getElementById('checkoutUserSlot');
  if (!slot) return;

  const displayName = user.ten || user.username || 'Khách hàng';
  const roleName = user.vaiTro?.tenVaiTro || (user.roleCode === 'ADMIN' ? 'Quản trị viên' : (user.roleCode === 'NHAN_VIEN' ? 'Nhân viên' : 'Khách hàng'));
  const isStaffOrAdmin = user.roleCode === 'ADMIN' || user.roleCode === 'NHAN_VIEN';

  slot.innerHTML = `
    <div class="user-dropdown-wrapper" id="userAvatarContainer" onclick="toggleCheckoutUserDropdown(event)">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="action-icon-circle" style="background:#2563eb; color:#ffffff; border-color:#2563eb;">
          <svg style="width:20px; height:20px;" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div class="action-text">
          <span class="action-label" style="font-weight: 700; color: #1e293b; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${displayName}
          </span>
          <span class="action-value" style="font-size: 0.75rem; color: #64748b; display: flex; align-items: center; gap: 3px;">
            Tài khoản <span style="font-size: 0.6rem;">▼</span>
          </span>
        </div>
      </div>

      <div class="user-dropdown-menu" id="userDropdownMenu">
        <div class="user-dropdown-header">
          <div class="user-dropdown-name">${displayName}</div>
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
        <button type="button" class="user-dropdown-item logout-item" onclick="event.stopPropagation(); logoutCheckoutUser();">
          <svg style="width:16px; height:16px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  `;
}

window.toggleCheckoutUserDropdown = function(e) {
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

// Đăng xuất từ trang Checkout
function logoutCheckoutUser() {
  localStorage.removeItem('laptop_store_user');
  sessionStorage.removeItem('laptop_store_user');
  localStorage.removeItem('laptop_store_cart');
  showToast('Đã đăng xuất tài khoản.');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 600);
}

// Chạy khởi tạo khi tải xong DOM
document.addEventListener('DOMContentLoaded', initCheckout);

