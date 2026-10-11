/**
 * LAPTOP STORE - CUSTOMER WARRANTY SCRIPTS (warranty-customer.js)
 * Xử lý logic và tương tác giao diện cho tất cả các trang bảo hành phía Khách hàng:
 * 1. warranty-my.html (Bảo hành của tôi)
 * 2. warranty-detail.html (Chi tiết bảo hành)
 * 3. warranty-request-create.html (Gửi yêu cầu bảo hành)
 * 4. warranty-requests-my.html (Yêu cầu bảo hành của tôi)
 * 5. warranty-request-detail.html (Chi tiết yêu cầu bảo hành)
 *
 * TUÂN THỦ BƯỚC 2:
 * - Đọc dữ liệu thật từ SQL Server qua Spring Boot REST API
 * - Tuyệt đối không lưu/ghi dữ liệu ở bước này
 * - Nếu Database trống, hiển thị danh sách rỗng, không dùng mock data giả lập
 * - Kiểm tra phân quyền sở hữu máy của khách hàng
 */

(function () {
  'use strict';

  const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080/api';

// Lấy thông tin người dùng đang đăng nhập (nếu có)
function getCurrentCustomer() {
  const userStr = localStorage.getItem('laptop_store_user') || sessionStorage.getItem('laptop_store_user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

// Lấy Header gửi kèm ID tài khoản xác thực
function getCustomerAuthHeaders() {
  const user = getCurrentCustomer();
  const headers = {
    'Content-Type': 'application/json'
  };
  if (user && user.id) {
    headers['X-User-Id'] = user.id.toString();
  }
  return headers;
}

// ============================================================================
// 1. TRANG "BẢO HÀNH CỦA TÔI" (warranty-my.html)
// ============================================================================
window.initWarrantyMyPage = async function() {
  let warrantiesList = [];
  let currentFilter = 'ALL';
  let currentSearch = '';

  const searchInput = document.getElementById('searchWarrantyInput');
  const countBadge = document.getElementById('warrantyTotalCountBadge');
  const gridContainer = document.getElementById('warrantyCardsGrid');
  const emptyState = document.getElementById('warrantyEmptyState');

  const user = getCurrentCustomer();
  if (!user || !user.id) {
    if (countBadge) countBadge.textContent = '0 máy';
    if (gridContainer) gridContainer.style.display = 'none';
    if (emptyState) {
      emptyState.style.display = 'block';
      const descEl = emptyState.querySelector('.empty-desc');
      if (descEl) descEl.textContent = 'Vui lòng đăng nhập tài khoản để xem các thiết bị và phiếu bảo hành chính hãng của bạn.';
      const actionBtn = emptyState.querySelector('.btn-empty-action');
      if (actionBtn) {
        actionBtn.textContent = 'Đăng Nhập Ngay';
        actionBtn.href = 'login.html?redirect=warranty-my.html';
      }
    }
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/bao-hanh/my`, {
      method: 'GET',
      headers: getCustomerAuthHeaders(),
      credentials: 'include'
    });

    if (res.ok) {
      warrantiesList = await res.json();
    } else {
      warrantiesList = [];
    }
  } catch (err) {
    console.warn('Lỗi tải danh sách bảo hành của tôi:', err);
    warrantiesList = [];
  }

  function renderList() {
    let filtered = warrantiesList.filter(item => {
      const matchSearch = !currentSearch ||
        (item.tenLaptop && item.tenLaptop.toLowerCase().includes(currentSearch)) ||
        (item.soImei && item.soImei.toLowerCase().includes(currentSearch)) ||
        (item.maPhieu && item.maPhieu.toLowerCase().includes(currentSearch));

      if (!matchSearch) return false;

      const statusKey = item.statusKey || getWarrantyStatusKey(item);
      if (currentFilter === 'ALL') return true;
      return statusKey === currentFilter;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} máy`;
    }

    if (!gridContainer) return;

    if (filtered.length === 0) {
      gridContainer.style.display = 'none';
      if (emptyState) {
        emptyState.style.display = 'block';
        const descEl = emptyState.querySelector('.empty-desc');
        if (descEl) descEl.textContent = 'Bạn chưa có laptop nào phù hợp với bộ lọc hiện tại hoặc chưa mua sản phẩm có phiếu bảo hành tại hệ thống.';
        const actionBtn = emptyState.querySelector('.btn-empty-action');
        if (actionBtn) {
          actionBtn.textContent = 'Khám Phá Laptop Mới';
          actionBtn.href = 'index.html';
        }
      }
      return;
    }

    gridContainer.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    gridContainer.innerHTML = filtered.map(item => {
      const statusBadge = getWarrantyStatusBadge(item);
      const isExpired = (item.statusKey || getWarrantyStatusKey(item)) === 'EXPIRED';
      const isRevoked = (item.statusKey || getWarrantyStatusKey(item)) === 'REVOKED';

      return `
        <div class="warranty-card ${isExpired ? 'warranty-card-expired' : ''} ${isRevoked ? 'warranty-card-revoked' : ''}">
          <div class="warranty-card-top">
            <div class="warranty-card-img-wrap">
              <img src="${item.hinhAnh || '../images/default-laptop.png'}" alt="${escapeHtml(item.tenLaptop)}" class="warranty-card-img" onerror="this.onerror=null; this.src='../images/default-laptop.png';">
            </div>
            <div class="warranty-card-info">
              <div class="warranty-card-header-line">
                <span class="warranty-slip-pill">${escapeHtml(item.maPhieu)}</span>
                ${statusBadge}
              </div>
              <h3 class="warranty-card-title">${escapeHtml(item.tenLaptop || 'Laptop')}</h3>
              <div class="warranty-card-specs">${escapeHtml(item.cauHinh || '')}</div>
              <div class="warranty-card-imei-row">
                <span class="imei-label">Số IMEI/Serial:</span>
                <span class="imei-code">${escapeHtml(item.soImei)}</span>
              </div>
            </div>
          </div>

          <div class="warranty-card-meta-bar">
            <div class="meta-item">
              <span class="meta-label">Mã Hóa Đơn</span>
              <span class="meta-val">${escapeHtml(item.maHoaDon || '---')}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Ngày Kích Hoạt</span>
              <span class="meta-val">${formatWarrantyDate(item.ngayKichHoat)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Ngày Hết Hạn</span>
              <span class="meta-val" style="font-weight:700; color:${isExpired ? '#dc2626' : '#1e293b'};">
                ${formatWarrantyDate(item.ngayHetHan)}
              </span>
            </div>
          </div>

          <div class="warranty-card-actions">
            <a href="warranty-detail.html?id=${item.id}" class="btn-warranty-detail">
              <span>Xem chi tiết bảo hành</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  // Lắng nghe tìm kiếm
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      renderList();
    });
  }

  // Lắng nghe click bộ lọc tab
  document.querySelectorAll('.warranty-filter-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.warranty-filter-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.getAttribute('data-status') || 'ALL';
      renderList();
    });
  });

  renderList();
};

// ============================================================================
// 2. TRANG "CHI TIẾT BẢO HÀNH" (warranty-detail.html)
// ============================================================================
window.initWarrantyDetailPage = async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const warrantyId = Number(urlParams.get('id'));

  if (!warrantyId) {
    showWarrantyCustomerError('Không tìm thấy mã phiếu bảo hành hợp lệ.');
    return;
  }

  const user = getCurrentCustomer();
  if (!user || !user.id) {
    showWarrantyCustomerError('Vui lòng đăng nhập tài khoản để xem chi tiết phiếu bảo hành của bạn.');
    return;
  }

  let warranty = null;
  let requestsOfImei = [];

  try {
    const res = await fetch(`${API_BASE_URL}/bao-hanh/my/${warrantyId}`, {
      method: 'GET',
      headers: getCustomerAuthHeaders(),
      credentials: 'include'
    });

    if (res.status === 403) {
      showWarrantyCustomerError('Bạn không có quyền xem thông tin phiếu bảo hành này (không thuộc quyền sở hữu của tài khoản).');
      return;
    }
    if (res.status === 404 || !res.ok) {
      showWarrantyCustomerError('Phiếu bảo hành không tồn tại trong hệ thống.');
      return;
    }

    warranty = await res.json();
  } catch (err) {
    console.warn('Lỗi tải chi tiết bảo hành:', err);
    showWarrantyCustomerError('Lỗi kết nối máy chủ khi tải thông tin bảo hành.');
    return;
  }

  // Lấy các yêu cầu bảo hành thật từ SQL Server theo số IMEI của máy
  try {
    if (warranty && warranty.soImei) {
      const reqRes = await fetch(`${API_BASE_URL}/yeu-cau-bao-hanh/imei/${encodeURIComponent(warranty.soImei)}`, {
        method: 'GET',
        headers: getCustomerAuthHeaders(),
        credentials: 'include'
      });
      if (reqRes.ok) {
        requestsOfImei = await reqRes.json();
      }
    }
  } catch (err) {
    console.warn('Lỗi tải yêu cầu theo IMEI:', err);
    requestsOfImei = [];
  }

  // Sắp xếp các yêu cầu bảo hành mới nhất lên trước
  requestsOfImei.sort((a, b) => new Date(b.ngayGui) - new Date(a.ngayGui));

  // Kiểm tra xem có yêu cầu nào đang mở (0: Chờ tiếp nhận, 1: Đã tiếp nhận, 2: Đang xử lý)
  const openRequest = requestsOfImei.find(r => [0, 1, 2].includes(Number(r.trangThai)));

  const statusKey = warranty.statusKey || getWarrantyStatusKey(warranty);
  const isAvailableForNewRequest = (statusKey === 'ACTIVE') && !openRequest;

  // Render thông tin Laptop
  const elLaptopName = document.getElementById('detailLaptopName');
  const elLaptopImg = document.getElementById('detailLaptopImg');
  const elLaptopSpecs = document.getElementById('detailLaptopSpecs');
  const elImei = document.getElementById('detailImei');
  const elMaHoaDon = document.getElementById('detailMaHoaDon');
  const elMaPhieu = document.getElementById('detailMaPhieu');

  if (elLaptopName) elLaptopName.textContent = warranty.tenLaptop || 'Laptop';
  if (elLaptopImg) {
    elLaptopImg.src = warranty.hinhAnh || '../images/default-laptop.png';
    elLaptopImg.alt = warranty.tenLaptop || 'Laptop';
  }
  if (elLaptopSpecs) elLaptopSpecs.textContent = warranty.cauHinh || 'Cấu hình tiêu chuẩn';
  if (elImei) elImei.textContent = warranty.soImei || '---';
  if (elMaHoaDon) elMaHoaDon.textContent = warranty.maHoaDon || '---';
  if (elMaPhieu) elMaPhieu.textContent = warranty.maPhieu || '---';

  // Render thông tin Bảo hành
  const elNgayKichHoat = document.getElementById('detailNgayKichHoat');
  const elNgayHetHan = document.getElementById('detailNgayHetHan');
  const elThoiHan = document.getElementById('detailThoiHan');
  const elStatusBadge = document.getElementById('detailStatusBadge');

  if (elNgayKichHoat) elNgayKichHoat.textContent = formatWarrantyDate(warranty.ngayKichHoat);
  if (elNgayHetHan) elNgayHetHan.textContent = formatWarrantyDate(warranty.ngayHetHan);
  if (elThoiHan) elThoiHan.textContent = `${warranty.thoiHanThang || 12} tháng (Tiêu chuẩn chính hãng)`;
  if (elStatusBadge) elStatusBadge.innerHTML = getWarrantyStatusBadge(warranty);

  // Render Action Banner (Nút gửi yêu cầu bảo hành hoặc cảnh báo)
  const actionBanner = document.getElementById('warrantyActionBanner');
  if (actionBanner) {
    if (isAvailableForNewRequest) {
      actionBanner.innerHTML = `
        <div class="action-banner-box action-banner-valid">
          <div class="banner-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
          </div>
          <div class="banner-content">
            <h4>Bảo hành của thiết bị đang có hiệu lực</h4>
            <p>Nếu laptop gặp sự cố phần cứng hoặc lỗi kỹ thuật trong quá trình sử dụng, bạn có thể gửi yêu cầu bảo hành trực tuyến để cửa hàng tiếp nhận hỗ trợ.</p>
          </div>
          <div class="banner-btn-wrap">
            <a href="warranty-request-create.html?warrantyId=${warranty.id}" class="btn-create-request">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Gửi Yêu Cầu Bảo Hành</span>
            </a>
          </div>
        </div>
      `;
    } else if (openRequest) {
      actionBanner.innerHTML = `
        <div class="action-banner-box action-banner-pending">
          <div class="banner-icon" style="background:#eff6ff; color:#2563eb;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="banner-content">
            <h4>Đang có yêu cầu bảo hành đang được xử lý</h4>
            <p>Laptop này hiện đang có yêu cầu <strong>#${escapeHtml(openRequest.maYeuCau)}</strong> ở trạng thái <em>${escapeHtml(getRequestStatusText(openRequest.trangThai))}</em>. Bạn không thể gửi yêu cầu mới cho đến khi yêu cầu hiện tại hoàn tất.</p>
          </div>
          <div class="banner-btn-wrap">
            <a href="warranty-request-detail.html?id=${openRequest.id}" class="btn-view-pending-request">
              <span>Xem tiến trình yêu cầu này</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          </div>
        </div>
      `;
    } else {
      // Hết hạn hoặc ngừng hiệu lực
      const reasonText = statusKey === 'REVOKED'
        ? 'Phiếu bảo hành của laptop này đã ngừng hiệu lực do vi phạm chính sách bảo hành hoặc bị hủy bỏ.'
        : 'Thời hạn bảo hành của laptop này đã kết thúc.';
      actionBanner.innerHTML = `
        <div class="action-banner-box action-banner-disabled">
          <div class="banner-icon" style="background:#fee2e2; color:#dc2626;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
          </div>
          <div class="banner-content">
            <h4 style="color:#b91c1c;">Không thể gửi yêu cầu bảo hành</h4>
            <p>${reasonText} Nút gửi yêu cầu bảo hành đã bị vô hiệu hóa.</p>
          </div>
          <div class="banner-btn-wrap">
            <button type="button" class="btn-create-request disabled" disabled title="Bảo hành không còn hiệu lực">
              <span>Gửi Yêu Cầu Bảo Hành</span>
            </button>
          </div>
        </div>
      `;
    }
  }

  // Render Bảng Lịch Sử Yêu Cầu Bảo Hành của máy
  const historyTbody = document.getElementById('warrantyHistoryTbody');
  const historyCountBadge = document.getElementById('historyCountBadge');
  const historyEmptyBox = document.getElementById('historyEmptyBox');

  if (historyCountBadge) {
    historyCountBadge.textContent = `${requestsOfImei.length} lần yêu cầu`;
  }

  if (historyTbody) {
    if (requestsOfImei.length === 0) {
      historyTbody.innerHTML = '';
      if (historyEmptyBox) historyEmptyBox.style.display = 'block';
    } else {
      if (historyEmptyBox) historyEmptyBox.style.display = 'none';
      historyTbody.innerHTML = requestsOfImei.map(req => {
        return `
          <tr>
            <td style="font-weight:700; color:#1e293b; font-family:monospace;">
              ${escapeHtml(req.maYeuCau)}
            </td>
            <td style="white-space:nowrap;">${formatWarrantyDate(req.ngayGui, true)}</td>
            <td style="max-width:260px; line-height:1.4; color:#475569;">
              ${escapeHtml(req.moTaLoi)}
            </td>
            <td style="text-align:center; white-space:nowrap;">
              ${getRequestStatusBadge(req.trangThai)}
            </td>
            <td style="white-space:nowrap;">${req.ngayHoanThanh ? formatWarrantyDate(req.ngayHoanThanh) : '<span style="color:#94a3b8;">---</span>'}</td>
            <td style="text-align:center; white-space:nowrap;">
              <a href="warranty-request-detail.html?id=${req.id}" class="btn-table-action">
                <span>Xem chi tiết</span>
              </a>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
};

// ============================================================================
// 3. TRANG "GỬI YÊU CẦU BẢO HÀNH" (warranty-request-create.html)
// ============================================================================
window.initWarrantyRequestCreatePage = async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const warrantyId = Number(urlParams.get('warrantyId') || urlParams.get('id') || urlParams.get('baoHanhId'));

  if (!warrantyId) {
    showWarrantyCustomerError('Không tìm thấy mã phiếu bảo hành cần gửi yêu cầu.');
    return;
  }

  const user = getCurrentCustomer();
  if (!user || !user.id) {
    showWarrantyCustomerError('Vui lòng đăng nhập tài khoản để thực hiện chức năng này.');
    return;
  }

  let formInfo = null;
  try {
    const res = await fetch(`${API_BASE_URL}/yeu-cau-bao-hanh/form-info/${warrantyId}`, {
      method: 'GET',
      headers: getCustomerAuthHeaders(),
      credentials: 'include'
    });

    if (res.status === 403) {
      showWarrantyCustomerError('Bạn không có quyền gửi yêu cầu cho phiếu bảo hành này (không thuộc quyền sở hữu của bạn).');
      return;
    }
    if (res.status === 404 || !res.ok) {
      showWarrantyCustomerError('Không tìm thấy thông tin phiếu bảo hành trong hệ thống.');
      return;
    }

    formInfo = await res.json();
  } catch (err) {
    console.warn('Lỗi tải thông tin phiếu bảo hành cho form:', err);
    showWarrantyCustomerError('Lỗi kết nối máy chủ khi chuẩn bị dữ liệu.');
    return;
  }

  const warranty = formInfo.baoHanh || formInfo;
  if (!warranty || (!warranty.id && !warranty.idBaoHanh)) {
    showWarrantyCustomerError('Dữ liệu bảo hành không hợp lệ.');
    return;
  }

  // Phần A: Render Thông tin Laptop & Bảo hành (Chỉ đọc)
  const elLaptopName = document.getElementById('reqLaptopName');
  const elLaptopImg = document.getElementById('reqLaptopImg');
  const elImei = document.getElementById('reqImei');
  const elMaPhieu = document.getElementById('reqMaPhieu');
  const elNgayKichHoat = document.getElementById('reqNgayKichHoat');
  const elNgayHetHan = document.getElementById('reqNgayHetHan');
  const elStatusBadge = document.getElementById('reqStatusBadge');

  if (elLaptopName) elLaptopName.textContent = warranty.tenLaptop || formInfo.tenLaptop || 'Laptop';
  if (elLaptopImg) elLaptopImg.src = warranty.hinhAnh || formInfo.hinhAnh || '../images/default-laptop.png';
  if (elImei) elImei.textContent = warranty.soImei || formInfo.soImei || '---';
  if (elMaPhieu) elMaPhieu.textContent = warranty.maPhieu || formInfo.maPhieuBaoHanh || '---';
  if (elNgayKichHoat) elNgayKichHoat.textContent = formatWarrantyDate(warranty.ngayKichHoat || formInfo.ngayKichHoatBaoHanh);
  if (elNgayHetHan) elNgayHetHan.textContent = formatWarrantyDate(warranty.ngayHetHan || formInfo.ngayHetHanBaoHanh);
  if (elStatusBadge) elStatusBadge.innerHTML = getWarrantyStatusBadge(warranty);

  // Link nút quay lại
  const currentWId = warranty.id || warranty.idBaoHanh || warrantyId;
  const btnBack = document.getElementById('btnBackToDetail');
  if (btnBack) btnBack.href = `warranty-detail.html?id=${currentWId}`;

  // Phần B: Tự động điền SĐT từ khách hàng (nếu có)
  const phoneInput = document.getElementById('reqPhoneInput');
  if (phoneInput) {
    if (formInfo.dienThoaiLienHe) {
      phoneInput.value = formInfo.dienThoaiLienHe;
    } else if (formInfo.dienThoai) {
      phoneInput.value = formInfo.dienThoai;
    } else if (user.soDienThoai || user.dienThoai) {
      phoneInput.value = user.soDienThoai || user.dienThoai;
    }
  }

  // Cảnh báo nếu phiếu không được phép tạo yêu cầu mới (đang có yêu cầu chờ xử lý hoặc hết hạn)
  const alertBox = document.getElementById('formValidationAlert');
  const submitBtn = document.querySelector('#warrantyRequestForm button[type="submit"]');

  if (formInfo.canCreateRequest === false) {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('disabled');
      submitBtn.title = formInfo.message || 'Không thể gửi yêu cầu';
    }
    if (alertBox) {
      alertBox.className = 'form-alert show warning';
      alertBox.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span>${escapeHtml(formInfo.message || 'Thiết bị hiện chưa thể gửi yêu cầu bảo hành mới.')}</span>
      `;
    }
  }

  // Đếm ký tự mô tả lỗi
  const faultInput = document.getElementById('reqFaultInput');
  const faultCount = document.getElementById('reqFaultCount');
  if (faultInput && faultCount) {
    faultInput.addEventListener('input', () => {
      const len = faultInput.value.length;
      faultCount.textContent = `${len}/1000 ký tự`;
      if (len < 10) {
        faultCount.style.color = '#ef4444';
      } else {
        faultCount.style.color = '#64748b';
      }
    });
  }

  // Đếm ký tự ghi chú bổ sung
  const noteInput = document.getElementById('reqNoteInput');
  const noteCount = document.getElementById('reqNoteCount');
  if (noteInput && noteCount) {
    noteInput.addEventListener('input', () => {
      noteCount.textContent = `${noteInput.value.length}/500 ký tự`;
    });
  }

  // Xử lý gửi Form (BƯỚC 4: KẾT NỐI API POST THẬT LƯU VÀO DATABASE)
  const form = document.getElementById('warrantyRequestForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      clearFormErrors();

      if (formInfo.canCreateRequest === false) {
        if (alertBox) {
          alertBox.className = 'form-alert show error';
          alertBox.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>${escapeHtml(formInfo.message || 'Thiết bị không thể gửi yêu cầu lúc này.')}</span>
          `;
        }
        return;
      }

      let isValid = true;
      const faultDesc = faultInput?.value.trim() || '';
      const phone = phoneInput?.value.trim() || '';
      const notes = noteInput?.value.trim() || '';

      // 1. Kiểm tra mô tả lỗi (Tối thiểu 10, tối đa 1000 ký tự)
      if (faultDesc.length < 10) {
        showFieldError('reqFaultInput', 'Mô tả lỗi phải có tối thiểu 10 ký tự để kỹ thuật viên hiểu rõ tình trạng.');
        isValid = false;
      } else if (faultDesc.length > 1000) {
        showFieldError('reqFaultInput', 'Mô tả lỗi không được vượt quá 1000 ký tự.');
        isValid = false;
      }

      // 2. Kiểm tra số điện thoại (Định dạng VN: 10 chữ số, bắt đầu bằng 0)
      const phoneRegex = /^0[0-9]{9}$/;
      if (!phone) {
        showFieldError('reqPhoneInput', 'Vui lòng nhập số điện thoại liên hệ.');
        isValid = false;
      } else if (!phoneRegex.test(phone)) {
        showFieldError('reqPhoneInput', 'Số điện thoại không hợp lệ (Phải đúng 10 chữ số và bắt đầu bằng số 0, ví dụ 0987654321).');
        isValid = false;
      }

      // 3. Kiểm tra ghi chú bổ sung
      if (notes.length > 500) {
        showFieldError('reqNoteInput', 'Ghi chú bổ sung không được vượt quá 500 ký tự.');
        isValid = false;
      }

      if (!isValid) {
        if (alertBox) {
          alertBox.className = 'form-alert show error';
          alertBox.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>Thông tin chưa hợp lệ. Vui lòng kiểm tra lại các trường báo đỏ bên dưới.</span>
          `;
        }
        return;
      }

      // GỬI YÊU CẦU BẢO HÀNH LÊN BACKEND THẬT (BƯỚC 4)
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
          <span>Đang gửi yêu cầu...</span>
        `;
      }

      try {
        const postPayload = {
          idBaoHanh: warrantyId,
          moTaLoi: faultDesc,
          dienThoaiLienHe: phone,
          ghiChuKhachHang: notes
        };

        const postRes = await fetch(`${API_BASE_URL}/yeu-cau-bao-hanh`, {
          method: 'POST',
          headers: getCustomerAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(postPayload)
        });

        const postData = await postRes.json();
        if (!postRes.ok) {
          throw new Error(postData.message || 'Gửi yêu cầu bảo hành thất bại.');
        }

        // Thành công: Hiển thị thông báo tinh tế và chuyển tới trang chi tiết
        showWarrantySuccessModal(postData);
      } catch (err) {
        console.error('Lỗi gửi yêu cầu bảo hành:', err);
        if (alertBox) {
          alertBox.className = 'form-alert show error';
          alertBox.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>${escapeHtml(err.message || 'Không thể gửi yêu cầu bảo hành. Vui lòng thử lại.')}</span>
          `;
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            <span>Gửi Yêu Cầu Bảo Hành</span>
          `;
        }
      }
    });
  }
};

function showFieldError(fieldId, errorMsg) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.add('is-invalid');
    const errEl = document.getElementById(`${fieldId}Error`);
    if (errEl) {
      errEl.textContent = errorMsg;
      errEl.style.display = 'block';
    }
  }
}

function clearFormErrors() {
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  document.querySelectorAll('.field-error-text').forEach(el => el.style.display = 'none');
}

/**
 * Hiển thị popup thông báo thành công tinh tế sau khi gửi yêu cầu bảo hành
 */
function showWarrantySuccessModal(postData) {
  const oldModal = document.getElementById('warrantySuccessModal');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'warrantySuccessModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    padding: 20px;
    box-sizing: border-box;
  `;

  const card = document.createElement('div');
  card.style.cssText = `
    background: #ffffff;
    border-radius: 20px;
    max-width: 460px;
    width: 100%;
    padding: 36px 28px 28px;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.9);
    transform: scale(0.92) translateY(12px);
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  `;

  const targetUrl = `warranty-request-detail.html?id=${postData.id}`;

  card.innerHTML = `
    <!-- Icon checkmark xanh tinh tế -->
    <div style="display:inline-flex; align-items:center; justify-content:center; width:68px; height:68px; border-radius:50%; background:#ecfdf5; border:3px solid #a7f3d0; color:#10b981; margin-bottom:16px; box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.25);">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    </div>

    <!-- Tiêu đề trang trọng -->
    <h3 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0 0 10px; letter-spacing: -0.3px;">
      Gửi Yêu Cầu Thành Công
    </h3>

    <!-- Nội dung thông báo theo yêu cầu -->
    <p style="font-size: 0.95rem; color: #475569; line-height: 1.55; margin: 0 0 16px; font-weight: 500;">
      Yêu cầu của bạn đã được gửi, nhân viên sẽ liên lạc lại trong thời gian sớm nhất
    </p>

    <!-- Badge mã yêu cầu -->
    <div style="display:inline-flex; align-items:center; gap:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:30px; padding:6px 16px; margin-bottom:24px; font-size:0.86rem; color:#475569;">
      <span>Mã yêu cầu:</span>
      <strong style="font-family:monospace; color:#2563eb; font-size:0.96rem; letter-spacing:0.5px;">${escapeHtml(postData.maYeuCau || 'YCBH')}</strong>
    </div>

    <!-- Các nút hành động (không tự động chuyển trang) -->
    <div style="display:flex; flex-direction:column; gap:10px;">
      <button id="btnGoToDetailNow" type="button" style="
        width: 100%;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: #ffffff;
        border: none;
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.28);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      ">
        <span>Xem chi tiết yêu cầu</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>

      <button id="btnCloseSuccessModalBtn" type="button" style="
        width: 100%;
        background: #f8fafc;
        color: #475569;
        border: 1px solid #cbd5e1;
        padding: 11px 24px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
      ">
        Đóng
      </button>
    </div>
  `;

  modal.appendChild(card);
  document.body.appendChild(modal);

  requestAnimationFrame(() => {
    modal.style.opacity = '1';
    card.style.transform = 'scale(1) translateY(0)';
  });

  const btnGo = card.querySelector('#btnGoToDetailNow');
  btnGo.addEventListener('mouseenter', () => {
    btnGo.style.transform = 'translateY(-1px)';
    btnGo.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.38)';
  });
  btnGo.addEventListener('mouseleave', () => {
    btnGo.style.transform = 'translateY(0)';
    btnGo.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.28)';
  });

  btnGo.addEventListener('click', () => {
    window.location.href = targetUrl;
  });

  const closeModal = () => {
    modal.style.opacity = '0';
    card.style.transform = 'scale(0.92) translateY(12px)';
    setTimeout(() => modal.remove(), 300);
  };

  const btnClose = card.querySelector('#btnCloseSuccessModalBtn');
  if (btnClose) btnClose.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// ============================================================================
// 4. TRANG "YÊU CẦU BẢO HÀNH CỦA TÔI" (warranty-requests-my.html)
// ============================================================================
window.initWarrantyRequestsMyPage = async function() {
  let requestsList = [];
  let currentFilter = 'ALL';
  let currentSearch = '';

  const searchInput = document.getElementById('searchRequestInput');
  const countBadge = document.getElementById('requestTotalCountBadge');
  const tbody = document.getElementById('requestsTableBody');
  const emptyBox = document.getElementById('requestsEmptyState');

  const user = getCurrentCustomer();
  if (!user || !user.id) {
    if (countBadge) countBadge.textContent = '0 yêu cầu';
    if (tbody) tbody.innerHTML = '';
    if (emptyBox) {
      emptyBox.style.display = 'block';
      const descEl = emptyBox.querySelector('.empty-desc');
      if (descEl) descEl.textContent = 'Vui lòng đăng nhập tài khoản để xem các yêu cầu bảo hành đã gửi của bạn.';
      const actionBtn = emptyBox.querySelector('.btn-empty-action');
      if (actionBtn) {
        actionBtn.textContent = 'Đăng Nhập Ngay';
        actionBtn.href = 'login.html?redirect=warranty-requests-my.html';
      }
    }
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/yeu-cau-bao-hanh/my`, {
      method: 'GET',
      headers: getCustomerAuthHeaders(),
      credentials: 'include'
    });

    if (res.ok) {
      requestsList = await res.json();
    } else {
      requestsList = [];
    }
  } catch (err) {
    console.warn('Lỗi tải danh sách yêu cầu bảo hành của tôi:', err);
    requestsList = [];
  }

  function renderList() {
    let filtered = requestsList
      .filter(item => {
        const matchSearch = !currentSearch ||
          (item.maYeuCau && item.maYeuCau.toLowerCase().includes(currentSearch)) ||
          (item.tenLaptop && item.tenLaptop.toLowerCase().includes(currentSearch)) ||
          (item.soImei && item.soImei.toLowerCase().includes(currentSearch));

        if (!matchSearch) return false;
        if (currentFilter === 'ALL') return true;
        return Number(item.trangThai) === Number(currentFilter);
      })
      .sort((a, b) => new Date(b.ngayGui) - new Date(a.ngayGui));

    if (countBadge) {
      countBadge.textContent = `${filtered.length} yêu cầu`;
    }

    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyBox) {
        emptyBox.style.display = 'block';
        const descEl = emptyBox.querySelector('.empty-desc');
        if (descEl) descEl.textContent = 'Bạn chưa gửi yêu cầu bảo hành nào hoặc không tìm thấy kết quả phù hợp với bộ lọc.';
        const actionBtn = emptyBox.querySelector('.btn-empty-action');
        if (actionBtn) {
          actionBtn.textContent = 'Xem Danh Sách Thiết Bị Của Tôi';
          actionBtn.href = 'warranty-my.html';
        }
      }
      return;
    }

    if (emptyBox) emptyBox.style.display = 'none';

    tbody.innerHTML = filtered.map(req => {
      return `
        <tr>
          <td style="font-family:monospace; font-weight:800; color:#1e293b; font-size:13.5px;">
            ${escapeHtml(req.maYeuCau)}
          </td>
          <td>
            <div style="font-weight:700; color:#0f172a; font-size:13.5px;">${escapeHtml(req.tenLaptop || 'Laptop')}</div>
            <div style="font-family:monospace; font-size:11.5px; color:#64748b; margin-top:2px;">IMEI: ${escapeHtml(req.soImei)}</div>
          </td>
          <td style="white-space:nowrap;">
            <div style="font-size:12.5px; color:#334155;">${formatWarrantyDate(req.ngayGui, true)}</div>
          </td>
          <td style="max-width:280px; font-size:12.5px; color:#475569; line-height:1.4;">
            ${escapeHtml(truncateText(req.moTaLoi, 80))}
          </td>
          <td style="text-align:center; white-space:nowrap;">
            ${getRequestStatusBadge(req.trangThai)}
          </td>
          <td style="text-align:center; white-space:nowrap;">
            <a href="warranty-request-detail.html?id=${req.id}" class="btn-table-action">
              <span>Xem chi tiết</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      renderList();
    });
  }

  document.querySelectorAll('.request-filter-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.request-filter-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.getAttribute('data-status') || 'ALL';
      renderList();
    });
  });

  renderList();
};

// ============================================================================
// 5. TRANG "CHI TIẾT YÊU CẦU BẢO HÀNH" (warranty-request-detail.html)
// ============================================================================
window.initWarrantyRequestDetailPage = async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const reqId = Number(urlParams.get('id'));

  if (!reqId) {
    showWarrantyCustomerError('Không tìm thấy mã yêu cầu bảo hành hợp lệ.');
    return;
  }

  const user = getCurrentCustomer();
  if (!user || !user.id) {
    showWarrantyCustomerError('Vui lòng đăng nhập tài khoản để xem chi tiết yêu cầu bảo hành.');
    return;
  }

  let req = null;
  try {
    const res = await fetch(`${API_BASE_URL}/yeu-cau-bao-hanh/my/${reqId}`, {
      method: 'GET',
      headers: getCustomerAuthHeaders(),
      credentials: 'include'
    });

    if (res.status === 403) {
      showWarrantyCustomerError('Bạn không có quyền xem yêu cầu bảo hành này (không thuộc quyền sở hữu của bạn).');
      return;
    }
    if (res.status === 404 || !res.ok) {
      showWarrantyCustomerError('Không tìm thấy yêu cầu bảo hành trong hệ thống.');
      return;
    }

    req = await res.json();
  } catch (err) {
    console.warn('Lỗi tải chi tiết yêu cầu bảo hành:', err);
    showWarrantyCustomerError('Lỗi kết nối máy chủ khi tải thông tin yêu cầu.');
    return;
  }

  // Header info
  const elMaYeuCau = document.getElementById('detailMaYeuCau');
  const elStatusBadge = document.getElementById('detailRequestStatusBadge');
  const elNgayGuiHeader = document.getElementById('detailNgayGuiHeader');

  if (elMaYeuCau) elMaYeuCau.textContent = req.maYeuCau;
  if (elStatusBadge) elStatusBadge.innerHTML = getRequestStatusBadge(req.trangThai);
  if (elNgayGuiHeader) elNgayGuiHeader.textContent = formatWarrantyDate(req.ngayGui, true);

  // Render Visual Progress Timeline
  renderRequestTimeline(req);

  // Nhóm 1: Thông tin yêu cầu
  const elMoTaLoi = document.getElementById('detailMoTaLoi');
  const elPhone = document.getElementById('detailPhone');
  const elNote = document.getElementById('detailNote');

  if (elMoTaLoi) elMoTaLoi.textContent = req.moTaLoi;
  if (elPhone) elPhone.textContent = req.dienThoaiLienHe || '---';
  if (elNote) elNote.textContent = req.ghiChuKhachHang || 'Không có ghi chú thêm';

  // Nhóm 2: Thông tin Laptop & Phiếu
  const elTenLaptop = document.getElementById('detailTenLaptop');
  const elImei = document.getElementById('detailImei');
  const elMaPhieu = document.getElementById('detailMaPhieu');
  const elCauHinh = document.getElementById('detailCauHinh');

  if (elTenLaptop) elTenLaptop.textContent = req.tenLaptop || 'Laptop';
  if (elImei) elImei.textContent = req.soImei || '---';
  if (elMaPhieu) elMaPhieu.textContent = req.maPhieuBaoHanh || '---';
  if (elCauHinh) elCauHinh.textContent = req.cauHinh || 'Cấu hình tiêu chuẩn';

  // Nhóm 3: Thông tin Xử lý từ Cửa Hàng
  const elStaff = document.getElementById('detailStaff');
  const elNgayTiepNhan = document.getElementById('detailNgayTiepNhan');
  const elNgayHoanThanh = document.getElementById('detailNgayHoanThanh');
  const elResultBox = document.getElementById('detailResultBox');
  const elResultText = document.getElementById('detailResultText');
  const elRejectBox = document.getElementById('detailRejectBox');
  const elRejectReason = document.getElementById('detailRejectReason');

  // Nếu id_nhan_vien = NULL, hiển thị "Chưa tiếp nhận"
  if (elStaff) elStaff.textContent = req.tenNhanVien || 'Chưa tiếp nhận';
  if (elNgayTiepNhan) elNgayTiepNhan.textContent = req.ngayTiepNhan ? formatWarrantyDate(req.ngayTiepNhan, true) : '---';
  if (elNgayHoanThanh) elNgayHoanThanh.textContent = req.ngayHoanThanh ? formatWarrantyDate(req.ngayHoanThanh, true) : '---';

  // Hiển thị kết quả xử lý nếu hoàn thành (trangThai = 3)
  if (Number(req.trangThai) === 3 && req.ghiChuXuLy) {
    if (elResultBox) elResultBox.style.display = 'block';
    if (elResultText) elResultText.textContent = req.ghiChuXuLy;
  } else if (elResultBox) {
    elResultBox.style.display = 'none';
  }

  // Hiển thị lý do từ chối nếu bị từ chối (trangThai = 4)
  if (Number(req.trangThai) === 4 && req.lyDoTuChoi) {
    if (elRejectBox) elRejectBox.style.display = 'block';
    if (elRejectReason) elRejectReason.textContent = req.lyDoTuChoi;
  } else if (elRejectBox) {
    elRejectBox.style.display = 'none';
  }
};

/**
 * Hiển thị lỗi phân quyền hoặc không tìm thấy trang chi tiết khách hàng
 */
function showWarrantyCustomerError(msg) {
  const container = document.querySelector('.warranty-page-wrapper .container');
  if (container) {
    container.innerHTML = `
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:48px 24px; text-align:center; margin-top:30px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <div style="width:56px; height:56px; border-radius:50%; background:#fee2e2; color:#dc2626; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h3 style="font-size:1.25rem; font-weight:700; color:#1e293b; margin-bottom:8px;">${escapeHtml(msg)}</h3>
        <p style="color:#64748b; font-size:0.95rem; margin-bottom:24px;">Vui lòng kiểm tra lại đường dẫn hoặc quay về danh sách quản lý của bạn.</p>
        <div style="display:flex; justify-content:center; gap:12px;">
          <a href="warranty-my.html" class="btn-empty-action" style="display:inline-block; padding:10px 20px; background:#2563eb; color:#ffffff; border-radius:8px; text-decoration:none; font-weight:600;">
            Bảo hành của tôi
          </a>
          <a href="warranty-requests-my.html" class="btn-empty-action" style="display:inline-block; padding:10px 20px; background:#f1f5f9; color:#334155; border-radius:8px; text-decoration:none; font-weight:600; border:1px solid #cbd5e1;">
            Yêu cầu bảo hành của tôi
          </a>
        </div>
      </div>
    `;
  }
}

/**
 * Render thanh tiến trình trực quan 4 bước
 */
function renderRequestTimeline(req) {
  const container = document.getElementById('requestTimelineContainer');
  if (!container) return;

  const s = Number(req.trangThai);
  const isRejected = (s === 4);

  let step1Class = 'completed'; // Gửi yêu cầu luôn hoàn thành
  let step2Class = s >= 1 && !isRejected ? (s > 1 ? 'completed' : 'active') : '';
  let step3Class = s >= 2 && !isRejected ? (s > 2 ? 'completed' : 'active') : '';
  let step4Class = s === 3 ? 'completed' : '';

  if (isRejected) {
    container.innerHTML = `
      <div class="timeline-stepper rejected">
        <div class="step-item completed">
          <div class="step-dot">✓</div>
          <div class="step-label">1. Gửi yêu cầu</div>
          <div class="step-time">${formatWarrantyDate(req.ngayGui)}</div>
        </div>
        <div class="step-line active"></div>
        <div class="step-item rejected-step">
          <div class="step-dot">✕</div>
          <div class="step-label">2. Từ chối yêu cầu</div>
          <div class="step-time">${req.ngayHoanThanh ? formatWarrantyDate(req.ngayHoanThanh) : 'Đã phản hồi'}</div>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="timeline-stepper">
      <div class="step-item ${step1Class}">
        <div class="step-dot">${s > 0 ? '✓' : '1'}</div>
        <div class="step-label">1. Gửi yêu cầu</div>
        <div class="step-time">${formatWarrantyDate(req.ngayGui)}</div>
      </div>
      <div class="step-line ${s >= 1 ? 'active' : ''}"></div>

      <div class="step-item ${step2Class}">
        <div class="step-dot">${s > 1 ? '✓' : '2'}</div>
        <div class="step-label">2. Tiếp nhận</div>
        <div class="step-time">${req.ngayTiepNhan ? formatWarrantyDate(req.ngayTiepNhan) : 'Chờ xử lý'}</div>
      </div>
      <div class="step-line ${s >= 2 ? 'active' : ''}"></div>

      <div class="step-item ${step3Class}">
        <div class="step-dot">${s > 2 ? '✓' : '3'}</div>
        <div class="step-label">3. Đang xử lý</div>
        <div class="step-time">${s >= 2 ? (req.ngayBatDauXuLy ? formatWarrantyDate(req.ngayBatDauXuLy) : 'Kỹ thuật kiểm tra') : '---'}</div>
      </div>
      <div class="step-line ${s === 3 ? 'active' : ''}"></div>

      <div class="step-item ${step4Class}">
        <div class="step-dot">${s === 3 ? '✓' : '4'}</div>
        <div class="step-label">4. Hoàn thành</div>
        <div class="step-time">${req.ngayHoanThanh ? formatWarrantyDate(req.ngayHoanThanh) : '---'}</div>
      </div>
    </div>
  `;
}

function getRequestStatusText(statusCode) {
  switch (Number(statusCode)) {
    case 0: return 'Chờ tiếp nhận';
    case 1: return 'Đã tiếp nhận';
    case 2: return 'Đang xử lý';
    case 3: return 'Hoàn thành';
    case 4: return 'Từ chối';
    default: return 'Chưa xác định';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncateText(str, maxLen = 60) {
  if (!str) return '';
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
}

// ============================================================================
// HELPER FUNCTIONS (ĐỊNH DẠNG & BADGE BẢO HÀNH)
// ============================================================================
function getWarrantyStatusKey(warranty) {
  if (!warranty) return 'EXPIRED';
  if (warranty.statusKeyBaoHanh) return String(warranty.statusKeyBaoHanh).toUpperCase();
  if (warranty.statusKey) return String(warranty.statusKey).toUpperCase();
  const rawStatus = (warranty.trangThaiBaoHanh !== undefined && warranty.trangThaiBaoHanh !== null)
    ? warranty.trangThaiBaoHanh
    : warranty.trangThai;
  if (rawStatus !== null && rawStatus !== undefined && Number(rawStatus) === 0) {
    return 'REVOKED';
  }
  const expiryRaw = warranty.ngayHetHanBaoHanh || warranty.ngayHetHan;
  if (!expiryRaw) return 'ACTIVE';
  const expiryDate = new Date(expiryRaw);
  const now = new Date();
  if (!isNaN(expiryDate.getTime()) && expiryDate < now) {
    return 'EXPIRED';
  }
  return 'ACTIVE';
}

function getWarrantyStatusBadge(warranty) {
  const statusKey = getWarrantyStatusKey(warranty);
  switch (statusKey) {
    case 'ACTIVE':
      return `<span class="badge-status badge-success" style="background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; font-weight:700; padding:4px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;">
        <span style="width:6px; height:6px; border-radius:50%; background:#16a34a; flex-shrink:0;"></span>
        Còn hạn
      </span>`;
    case 'EXPIRED':
      return `<span class="badge-status badge-secondary" style="background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1; font-weight:700; padding:4px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;">
        <span style="width:6px; height:6px; border-radius:50%; background:#94a3b8; flex-shrink:0;"></span>
        Hết hạn
      </span>`;
    case 'REVOKED':
      return `<span class="badge-status badge-danger" style="background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; font-weight:700; padding:4px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;">
        <span style="width:6px; height:6px; border-radius:50%; background:#dc2626; flex-shrink:0;"></span>
        Ngừng hiệu lực
      </span>`;
    default:
      return `<span class="badge-status" style="white-space:nowrap;">---</span>`;
  }
}

function getRequestStatusBadge(statusCode) {
  const s = Number(statusCode);
  switch (s) {
    case 0:
      return `<span class="badge-status badge-warning" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-weight:700; padding:4px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;">
        <span style="width:6px; height:6px; border-radius:50%; background:#d97706; flex-shrink:0;"></span>
        Chờ tiếp nhận
      </span>`;
    case 1:
      return `<span class="badge-status badge-info" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-weight:700; padding:4px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;">
        <span style="width:6px; height:6px; border-radius:50%; background:#2563eb; flex-shrink:0;"></span>
        Đã tiếp nhận
      </span>`;
    case 2:
      return `<span class="badge-status" style="background:#f3e8ff; color:#7e22ce; border:1px solid #e9d5ff; font-weight:700; padding:4px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;">
        <span style="width:6px; height:6px; border-radius:50%; background:#9333ea; flex-shrink:0;"></span>
        Đang xử lý
      </span>`;
    case 3:
      return `<span class="badge-status badge-success" style="background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; font-weight:700; padding:4px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;">
        <span style="width:6px; height:6px; border-radius:50%; background:#16a34a; flex-shrink:0;"></span>
        Hoàn thành
      </span>`;
    case 4:
      return `<span class="badge-status badge-danger" style="background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; font-weight:700; padding:4px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;">
        <span style="width:6px; height:6px; border-radius:50%; background:#dc2626; flex-shrink:0;"></span>
        Từ chối
      </span>`;
    default:
      return `<span class="badge-status" style="white-space:nowrap;">Không xác định</span>`;
  }
}

function formatWarrantyDate(isoString, includeTime = false) {
  if (!isoString) return '---';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  if (!includeTime) {
    return `${day}/${month}/${year}`;
  }
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${mins} ${day}/${month}/${year}`;
}

window.getWarrantyStatusKey = getWarrantyStatusKey;
window.getWarrantyStatusBadge = getWarrantyStatusBadge;
window.getRequestStatusBadge = getRequestStatusBadge;
window.formatWarrantyDate = formatWarrantyDate;

})();

