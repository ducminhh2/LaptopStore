/**
 * LAPTOP STORE - AUTHENTICATION SCRIPT (auth.js)
 * Handles Login, Register, Role-based Redirection, and Session Storage
 */

const API_BASE_URL = 'http://localhost:8080/api';

// SVG Icons for clean eye toggle
const SVG_EYE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const SVG_EYE_OFF = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

document.addEventListener('DOMContentLoaded', () => {
  // Check if remember_me prefilled
  const savedUsername = localStorage.getItem('laptop_store_remember_username');
  if (savedUsername) {
    const input = document.getElementById('loginUsername');
    const chk = document.getElementById('rememberMe');
    if (input) input.value = savedUsername;
    if (chk) chk.checked = true;
  }
});

// Chuyển đổi giữa 2 tab: Đăng Nhập và Đăng Ký
window.switchAuthTab = function(tabName) {
  const loginTab = document.getElementById('tabLoginBtn');
  const regTab = document.getElementById('tabRegisterBtn');
  const loginPane = document.getElementById('loginFormPane');
  const regPane = document.getElementById('registerFormPane');
  hideAlert();

  if (tabName === 'login') {
    loginTab.classList.add('active');
    regTab.classList.remove('active');
    loginPane.classList.add('active');
    regPane.classList.remove('active');
  } else {
    regTab.classList.add('active');
    loginTab.classList.remove('active');
    regPane.classList.add('active');
    loginPane.classList.remove('active');
  }
};

// Ẩn / hiện mật khẩu dạng icon con mắt cơ bản
window.togglePassword = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPwd = input.type === 'password';
  input.type = isPwd ? 'text' : 'password';
  btn.innerHTML = isPwd ? SVG_EYE_OFF : SVG_EYE;
};

// Hiển thị thông báo (thành công hoặc lỗi)
function showAlert(message, isError = true) {
  const alertEl = document.getElementById('authAlert');
  if (!alertEl) return;
  alertEl.className = `auth-alert show ${isError ? 'auth-alert-error' : 'auth-alert-success'}`;
  const icon = isError
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  alertEl.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;
}

function hideAlert() {
  const alertEl = document.getElementById('authAlert');
  if (alertEl) alertEl.className = 'auth-alert';
}

// Xử lý Đăng Nhập
window.handleLoginSubmit = async function(e) {
  e.preventDefault();
  hideAlert();

  const username = document.getElementById('loginUsername')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  const remember = document.getElementById('rememberMe')?.checked;

  if (!username || !password) {
    showAlert('Vui lòng nhập tên đăng nhập và mật khẩu!');
    return;
  }

  const btn = document.getElementById('btnLoginSubmit');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Đang xử lý...';
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Tài khoản hoặc mật khẩu không chính xác');
    }

    // Ghi nhớ đăng nhập
    if (remember) {
      localStorage.setItem('laptop_store_remember_username', username);
    } else {
      localStorage.removeItem('laptop_store_remember_username');
    }

    // Lưu thông tin người dùng vào Session & LocalStorage
    localStorage.setItem('laptop_store_user', JSON.stringify(data));
    sessionStorage.setItem('laptop_store_user', JSON.stringify(data));

    // Điều hướng theo vai trò (Role-based Redirection)
    const role = data.roleCode;
    const roleName = data.vaiTro?.tenVaiTro || (role === 'ADMIN' ? 'Quản trị viên' : (role === 'NHAN_VIEN' ? 'Nhân viên' : 'Khách hàng'));

    if (role === 'ADMIN' || role === 'NHAN_VIEN') {
      showAlert(`Đăng nhập thành công với vai trò [${roleName}]! Đang chuyển sang trang Quản Trị & POS...`, false);
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 700);
    } else {
      showAlert(`Đăng nhập thành công! Đang chuyển sang trang Cửa Hàng...`, false);
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 700);
    }

  } catch(err) {
    showAlert(err.message || 'Lỗi kết nối tới hệ thống máy chủ backend');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Đăng Nhập';
    }
  }
};

// Xử lý Đăng Ký
window.handleRegisterSubmit = async function(e) {
  e.preventDefault();
  hideAlert();

  const ten = document.getElementById('regTen')?.value.trim();
  const username = document.getElementById('regUsername')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim();
  const dienThoai = document.getElementById('regPhone')?.value.trim();
  const diaChi = document.getElementById('regDiaChi')?.value.trim();
  const password = document.getElementById('regPassword')?.value;
  const confirmPassword = document.getElementById('regConfirmPassword')?.value;

  if (!ten || !username || !password) {
    showAlert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
    return;
  }

  if (password.length < 6) {
    showAlert('Mật khẩu phải có ít nhất 6 ký tự để đảm bảo an toàn!');
    return;
  }

  if (password !== confirmPassword) {
    showAlert('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.');
    return;
  }

  const btn = document.getElementById('btnRegisterSubmit');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Đang tạo tài khoản...';
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        ten,
        username,
        email,
        dienThoai,
        diaChi,
        password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Không thể đăng ký tài khoản');
    }

    // Đăng ký tài khoản khách hàng thành công
    localStorage.setItem('laptop_store_user', JSON.stringify(data));
    sessionStorage.setItem('laptop_store_user', JSON.stringify(data));

    showAlert('Đăng ký tài khoản thành công! Đang chuyển tới cửa hàng...', false);
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 900);

  } catch(err) {
    showAlert(err.message || 'Lỗi khi đăng ký tài khoản');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Đăng Ký Tài Khoản';
    }
  }
};
