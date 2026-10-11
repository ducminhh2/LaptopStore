/**
 * LAPTOP STORE - WARRANTY MODULE MOCK DATA (warranty-mock-data.js)
 * Dữ liệu mẫu dùng chung cho cả giao diện Khách hàng và Quản trị (Admin & Nhân viên).
 * Tổ chức dạng Object nhất quán, sẵn sàng thay thế bằng API REST ở Bước 2.
 */

const WARRANTY_MOCK_DATA = {
  // 1. Danh sách phiếu bảo hành (Bảo hành theo IMEI của máy)
  // trangThai: 1 = Có hiệu lực, 0 = Ngừng hiệu lực
  // Hết hạn: xác định động nếu ngayHetHan < Ngày hiện tại
  warranties: [
    {
      id: 1,
      maPhieu: "BH-LP045-2026",
      soImei: "LP045000031872",
      tenLaptop: "HP Envy x360 14 (2024)",
      cauHinh: "Intel Core Ultra 7 155H / 32GB RAM / 1TB SSD / 14\" 2.8K OLED Cảm ứng / Bạc",
      hinhAnh: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80",
      maHoaDon: "HD1790939507",
      khachHang: {
        id: 1,
        hoTen: "Nguyễn Văn An",
        dienThoai: "0987654321",
        email: "an.nguyen@gmail.com",
        diaChi: "Số 15 Phố Huế, Hoàn Kiếm, Hà Nội"
      },
      ngayKichHoat: "2026-01-15T09:30:00",
      ngayHetHan: "2027-01-15T23:59:59",
      thoiHanThang: 12,
      trangThai: 1 // 1: Có hiệu lực (và còn hạn)
    },
    {
      id: 2,
      maPhieu: "BH-LP002-2025",
      soImei: "LP002000011318",
      tenLaptop: "Dell XPS 13 Plus 9320",
      cauHinh: "Intel Core i7-1360P / 16GB RAM / 512GB SSD / 13.4\" 3.5K OLED / Xám Bạc",
      hinhAnh: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
      maHoaDon: "HD1790939375",
      khachHang: {
        id: 2,
        hoTen: "Lê Hoàng Long",
        dienThoai: "0903123456",
        email: "long.le@gmail.com",
        diaChi: "Tòa S2.05 Vinhomes Ocean Park, Gia Lâm, Hà Nội"
      },
      ngayKichHoat: "2025-05-10T14:15:00",
      ngayHetHan: "2026-05-10T23:59:59",
      thoiHanThang: 12,
      trangThai: 1 // 1: Có hiệu lực nhưng ngày hết hạn đã qua -> Hết hạn
    },
    {
      id: 3,
      maPhieu: "BH-LP012-2026",
      soImei: "LP012000019284",
      tenLaptop: "Asus ROG Zephyrus G14 (2024)",
      cauHinh: "AMD Ryzen 9 8945HS / 32GB RAM / 1TB SSD / RTX 4070 8GB / 14\" 3K 120Hz OLED / Trắng",
      hinhAnh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
      maHoaDon: "HD1790939646",
      khachHang: {
        id: 3,
        hoTen: "Phạm Minh Tuấn",
        dienThoai: "0938889999",
        email: "tuan.pham@gmail.com",
        diaChi: "Số 88 Cầu Giấy, Cầu Giấy, Hà Nội"
      },
      ngayKichHoat: "2026-02-02T10:00:00",
      ngayHetHan: "2027-02-02T23:59:59",
      thoiHanThang: 12,
      trangThai: 0 // 0: Ngừng hiệu lực (do can thiệp/ngấm nước)
    },
    {
      id: 4,
      maPhieu: "BH-LP025-2026",
      soImei: "LP025000041290",
      tenLaptop: "Lenovo ThinkPad X1 Carbon Gen 11",
      cauHinh: "Intel Core i7-1365U / 32GB RAM / 1TB SSD / 14\" 2.8K OLED / Đen Carbon",
      hinhAnh: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
      maHoaDon: "HD1790940736",
      khachHang: {
        id: 4,
        hoTen: "Vũ Thu Trang",
        dienThoai: "0977112233",
        email: "trang.vu@gmail.com",
        diaChi: "Số 26 Đội Cấn, Ba Đình, Hà Nội"
      },
      ngayKichHoat: "2026-06-20T11:45:00",
      ngayHetHan: "2027-06-20T23:59:59",
      thoiHanThang: 12,
      trangThai: 1 // Còn hạn
    },
    {
      id: 5,
      maPhieu: "BH-LP033-2026",
      soImei: "LP033000088124",
      tenLaptop: "Acer Predator Helios Neo 16",
      cauHinh: "Intel Core i7-14700HX / 16GB RAM / 1TB SSD / RTX 4060 8GB / 16\" WQXGA 165Hz / Đen",
      hinhAnh: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
      maHoaDon: "HD261003_015951",
      khachHang: {
        id: 5,
        hoTen: "Hoàng Đức Nam",
        dienThoai: "0918765432",
        email: "nam.hoang@gmail.com",
        diaChi: "Số 102 Trường Chinh, Đống Đa, Hà Nội"
      },
      ngayKichHoat: "2026-08-12T16:20:00",
      ngayHetHan: "2027-08-12T23:59:59",
      thoiHanThang: 12,
      trangThai: 1 // Còn hạn
    }
  ],

  // 2. Danh sách yêu cầu bảo hành
  // Trạng thái INT:
  // 0: Chờ tiếp nhận
  // 1: Đã tiếp nhận
  // 2: Đang xử lý
  // 3: Hoàn thành
  // 4: Từ chối
  requests: [
    {
      id: 1,
      maYeuCau: "YCBH-2601",
      idBaoHanh: 1,
      maPhieuBaoHanh: "BH-LP045-2026",
      soImei: "LP045000031872",
      tenLaptop: "HP Envy x360 14 (2024)",
      khachHang: {
        id: 1,
        hoTen: "Nguyễn Văn An",
        dienThoai: "0987654321",
        email: "an.nguyen@gmail.com"
      },
      ngayGui: "2026-03-20T08:30:00",
      moTaLoi: "Màn hình thỉnh thoảng bị sọc nhiễu và chớp tắt khi gập mở góc bản lề 90-120 độ. Khi để cố định thì hiển thị bình thường.",
      dienThoaiLienHe: "0987654321",
      ghiChuKhachHang: "Tôi hay dùng máy để thuyết trình, cần kiểm tra sớm giúp tôi.",
      trangThai: 3, // Hoàn thành
      nhanVienTiepNhan: "Nguyễn Thanh Liêm (NV002)",
      ngayTiepNhan: "2026-03-20T09:45:00",
      ngayHoanThanh: "2026-03-23T15:20:00",
      ghiChuXuLy: "Kiểm tra phát hiện lỏng cáp eDP màn hình qua trục bản lề. Đã thay mới cáp màn hình chính hãng, căn chỉnh lại độ siết bản lề và chạy stress test 24 giờ đạt tiêu chuẩn xuất xưởng.",
      lyDoTuChoi: null
    },
    {
      id: 2,
      maYeuCau: "YCBH-2602",
      idBaoHanh: 1,
      maPhieuBaoHanh: "BH-LP045-2026",
      soImei: "LP045000031872",
      tenLaptop: "HP Envy x360 14 (2024)",
      khachHang: {
        id: 1,
        hoTen: "Nguyễn Văn An",
        dienThoai: "0987654321",
        email: "an.nguyen@gmail.com"
      },
      ngayGui: "2026-10-05T14:10:00",
      moTaLoi: "Loa ngoài bên phải bị rè nặng khi mở âm lượng trên 60%, đặc biệt khi nghe các bài nhạc có âm bass trầm.",
      dienThoaiLienHe: "0987654321",
      ghiChuKhachHang: "Tôi có thể mang máy đến cửa hàng vào chiều thứ 7 tuần này.",
      trangThai: 0, // Chờ tiếp nhận (Chưa có nhân viên phụ trách)
      nhanVienTiepNhan: null,
      ngayTiepNhan: null,
      ngayHoanThanh: null,
      ghiChuXuLy: null,
      lyDoTuChoi: null
    },
    {
      id: 3,
      maYeuCau: "YCBH-2501",
      idBaoHanh: 2,
      maPhieuBaoHanh: "BH-LP002-2025",
      soImei: "LP002000011318",
      tenLaptop: "Dell XPS 13 Plus 9320",
      khachHang: {
        id: 2,
        hoTen: "Lê Hoàng Long",
        dienThoai: "0903123456",
        email: "long.le@gmail.com"
      },
      ngayGui: "2025-11-12T10:15:00",
      moTaLoi: "Phím Spacebar và phím Enter bị kẹt, gõ không nảy và đôi khi bị dính kép ký tự khi soạn thảo văn bản.",
      dienThoaiLienHe: "0903123456",
      ghiChuKhachHang: "Máy còn nguyên tem bảo hành, chưa từng sửa chữa ngoài.",
      trangThai: 3, // Hoàn thành
      nhanVienTiepNhan: "Nguyễn Minh Đức (NV001)",
      ngayTiepNhan: "2025-11-12T11:00:00",
      ngayHoanThanh: "2025-11-15T16:00:00",
      ghiChuXuLy: "Vệ sinh cơ cấu phím xương bướm và thay thế cụm phím mới theo diện bảo hành tiêu chuẩn của hãng.",
      lyDoTuChoi: null
    },
    {
      id: 4,
      maYeuCau: "YCBH-2603",
      idBaoHanh: 3,
      maPhieuBaoHanh: "BH-LP012-2026",
      soImei: "LP012000019284",
      tenLaptop: "Asus ROG Zephyrus G14 (2024)",
      khachHang: {
        id: 3,
        hoTen: "Phạm Minh Tuấn",
        dienThoai: "0938889999",
        email: "tuan.pham@gmail.com"
      },
      ngayGui: "2026-04-15T11:20:00",
      moTaLoi: "Laptop không lên nguồn sau khi bị đổ nước ngọt lên mặt bàn phím. Cắm sạc đèn báo nguồn không sáng.",
      dienThoaiLienHe: "0938889999",
      ghiChuKhachHang: "Nhờ cửa hàng kiểm tra xem có khắc phục được không.",
      trangThai: 4, // Từ chối
      nhanVienTiepNhan: "Nguyễn Thanh Liêm (NV002)",
      ngayTiepNhan: "2026-04-15T13:30:00",
      ngayHoanThanh: "2026-04-16T10:00:00",
      ghiChuXuLy: null,
      lyDoTuChoi: "Kỹ thuật kiểm tra phát hiện bo mạch chủ và pin bị ngấm chất lỏng oxy hóa cháy mạch. Căn cứ quy định bảo hành, sản phẩm bị tổn hại do chất lỏng/người dùng nên bị từ chối bảo hành miễn phí. Đã lập biên bản bàn giao giải thích cho khách hàng."
    },
    {
      id: 5,
      maYeuCau: "YCBH-2604",
      idBaoHanh: 4,
      maPhieuBaoHanh: "BH-LP025-2026",
      soImei: "LP025000041290",
      tenLaptop: "Lenovo ThinkPad X1 Carbon Gen 11",
      khachHang: {
        id: 4,
        hoTen: "Vũ Thu Trang",
        dienThoai: "0977112233",
        email: "trang.vu@gmail.com"
      },
      ngayGui: "2026-10-01T09:00:00",
      moTaLoi: "Bàn di chuột Touchpad thỉnh thoảng bị trôi con trỏ hoặc nhảy chuột khi cắm sạc pin zin theo máy.",
      dienThoaiLienHe: "0977112233",
      ghiChuKhachHang: "Nếu phải giữ máy xin cho tôi mượn máy tạm để làm việc.",
      trangThai: 1, // Đã tiếp nhận
      nhanVienTiepNhan: "Nguyễn Minh Đức (NV001)",
      ngayTiepNhan: "2026-10-01T10:30:00",
      ngayHoanThanh: null,
      ghiChuXuLy: "Đã liên hệ khách hàng xác nhận tình trạng, hẹn tiếp nhận máy tại cửa hàng để đo đạc tiếp địa sạc và firmware touchpad.",
      lyDoTuChoi: null
    },
    {
      id: 6,
      maYeuCau: "YCBH-2605",
      idBaoHanh: 5,
      maPhieuBaoHanh: "BH-LP033-2026",
      soImei: "LP033000088124",
      tenLaptop: "Acer Predator Helios Neo 16",
      khachHang: {
        id: 5,
        hoTen: "Hoàng Đức Nam",
        dienThoai: "0918765432",
        email: "nam.hoang@gmail.com"
      },
      ngayGui: "2026-10-03T16:00:00",
      moTaLoi: "Quạt tản nhiệt GPU phát ra tiếng kêu cạch cạch to bất thường khi chạy tác vụ nặng, nhiệt độ GPU tăng nhanh lên 88 độ C.",
      dienThoaiLienHe: "0918765432",
      ghiChuKhachHang: "Đã mang máy gửi trực tiếp tại store chiều hôm qua.",
      trangThai: 2, // Đang xử lý
      nhanVienTiepNhan: "Nguyễn Minh Đức (NV001)",
      ngayTiepNhan: "2026-10-04T08:30:00",
      ngayHoanThanh: null,
      ghiChuXuLy: "Đang tiến hành tháo cụm tản nhiệt vapor chamber để thay thế module quạt tản nhiệt GPU mới chính hãng.",
      lyDoTuChoi: null
    }
  ]
};

// ============================================================================
// HELPER FUNCTIONS (DÙNG CHUNG CHO BẢO HÀNH)
// ============================================================================

/**
 * Tính trạng thái hiển thị của phiếu bảo hành
 * @returns { 'ACTIVE' | 'EXPIRED' | 'REVOKED' }
 */
function getWarrantyStatusKey(warranty) {
  if (!warranty) return 'EXPIRED';

  // 1. Ưu tiên statusKey chuẩn từ backend (statusKeyBaoHanh hoặc statusKey)
  if (warranty.statusKeyBaoHanh) return String(warranty.statusKeyBaoHanh).toUpperCase();
  if (warranty.statusKey) return String(warranty.statusKey).toUpperCase();

  // 2. Kiểm tra trạng thái thu hồi / vô hiệu (chỉ khi có giá trị khác null và undefined)
  const rawStatus = (warranty.trangThaiBaoHanh !== undefined && warranty.trangThaiBaoHanh !== null)
    ? warranty.trangThaiBaoHanh
    : warranty.trangThai;

  if (rawStatus !== null && rawStatus !== undefined && Number(rawStatus) === 0) {
    return 'REVOKED'; // 0: Ngừng hiệu lực
  }

  // 3. Kiểm tra hạn bảo hành
  const expiryRaw = warranty.ngayHetHanBaoHanh || warranty.ngayHetHan;
  if (!expiryRaw) return 'ACTIVE';

  const expiryDate = new Date(expiryRaw);
  const now = new Date();
  if (!isNaN(expiryDate.getTime()) && expiryDate < now) {
    return 'EXPIRED'; // Quá hạn
  }

  return 'ACTIVE'; // Còn hạn
}

/**
 * Trả về badge HTML cho phiếu bảo hành
 */
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

/**
 * Trả về badge HTML cho yêu cầu bảo hành (INT: 0..4)
 */
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

/**
 * Định dạng ngày dd/MM/yyyy hoặc dd/MM/yyyy HH:mm
 */
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
