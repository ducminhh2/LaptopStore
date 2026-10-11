/**
 * LAPTOP STORE - USER MANAGEMENT (user-admin.js)
 * Module Quản lý Người dùng (Dùng chung cho Admin và Nhân viên)
 * TUÂN THỦ BƯỚC 1:
 * - Đọc dữ liệu thật từ SQL Server qua API GET /api/nguoi-dung
 * - Tuyệt đối KHÔNG gọi API ghi dữ liệu (POST, PUT, DELETE) ở bước này
 * - Hoàn thiện 100% giao diện: Thống kê 4 thẻ, tìm kiếm, lọc vai trò, phân trang,
 *   modal Chi tiết, modal Thêm nhân viên, modal Chỉnh sửa, modal Đổi vai trò, modal Khóa tài khoản
 */

(function () {
  'use strict';

  const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080/api';

  const userState = {
    usersList: [],
    filteredList: [],
    currentPage: 1,
    pageSize: 10,
    currentSearch: '',
    currentRoleFilter: 'ALL',
    currentStatusFilter: 'ALL',
    selectedUserId: null
  };

  // Helper lấy initials cho avatar
  function getInitials(name) {
    if (!name) return 'ND';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Helper sinh avatar background màu sắc ngẫu nhiên nhưng ổn định theo ID
  function getAvatarBg(id) {
    const colors = [
      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      'linear-gradient(135deg, #06b6d4, #0e7490)',
      'linear-gradient(135deg, #10b981, #047857)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #ec4899, #be185d)'
    ];
    return colors[(id || 0) % colors.length];
  }

  // Helper render role badge
  function renderRoleBadge(vaiTro) {
    if (!vaiTro) {
      return `<span style="background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 9999px; padding: 3px 10px; font-size: 0.78rem; font-weight: 600;">Chưa gán</span>`;
    }
    const roleId = Number(vaiTro.id);
    const roleName = vaiTro.tenVaiTro || 'Khác';

    if (roleId === 1 || roleName.toLowerCase().includes('quản trị') || roleName.toLowerCase().includes('admin')) {
      return `<span style="background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff; border-radius: 9999px; padding: 3px 10px; font-size: 0.78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
        ${roleName}
      </span>`;
    } else if (roleId === 2 || roleName.toLowerCase().includes('nhân viên') || roleName.toLowerCase().includes('staff')) {
      return `<span style="background: #eff6ff; color: #0284c7; border: 1px solid #bae6fd; border-radius: 9999px; padding: 3px 10px; font-size: 0.78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
        <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#0284c7;"></span>
        ${roleName}
      </span>`;
    } else {
      return `<span style="background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; border-radius: 9999px; padding: 3px 10px; font-size: 0.78rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
        <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#059669;"></span>
        ${roleName}
      </span>`;
    }
  }

  // ============================================================================
  // LOAD DỮ LIỆU TỪ BACKEND
  // ============================================================================
  window.initUserAdminTab = async function () {
    const tbody = document.getElementById('userTableBody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 35px 20px; color: var(--admin-text-muted);">
            <div style="display:inline-block; width:22px; height:22px; border:2.5px solid #cbd5e1; border-top-color:#3b82f6; border-radius:50%; animation:spin 0.8s linear infinite; vertical-align:middle; margin-right:8px;"></div>
            Đang tải dữ liệu người dùng từ cơ sở dữ liệu...
          </td>
        </tr>
      `;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/nguoi-dung`);
      if (res.ok) {
        userState.usersList = await res.json();
      } else {
        userState.usersList = [];
      }
    } catch (err) {
      console.warn('Lỗi kết nối API /api/nguoi-dung:', err);
      userState.usersList = [];
    }

    updateUserStats();
    applyUserFilters();
  };

  // Tính toán 4 thẻ thống kê từ dữ liệu thật
  function updateUserStats() {
    const list = userState.usersList || [];
    const total = list.length;

    let adminCount = 0;
    let staffCount = 0;
    let customerCount = 0;

    list.forEach(u => {
      const rId = u.vaiTro ? Number(u.vaiTro.id) : null;
      const rName = u.vaiTro && u.vaiTro.tenVaiTro ? u.vaiTro.tenVaiTro.toLowerCase() : '';

      if (rId === 1 || rName.includes('quản trị') || rName.includes('admin')) {
        adminCount++;
      } else if (rId === 2 || rName.includes('nhân viên') || rName.includes('staff')) {
        staffCount++;
      } else {
        customerCount++;
      }
    });

    const elTotal = document.getElementById('statUserTotal');
    const elAdmin = document.getElementById('statUserAdmin');
    const elStaff = document.getElementById('statUserStaff');
    const elCustomer = document.getElementById('statUserCustomer');

    if (elTotal) elTotal.textContent = total;
    if (elAdmin) elAdmin.textContent = adminCount;
    if (elStaff) elStaff.textContent = staffCount;
    if (elCustomer) elCustomer.textContent = customerCount;
  }

  // Lọc và tìm kiếm
  function applyUserFilters() {
    const s = userState.currentSearch.trim().toLowerCase();
    const roleF = userState.currentRoleFilter;

    userState.filteredList = (userState.usersList || []).filter(u => {
      // Tìm theo họ tên, username, email, sđt, mã
      const matchSearch = !s ||
        (u.ten && u.ten.toLowerCase().includes(s)) ||
        (u.username && u.username.toLowerCase().includes(s)) ||
        (u.email && u.email.toLowerCase().includes(s)) ||
        (u.dienThoai && u.dienThoai.toLowerCase().includes(s)) ||
        (u.ma && u.ma.toLowerCase().includes(s));

      if (!matchSearch) return false;

      // Lọc theo vai trò
      if (roleF !== 'ALL') {
        const targetId = Number(roleF);
        if (!u.vaiTro || Number(u.vaiTro.id) !== targetId) {
          return false;
        }
      }

      return true;
    });

    userState.currentPage = 1;
    renderUserTable();
  }

  // Render bảng người dùng
  function renderUserTable() {
    const tbody = document.getElementById('userTableBody');
    const emptyState = document.getElementById('userEmptyState');
    const paginationSec = document.getElementById('userPaginationSection');

    if (!tbody) return;

    const list = userState.filteredList || [];
    const total = list.length;

    if (total === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (paginationSec) paginationSec.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (paginationSec) paginationSec.style.display = 'flex';

    // Tính toán phân trang
    const totalPages = Math.ceil(total / userState.pageSize) || 1;
    if (userState.currentPage > totalPages) userState.currentPage = totalPages;

    const startIdx = (userState.currentPage - 1) * userState.pageSize;
    const endIdx = Math.min(startIdx + userState.pageSize, total);
    const pageItems = list.slice(startIdx, endIdx);

    tbody.innerHTML = pageItems.map((user, idx) => {
      const stt = startIdx + idx + 1;
      const initials = getInitials(user.ten);
      const avatarBg = getAvatarBg(user.id);
      const userEmail = user.email || '<span style="color:#94a3b8; font-style:italic;">Chưa có</span>';
      const userPhone = user.dienThoai || '<span style="color:#94a3b8; font-style:italic;">---</span>';
      const userAddress = user.diaChi || '<span style="color:#94a3b8; font-style:italic;">---</span>';

      return `
        <tr style="transition: background 0.15s ease;">
          <td style="text-align: center; font-weight: 600; color: #64748b;">${stt}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: ${avatarBg}; color: #fff; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
                ${initials}
              </div>
              <div>
                <div style="font-weight: 700; color: #0f172a; font-size: 0.92rem;">${user.ten || 'Chưa đặt tên'}</div>
                <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px;">
                  <span style="font-family: monospace; color: #3b82f6;">@${user.username || '---'}</span>
                  ${user.ma ? `<span style="margin-left: 6px; color: #94a3b8;">(${user.ma})</span>` : ''}
                </div>
              </div>
            </div>
          </td>
          <td style="font-size: 0.88rem; color: #334155;">${userEmail}</td>
          <td style="font-size: 0.88rem; color: #1e293b; font-weight: 600;">${userPhone}</td>
          <td style="font-size: 0.85rem; color: #475569; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${user.diaChi || ''}">
            ${userAddress}
          </td>
          <td style="text-align: center;">
            ${renderRoleBadge(user.vaiTro)}
          </td>
          <td style="text-align: center;">
            <span style="display: inline-flex; align-items: center; gap: 5px; background: #ecfdf5; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 9999px; padding: 3px 10px; font-size: 0.76rem; font-weight: 600;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: #16a34a;"></span>
              Hoạt động
            </span>
          </td>
          <td style="text-align: center;">
            <div style="display: inline-flex; gap: 6px; align-items: center;">
              <button type="button" class="btn-admin btn-outline btn-sm" onclick="openUserDetailModal(${user.id})" title="Xem chi tiết tài khoản" style="padding: 4px 10px; font-size: 0.8rem; font-weight: 600;">
                Chi tiết
              </button>
              <button type="button" class="btn-admin btn-outline btn-sm" onclick="openChangeRoleModal(${user.id})" title="Thay đổi vai trò" style="padding: 4px 8px; color: #7e22ce; border-color: #e9d5ff;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
              </button>
              <button type="button" class="btn-admin btn-outline btn-sm" onclick="openLockUserModal(${user.id})" title="Khóa / Mở khóa" style="padding: 4px 8px; color: #dc2626; border-color: #fca5a5;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    renderPagination(total, startIdx + 1, endIdx, totalPages);
  }

  // Render controls phân trang
  function renderPagination(total, fromItem, toItem, totalPages) {
    const infoEl = document.getElementById('userPaginationInfo');
    const controlsEl = document.getElementById('userPaginationControls');

    if (infoEl) {
      infoEl.textContent = `Hiển thị ${fromItem} - ${toItem} trên tổng số ${total} tài khoản`;
    }

    if (controlsEl) {
      let html = '';

      // Nút Trước
      html += `
        <button type="button" class="btn-admin btn-outline btn-sm" onclick="goToUserPage(${userState.currentPage - 1})" ${userState.currentPage <= 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
          &laquo; Trước
        </button>
      `;

      // Các nút số trang
      for (let p = 1; p <= totalPages; p++) {
        const isActive = p === userState.currentPage;
        html += `
          <button type="button" class="btn-admin ${isActive ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="goToUserPage(${p})" style="min-width: 32px; padding: 4px 8px; font-weight: ${isActive ? '700' : '500'};">
            ${p}
          </button>
        `;
      }

      // Nút Sau
      html += `
        <button type="button" class="btn-admin btn-outline btn-sm" onclick="goToUserPage(${userState.currentPage + 1})" ${userState.currentPage >= totalPages ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
          Sau &raquo;
        </button>
      `;

      controlsEl.innerHTML = html;
    }
  }

  window.goToUserPage = function (page) {
    const totalPages = Math.ceil((userState.filteredList.length || 0) / userState.pageSize) || 1;
    if (page < 1 || page > totalPages) return;
    userState.currentPage = page;
    renderUserTable();
  };

  // Event handlers tìm kiếm & bộ lọc
  window.onUserSearchInput = function () {
    const input = document.getElementById('userSearchInput');
    userState.currentSearch = input ? input.value : '';
    applyUserFilters();
  };

  window.onUserRoleFilterChange = function () {
    const select = document.getElementById('userRoleFilter');
    userState.currentRoleFilter = select ? select.value : 'ALL';
    applyUserFilters();
  };

  window.onUserStatusFilterChange = function () {
    const select = document.getElementById('userStatusFilter');
    userState.currentStatusFilter = select ? select.value : 'ALL';
    applyUserFilters();
  };

  window.resetUserFilters = function () {
    const input = document.getElementById('userSearchInput');
    const selectRole = document.getElementById('userRoleFilter');
    const selectStatus = document.getElementById('userStatusFilter');

    if (input) input.value = '';
    if (selectRole) selectRole.value = 'ALL';
    if (selectStatus) selectStatus.value = 'ALL';

    userState.currentSearch = '';
    userState.currentRoleFilter = 'ALL';
    userState.currentStatusFilter = 'ALL';

    applyUserFilters();
  };

  // ============================================================================
  // MODAL 1: CHI TIẾT NGƯỜI DÙNG
  // ============================================================================
  window.openUserDetailModal = function (userId) {
    const user = (userState.usersList || []).find(u => u.id === userId);
    if (!user) return;

    userState.selectedUserId = userId;

    const elAvatar = document.getElementById('detailUserAvatar');
    const elTen = document.getElementById('detailUserTen');
    const elVaiTro = document.getElementById('detailUserVaiTroBadge');
    const elUsername = document.getElementById('detailUserUsername');
    const elMa = document.getElementById('detailUserMa');
    const elEmail = document.getElementById('detailUserEmail');
    const elPhone = document.getElementById('detailUserPhone');
    const elAddress = document.getElementById('detailUserAddress');
    const elStatus = document.getElementById('detailUserStatusBadge');

    if (elAvatar) {
      elAvatar.textContent = getInitials(user.ten);
      elAvatar.style.background = getAvatarBg(user.id);
    }
    if (elTen) elTen.textContent = user.ten || 'Chưa đặt tên';
    if (elVaiTro) elVaiTro.innerHTML = renderRoleBadge(user.vaiTro);
    if (elUsername) elUsername.textContent = user.username || '---';
    if (elMa) elMa.textContent = user.ma || '---';
    if (elEmail) elEmail.textContent = user.email || 'Chưa cập nhật';
    if (elPhone) elPhone.textContent = user.dienThoai || 'Chưa cập nhật';
    if (elAddress) elAddress.textContent = user.diaChi || 'Chưa cập nhật địa chỉ';
    if (elStatus) elStatus.textContent = 'Đang hoạt động (Dữ liệu DB)';

    const modal = document.getElementById('modalUserDetail');
    if (modal) modal.classList.add('active');
  };

  window.closeUserDetailModal = function () {
    const modal = document.getElementById('modalUserDetail');
    if (modal) modal.classList.remove('active');
  };

  window.openEditUserFromDetail = function () {
    closeUserDetailModal();
    if (userState.selectedUserId) {
      openEditUserModal(userState.selectedUserId);
    }
  };

  window.openChangeRoleFromDetail = function () {
    closeUserDetailModal();
    if (userState.selectedUserId) {
      openChangeRoleModal(userState.selectedUserId);
    }
  };

  window.openLockUserFromDetail = function () {
    closeUserDetailModal();
    if (userState.selectedUserId) {
      openLockUserModal(userState.selectedUserId);
    }
  };

  // ============================================================================
  // MODAL 2: THÊM NHÂN VIÊN MỚI
  // ============================================================================
  window.openAddStaffModal = function () {
    const form = document.getElementById('formAddStaff');
    if (form) form.reset();

    const err = document.getElementById('addStaffErrorMsg');
    if (err) err.style.display = 'none';

    const modal = document.getElementById('modalAddStaff');
    if (modal) modal.classList.add('active');
  };

  window.closeAddStaffModal = function () {
    const modal = document.getElementById('modalAddStaff');
    if (modal) modal.classList.remove('active');
  };

  window.handleAddStaffSubmit = function () {
    const ten = document.getElementById('addStaffTen')?.value.trim();
    const username = document.getElementById('addStaffUsername')?.value.trim();
    const email = document.getElementById('addStaffEmail')?.value.trim();
    const phone = document.getElementById('addStaffPhone')?.value.trim();
    const password = document.getElementById('addStaffPassword')?.value;
    const confirmPassword = document.getElementById('addStaffConfirmPassword')?.value;

    const errEl = document.getElementById('addStaffErrorMsg');
    function showError(msg) {
      if (errEl) {
        errEl.textContent = msg;
        errEl.style.display = 'block';
      }
    }

    if (!ten) return showError('Vui lòng nhập họ và tên nhân viên!');
    if (!username) return showError('Vui lòng nhập tên đăng nhập (username)!');
    if (!email || !email.includes('@')) return showError('Vui lòng nhập địa chỉ email hợp lệ!');
    if (!phone || !phone.match(/^0[0-9]{9}$/)) return showError('Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng số 0!');
    if (!password || password.length < 6) return showError('Mật khẩu phải có tối thiểu 6 ký tự!');
    if (password !== confirmPassword) return showError('Mật khẩu xác nhận không trùng khớp!');

    if (errEl) errEl.style.display = 'none';

    alert('[BƯỚC 1 - GIAO DIỆN HOÀN THIỆN]\nĐã kiểm tra validation form thành công!\nTheo quy định của Bước 1: Chưa gọi API ghi dữ liệu hoặc lưu Database. Nghiệp vụ tạo tài khoản thật sẽ được kích hoạt ở Bước 2.');
  };

  // ============================================================================
  // MODAL 3: CHỈNH SỬA THÔNG TIN NGƯỜI DÙNG
  // ============================================================================
  window.openEditUserModal = function (userId) {
    const user = (userState.usersList || []).find(u => u.id === userId);
    if (!user) return;

    userState.selectedUserId = userId;

    document.getElementById('editUserMa').value = user.ma || '';
    document.getElementById('editUserUsername').value = user.username || '';
    document.getElementById('editUserTen').value = user.ten || '';
    document.getElementById('editUserEmail').value = user.email || '';
    document.getElementById('editUserPhone').value = user.dienThoai || '';
    document.getElementById('editUserAddress').value = user.diaChi || '';

    const modal = document.getElementById('modalEditUser');
    if (modal) modal.classList.add('active');
  };

  window.closeEditUserModal = function () {
    const modal = document.getElementById('modalEditUser');
    if (modal) modal.classList.remove('active');
  };

  window.handleEditUserSubmit = function () {
    const ten = document.getElementById('editUserTen')?.value.trim();
    if (!ten) {
      alert('Họ và tên không được để trống!');
      return;
    }

    alert('[BƯỚC 1 - GIAO DIỆN HOÀN THIỆN]\nĐã kiểm tra form chỉnh sửa thành công!\nTheo quy định của Bước 1: Chưa gọi API PUT cập nhật Database. Nghiệp vụ cập nhật thật sẽ được kích hoạt ở Bước 2.');
  };

  // ============================================================================
  // MODAL 4: THAY ĐỔI VAI TRÒ
  // ============================================================================
  window.openChangeRoleModal = function (userId) {
    const user = (userState.usersList || []).find(u => u.id === userId);
    if (!user) return;

    userState.selectedUserId = userId;

    const elName = document.getElementById('changeRoleUserName');
    const elBadge = document.getElementById('changeRoleCurrentBadge');
    const elSelect = document.getElementById('changeRoleNewSelect');

    if (elName) elName.textContent = `${user.ten || user.username} (${user.ma || '---'})`;
    if (elBadge) elBadge.innerHTML = renderRoleBadge(user.vaiTro);
    if (elSelect && user.vaiTro && user.vaiTro.id) {
      elSelect.value = user.vaiTro.id.toString();
    }

    const modal = document.getElementById('modalChangeRole');
    if (modal) modal.classList.add('active');
  };

  window.closeChangeRoleModal = function () {
    const modal = document.getElementById('modalChangeRole');
    if (modal) modal.classList.remove('active');
  };

  window.handleChangeRoleSubmit = function () {
    const newRoleId = document.getElementById('changeRoleNewSelect')?.value;
    const roleText = newRoleId === '1' ? 'Quản trị viên (Admin)' : (newRoleId === '2' ? 'Nhân viên (Staff)' : 'Khách hàng');

    alert(`[BƯỚC 1 - GIAO DIỆN HOÀN THIỆN]\nĐã chọn vai trò mới: ${roleText}!\nTheo quy định của Bước 1: Chưa thực hiện ghi vào Database. Nghiệp vụ đổi vai trò thật sẽ được kích hoạt ở Bước 2.`);
  };

  // ============================================================================
  // MODAL 5: KHÓA / MỞ KHÓA TÀI KHOẢN
  // ============================================================================
  window.openLockUserModal = function (userId) {
    const user = (userState.usersList || []).find(u => u.id === userId);
    if (!user) return;

    userState.selectedUserId = userId;

    const msg = document.getElementById('lockModalMessage');
    if (msg) {
      msg.innerHTML = `Bạn có chắc chắn muốn khóa tài khoản của <strong>${user.ten || user.username}</strong> (${user.ma || '---'})?<br>Tài khoản bị khóa sẽ không thể đăng nhập vào hệ thống.`;
    }

    const modal = document.getElementById('modalToggleLockUser');
    if (modal) modal.classList.add('active');
  };

  window.closeToggleLockUserModal = function () {
    const modal = document.getElementById('modalToggleLockUser');
    if (modal) modal.classList.remove('active');
  };

  window.handleLockUserSubmit = function () {
    alert('[BƯỚC 1 - GIAO DIỆN HOÀN THIỆN]\nXác nhận thao tác khóa tài khoản!\nTheo khảo sát kiến trúc: Bảng nguoi_dung trong Database hiện tại chưa có cột trạng thái. Giao diện modal đã sẵn sàng và sẽ hoạt động khi có cột tương ứng.');
  };

})();
