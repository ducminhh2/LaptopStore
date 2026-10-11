/**
 * LAPTOP STORE - ADMIN & STAFF WARRANTY MANAGEMENT SCRIPT (warranty-admin.js)
 * Bộ điều khiển giao diện Quản Lý Bảo Hành và Yêu Cầu Bảo Hành
 * DÙNG CHUNG DUY NHẤT 1 BỘ GIAO DIỆN CHO CẢ ADMIN VÀ NHÂN VIÊN.
 * Tuân thủ Bước 2: Đọc dữ liệu thật từ Database qua Spring Boot REST API, loại bỏ mock data.
 * Không thực hiện các hành động ghi dữ liệu (tiếp nhận, từ chối, v.v.).
 */

(function () {
  'use strict';

  const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080/api';

  // State quản lý tab bảo hành admin
  const adminWarrantyState = {
  warrantiesList: [],
  requestsList: [],
  warrantySearch: '',
  warrantyFilter: 'ALL',
  requestSearch: '',
  requestFilter: 'ALL',
  selectedWarranty: null,
  selectedRequest: null
};

// ============================================================================
// 1. TAB: QUẢN LÝ PHIẾU BẢO HÀNH (Trang 6)
// ============================================================================
window.initAdminWarrantiesTab = async function() {
  await Promise.all([
    fetchAdminWarrantyStats(),
    fetchAdminWarrantiesTable()
  ]);
};

async function fetchAdminWarrantyStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/bao-hanh/admin/thong-ke`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const stats = await res.json();

    const totalEl = document.getElementById('statAdminWarrantyTotal');
    const activeEl = document.getElementById('statAdminWarrantyActive');
    const expiredEl = document.getElementById('statAdminWarrantyExpired');
    const revokedEl = document.getElementById('statAdminWarrantyRevoked');

    if (totalEl) totalEl.textContent = stats.tongSo || 0;
    if (activeEl) activeEl.textContent = stats.conHan || 0;
    if (expiredEl) expiredEl.textContent = stats.hetHan || 0;
    if (revokedEl) revokedEl.textContent = stats.ngungHieuLuc || 0;
  } catch (err) {
    console.warn('Lỗi tải thống kê bảo hành từ API:', err);
  }
}

async function fetchAdminWarrantiesTable() {
  try {
    const res = await fetch(`${API_BASE_URL}/bao-hanh/admin/danh-sach`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    adminWarrantyState.warrantiesList = Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Lỗi tải danh sách bảo hành từ API:', err);
    adminWarrantyState.warrantiesList = [];
  }
  renderAdminWarrantiesTable();
}

window.filterAdminWarrantiesTable = function() {
  const searchInput = document.getElementById('searchAdminWarrantyInput');
  const statusSelect = document.getElementById('filterAdminWarrantyStatus');

  if (searchInput) adminWarrantyState.warrantySearch = searchInput.value.trim().toLowerCase();
  if (statusSelect) adminWarrantyState.warrantyFilter = statusSelect.value;

  renderAdminWarrantiesTable();
};

function renderAdminWarrantiesTable() {
  const tbody = document.getElementById('adminWarrantiesTableBody');
  const emptyState = document.getElementById('adminWarrantiesEmptyState');
  if (!tbody) return;

  const s = adminWarrantyState.warrantySearch;
  const f = adminWarrantyState.warrantyFilter;

  const filtered = adminWarrantyState.warrantiesList.filter(item => {
    const matchSearch = !s ||
      (item.maPhieu && item.maPhieu.toLowerCase().includes(s)) ||
      (item.soImei && item.soImei.toLowerCase().includes(s)) ||
      (item.tenLaptop && item.tenLaptop.toLowerCase().includes(s)) ||
      (item.tenKhachHang && item.tenKhachHang.toLowerCase().includes(s));

    if (!matchSearch) return false;

    if (f === 'ALL') return true;
    return item.statusKey === f;
  });

  const countBadge = document.getElementById('adminWarrantyCountBadge');
  if (countBadge) countBadge.textContent = `${filtered.length} phiếu`;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = filtered.map((item, index) => {
    const statusBadge = getWarrantyStatusBadge(item);

    return `
      <tr>
        <td style="text-align: center; color: var(--admin-text-muted); font-weight: 600;">${index + 1}</td>
        <td>
          <span style="font-family: monospace; font-weight: 800; color: #2563eb; font-size: 0.95rem;">
            ${escapeHtml(item.maPhieu)}
          </span>
        </td>
        <td>
          <div style="font-weight: 700; color: #0f172a;">${escapeHtml(item.tenLaptop || 'Laptop')}</div>
          <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px;">Hóa đơn: <strong>${escapeHtml(item.maHoaDon || '---')}</strong></div>
        </td>
        <td>
          <span style="font-family: monospace; font-weight: 700; background: #f8fafc; padding: 3px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
            ${escapeHtml(item.soImei)}
          </span>
        </td>
        <td>
          <div style="font-weight: 600; color: #1e293b;">${escapeHtml(item.tenKhachHang || 'Khách vãng lai')}</div>
          <div style="font-size: 0.78rem; color: #64748b;">${escapeHtml(item.soDienThoaiKhachHang || '---')}</div>
        </td>
        <td style="text-align: center; white-space: nowrap;">${formatWarrantyDate(item.ngayKichHoat)}</td>
        <td style="text-align: center; white-space: nowrap; font-weight: 600;">${formatWarrantyDate(item.ngayHetHan)}</td>
        <td style="text-align: center;">${statusBadge}</td>
        <td style="text-align: center;">
          <button type="button" class="btn-admin btn-outline btn-sm" onclick="openAdminWarrantyDetailModal(${item.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>Chi tiết</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ============================================================================
// 2. MODAL: CHI TIẾT BẢO HÀNH CHO ADMIN / NHÂN VIÊN (Trang 7)
// ============================================================================
window.openAdminWarrantyDetailModal = async function(warrantyId) {
  let item = adminWarrantyState.warrantiesList.find(w => w.id === warrantyId);
  if (!item) {
    try {
      const res = await fetch(`${API_BASE_URL}/bao-hanh/admin/${warrantyId}`);
      if (res.ok) item = await res.json();
    } catch (e) {
      console.warn(e);
    }
  }
  if (!item) return;

  adminWarrantyState.selectedWarranty = item;

  // Lấy lịch sử yêu cầu của cùng số IMEI từ API thực tế
  let requests = [];
  if (item.soImei) {
    try {
      const resReq = await fetch(`${API_BASE_URL}/yeu-cau-bao-hanh/imei/${encodeURIComponent(item.soImei)}`);
      if (resReq.ok) {
        requests = await resReq.json();
      }
    } catch (e) {
      console.warn('Lỗi tải lịch sử yêu cầu của IMEI:', e);
    }
  }

  // Gán thông tin Laptop
  const elLaptopName = document.getElementById('admWDetailLaptopName');
  const elLaptopImg = document.getElementById('admWDetailLaptopImg');
  const elImei = document.getElementById('admWDetailImei');
  const elSpecs = document.getElementById('admWDetailSpecs');
  const elMaHoaDon = document.getElementById('admWDetailMaHoaDon');

  if (elLaptopName) elLaptopName.textContent = item.tenLaptop || 'Laptop';
  if (elLaptopImg) elLaptopImg.src = item.hinhAnh || '../images/default-laptop.png';
  if (elImei) elImei.textContent = item.soImei || '---';
  if (elSpecs) elSpecs.textContent = item.cauHinh || 'Đang cập nhật cấu hình';
  if (elMaHoaDon) elMaHoaDon.textContent = item.maHoaDon || '---';

  // Gán thông tin Khách hàng
  const elCustName = document.getElementById('admWDetailCustName');
  const elCustPhone = document.getElementById('admWDetailCustPhone');
  const elCustEmail = document.getElementById('admWDetailCustEmail');
  const elCustAddress = document.getElementById('admWDetailCustAddress');

  if (elCustName) elCustName.textContent = item.tenKhachHang || 'Khách vãng lai';
  if (elCustPhone) elCustPhone.textContent = item.soDienThoaiKhachHang || '---';
  if (elCustEmail) elCustEmail.textContent = item.emailKhachHang || '---';
  if (elCustAddress) elCustAddress.textContent = item.diaChiKhachHang || '---';

  // Gán thông tin Bảo hành
  const elMaPhieu = document.getElementById('admWDetailMaPhieu');
  const elNgayKichHoat = document.getElementById('admWDetailNgayKichHoat');
  const elNgayHetHan = document.getElementById('admWDetailNgayHetHan');
  const elThoiHan = document.getElementById('admWDetailThoiHan');
  const elStatusBadge = document.getElementById('admWDetailStatusBadge');

  if (elMaPhieu) elMaPhieu.textContent = item.maPhieu;
  if (elNgayKichHoat) elNgayKichHoat.textContent = formatWarrantyDate(item.ngayKichHoat);
  if (elNgayHetHan) elNgayHetHan.textContent = formatWarrantyDate(item.ngayHetHan);
  if (elThoiHan) elThoiHan.textContent = `${item.thoiHanThang || 12} tháng`;
  if (elStatusBadge) elStatusBadge.innerHTML = getWarrantyStatusBadge(item);

  // Render bảng Lịch sử yêu cầu bảo hành của máy
  const historyTbody = document.getElementById('admWDetailHistoryTbody');
  const historyCount = document.getElementById('admWDetailHistoryCount');

  if (historyCount) historyCount.textContent = `${requests.length} yêu cầu`;

  if (historyTbody) {
    if (requests.length === 0) {
      historyTbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px;">
            Thiết bị này chưa từng phát sinh yêu cầu bảo hành nào.
          </td>
        </tr>
      `;
    } else {
      historyTbody.innerHTML = requests.map(r => `
        <tr>
          <td style="font-family: monospace; font-weight: 800; color: #2563eb;">${escapeHtml(r.maYeuCau)}</td>
          <td style="white-space: nowrap;">${formatWarrantyDate(r.ngayGui, true)}</td>
          <td style="max-width: 220px; font-size: 0.85rem; color: #475569;">${escapeHtml(r.moTaLoi)}</td>
          <td style="font-weight: 600; color: #1e293b;">${escapeHtml(r.tenNhanVien || 'Chưa tiếp nhận')}</td>
          <td style="text-align: center;">${getRequestStatusBadge(r.trangThai)}</td>
          <td style="white-space: nowrap;">${r.ngayHoanThanh ? formatWarrantyDate(r.ngayHoanThanh) : '---'}</td>
          <td style="text-align: center;">
            <button type="button" class="btn-admin btn-outline btn-sm" onclick="closeAdminWarrantyDetailModal(); openAdminWarrantyRequestDetailModal(${r.id});">
              Chi tiết
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  const modal = document.getElementById('modalAdminWarrantyDetail');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
};

window.closeAdminWarrantyDetailModal = function() {
  const modal = document.getElementById('modalAdminWarrantyDetail');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};

// ============================================================================
// 3. TAB: QUẢN LÝ YÊU CẦU BẢO HÀNH (Trang 8)
// ============================================================================
window.initAdminWarrantyRequestsTab = async function() {
  await Promise.all([
    fetchAdminRequestStats(),
    fetchAdminWarrantyRequestsTable()
  ]);
};

async function fetchAdminRequestStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/yeu-cau-bao-hanh/admin/thong-ke`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const stats = await res.json();

    const el0 = document.getElementById('statAdminReqPending');
    const el1 = document.getElementById('statAdminReqAccepted');
    const el2 = document.getElementById('statAdminReqProcessing');
    const el3 = document.getElementById('statAdminReqCompleted');
    const el4 = document.getElementById('statAdminReqRejected');

    if (el0) el0.textContent = stats.choTiepNhan || 0;
    if (el1) el1.textContent = stats.daTiepNhan || 0;
    if (el2) el2.textContent = stats.dangXuLy || 0;
    if (el3) el3.textContent = stats.hoanThanh || 0;
    if (el4) el4.textContent = stats.tuChoi || 0;
  } catch (err) {
    console.warn('Lỗi tải thống kê yêu cầu từ API:', err);
  }
}

async function fetchAdminWarrantyRequestsTable() {
  try {
    const res = await fetch(`${API_BASE_URL}/yeu-cau-bao-hanh/admin/danh-sach`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    adminWarrantyState.requestsList = Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Lỗi tải danh sách yêu cầu từ API:', err);
    adminWarrantyState.requestsList = [];
  }
  renderAdminWarrantyRequestsTable();
}

window.filterAdminWarrantyRequestsTable = function() {
  const searchInput = document.getElementById('searchAdminRequestInput');
  const statusSelect = document.getElementById('filterAdminRequestStatus');

  if (searchInput) adminWarrantyState.requestSearch = searchInput.value.trim().toLowerCase();
  if (statusSelect) adminWarrantyState.requestFilter = statusSelect.value;

  renderAdminWarrantyRequestsTable();
};

function renderAdminWarrantyRequestsTable() {
  const tbody = document.getElementById('adminWarrantyRequestsTableBody');
  const emptyState = document.getElementById('adminWarrantyRequestsEmptyState');
  if (!tbody) return;

  const s = adminWarrantyState.requestSearch;
  const f = adminWarrantyState.requestFilter;

  const filtered = adminWarrantyState.requestsList
    .filter(item => {
      const matchSearch = !s ||
        (item.maYeuCau && item.maYeuCau.toLowerCase().includes(s)) ||
        (item.soImei && item.soImei.toLowerCase().includes(s)) ||
        (item.tenLaptop && item.tenLaptop.toLowerCase().includes(s)) ||
        (item.tenKhachHang && item.tenKhachHang.toLowerCase().includes(s));

      if (!matchSearch) return false;

      if (f === 'ALL') return true;
      return Number(item.trangThai) === Number(f);
    })
    .sort((a, b) => new Date(b.ngayGui) - new Date(a.ngayGui));

  const countBadge = document.getElementById('adminWarrantyReqCountBadge');
  if (countBadge) countBadge.textContent = `${filtered.length} yêu cầu`;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = filtered.map((req, index) => {
    const statusBadge = getRequestStatusBadge(req.trangThai);

    return `
      <tr>
        <td style="text-align: center; color: var(--admin-text-muted); font-weight: 600;">${index + 1}</td>
        <td>
          <span style="font-family: monospace; font-weight: 800; color: #2563eb; font-size: 0.95rem;">
            ${escapeHtml(req.maYeuCau)}
          </span>
        </td>
        <td>
          <div style="font-weight: 700; color: #0f172a;">${escapeHtml(req.tenLaptop || 'Laptop')}</div>
        </td>
        <td>
          <span style="font-family: monospace; font-weight: 700; background: #f8fafc; padding: 3px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
            ${escapeHtml(req.soImei)}
          </span>
        </td>
        <td>
          <div style="font-weight: 600; color: #1e293b;">${escapeHtml(req.tenKhachHang || 'Khách vãng lai')}</div>
          <div style="font-size: 0.78rem; color: #64748b;">${escapeHtml(req.dienThoaiLienHe || '---')}</div>
        </td>
        <td style="text-align: center; white-space: nowrap;">${formatWarrantyDate(req.ngayGui, true)}</td>
        <td>
          <span style="font-weight: 600; color: ${req.tenNhanVien ? '#1e293b' : '#94a3b8'};">
            ${escapeHtml(req.tenNhanVien || 'Chưa tiếp nhận')}
          </span>
        </td>
        <td style="text-align: center;">${statusBadge}</td>
        <td style="text-align: center;">
          <button type="button" class="btn-admin btn-outline btn-sm" onclick="openAdminWarrantyRequestDetailModal(${req.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>Chi tiết</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ============================================================================
// 4. MODAL: CHI TIẾT YÊU CẦU BẢO HÀNH CHO ADMIN / NHÂN VIÊN (MINIMALIST CARD)
// ============================================================================
function formatStepperDate(isoString) {
  if (!isoString) return '---';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} — ${hours}:${mins}`;
}

function renderAdminDetailStatusBadge(el, statusCode) {
  if (!el) return;
  const s = Number(statusCode);
  let bg = '#ffedd5', color = '#ea580c', text = 'Chờ tiếp nhận';
  switch (s) {
    case 0:
      bg = '#ffedd5'; color = '#ea580c'; text = 'Chờ tiếp nhận'; break;
    case 1:
      bg = '#eff6ff'; color = '#2563eb'; text = 'Đã tiếp nhận'; break;
    case 2:
      bg = '#f5f3ff'; color = '#7c3aed'; text = 'Đang xử lý'; break;
    case 3:
      bg = '#ecfdf5'; color = '#059669'; text = 'Hoàn thành'; break;
    case 4:
      bg = '#fef2f2'; color = '#dc2626'; text = 'Từ chối'; break;
    default:
      bg = '#f1f5f9'; color = '#64748b'; text = 'Không xác định'; break;
  }
  el.style.background = bg;
  el.style.color = color;
  el.style.borderRadius = '9999px';
  el.style.padding = '4px 14px';
  el.style.fontSize = '12.5px';
  el.style.fontWeight = '600';
  el.style.display = 'inline-block';
  el.style.lineHeight = '1.4';
  el.textContent = text;
}

function getAdminDetailStatusBadge(statusCode) {
  const s = Number(statusCode);
  switch (s) {
    case 0:
      return `<span style="background: #ffedd5; color: #ea580c; border-radius: 9999px; padding: 4px 14px; font-size: 12.5px; font-weight: 600; display: inline-block; line-height: 1.4;">Chờ tiếp nhận</span>`;
    case 1:
      return `<span style="background: #eff6ff; color: #2563eb; border-radius: 9999px; padding: 4px 14px; font-size: 12.5px; font-weight: 600; display: inline-block; line-height: 1.4;">Đã tiếp nhận</span>`;
    case 2:
      return `<span style="background: #f5f3ff; color: #7c3aed; border-radius: 9999px; padding: 4px 14px; font-size: 12.5px; font-weight: 600; display: inline-block; line-height: 1.4;">Đang xử lý</span>`;
    case 3:
      return `<span style="background: #ecfdf5; color: #059669; border-radius: 9999px; padding: 4px 14px; font-size: 12.5px; font-weight: 600; display: inline-block; line-height: 1.4;">Hoàn thành</span>`;
    case 4:
      return `<span style="background: #fef2f2; color: #dc2626; border-radius: 9999px; padding: 4px 14px; font-size: 12.5px; font-weight: 600; display: inline-block; line-height: 1.4;">Từ chối</span>`;
    default:
      return `<span style="background: #f1f5f9; color: #64748b; border-radius: 9999px; padding: 4px 14px; font-size: 12.5px; font-weight: 600; display: inline-block; line-height: 1.4;">Không xác định</span>`;
  }
}

window.openAdminWarrantyRequestDetailModal = async function(requestId) {
  let req = null;
  try {
    const res = await fetch(`${API_BASE_URL}/yeu-cau-bao-hanh/admin/${requestId}`);
    if (res.ok) req = await res.json();
  } catch (e) {
    console.warn(e);
  }
  if (!req) {
    req = adminWarrantyState.requestsList.find(r => r.id === requestId);
  }
  if (!req) return;

  adminWarrantyState.selectedRequest = req;

  // Header info
  const elMaYeuCau = document.getElementById('admRDetailMa');
  const elNgayGui = document.getElementById('admRDetailNgayGui');
  const elStatusBadge = document.getElementById('admRDetailStatusBadge');

  if (elMaYeuCau) elMaYeuCau.textContent = req.maYeuCau;
  if (elNgayGui) elNgayGui.textContent = formatWarrantyDate(req.ngayGui, true);
  if (elStatusBadge) renderAdminDetailStatusBadge(elStatusBadge, req.trangThai);

  // Section 1: Thông tin khách hàng
  const elCustName = document.getElementById('admRDetailCustName');
  const elCustPhone = document.getElementById('admRDetailCustPhone');

  if (elCustName) elCustName.textContent = req.tenKhachHang || 'Khách hàng';
  if (elCustPhone) elCustPhone.textContent = req.dienThoaiLienHe || '---';

  // Section 2: Thông tin laptop và bảo hành
  const elLaptopName = document.getElementById('admRDetailLaptopName');
  const elImei = document.getElementById('admRDetailImei');
  const elMaPhieu = document.getElementById('admRDetailMaPhieu');
  const elThoiHan = document.getElementById('admRDetailThoiHan');

  if (elLaptopName) elLaptopName.textContent = req.tenLaptop || 'Laptop';
  if (elImei) elImei.textContent = req.soImei || '---';
  if (elMaPhieu) elMaPhieu.textContent = req.maPhieuBaoHanh || 'Đọc từ Database';
  if (elThoiHan) {
    if (req.ngayKichHoatBaoHanh && req.ngayHetHanBaoHanh) {
      elThoiHan.textContent = `${formatWarrantyDate(req.ngayKichHoatBaoHanh)} — ${formatWarrantyDate(req.ngayHetHanBaoHanh)}`;
    } else if (req.thoiHanThang) {
      elThoiHan.textContent = `${req.thoiHanThang} tháng`;
    } else {
      elThoiHan.textContent = 'Đọc từ Database';
    }
  }

  // Section 3: Nội dung yêu cầu
  const elMoTaLoi = document.getElementById('admRDetailMoTaLoi');
  const elGhiChuKhach = document.getElementById('admRDetailGhiChuKhach');

  if (elMoTaLoi) elMoTaLoi.textContent = req.moTaLoi || 'Hiển thị nội dung mo_ta_loi từ Database';
  if (elGhiChuKhach) elGhiChuKhach.textContent = req.ghiChuKhachHang || 'Hiển thị ghi chú nếu có';

  // Section 4: Tiến trình xử lý (Vertical Stepper)
  renderAdminWarrantyStepper(req);

  // Footer: Action Buttons
  renderAdminRequestActionButtons(req);

  // Render Lịch sử bảo hành trước đó của cùng IMEI
  await renderAdminRequestImeiHistory(req.soImei, req.id);

  const modal = document.getElementById('modalAdminWarrantyRequestDetail');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
};

window.closeAdminWarrantyRequestDetailModal = function() {
  const modal = document.getElementById('modalAdminWarrantyRequestDetail');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};

/**
 * Render Vertical Stepper matching the minimalist screenshot
 */
function renderAdminWarrantyStepper(req) {
  const container = document.getElementById('admRDetailStepper');
  if (!container) return;

  const s = Number(req.trangThai);
  const ngayGuiFormatted = formatStepperDate(req.ngayGui);

  if (s === 4) {
    // Trường hợp từ chối tiếp nhận
    container.innerHTML = `
      <div class="warranty-vstep">
        <div class="warranty-vstep-axis">
          <span class="warranty-vstep-num active">1</span>
          <div class="warranty-vstep-line"></div>
        </div>
        <div class="warranty-vstep-content">
          <div class="warranty-vstep-title active">Đã gửi yêu cầu</div>
          <div class="warranty-vstep-desc">${ngayGuiFormatted}</div>
        </div>
      </div>

      <div class="warranty-vstep">
        <div class="warranty-vstep-axis">
          <span class="warranty-vstep-num active" style="color: #dc2626;">2</span>
        </div>
        <div class="warranty-vstep-content" style="padding-bottom: 0;">
          <div class="warranty-vstep-title active" style="color: #dc2626;">Từ chối tiếp nhận</div>
          <div class="warranty-vstep-desc">
            <div>Nhân viên phụ trách: <strong>${escapeHtml(req.tenNhanVien || 'Nhân viên')}</strong></div>
            <div style="margin-top: 4px; color: #b91c1c; font-style: italic;">Lý do từ chối: ${escapeHtml(req.lyDoTuChoi || 'Không đủ điều kiện bảo hành')}</div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Trường hợp s = 0, 1, 2, 3 (Các bước bình thường 1 -> 4)
  // Step 1: Đã gửi yêu cầu
  const step1Html = `
    <div class="warranty-vstep">
      <div class="warranty-vstep-axis">
        <span class="warranty-vstep-num active">1</span>
        <div class="warranty-vstep-line"></div>
      </div>
      <div class="warranty-vstep-content">
        <div class="warranty-vstep-title active">Đã gửi yêu cầu</div>
        <div class="warranty-vstep-desc">${ngayGuiFormatted}</div>
      </div>
    </div>
  `;

  // Step 2: Chờ tiếp nhận hoặc Đã tiếp nhận
  let step2Html = '';
  if (s === 0) {
    step2Html = `
      <div class="warranty-vstep">
        <div class="warranty-vstep-axis">
          <span class="warranty-vstep-num active">2</span>
          <div class="warranty-vstep-line"></div>
        </div>
        <div class="warranty-vstep-content">
          <div class="warranty-vstep-title active">Chờ tiếp nhận</div>
          <div class="warranty-vstep-desc">Nhân viên phụ trách: Chưa tiếp nhận</div>
        </div>
      </div>
    `;
  } else {
    const timeTiepNhan = req.ngayTiepNhan ? ` (${formatStepperDate(req.ngayTiepNhan)})` : '';
    step2Html = `
      <div class="warranty-vstep">
        <div class="warranty-vstep-axis">
          <span class="warranty-vstep-num active">2</span>
          <div class="warranty-vstep-line"></div>
        </div>
        <div class="warranty-vstep-content">
          <div class="warranty-vstep-title active">Đã tiếp nhận</div>
          <div class="warranty-vstep-desc">Nhân viên phụ trách: <strong>${escapeHtml(req.tenNhanVien || 'Nhân viên')}</strong>${timeTiepNhan}</div>
        </div>
      </div>
    `;
  }

  // Step 3: Đang xử lý
  let step3Html = '';
  if (s < 2) {
    step3Html = `
      <div class="warranty-vstep">
        <div class="warranty-vstep-axis">
          <span class="warranty-vstep-num inactive">3</span>
          <div class="warranty-vstep-line" style="min-height: 18px;"></div>
        </div>
        <div class="warranty-vstep-content">
          <div class="warranty-vstep-title inactive">Đang xử lý — Chưa thực hiện</div>
        </div>
      </div>
    `;
  } else if (s === 2) {
    step3Html = `
      <div class="warranty-vstep">
        <div class="warranty-vstep-axis">
          <span class="warranty-vstep-num active">3</span>
          <div class="warranty-vstep-line"></div>
        </div>
        <div class="warranty-vstep-content">
          <div class="warranty-vstep-title active">Đang xử lý</div>
          <div class="warranty-vstep-desc">Bắt đầu: ${formatStepperDate(req.ngayBatDauXuLy || req.ngayTiepNhan)} — Đang kiểm tra & khắc phục sự cố</div>
        </div>
      </div>
    `;
  } else { // s === 3
    step3Html = `
      <div class="warranty-vstep">
        <div class="warranty-vstep-axis">
          <span class="warranty-vstep-num active">3</span>
          <div class="warranty-vstep-line"></div>
        </div>
        <div class="warranty-vstep-content">
          <div class="warranty-vstep-title active">Đã xử lý kỹ thuật</div>
          <div class="warranty-vstep-desc">Bắt đầu: ${formatStepperDate(req.ngayBatDauXuLy || req.ngayTiepNhan)}</div>
        </div>
      </div>
    `;
  }

  // Step 4: Hoàn thành
  let step4Html = '';
  if (s < 3) {
    step4Html = `
      <div class="warranty-vstep">
        <div class="warranty-vstep-axis">
          <span class="warranty-vstep-num inactive">4</span>
        </div>
        <div class="warranty-vstep-content" style="padding-bottom: 0;">
          <div class="warranty-vstep-title inactive">Hoàn thành — Chưa thực hiện</div>
        </div>
      </div>
    `;
  } else { // s === 3
    step4Html = `
      <div class="warranty-vstep">
        <div class="warranty-vstep-axis">
          <span class="warranty-vstep-num active" style="color: #16a34a;">4</span>
        </div>
        <div class="warranty-vstep-content" style="padding-bottom: 0;">
          <div class="warranty-vstep-title active" style="color: #16a34a;">Hoàn thành</div>
          <div class="warranty-vstep-desc">
            <div>Thời gian hoàn tất: ${formatStepperDate(req.ngayHoanThanh)}</div>
            ${req.ghiChuXuLy ? `<div style="margin-top: 4px; color: #15803d; font-style: italic;">Kết quả: ${escapeHtml(req.ghiChuXuLy)}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = step1Html + step2Html + step3Html + step4Html;
}

/**
 * Render khu vực nút hành động theo đúng trạng thái (Pill buttons matching screenshot)
 */
function renderAdminRequestActionButtons(req) {
  const container = document.getElementById('admRDetailActionButtons');
  if (!container) return;

  const s = Number(req.trangThai);

  if (s === 0) {
    container.innerHTML = `
      <button type="button" class="btn-step5-pill-outline" onclick="openAdminTuChoiModal()">Từ chối</button>
      <button type="button" class="btn-step5-pill-dark" onclick="openAdminTiepNhanModal()">Tiếp nhận yêu cầu</button>
    `;
  } else if (s === 1) {
    container.innerHTML = `
      <button type="button" class="btn-step5-pill-dark" onclick="openAdminBatDauXuLyModal()">Bắt đầu xử lý</button>
    `;
  } else if (s === 2) {
    container.innerHTML = `
      <button type="button" class="btn-step5-pill-dark" onclick="openAdminHoanThanhModal()">Hoàn thành</button>
    `;
  } else if (s === 3) {
    container.innerHTML = `
      <div style="background: #ecfdf5; border: 1px solid #bbf7d0; color: #166534; border-radius: 9999px; padding: 6px 18px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>Đã hoàn thành</span>
      </div>
    `;
  } else if (s === 4) {
    container.innerHTML = `
      <div style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 9999px; padding: 6px 18px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        <span>Đã từ chối</span>
      </div>
    `;
  }
}

/**
 * Render lịch sử bảo hành của laptop (cùng IMEI) từ API
 */
async function renderAdminRequestImeiHistory(imei, currentRequestId) {
  const tbody = document.getElementById('admRDetailHistoryTbody');
  if (!tbody) return;

  let historyList = [];
  if (imei) {
    try {
      const res = await fetch(`${API_BASE_URL}/yeu-cau-bao-hanh/imei/${encodeURIComponent(imei)}`);
      if (res.ok) {
        const all = await res.json();
        historyList = all.filter(r => r.id !== currentRequestId);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  if (historyList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #94a3b8; padding: 18px;">
          Trước đây thiết bị này chưa từng có yêu cầu bảo hành nào khác.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = historyList.map(item => `
    <tr>
      <td style="font-family: monospace; font-weight: 800; color: #2563eb;">${escapeHtml(item.maYeuCau)}</td>
      <td style="white-space: nowrap;">${formatWarrantyDate(item.ngayGui)}</td>
      <td style="max-width: 200px; font-size: 0.82rem; color: #475569;">${escapeHtml(item.moTaLoi)}</td>
      <td style="font-size: 0.82rem; color: #1e293b;">${escapeHtml(item.tenNhanVien || '---')}</td>
      <td style="max-width: 220px; font-size: 0.82rem; color: #334155;">
        ${escapeHtml(item.ghiChuXuLy || item.lyDoTuChoi || '---')}
      </td>
      <td style="text-align: center;">${getRequestStatusBadge(item.trangThai)}</td>
    </tr>
  `).join('');
}

// ============================================================================
// 5. SUB-MODALS THAO TÁC (TIẾP NHẬN, TỪ CHỐI, BẮT ĐẦU XỬ LÝ, HOÀN THÀNH)
// ============================================================================

function getStaffAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  let staffId = 4;
  let staffUsername = 'admin';
  const u = (typeof getLoggedInUser === 'function') ? getLoggedInUser() : null;
  if (u && u.id) {
    staffId = u.id;
    staffUsername = u.username || 'nhanvien';
  } else {
    const userStr = localStorage.getItem('laptop_store_user') || sessionStorage.getItem('laptop_store_user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed.id) {
          staffId = parsed.id;
          staffUsername = parsed.username || 'nhanvien';
        }
      } catch(e) {}
    }
  }
  headers['X-Staff-Id'] = staffId;
  headers['X-User-Id'] = staffId;
  headers['X-Staff-Username'] = staffUsername;
  return headers;
}

window.openAdminTiepNhanModal = function() {
  const modal = document.getElementById('modalAdminTiepNhan');
  const maEl = document.getElementById('modalTiepNhanMaDisplay');
  if (maEl && adminWarrantyState.selectedRequest) {
    maEl.textContent = adminWarrantyState.selectedRequest.maYeuCau;
  }
  const chk = document.getElementById('chkAdminTiepNhanConfirm');
  if (chk) {
    chk.checked = false;
    if (typeof window.toggleAdminTiepNhanCheck === 'function') {
      window.toggleAdminTiepNhanCheck(chk);
    }
  }
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
};

window.closeAdminTiepNhanModal = function() {
  const modal = document.getElementById('modalAdminTiepNhan');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};

window.toggleAdminTiepNhanCheck = function(input) {
  const icon = document.getElementById('iconAdminTiepNhanCheck');
  const btn = document.querySelector('#modalAdminTiepNhan .btn-primary');
  if (!icon) return;
  if (input.checked) {
    icon.style.background = '#0f172a';
    icon.style.border = 'none';
    icon.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    }
  } else {
    icon.style.background = '#ffffff';
    icon.style.border = '2px solid #cbd5e1';
    icon.innerHTML = '';
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    }
  }
};

window.confirmAdminTiepNhan = async function() {
  const req = adminWarrantyState.selectedRequest;
  if (!req || !req.id) return;
  const chk = document.getElementById('chkAdminTiepNhanConfirm');
  if (chk && !chk.checked) {
    alert('Vui lòng xác nhận đã nhận laptop và kiểm tra đúng IMEI/Serial trước khi tiếp nhận.');
    return;
  }
  const btn = document.querySelector('#modalAdminTiepNhan .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Đang xử lý...'; }

  try {
    const res = await fetch(`${API_BASE_URL}/yeu-cau-bao-hanh/admin/${req.id}/tiep-nhan`, {
      method: 'POST',
      headers: getStaffAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Tiếp nhận yêu cầu thất bại');
    }
    closeAdminTiepNhanModal();
    alert('Tiếp nhận yêu cầu bảo hành thành công!');
    await initAdminWarrantyRequestsTab();
    await openAdminWarrantyRequestDetailModal(req.id);
  } catch (err) {
    alert('Lỗi: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Xác nhận tiếp nhận'; }
  }
};

window.openAdminBatDauXuLyModal = function() {
  const modal = document.getElementById('modalAdminBatDauXuLy');
  const maEl = document.getElementById('modalBatDauXuLyMaDisplay');
  if (maEl && adminWarrantyState.selectedRequest) {
    maEl.textContent = adminWarrantyState.selectedRequest.maYeuCau;
  }
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
};

window.closeAdminBatDauXuLyModal = function() {
  const modal = document.getElementById('modalAdminBatDauXuLy');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};

window.confirmAdminBatDauXuLy = async function() {
  const req = adminWarrantyState.selectedRequest;
  if (!req || !req.id) return;
  const btn = document.querySelector('#modalAdminBatDauXuLy .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Đang xử lý...'; }

  try {
    const res = await fetch(`${API_BASE_URL}/yeu-cau-bao-hanh/admin/${req.id}/bat-dau-xu-ly`, {
      method: 'POST',
      headers: getStaffAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Bắt đầu xử lý thất bại');
    }
    closeAdminBatDauXuLyModal();
    alert('Đã chuyển trạng thái sang "Đang xử lý" kỹ thuật thành công!');
    await initAdminWarrantyRequestsTab();
    await openAdminWarrantyRequestDetailModal(req.id);
  } catch (err) {
    alert('Lỗi: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Bắt Đầu Xử Lý'; }
  }
};

window.openAdminHoanThanhModal = function() {
  const modal = document.getElementById('modalAdminHoanThanh');
  const maEl = document.getElementById('modalHoanThanhMaDisplay');
  const textInput = document.getElementById('modalHoanThanhKetQuaInput');
  const errEl = document.getElementById('modalHoanThanhError');
  const countEl = document.getElementById('modalHoanThanhCharCount');
  const chk = document.getElementById('chkAdminHoanThanhConfirm');

  if (maEl && adminWarrantyState.selectedRequest) {
    maEl.textContent = adminWarrantyState.selectedRequest.maYeuCau;
  }
  if (textInput) textInput.value = '';
  if (countEl) countEl.textContent = '0/1000';
  if (errEl) {
    errEl.textContent = '';
    errEl.style.display = 'none';
  }
  if (chk) {
    chk.checked = false;
    if (typeof window.toggleAdminHoanThanhCheck === 'function') {
      window.toggleAdminHoanThanhCheck(chk);
    }
  }
  if (typeof window.updateHoanThanhButtonState === 'function') {
    window.updateHoanThanhButtonState();
  }

  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
};

window.closeAdminHoanThanhModal = function() {
  const modal = document.getElementById('modalAdminHoanThanh');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};

window.toggleAdminHoanThanhCheck = function(input) {
  const icon = document.getElementById('iconAdminHoanThanhCheck');
  if (icon) {
    if (input.checked) {
      icon.style.background = '#0f172a';
      icon.style.border = 'none';
      icon.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else {
      icon.style.background = '#ffffff';
      icon.style.border = '1.8px solid #cbd5e1';
      icon.innerHTML = '';
    }
  }
  if (typeof window.updateHoanThanhButtonState === 'function') {
    window.updateHoanThanhButtonState();
  }
};

window.onHoanThanhInputChange = function() {
  const textInput = document.getElementById('modalHoanThanhKetQuaInput');
  const countEl = document.getElementById('modalHoanThanhCharCount');
  const errEl = document.getElementById('modalHoanThanhError');
  const len = textInput ? textInput.value.length : 0;
  if (countEl) countEl.textContent = `${len}/1000`;
  if (errEl && len >= 10 && len <= 1000) {
    errEl.style.display = 'none';
  }
  if (typeof window.updateHoanThanhButtonState === 'function') {
    window.updateHoanThanhButtonState();
  }
};

window.updateHoanThanhButtonState = function() {
  const textInput = document.getElementById('modalHoanThanhKetQuaInput');
  const chk = document.getElementById('chkAdminHoanThanhConfirm');
  const btn = document.querySelector('#modalAdminHoanThanh .btn-success') || document.getElementById('btnAdminConfirmHoanThanh');
  if (!btn) return;

  const val = textInput ? textInput.value.trim() : '';
  const isChecked = chk ? chk.checked : false;

  if (isChecked && val.length >= 10 && val.length <= 1000) {
    btn.disabled = false;
    btn.style.background = '#0f172a';
    btn.style.color = '#ffffff';
    btn.style.cursor = 'pointer';
    btn.style.opacity = '1';
  } else {
    btn.disabled = true;
    btn.style.background = '#f1f5f9';
    btn.style.color = '#94a3b8';
    btn.style.cursor = 'not-allowed';
    btn.style.opacity = '1';
  }
};

window.confirmAdminHoanThanh = async function() {
  const req = adminWarrantyState.selectedRequest;
  if (!req || !req.id) return;

  const textInput = document.getElementById('modalHoanThanhKetQuaInput');
  const errEl = document.getElementById('modalHoanThanhError');
  const chk = document.getElementById('chkAdminHoanThanhConfirm');
  const val = textInput ? textInput.value.trim() : '';

  if (!val || val.length < 10) {
    if (errEl) {
      errEl.textContent = 'Vui lòng nhập chi tiết kết quả xử lý kỹ thuật (tối thiểu 10 ký tự).';
      errEl.style.display = 'block';
    }
    return;
  }
  if (val.length > 1000) {
    if (errEl) {
      errEl.textContent = 'Kết quả xử lý không được vượt quá 1000 ký tự.';
      errEl.style.display = 'block';
    }
    return;
  }
  if (!chk || !chk.checked) {
    if (errEl) {
      errEl.textContent = 'Vui lòng xác nhận đã hoàn tất xử lý và kiểm tra lại tình trạng hoạt động của laptop.';
      errEl.style.display = 'block';
    }
    return;
  }

  const btn = document.querySelector('#modalAdminHoanThanh .btn-success') || document.getElementById('btnAdminConfirmHoanThanh');
  if (btn) { btn.disabled = true; btn.textContent = 'Đang hoàn tất...'; }

  try {
    const res = await fetch(`${API_BASE_URL}/yeu-cau-bao-hanh/admin/${req.id}/hoan-thanh`, {
      method: 'POST',
      headers: getStaffAuthHeaders(),
      body: JSON.stringify({ ghiChuXuLy: val })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Hoàn thành yêu cầu thất bại');
    }
    closeAdminHoanThanhModal();
    alert('Xác nhận hoàn thành yêu cầu bảo hành thành công!');
    await initAdminWarrantyRequestsTab();
    await openAdminWarrantyRequestDetailModal(req.id);
  } catch (err) {
    alert('Lỗi: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Xác nhận hoàn thành'; }
    if (typeof window.updateHoanThanhButtonState === 'function') {
      window.updateHoanThanhButtonState();
    }
  }
};

window.openAdminTuChoiModal = function() {
  const modal = document.getElementById('modalAdminTuChoi');
  const maEl = document.getElementById('modalTuChoiMaDisplay');
  const textInput = document.getElementById('modalTuChoiLyDoInput');
  const errEl = document.getElementById('modalTuChoiError');

  if (maEl && adminWarrantyState.selectedRequest) {
    maEl.textContent = adminWarrantyState.selectedRequest.maYeuCau;
  }
  if (textInput) textInput.value = '';
  if (errEl) errEl.style.display = 'none';

  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
};

window.closeAdminTuChoiModal = function() {
  const modal = document.getElementById('modalAdminTuChoi');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};

window.confirmAdminTuChoi = async function() {
  const req = adminWarrantyState.selectedRequest;
  if (!req || !req.id) return;

  const textInput = document.getElementById('modalTuChoiLyDoInput');
  const errEl = document.getElementById('modalTuChoiError');
  const val = textInput ? textInput.value.trim() : '';

  if (!val || val.length < 10) {
    if (errEl) {
      errEl.textContent = 'Vui lòng nhập rõ lý do từ chối bảo hành (tối thiểu 10 ký tự) để giải thích cho khách hàng.';
      errEl.style.display = 'block';
    }
    return;
  }
  if (val.length > 1000) {
    if (errEl) {
      errEl.textContent = 'Lý do từ chối không được vượt quá 1000 ký tự.';
      errEl.style.display = 'block';
    }
    return;
  }

  const btn = document.querySelector('#modalAdminTuChoi .btn-danger');
  if (btn) { btn.disabled = true; btn.textContent = 'Đang từ chối...'; }

  try {
    const res = await fetch(`${API_BASE_URL}/yeu-cau-bao-hanh/admin/${req.id}/tu-choi`, {
      method: 'POST',
      headers: getStaffAuthHeaders(),
      body: JSON.stringify({ lyDoTuChoi: val })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Từ chối yêu cầu thất bại');
    }
    closeAdminTuChoiModal();
    alert('Đã từ chối tiếp nhận yêu cầu bảo hành.');
    await initAdminWarrantyRequestsTab();
    await openAdminWarrantyRequestDetailModal(req.id);
  } catch (err) {
    alert('Lỗi: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Xác Nhận Từ Chối'; }
  }
};

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

