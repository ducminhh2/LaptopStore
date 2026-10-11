package com.laptopstore.service.impl;

import com.laptopstore.dto.WarrantyRequestCreateDTO;
import com.laptopstore.dto.WarrantyRequestResponseDTO;
import com.laptopstore.dto.WarrantyRequestStatsDTO;
import com.laptopstore.entity.*;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.BaoHanhRepository;
import com.laptopstore.repository.ChiTietHoaDonImeiRepository;
import com.laptopstore.repository.HinhAnhRepository;
import com.laptopstore.repository.NguoiDungRepository;
import com.laptopstore.repository.YeuCauBaoHanhRepository;
import com.laptopstore.service.YeuCauBaoHanhService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class YeuCauBaoHanhServiceImpl implements YeuCauBaoHanhService {

    private final YeuCauBaoHanhRepository yeuCauBaoHanhRepository;
    private final BaoHanhRepository baoHanhRepository;
    private final ChiTietHoaDonImeiRepository chiTietHoaDonImeiRepository;
    private final HinhAnhRepository hinhAnhRepository;
    private final NguoiDungRepository nguoiDungRepository;

    @Override
    public List<YeuCauBaoHanh> getAll() {
        return yeuCauBaoHanhRepository.findAllByOrderByNgayYeuCauDescIdDesc();
    }

    @Override
    public YeuCauBaoHanh getById(Integer id) {
        return yeuCauBaoHanhRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu bảo hành", "id", id));
    }

    // =========================================================================
    // BƯỚC 4: KHÁCH HÀNG GỬI YÊU CẦU BẢO HÀNH
    // =========================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WarrantyRequestResponseDTO guiYeuCauBaoHanh(WarrantyRequestCreateDTO request, Integer customerId) {
        if (customerId == null) {
            throw new IllegalArgumentException("Vui lòng đăng nhập tài khoản khách hàng để gửi yêu cầu bảo hành.");
        }
        NguoiDung customer = nguoiDungRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", "id", customerId));

        if (request == null || request.getIdBaoHanh() == null) {
            throw new IllegalArgumentException("Thông tin phiếu bảo hành không hợp lệ.");
        }

        // Khóa bi quan bản ghi Bảo Hành để chống gửi trùng khi có hai request đồng thời
        BaoHanh bh = baoHanhRepository.findByIdForUpdate(request.getIdBaoHanh())
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu bảo hành", "id", request.getIdBaoHanh()));

        // 1. Kiểm tra quyền sở hữu IMEI thông qua hóa đơn đã hoàn thành (trangThai=3) và đã thanh toán (thanhToan.trangThai=1)
        boolean owned = baoHanhRepository.isWarrantyOwnedByCustomer(bh.getId(), customerId);
        if (!owned) {
            throw new SecurityException("Bạn không sở hữu laptop có phiếu bảo hành này hoặc hóa đơn mua hàng chưa hoàn tất thanh toán!");
        }

        // 2. Kiểm tra hiệu lực bảo hành (trangThai = 1)
        if (bh.getTrangThai() == null || bh.getTrangThai() != 1) {
            throw new IllegalStateException("Phiếu bảo hành này đã ngừng hiệu lực, không thể gửi yêu cầu hỗ trợ.");
        }

        // 3. Kiểm tra thời hạn bảo hành (chưa hết hạn)
        LocalDateTime now = LocalDateTime.now();
        if (bh.getNgayHetHan() != null && bh.getNgayHetHan().isBefore(now)) {
            throw new IllegalStateException("Phiếu bảo hành này đã hết hạn, không thể gửi yêu cầu hỗ trợ miễn phí.");
        }

        // 4. Kiểm tra không có yêu cầu bảo hành trạng thái 0, 1 hoặc 2 đang mở cho cùng phiếu bảo hành
        boolean hasOpenRequest = yeuCauBaoHanhRepository.existsOpenRequestByBaoHanhId(bh.getId());
        if (hasOpenRequest) {
            throw new IllegalStateException("Thiết bị này đang có một yêu cầu bảo hành khác đang chờ tiếp nhận hoặc đang trong quá trình xử lý!");
        }

        // 5. Validation dữ liệu đầu vào:
        // Mô tả lỗi: 10 - 1000 ký tự
        if (request.getMoTaLoi() == null || request.getMoTaLoi().trim().length() < 10) {
            throw new IllegalArgumentException("Mô tả sự cố phải có tối thiểu 10 ký tự.");
        }
        String cleanMoTa = request.getMoTaLoi().trim();
        if (cleanMoTa.length() > 1000) {
            throw new IllegalArgumentException("Mô tả sự cố không được vượt quá 1000 ký tự.");
        }

        // Số điện thoại Việt Nam: 10 chữ số bắt đầu bằng số 0
        if (request.getDienThoaiLienHe() == null || !request.getDienThoaiLienHe().trim().matches("^0[0-9]{9}$")) {
            throw new IllegalArgumentException("Số điện thoại liên hệ không hợp lệ (phải đúng 10 chữ số và bắt đầu bằng số 0).");
        }
        String cleanPhone = request.getDienThoaiLienHe().trim();

        // Ghi chú tối đa 500 ký tự
        String cleanNote = null;
        if (request.getGhiChuKhachHang() != null && !request.getGhiChuKhachHang().trim().isEmpty()) {
            cleanNote = request.getGhiChuKhachHang().trim();
            if (cleanNote.length() > 500) {
                throw new IllegalArgumentException("Ghi chú bổ sung không được vượt quá 500 ký tự.");
            }
        }

        // 6. Tạo mới thực thể YeuCauBaoHanh
        // Tự sinh mã yêu cầu duy nhất theo ID bản ghi
        YeuCauBaoHanh entity = YeuCauBaoHanh.builder()
                .maYeuCau("TEMP-" + UUID.randomUUID().toString().substring(0, 8))
                .baoHanh(bh)
                .khachHang(customer)
                .nhanVien(null)                  // id_nhan_vien = NULL
                .moTaLoi(cleanMoTa)
                .dienThoaiLienHe(cleanPhone)
                .ghiChuKhachHang(cleanNote)
                .ngayYeuCau(now)
                .ngayTiepNhan(null)              // Chưa tiếp nhận
                .ngayBatDauXuLy(null)            // Chưa xử lý
                .ngayHoanThanh(null)             // Chưa hoàn thành
                .trangThai(0)                    // Trạng thái mặc định: 0 (Chờ tiếp nhận)
                .ghiChuXuLy(null)
                .lyDoTuChoi(null)
                .build();

        YeuCauBaoHanh saved = yeuCauBaoHanhRepository.save(entity);
        saved.setMaYeuCau(String.format("YCBH-%06d", saved.getId()));
        saved = yeuCauBaoHanhRepository.save(saved);

        return mapToRequestDTO(saved);
    }

    // =========================================================================
    // BƯỚC 2: CÁC PHƯƠNG THỨC ĐỒNG BỘ DỮ LIỆU ĐỌC
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public WarrantyRequestStatsDTO getRequestStats() {
        long c0 = yeuCauBaoHanhRepository.countByTrangThai(0);
        long c1 = yeuCauBaoHanhRepository.countByTrangThai(1);
        long c2 = yeuCauBaoHanhRepository.countByTrangThai(2);
        long c3 = yeuCauBaoHanhRepository.countByTrangThai(3);
        long c4 = yeuCauBaoHanhRepository.countByTrangThai(4);
        long total = yeuCauBaoHanhRepository.count();

        return WarrantyRequestStatsDTO.builder()
                .choTiepNhan(c0)
                .daTiepNhan(c1)
                .dangXuLy(c2)
                .hoanThanh(c3)
                .tuChoi(c4)
                .tongSo(total)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarrantyRequestResponseDTO> getAdminRequestList(String search, Integer status) {
        List<YeuCauBaoHanh> list = yeuCauBaoHanhRepository.findAllByOrderByNgayYeuCauDescIdDesc();
        if (list.isEmpty()) {
            return Collections.emptyList();
        }

        List<WarrantyRequestResponseDTO> dtoList = list.stream()
                .map(this::mapToRequestDTO)
                .toList();

        final String s = (search != null) ? search.trim().toLowerCase() : "";

        return dtoList.stream().filter(item -> {
            boolean matchSearch = s.isEmpty()
                    || (item.getMaYeuCau() != null && item.getMaYeuCau().toLowerCase().contains(s))
                    || (item.getSoImei() != null && item.getSoImei().toLowerCase().contains(s))
                    || (item.getTenLaptop() != null && item.getTenLaptop().toLowerCase().contains(s))
                    || (item.getTenKhachHang() != null && item.getTenKhachHang().toLowerCase().contains(s));

            if (!matchSearch) return false;

            if (status == null) return true;
            return status.equals(item.getTrangThai());
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WarrantyRequestResponseDTO getAdminRequestDetail(Integer id) {
        YeuCauBaoHanh req = getById(id);
        return mapToRequestDTO(req);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarrantyRequestResponseDTO> getCustomerRequestList(Integer customerId) {
        if (customerId == null) {
            return Collections.emptyList();
        }
        List<YeuCauBaoHanh> list = yeuCauBaoHanhRepository.findByKhachHangIdOrderByNgayYeuCauDescIdDesc(customerId);
        return list.stream().map(this::mapToRequestDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WarrantyRequestResponseDTO getCustomerRequestDetail(Integer id, Integer customerId) {
        if (id == null || customerId == null) {
            return null;
        }
        YeuCauBaoHanh req = getById(id);
        if (req.getKhachHang() == null || !customerId.equals(req.getKhachHang().getId())) {
            return null; // Không thuộc quyền sở hữu của khách hàng (Chống IDOR)
        }
        return mapToRequestDTO(req);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarrantyRequestResponseDTO> getRequestsByImei(String soImei) {
        if (soImei == null || soImei.isBlank()) {
            return Collections.emptyList();
        }
        List<YeuCauBaoHanh> list = yeuCauBaoHanhRepository.findByBaoHanhImeiSoImeiOrderByNgayYeuCauDescIdDesc(soImei.trim());
        return list.stream().map(this::mapToRequestDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WarrantyRequestResponseDTO getFormInfoByBaoHanhId(Integer baoHanhId, Integer customerId) {
        if (baoHanhId == null) return null;

        // Kiểm tra quyền sở hữu của khách hàng nếu customerId được cung cấp
        if (customerId != null) {
            boolean owned = baoHanhRepository.isWarrantyOwnedByCustomer(baoHanhId, customerId);
            if (!owned) {
                return null; // Không sở hữu laptop này
            }
        }

        BaoHanh bh = baoHanhRepository.findById(baoHanhId)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu bảo hành", "id", baoHanhId));

        Imei imei = bh.getImei();
        ChiTietSanPham ctsp = (imei != null) ? imei.getChiTietSanPham() : null;
        SanPham sp = (ctsp != null) ? ctsp.getSanPham() : null;

        String tenLaptop = (sp != null && sp.getTenSp() != null) ? sp.getTenSp() : "Laptop";
        String cauHinh = buildCauHinhSummary(ctsp);
        String hinhAnh = getProductImageUrl(sp);

        ChiTietHoaDonImei cthdi = (imei != null)
                ? chiTietHoaDonImeiRepository.findByImeiId(imei.getId()).orElse(null)
                : null;
        String maHoaDon = (cthdi != null && cthdi.getChiTietHoaDon() != null && cthdi.getChiTietHoaDon().getHoaDon() != null)
                ? cthdi.getChiTietHoaDon().getHoaDon().getMa() : "---";

        LocalDateTime now = LocalDateTime.now();
        int stBh = bh.getTrangThai() != null ? bh.getTrangThai() : 1;
        String statusKey;
        if (stBh == 0) {
            statusKey = "REVOKED";
        } else if (bh.getNgayHetHan() != null && bh.getNgayHetHan().isBefore(now)) {
            statusKey = "EXPIRED";
        } else {
            statusKey = "ACTIVE";
        }

        int thoiHanThang = 12;
        if (bh.getNgayKichHoat() != null && bh.getNgayHetHan() != null) {
            long months = ChronoUnit.MONTHS.between(bh.getNgayKichHoat(), bh.getNgayHetHan());
            if (months > 0) thoiHanThang = (int) months;
        }

        // Kiểm tra điều kiện tạo yêu cầu mới (Bước 4 & 5)
        boolean canCreate = true;
        String message = null;

        if (stBh == 0) {
            canCreate = false;
            message = "Phiếu bảo hành đã ngừng hiệu lực, không thể gửi yêu cầu hỗ trợ.";
        } else if (bh.getNgayHetHan() != null && bh.getNgayHetHan().isBefore(now)) {
            canCreate = false;
            message = "Phiếu bảo hành này đã hết hạn, không thể gửi yêu cầu hỗ trợ miễn phí.";
        } else if (yeuCauBaoHanhRepository.existsOpenRequestByBaoHanhId(baoHanhId)) {
            canCreate = false;
            message = "Thiết bị này đang có một yêu cầu bảo hành khác đang chờ tiếp nhận hoặc đang được xử lý.";
        }

        // Lấy số điện thoại từ khách hàng hoặc đơn hàng để gợi ý tự động điền form
        String dienThoaiGoiY = "";
        if (cthdi != null && cthdi.getChiTietHoaDon() != null && cthdi.getChiTietHoaDon().getHoaDon() != null) {
            dienThoaiGoiY = cthdi.getChiTietHoaDon().getHoaDon().getDienThoai();
            if ((dienThoaiGoiY == null || dienThoaiGoiY.isBlank()) && cthdi.getChiTietHoaDon().getHoaDon().getKhachHang() != null) {
                dienThoaiGoiY = cthdi.getChiTietHoaDon().getHoaDon().getKhachHang().getDienThoai();
            }
        }

        return WarrantyRequestResponseDTO.builder()
                .id(bh.getId())
                .idBaoHanh(bh.getId())
                .maPhieuBaoHanh(bh.getMaPhieu())
                .idImei(imei != null ? imei.getId() : null)
                .soImei(imei != null ? imei.getSoImei() : "")
                .tenLaptop(tenLaptop)
                .cauHinh(cauHinh)
                .hinhAnh(hinhAnh)
                .maHoaDon(maHoaDon)
                .dienThoaiLienHe(dienThoaiGoiY)
                .ngayKichHoatBaoHanh(bh.getNgayKichHoat())
                .ngayHetHanBaoHanh(bh.getNgayHetHan())
                .thoiHanThang(thoiHanThang)
                .trangThaiBaoHanh(stBh)
                .statusKeyBaoHanh(statusKey)
                .canCreateRequest(canCreate)
                .message(message)
                .build();
    }

    // --- Helper Mapping ---
    private WarrantyRequestResponseDTO mapToRequestDTO(YeuCauBaoHanh req) {
        if (req == null) return null;

        BaoHanh bh = req.getBaoHanh();
        Imei imei = (bh != null) ? bh.getImei() : null;
        ChiTietSanPham ctsp = (imei != null) ? imei.getChiTietSanPham() : null;
        SanPham sp = (ctsp != null) ? ctsp.getSanPham() : null;

        String tenLaptop = (sp != null && sp.getTenSp() != null) ? sp.getTenSp() : "Laptop";
        String cauHinh = buildCauHinhSummary(ctsp);
        String hinhAnh = getProductImageUrl(sp);

        ChiTietHoaDonImei cthdi = (imei != null)
                ? chiTietHoaDonImeiRepository.findByImeiId(imei.getId()).orElse(null)
                : null;
        String maHoaDon = (cthdi != null && cthdi.getChiTietHoaDon() != null && cthdi.getChiTietHoaDon().getHoaDon() != null)
                ? cthdi.getChiTietHoaDon().getHoaDon().getMa() : "---";

        NguoiDung kh = req.getKhachHang();
        Integer idKhachHang = (kh != null) ? kh.getId() : null;
        String tenKhachHang = (kh != null && kh.getTen() != null) ? kh.getTen() : "Khách hàng";
        String emailKhachHang = (kh != null && kh.getEmail() != null) ? kh.getEmail() : "---";

        NguoiDung nv = req.getNhanVien();
        Integer idNhanVien = (nv != null) ? nv.getId() : null;
        String tenNhanVien = (nv != null && nv.getTen() != null)
                ? (nv.getTen() + (nv.getMa() != null ? " (" + nv.getMa() + ")" : ""))
                : null; // null biểu thị "Chưa tiếp nhận"

        LocalDateTime now = LocalDateTime.now();
        int stBh = (bh != null && bh.getTrangThai() != null) ? bh.getTrangThai() : 1;
        String statusKey;
        if (stBh == 0) {
            statusKey = "REVOKED";
        } else if (bh != null && bh.getNgayHetHan() != null && bh.getNgayHetHan().isBefore(now)) {
            statusKey = "EXPIRED";
        } else {
            statusKey = "ACTIVE";
        }

        int thoiHanThang = 12;
        if (bh != null && bh.getNgayKichHoat() != null && bh.getNgayHetHan() != null) {
            long months = ChronoUnit.MONTHS.between(bh.getNgayKichHoat(), bh.getNgayHetHan());
            if (months > 0) thoiHanThang = (int) months;
        }

        return WarrantyRequestResponseDTO.builder()
                .id(req.getId())
                .maYeuCau(req.getMaYeuCau())
                .idBaoHanh(bh != null ? bh.getId() : null)
                .maPhieuBaoHanh(bh != null ? bh.getMaPhieu() : "")
                .idImei(imei != null ? imei.getId() : null)
                .soImei(imei != null ? imei.getSoImei() : "")
                .tenLaptop(tenLaptop)
                .cauHinh(cauHinh)
                .hinhAnh(hinhAnh)
                .maHoaDon(maHoaDon)
                .idKhachHang(idKhachHang)
                .tenKhachHang(tenKhachHang)
                .emailKhachHang(emailKhachHang)
                .dienThoaiLienHe(req.getDienThoaiLienHe())
                .ghiChuKhachHang(req.getGhiChuKhachHang())
                .moTaLoi(req.getMoTaLoi())
                .ngayGui(req.getNgayYeuCau())
                .ngayTiepNhan(req.getNgayTiepNhan())
                .ngayBatDauXuLy(req.getNgayBatDauXuLy())
                .ngayHoanThanh(req.getNgayHoanThanh())
                .idNhanVien(idNhanVien)
                .tenNhanVien(tenNhanVien)
                .trangThai(req.getTrangThai())
                .ghiChuXuLy(req.getGhiChuXuLy())
                .lyDoTuChoi(req.getLyDoTuChoi())
                .ngayKichHoatBaoHanh(bh != null ? bh.getNgayKichHoat() : null)
                .ngayHetHanBaoHanh(bh != null ? bh.getNgayHetHan() : null)
                .thoiHanThang(thoiHanThang)
                .trangThaiBaoHanh(stBh)
                .statusKeyBaoHanh(statusKey)
                .build();
    }

    private String buildCauHinhSummary(ChiTietSanPham ctsp) {
        if (ctsp == null) return "";
        List<String> parts = new ArrayList<>();
        if (ctsp.getCpu() != null && ctsp.getCpu().getTenCpu() != null) parts.add(ctsp.getCpu().getTenCpu());
        if (ctsp.getRam() != null && ctsp.getRam().getDungLuong() != null) parts.add(ctsp.getRam().getDungLuong());
        if (ctsp.getOCung() != null && ctsp.getOCung().getDungLuong() != null) parts.add(ctsp.getOCung().getDungLuong());
        if (ctsp.getCardDoHoa() != null && ctsp.getCardDoHoa().getTenCard() != null) parts.add(ctsp.getCardDoHoa().getTenCard());
        if (ctsp.getMauSac() != null && ctsp.getMauSac().getTenMau() != null) parts.add(ctsp.getMauSac().getTenMau());
        return String.join(" / ", parts);
    }

    private String getProductImageUrl(SanPham sp) {
        if (sp != null && sp.getId() != null) {
            List<HinhAnh> imgs = hinhAnhRepository.findBySanPhamId(sp.getId());
            if (!imgs.isEmpty() && imgs.get(0).getUrlHinhAnh() != null && !imgs.get(0).getUrlHinhAnh().isBlank()) {
                return imgs.get(0).getUrlHinhAnh();
            }
        }
        return "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80";
    }

    // =========================================================================
    // BƯỚC 5: NGHIỆP VỤ XỬ LÝ YÊU CẦU BẢO HÀNH (DÙNG CHUNG ADMIN & NHÂN VIÊN)
    // =========================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WarrantyRequestResponseDTO tiepNhanYeuCau(Integer id, Integer staffId) {
        NguoiDung staff = validateStaffUser(staffId);
        YeuCauBaoHanh req = yeuCauBaoHanhRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu bảo hành", "id", id));

        // Điều kiện: Chỉ tiếp nhận yêu cầu có trang_thai = 0
        if (req.getTrangThai() == null || req.getTrangThai() != 0) {
            throw new IllegalStateException("Yêu cầu đã được cập nhật bởi người khác hoặc không ở trạng thái Chờ tiếp nhận. Vui lòng tải lại trang.");
        }

        req.setNhanVien(staff);
        req.setNgayTiepNhan(LocalDateTime.now());
        req.setTrangThai(1);

        YeuCauBaoHanh saved = yeuCauBaoHanhRepository.save(req);
        return mapToRequestDTO(saved);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WarrantyRequestResponseDTO tuChoiYeuCau(Integer id, String lyDoTuChoi, Integer staffId) {
        NguoiDung staff = validateStaffUser(staffId);

        // Validation lý do từ chối: bắt buộc, trim khoảng trắng, từ 10 đến 1000 ký tự
        if (lyDoTuChoi == null || lyDoTuChoi.trim().length() < 10) {
            throw new IllegalArgumentException("Lý do từ chối phải có tối thiểu 10 ký tự.");
        }
        String cleanReason = lyDoTuChoi.trim();
        if (cleanReason.length() > 1000) {
            throw new IllegalArgumentException("Lý do từ chối không được vượt quá 1000 ký tự.");
        }

        YeuCauBaoHanh req = yeuCauBaoHanhRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu bảo hành", "id", id));

        // Điều kiện: Chỉ được từ chối yêu cầu trạng thái 0 — Chờ tiếp nhận
        if (req.getTrangThai() == null || req.getTrangThai() != 0) {
            throw new IllegalStateException("Yêu cầu đã được cập nhật bởi người khác hoặc không ở trạng thái Chờ tiếp nhận. Vui lòng tải lại trang.");
        }

        req.setLyDoTuChoi(cleanReason);
        req.setNhanVien(staff); // Gán id_nhan_vien bằng người thực hiện từ chối để ghi nhận trách nhiệm
        req.setTrangThai(4);
        // Không gán ngay_tiep_nhan, ngay_bat_dau_xu_ly hoặc ngay_hoan_thanh

        YeuCauBaoHanh saved = yeuCauBaoHanhRepository.save(req);
        return mapToRequestDTO(saved);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WarrantyRequestResponseDTO batDauXuLy(Integer id, Integer staffId) {
        validateStaffUser(staffId);
        YeuCauBaoHanh req = yeuCauBaoHanhRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu bảo hành", "id", id));

        // Điều kiện: Chỉ được thực hiện khi trang_thai = 1
        if (req.getTrangThai() == null || req.getTrangThai() != 1) {
            throw new IllegalStateException("Yêu cầu đã được cập nhật bởi người khác hoặc không ở trạng thái Đã tiếp nhận. Vui lòng tải lại trang.");
        }

        if (req.getNhanVien() == null) {
            throw new IllegalStateException("Yêu cầu chưa có thông tin nhân viên tiếp nhận hợp lệ.");
        }

        // Không thay đổi id_nhan_vien đã được gán khi tiếp nhận, không ghi đè ngay_tiep_nhan
        req.setNgayBatDauXuLy(LocalDateTime.now());
        req.setTrangThai(2);

        YeuCauBaoHanh saved = yeuCauBaoHanhRepository.save(req);
        return mapToRequestDTO(saved);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WarrantyRequestResponseDTO hoanThanhYeuCau(Integer id, String ghiChuXuLy, Integer staffId) {
        validateStaffUser(staffId);

        // Validation kết quả xử lý: bắt buộc, trim khoảng trắng, từ 10 đến 1000 ký tự
        if (ghiChuXuLy == null || ghiChuXuLy.trim().length() < 10) {
            throw new IllegalArgumentException("Kết quả kiểm tra và xử lý phải có tối thiểu 10 ký tự.");
        }
        String cleanNotes = ghiChuXuLy.trim();
        if (cleanNotes.length() > 1000) {
            throw new IllegalArgumentException("Kết quả kiểm tra và xử lý không được vượt quá 1000 ký tự.");
        }

        YeuCauBaoHanh req = yeuCauBaoHanhRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu bảo hành", "id", id));

        // Điều kiện: Chỉ được hoàn thành khi trang_thai = 2
        if (req.getTrangThai() == null || req.getTrangThai() != 2) {
            throw new IllegalStateException("Yêu cầu đã được cập nhật bởi người khác hoặc không ở trạng thái Đang xử lý. Vui lòng tải lại trang.");
        }

        // Giữ nguyên nhân viên phụ trách tiếp nhận ban đầu
        req.setGhiChuXuLy(cleanNotes);
        req.setNgayHoanThanh(LocalDateTime.now());
        req.setTrangThai(3);

        YeuCauBaoHanh saved = yeuCauBaoHanhRepository.save(req);
        return mapToRequestDTO(saved);
    }

    /**
     * Xác thực người dùng thực hiện có vai trò Admin hoặc Nhân viên.
     * Admin và Nhân viên dùng chung 100% quyền xử lý trong module này.
     */
    private NguoiDung validateStaffUser(Integer staffId) {
        if (staffId == null) {
            throw new IllegalArgumentException("Vui lòng đăng nhập tài khoản Quản trị viên hoặc Nhân viên để xử lý yêu cầu.");
        }
        NguoiDung user = nguoiDungRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", staffId));

        VaiTro vt = user.getVaiTro();
        boolean isStaffOrAdmin = false;
        if (vt != null) {
            Integer roleId = vt.getId();
            String roleName = vt.getTenVaiTro() != null ? vt.getTenVaiTro().toLowerCase() : "";
            if (roleId != null && (roleId == 1 || roleId == 2)) {
                isStaffOrAdmin = true;
            } else if (roleName.contains("admin") || roleName.contains("quản trị")
                    || roleName.contains("nhân viên") || roleName.contains("staff")) {
                isStaffOrAdmin = true;
            }
        }

        if (!isStaffOrAdmin) {
            throw new SecurityException("Tài khoản của bạn không có quyền xử lý yêu cầu bảo hành!");
        }

        return user;
    }
}
