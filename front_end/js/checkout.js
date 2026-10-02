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

// Xử lý nút [ĐẶT HÀNG] dạng Placeholder (CHƯA tạo hóa đơn, CHƯA phân bổ IMEI ở bước này)
function handlePlaceOrderPlaceholder() {
  const name = document.getElementById('recipientName')?.value.trim();
  const phone = document.getElementById('recipientPhone')?.value.trim();
  const address = document.getElementById('recipientAddress')?.value.trim();
  const note = document.getElementById('orderNotes')?.value.trim();

  if (!name) {
    showToast('Vui lòng nhập họ và tên người nhận hàng!', 'warning');
    document.getElementById('recipientName')?.focus();
    return;
  }
  if (!phone) {
    showToast('Vui lòng nhập số điện thoại người nhận hàng!', 'warning');
    document.getElementById('recipientPhone')?.focus();
    return;
  }
  if (!address) {
    showToast('Vui lòng nhập địa chỉ giao hàng!', 'warning');
    document.getElementById('recipientAddress')?.focus();
    return;
  }

  // Cảnh báo nếu tồn kho không đủ
  if (checkoutData && checkoutData.coCanhBaoTonKho) {
    showToast('Đơn hàng có sản phẩm vượt quá tồn kho khả dụng. Vui lòng quay lại giỏ hàng điều chỉnh số lượng!', 'warning');
    return;
  }

  // Bước này CHỈ là trang Checkout, chưa tạo đơn hàng vào DB
  const payMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'COD';
  showToast(`✓ Đã xác nhận thông tin nhận hàng của ${name} (Phương thức: ${payMethod}). Chức năng Đặt Hàng sẽ được xử lý ở bước tiếp theo!`, 'success');
}

// Hiển thị tài khoản người dùng trên header
function renderHeaderUser(user) {
  const slot = document.getElementById('checkoutUserSlot');
  if (!slot) return;

  const displayName = user.ten || user.username || 'Khách hàng';
  slot.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <div class="action-icon-circle" style="background: rgba(34, 197, 94, 0.15); color: #22c55e;">
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
      </div>
      <div class="action-text">
        <span class="action-label" style="color: #22c55e; font-weight: 700;">${displayName}</span>
        <span class="action-value" style="color: #ef4444; font-size: 0.75rem; cursor: pointer;" onclick="logoutCheckoutUser()">Đăng xuất</span>
      </div>
    </div>
  `;
}

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
