package com.laptopstore.service.impl;

import com.laptopstore.dto.WarrantyResponseDTO;
import com.laptopstore.dto.WarrantyStatsDTO;
import com.laptopstore.entity.*;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.*;
import com.laptopstore.service.BaoHanhService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BaoHanhServiceImpl implements BaoHanhService {

    private final BaoHanhRepository baoHanhRepository;
    private final ChiTietHoaDonImeiRepository chiTietHoaDonImeiRepository;
    private final YeuCauBaoHanhRepository yeuCauBaoHanhRepository;
    private final HinhAnhRepository hinhAnhRepository;
    private final HoaDonRepository hoaDonRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;

    @Override
    public List<BaoHanh> getAll() {
        return baoHanhRepository.findAll();
    }

    @Override
    public BaoHanh getById(Integer id) {
        return baoHanhRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu bảo hành", "id", id));
    }

    @Override
    public BaoHanh getByMaPhieu(String maPhieu) {
        return baoHanhRepository.findByMaPhieu(maPhieu)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu bảo hành", "maPhieu", maPhieu));
    }

    @Override
    public BaoHanh getByImei(Integer imeiId) {
        return baoHanhRepository.findByImeiId(imeiId)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu bảo hành", "imeiId", imeiId));
    }

    @Override
    public BaoHanh getBySoImei(String soImei) {
        return baoHanhRepository.findByImeiSoImei(soImei)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu bảo hành", "soImei", soImei));
    }

    @Override
    public BaoHanh create(BaoHanh baoHanh) {
        return baoHanhRepository.save(baoHanh);
    }

    @Override
    public BaoHanh update(Integer id, BaoHanh baoHanh) {
        BaoHanh existing = getById(id);
        existing.setMaPhieu(baoHanh.getMaPhieu());
        existing.setNgayKichHoat(baoHanh.getNgayKichHoat());
        existing.setNgayHetHan(baoHanh.getNgayHetHan());
        existing.setTrangThai(baoHanh.getTrangThai());
        if (baoHanh.getImei() != null) {
            existing.setImei(baoHanh.getImei());
        }
        return baoHanhRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        BaoHanh existing = getById(id);
        baoHanhRepository.delete(existing);
    }

    // =========================================================================
    // BƯỚC 2: CÁC PHƯƠNG THỨC ĐỒNG BỘ DỮ LIỆU ĐỌC
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public WarrantyStatsDTO getWarrantyStats() {
        List<BaoHanh> list = baoHanhRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        long ngungHieuLuc = 0;
        long hetHan = 0;
        long conHan = 0;

        for (BaoHanh bh : list) {
            int st = bh.getTrangThai() != null ? bh.getTrangThai() : 1;
            if (st == 0) {
                ngungHieuLuc++;
            } else if (bh.getNgayHetHan() != null && bh.getNgayHetHan().isBefore(now)) {
                hetHan++;
            } else {
                conHan++;
            }
        }

        return WarrantyStatsDTO.builder()
                .tongSo(list.size())
                .conHan(conHan)
                .hetHan(hetHan)
                .ngungHieuLuc(ngungHieuLuc)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarrantyResponseDTO> getAdminWarrantyList(String search, String status) {
        List<BaoHanh> list = baoHanhRepository.findAllByOrderByNgayKichHoatDescIdDesc();
        if (list.isEmpty()) {
            return Collections.emptyList();
        }

        List<WarrantyResponseDTO> dtoList = list.stream()
                .map(this::mapToWarrantyResponseDTO)
                .toList();

        final String s = (search != null) ? search.trim().toLowerCase() : "";
        final String f = (status != null && !status.isBlank()) ? status.trim().toUpperCase() : "ALL";

        return dtoList.stream().filter(item -> {
            boolean matchSearch = s.isEmpty()
                    || (item.getMaPhieu() != null && item.getMaPhieu().toLowerCase().contains(s))
                    || (item.getSoImei() != null && item.getSoImei().toLowerCase().contains(s))
                    || (item.getTenLaptop() != null && item.getTenLaptop().toLowerCase().contains(s))
                    || (item.getTenKhachHang() != null && item.getTenKhachHang().toLowerCase().contains(s));

            if (!matchSearch) return false;

            if ("ALL".equals(f)) return true;
            return f.equals(item.getStatusKey());
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WarrantyResponseDTO getAdminWarrantyDetail(Integer id) {
        BaoHanh bh = getById(id);
        return mapToWarrantyResponseDTO(bh);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarrantyResponseDTO> getCustomerWarrantyList(Integer customerId) {
        if (customerId == null) {
            return Collections.emptyList();
        }
        List<BaoHanh> list = baoHanhRepository.findWarrantiesByKhachHangId(customerId);
        return list.stream().map(this::mapToWarrantyResponseDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WarrantyResponseDTO getCustomerWarrantyDetail(Integer id, Integer customerId) {
        if (id == null || customerId == null) {
            return null;
        }
        boolean owned = baoHanhRepository.isWarrantyOwnedByCustomer(id, customerId);
        if (!owned) {
            return null; // Không thuộc quyền sở hữu của khách hàng (chống IDOR)
        }
        BaoHanh bh = getById(id);
        return mapToWarrantyResponseDTO(bh);
    }

    // --- Helper mapping ---
    private WarrantyResponseDTO mapToWarrantyResponseDTO(BaoHanh bh) {
        if (bh == null) return null;

        Imei imei = bh.getImei();
        ChiTietSanPham ctsp = (imei != null) ? imei.getChiTietSanPham() : null;
        SanPham sp = (ctsp != null) ? ctsp.getSanPham() : null;

        String tenLaptop = (sp != null && sp.getTenSp() != null) ? sp.getTenSp() : "Laptop";
        String cauHinh = buildCauHinhSummary(ctsp);
        String hinhAnh = getProductImageUrl(sp, ctsp);

        // Truy xuất hóa đơn & khách hàng qua chi_tiet_hoa_don_imei
        ChiTietHoaDonImei cthdi = (imei != null)
                ? chiTietHoaDonImeiRepository.findByImeiId(imei.getId()).orElse(null)
                : null;

        HoaDon hd = (cthdi != null && cthdi.getChiTietHoaDon() != null)
                ? cthdi.getChiTietHoaDon().getHoaDon()
                : null;

        NguoiDung kh = (hd != null) ? hd.getKhachHang() : null;

        String maHoaDon = (hd != null && hd.getMa() != null) ? hd.getMa() : "---";
        Integer idKhachHang = (kh != null) ? kh.getId() : null;
        String tenKhachHang = (kh != null && kh.getTen() != null)
                ? kh.getTen()
                : ((hd != null && hd.getTenNguoiNhan() != null) ? hd.getTenNguoiNhan() : "Khách vãng lai");
        String sdtKhachHang = (hd != null && hd.getDienThoai() != null && !hd.getDienThoai().isBlank())
                ? hd.getDienThoai()
                : ((kh != null && kh.getDienThoai() != null) ? kh.getDienThoai() : "---");
        String emailKhachHang = (kh != null && kh.getEmail() != null) ? kh.getEmail() : "---";
        String diaChiKhachHang = (hd != null && hd.getDiaChi() != null && !hd.getDiaChi().isBlank())
                ? hd.getDiaChi()
                : ((kh != null && kh.getDiaChi() != null) ? kh.getDiaChi() : "---");

        // Tính toán trạng thái
        LocalDateTime now = LocalDateTime.now();
        int st = bh.getTrangThai() != null ? bh.getTrangThai() : 1;
        String statusKey;
        if (st == 0) {
            statusKey = "REVOKED";
        } else if (bh.getNgayHetHan() != null && bh.getNgayHetHan().isBefore(now)) {
            statusKey = "EXPIRED";
        } else {
            statusKey = "ACTIVE";
        }

        // Tính thời hạn tháng
        int thoiHanThang = 12;
        if (bh.getNgayKichHoat() != null && bh.getNgayHetHan() != null) {
            long months = ChronoUnit.MONTHS.between(bh.getNgayKichHoat(), bh.getNgayHetHan());
            if (months > 0) {
                thoiHanThang = (int) months;
            }
        }

        int soLanYeuCau = yeuCauBaoHanhRepository.countByBaoHanhId(bh.getId());

        return WarrantyResponseDTO.builder()
                .id(bh.getId())
                .maPhieu(bh.getMaPhieu())
                .idImei(imei != null ? imei.getId() : null)
                .soImei(imei != null ? imei.getSoImei() : "")
                .tenLaptop(tenLaptop)
                .cauHinh(cauHinh)
                .hinhAnh(hinhAnh)
                .maHoaDon(maHoaDon)
                .idKhachHang(idKhachHang)
                .tenKhachHang(tenKhachHang)
                .soDienThoaiKhachHang(sdtKhachHang)
                .emailKhachHang(emailKhachHang)
                .diaChiKhachHang(diaChiKhachHang)
                .ngayKichHoat(bh.getNgayKichHoat())
                .ngayHetHan(bh.getNgayHetHan())
                .thoiHanThang(thoiHanThang)
                .trangThai(st)
                .statusKey(statusKey)
                .soLanYeuCau(soLanYeuCau)
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

    private String getProductImageUrl(SanPham sp, ChiTietSanPham ctsp) {
        if (sp != null && sp.getId() != null) {
            List<HinhAnh> imgs = hinhAnhRepository.findBySanPhamId(sp.getId());
            if (!imgs.isEmpty() && imgs.get(0).getUrlHinhAnh() != null && !imgs.get(0).getUrlHinhAnh().isBlank()) {
                return imgs.get(0).getUrlHinhAnh();
            }
        }
        return "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80";
    }

    // ==============================================================
    // BƯỚC 3: TỰ ĐỘNG KÍCH HOẠT BẢO HÀNH 12 THÁNG KHI HÓA ĐƠN HOÀN THÀNH
    // ==============================================================
    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<BaoHanh> kichHoatBaoHanhTheoHoaDon(Integer idHoaDon) {
        if (idHoaDon == null) {
            throw new IllegalArgumentException("ID hóa đơn không được để trống khi kích hoạt bảo hành.");
        }

        // 1. Lấy hóa đơn từ Database
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn", "id", idHoaDon));

        // 2. Kiểm tra điều kiện hóa đơn: chỉ kích hoạt khi hóa đơn ở trạng thái 3 (Hoàn thành)
        Integer hdStatus = hoaDon.getTrangThai();
        if (hdStatus == null || hdStatus != 3) {
            throw new IllegalStateException(String.format(
                    "Chỉ kích hoạt bảo hành khi hóa đơn ở trạng thái 'Hoàn thành' (3). Hóa đơn %s có trạng thái: %s",
                    hoaDon.getMa(), hdStatus));
        }

        // 3. Kiểm tra điều kiện thanh toán: chỉ kích hoạt khi thanh toán có trạng thái 1 (Đã thanh toán)
        ThanhToan thanhToan = hoaDon.getThanhToan();
        if (thanhToan == null || thanhToan.getTrangThai() == null || thanhToan.getTrangThai() != 1) {
            throw new IllegalStateException(String.format(
                    "Chỉ kích hoạt bảo hành khi hóa đơn đã được thanh toán thành công (thanh_toan.trang_thai = 1). Hóa đơn %s chưa hoàn tất thanh toán.",
                    hoaDon.getMa()));
        }

        // 4. Lấy toàn bộ IMEI thuộc hóa đơn thông qua chi_tiet_hoa_don_imei
        List<ChiTietHoaDonImei> cthdImeis = chiTietHoaDonImeiRepository.findByChiTietHoaDonHoaDonId(idHoaDon);
        if (cthdImeis == null || cthdImeis.isEmpty()) {
            throw new IllegalStateException(String.format(
                    "Hóa đơn %s chưa có IMEI nào được phân bổ trong chi_tiet_hoa_don_imei. Không thể kích hoạt bảo hành.",
                    hoaDon.getMa()));
        }

        // 5. Kiểm tra tính hợp lệ của mapping IMEI so với tổng số lượng mua trong hóa đơn
        List<ChiTietHoaDon> cthdList = chiTietHoaDonRepository.findByHoaDonId(idHoaDon);
        int expectedQuantity = cthdList.stream()
                .mapToInt(c -> c.getSoLuong() != null ? c.getSoLuong() : 0)
                .sum();

        if (cthdImeis.size() != expectedQuantity) {
            throw new IllegalStateException(String.format(
                    "Hóa đơn %s yêu cầu phân bổ %d IMEI theo số lượng đặt mua, nhưng chỉ tìm thấy %d IMEI được gán. Dữ liệu không hợp lệ để kích hoạt bảo hành.",
                    hoaDon.getMa(), expectedQuantity, cthdImeis.size()));
        }

        List<BaoHanh> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime ngayHetHan = now.plusMonths(12);

        // 6 & 7. Tạo phiếu bảo hành cho từng IMEI (1 IMEI -> 1 Phiếu bảo hành riêng)
        for (ChiTietHoaDonImei cti : cthdImeis) {
            Imei imei = cti.getImei();
            if (imei == null || imei.getId() == null) {
                throw new IllegalStateException("Chi tiết hóa đơn IMEI chứa bản ghi IMEI không hợp lệ.");
            }

            // Chống tạo trùng: Kiểm tra IMEI đã có phiếu bảo hành trong bao_hanh chưa
            Optional<BaoHanh> existingBhOpt = baoHanhRepository.findByImeiId(imei.getId());
            if (existingBhOpt.isPresent()) {
                // Đã có phiếu bảo hành -> Giữ nguyên, không tạo trùng và không thay đổi ngày kích hoạt/hết hạn phiếu cũ
                result.add(existingBhOpt.get());
                continue;
            }

            // Tạo phiếu bảo hành mới (Mặc định 12 tháng, có hiệu lực = 1)
            BaoHanh newBh = BaoHanh.builder()
                    .imei(imei)
                    .ngayKichHoat(now)
                    .ngayHetHan(ngayHetHan)
                    .trangThai(1) // 1: Có hiệu lực
                    .maPhieu("BH-TEMP-" + UUID.randomUUID().toString().substring(0, 8))
                    .build();

            BaoHanh savedBh = baoHanhRepository.save(newBh);

            // Sinh mã phiếu duy nhất theo ID: BH-000001, BH-000002...
            savedBh.setMaPhieu(String.format("BH-%06d", savedBh.getId()));
            savedBh = baoHanhRepository.save(savedBh);

            result.add(savedBh);
        }

        return result;
    }

    @Override
    @EventListener(ApplicationReadyEvent.class)
    @Order(1)
    @Transactional(rollbackFor = Exception.class)
    public void dongBoBaoHanhChoHoaDonDaHoanThanh() {
        try {
            List<HoaDon> completedList = hoaDonRepository.findByTrangThai(3);
            if (completedList == null || completedList.isEmpty()) {
                return;
            }
            for (HoaDon hd : completedList) {
                try {
                    if (hd.getThanhToan() != null && Integer.valueOf(1).equals(hd.getThanhToan().getTrangThai())) {
                        kichHoatBaoHanhTheoHoaDon(hd.getId());
                    }
                } catch (Exception ignored) {
                    // Bỏ qua nếu hóa đơn thiếu IMEI phân bổ hoặc đã được kích hoạt trước đó
                }
            }
        } catch (Exception ignored) {
        }
    }
}
