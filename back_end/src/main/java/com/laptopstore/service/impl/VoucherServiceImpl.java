package com.laptopstore.service.impl;

import com.laptopstore.dto.VoucherRequest;
import com.laptopstore.dto.VoucherResponse;
import com.laptopstore.entity.Voucher;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.VoucherRepository;
import com.laptopstore.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;

    @Override
    public List<VoucherResponse> getAllVouchers(String keyword, String statusFilter) {
        List<Voucher> vouchers;
        if (keyword != null && !keyword.trim().isEmpty()) {
            vouchers = voucherRepository.searchByKeyword(keyword.trim());
        } else {
            vouchers = voucherRepository.findAllByOrderByIdDesc();
        }

        LocalDateTime now = LocalDateTime.now();
        return vouchers.stream()
                .map(v -> mapToResponse(v, now))
                .filter(resp -> {
                    if (statusFilter == null || statusFilter.isBlank() || "ALL".equalsIgnoreCase(statusFilter)) {
                        return true;
                    }
                    return statusFilter.equalsIgnoreCase(resp.getTrangThaiHienThi());
                })
                .toList();
    }

    @Override
    public VoucherResponse getVoucherById(Integer id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "id", id));
        return mapToResponse(voucher, LocalDateTime.now());
    }

    @Override
    public VoucherResponse getVoucherByMa(String ma) {
        if (ma == null || ma.isBlank()) {
            throw new IllegalArgumentException("Mã Voucher không được để trống.");
        }
        Voucher voucher = voucherRepository.findByMaIgnoreCase(ma.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "ma", ma.trim()));
        return mapToResponse(voucher, LocalDateTime.now());
    }

    @Override
    @Transactional
    public Voucher createVoucher(VoucherRequest request) {
        validateVoucherRequest(request, null);

        String normalizedMa = request.getMa().trim().toUpperCase(Locale.ROOT);
        if (voucherRepository.existsByMaIgnoreCase(normalizedMa)) {
            throw new IllegalArgumentException("Mã Voucher '" + normalizedMa + "' đã tồn tại.");
        }

        BigDecimal giamToiDa = request.getGiamToiDa();
        if (request.getLoaiGiam() == 2) {
            giamToiDa = null; // Loại giảm số tiền cố định thì giam_toi_da bắt buộc NULL
        }

        BigDecimal donToiThieu = request.getGiaTriDonToiThieu() != null ? request.getGiaTriDonToiThieu() : BigDecimal.ZERO;
        Integer trangThai = request.getTrangThai() != null ? request.getTrangThai() : 1;

        Voucher voucher = Voucher.builder()
                .ma(normalizedMa)
                .tenVoucher(request.getTenVoucher().trim())
                .loaiGiam(request.getLoaiGiam())
                .giaTriGiam(request.getGiaTriGiam())
                .giaTriDonToiThieu(donToiThieu)
                .giamToiDa(giamToiDa)
                .ngayBatDau(request.getNgayBatDau())
                .ngayKetThuc(request.getNgayKetThuc())
                .trangThai(trangThai)
                .build();

        return voucherRepository.save(voucher);
    }

    @Override
    @Transactional
    public Voucher updateVoucher(Integer id, VoucherRequest request) {
        Voucher existing = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "id", id));

        validateVoucherRequest(request, id);

        // Giữ mã Voucher readonly (không đổi mã để đảm bảo an toàn lịch sử)
        // Nhưng nếu request có mã, kiểm tra trùng trừ chính nó
        if (request.getMa() != null && !request.getMa().isBlank()) {
            String checkMa = request.getMa().trim().toUpperCase(Locale.ROOT);
            if (voucherRepository.existsByMaIgnoreCaseAndIdNot(checkMa, id)) {
                throw new IllegalArgumentException("Mã Voucher '" + checkMa + "' đã tồn tại.");
            }
            // Giữ mã ban đầu hoặc cập nhật nếu hợp lệ
            existing.setMa(checkMa);
        }

        existing.setTenVoucher(request.getTenVoucher().trim());
        existing.setLoaiGiam(request.getLoaiGiam());
        existing.setGiaTriGiam(request.getGiaTriGiam());

        BigDecimal donToiThieu = request.getGiaTriDonToiThieu() != null ? request.getGiaTriDonToiThieu() : BigDecimal.ZERO;
        existing.setGiaTriDonToiThieu(donToiThieu);

        if (request.getLoaiGiam() == 2) {
            existing.setGiamToiDa(null); // Luôn NULL khi loại 2
        } else {
            existing.setGiamToiDa(request.getGiamToiDa());
        }

        existing.setNgayBatDau(request.getNgayBatDau());
        existing.setNgayKetThuc(request.getNgayKetThuc());
        if (request.getTrangThai() != null) {
            existing.setTrangThai(request.getTrangThai());
        }

        return voucherRepository.save(existing);
    }

    @Override
    @Transactional
    public void updateTrangThai(Integer id, Integer trangThai) {
        Voucher existing = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "id", id));
        if (trangThai == null || (trangThai != 0 && trangThai != 1)) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ (0: Ngừng hoạt động, 1: Hoạt động).");
        }
        existing.setTrangThai(trangThai);
        voucherRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteVoucher(Integer id) {
        // Soft-delete / Ngừng hoạt động theo yêu cầu thiết kế không xóa cứng
        updateTrangThai(id, 0);
    }

    @Override
    public List<VoucherResponse> getAvailableVouchersForPos(BigDecimal tongTienHang) {
        LocalDateTime now = LocalDateTime.now();
        List<Voucher> activeList = voucherRepository.findActiveVouchersAtDate(now);
        BigDecimal subtotal = (tongTienHang != null && tongTienHang.compareTo(BigDecimal.ZERO) > 0) ? tongTienHang : BigDecimal.ZERO;

        return activeList.stream().map(v -> {
            VoucherResponse res = mapToResponse(v, now);
            BigDecimal minOrder = v.getGiaTriDonToiThieu() != null ? v.getGiaTriDonToiThieu() : BigDecimal.ZERO;
            boolean eligible = subtotal.compareTo(minOrder) >= 0;
            res.setDuDieuKien(eligible);
            if (!eligible) {
                res.setLyDoKhongDuDieuKien(String.format("Đơn tối thiểu %s (Chưa đủ điều kiện)", formatMoney(minOrder)));
            } else {
                res.setLyDoKhongDuDieuKien(null);
            }
            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public com.laptopstore.dto.VoucherCalculationResponse calculateVoucherDiscount(Integer idVoucher, BigDecimal tongTienHang) {
        BigDecimal subtotal = (tongTienHang != null && tongTienHang.compareTo(BigDecimal.ZERO) > 0) ? tongTienHang : BigDecimal.ZERO;

        if (idVoucher == null) {
            return com.laptopstore.dto.VoucherCalculationResponse.builder()
                    .idVoucher(null)
                    .maVoucher(null)
                    .tenVoucher(null)
                    .loaiGiam(null)
                    .giaTriGiam(BigDecimal.ZERO)
                    .tongTienHang(subtotal)
                    .tienGiamVoucher(BigDecimal.ZERO)
                    .khachPhaiTra(subtotal)
                    .hopLe(true)
                    .thongBao("Không áp dụng Voucher.")
                    .build();
        }

        Voucher v = voucherRepository.findById(idVoucher).orElse(null);
        if (v == null) {
            return com.laptopstore.dto.VoucherCalculationResponse.builder()
                    .idVoucher(idVoucher)
                    .tongTienHang(subtotal)
                    .tienGiamVoucher(BigDecimal.ZERO)
                    .khachPhaiTra(subtotal)
                    .hopLe(false)
                    .thongBao("Voucher không tồn tại trong hệ thống.")
                    .build();
        }

        if (v.getTrangThai() == null || v.getTrangThai() != 1) {
            return com.laptopstore.dto.VoucherCalculationResponse.builder()
                    .idVoucher(v.getId())
                    .maVoucher(v.getMa())
                    .tenVoucher(v.getTenVoucher())
                    .loaiGiam(v.getLoaiGiam())
                    .giaTriGiam(v.getGiaTriGiam())
                    .tongTienHang(subtotal)
                    .tienGiamVoucher(BigDecimal.ZERO)
                    .khachPhaiTra(subtotal)
                    .hopLe(false)
                    .thongBao("Voucher hiện không hoạt động.")
                    .build();
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(v.getNgayBatDau())) {
            return com.laptopstore.dto.VoucherCalculationResponse.builder()
                    .idVoucher(v.getId())
                    .maVoucher(v.getMa())
                    .tenVoucher(v.getTenVoucher())
                    .loaiGiam(v.getLoaiGiam())
                    .giaTriGiam(v.getGiaTriGiam())
                    .tongTienHang(subtotal)
                    .tienGiamVoucher(BigDecimal.ZERO)
                    .khachPhaiTra(subtotal)
                    .hopLe(false)
                    .thongBao("Voucher chưa đến ngày bắt đầu áp dụng.")
                    .build();
        }
        if (now.isAfter(v.getNgayKetThuc())) {
            return com.laptopstore.dto.VoucherCalculationResponse.builder()
                    .idVoucher(v.getId())
                    .maVoucher(v.getMa())
                    .tenVoucher(v.getTenVoucher())
                    .loaiGiam(v.getLoaiGiam())
                    .giaTriGiam(v.getGiaTriGiam())
                    .tongTienHang(subtotal)
                    .tienGiamVoucher(BigDecimal.ZERO)
                    .khachPhaiTra(subtotal)
                    .hopLe(false)
                    .thongBao("Voucher đã hết hạn.")
                    .build();
        }

        BigDecimal minOrder = v.getGiaTriDonToiThieu() != null ? v.getGiaTriDonToiThieu() : BigDecimal.ZERO;
        if (subtotal.compareTo(minOrder) < 0) {
            return com.laptopstore.dto.VoucherCalculationResponse.builder()
                    .idVoucher(v.getId())
                    .maVoucher(v.getMa())
                    .tenVoucher(v.getTenVoucher())
                    .loaiGiam(v.getLoaiGiam())
                    .giaTriGiam(v.getGiaTriGiam())
                    .tongTienHang(subtotal)
                    .tienGiamVoucher(BigDecimal.ZERO)
                    .khachPhaiTra(subtotal)
                    .hopLe(false)
                    .thongBao(String.format("Voucher chưa đủ điều kiện giá trị đơn hàng (tối thiểu %s).", formatMoney(minOrder)))
                    .build();
        }

        // Tính tiền giảm
        BigDecimal tienGiam = BigDecimal.ZERO;
        if (v.getLoaiGiam() == 1) { // Giảm %
            BigDecimal rate = v.getGiaTriGiam() != null ? v.getGiaTriGiam() : BigDecimal.ZERO;
            tienGiam = subtotal.multiply(rate).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            if (v.getGiamToiDa() != null && v.getGiamToiDa().compareTo(BigDecimal.ZERO) > 0) {
                tienGiam = tienGiam.min(v.getGiamToiDa());
            }
        } else { // Giảm số tiền
            tienGiam = v.getGiaTriGiam() != null ? v.getGiaTriGiam() : BigDecimal.ZERO;
        }

        // Đảm bảo không giảm quá tổng tiền hàng và không âm
        tienGiam = tienGiam.min(subtotal);
        if (tienGiam.compareTo(BigDecimal.ZERO) < 0) {
            tienGiam = BigDecimal.ZERO;
        }

        BigDecimal khachPhaiTra = subtotal.subtract(tienGiam);
        if (khachPhaiTra.compareTo(BigDecimal.ZERO) < 0) {
            khachPhaiTra = BigDecimal.ZERO;
        }

        return com.laptopstore.dto.VoucherCalculationResponse.builder()
                .idVoucher(v.getId())
                .maVoucher(v.getMa())
                .tenVoucher(v.getTenVoucher())
                .loaiGiam(v.getLoaiGiam())
                .giaTriGiam(v.getGiaTriGiam())
                .tongTienHang(subtotal)
                .tienGiamVoucher(tienGiam)
                .khachPhaiTra(khachPhaiTra)
                .hopLe(true)
                .thongBao(String.format("Áp dụng Voucher %s thành công.", v.getMa()))
                .build();
    }

    /**
     * Xác thực toàn diện các quy tắc nghiệp vụ Voucher
     */
    private void validateVoucherRequest(VoucherRequest request, Integer excludeId) {
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu Voucher không được để trống.");
        }

        // 1. Mã Voucher
        if (request.getMa() == null || request.getMa().trim().isEmpty()) {
            throw new IllegalArgumentException("Mã Voucher không được để trống.");
        }
        String ma = request.getMa().trim();
        if (ma.length() > 50) {
            throw new IllegalArgumentException("Mã Voucher không được vượt quá 50 ký tự.");
        }

        // 2. Tên Voucher
        if (request.getTenVoucher() == null || request.getTenVoucher().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên Voucher không được để trống.");
        }
        if (request.getTenVoucher().trim().length() > 200) {
            throw new IllegalArgumentException("Tên Voucher không được vượt quá 200 ký tự.");
        }

        // 3. Loại giảm
        if (request.getLoaiGiam() == null || (request.getLoaiGiam() != 1 && request.getLoaiGiam() != 2)) {
            throw new IllegalArgumentException("Loại giảm giá không hợp lệ (1: Phần trăm, 2: Số tiền cố định).");
        }

        // 4. Giá trị giảm
        if (request.getGiaTriGiam() == null) {
            throw new IllegalArgumentException("Giá trị giảm không được để trống.");
        }
        if (request.getLoaiGiam() == 1) { // Giảm theo %
            if (request.getGiaTriGiam().compareTo(BigDecimal.ZERO) <= 0 ||
                request.getGiaTriGiam().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("Phần trăm giảm phải lớn hơn 0 và không vượt quá 100%.");
            }
        } else { // Giảm theo số tiền
            if (request.getGiaTriGiam().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Giá trị giảm phải lớn hơn 0.");
            }
        }

        // 5. Đơn tối thiểu
        if (request.getGiaTriDonToiThieu() != null && request.getGiaTriDonToiThieu().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Giá trị đơn tối thiểu không được âm.");
        }

        // 6. Giảm tối đa
        if (request.getLoaiGiam() == 1 && request.getGiamToiDa() != null) {
            if (request.getGiamToiDa().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Mức giảm tối đa phải lớn hơn 0 hoặc để trống (không giới hạn).");
            }
        }

        // 7. Thời gian áp dụng
        if (request.getNgayBatDau() == null || request.getNgayKetThuc() == null) {
            throw new IllegalArgumentException("Ngày bắt đầu và ngày kết thúc không được để trống.");
        }
        if (!request.getNgayBatDau().isBefore(request.getNgayKetThuc())) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu.");
        }

        // 8. Trạng thái
        if (request.getTrangThai() != null && request.getTrangThai() != 0 && request.getTrangThai() != 1) {
            throw new IllegalArgumentException("Trạng thái Voucher không hợp lệ.");
        }
    }

    /**
     * Map Entity sang VoucherResponse với các trạng thái suy ra theo thời gian thực
     */
    private VoucherResponse mapToResponse(Voucher v, LocalDateTime now) {
        String statusText;
        String badgeClass;

        if (v.getTrangThai() == null || v.getTrangThai() == 0) {
            statusText = "Ngừng hoạt động";
            badgeClass = "cancelled";
        } else if (now.isBefore(v.getNgayBatDau())) {
            statusText = "Sắp diễn ra";
            badgeClass = "pending";
        } else if (now.isAfter(v.getNgayKetThuc())) {
            statusText = "Đã kết thúc";
            badgeClass = "shipping";
        } else {
            statusText = "Đang diễn ra";
            badgeClass = "confirmed";
        }

        // Format loại giảm hiển thị
        String loaiGiamHienThi;
        if (v.getLoaiGiam() != null && v.getLoaiGiam() == 1) {
            BigDecimal val = v.getGiaTriGiam() != null ? v.getGiaTriGiam() : BigDecimal.ZERO;
            loaiGiamHienThi = formatDecimal(val) + "%";
        } else {
            loaiGiamHienThi = formatMoney(v.getGiaTriGiam());
        }

        // Format giảm tối đa hiển thị
        String giamToiDaHienThi;
        if (v.getLoaiGiam() != null && v.getLoaiGiam() == 2) {
            giamToiDaHienThi = "—";
        } else {
            if (v.getGiamToiDa() != null && v.getGiamToiDa().compareTo(BigDecimal.ZERO) > 0) {
                giamToiDaHienThi = formatMoney(v.getGiamToiDa());
            } else {
                giamToiDaHienThi = "Không giới hạn";
            }
        }

        // Format đơn tối thiểu hiển thị
        String donToiThieuHienThi = formatMoney(v.getGiaTriDonToiThieu());

        return VoucherResponse.builder()
                .id(v.getId())
                .ma(v.getMa())
                .tenVoucher(v.getTenVoucher())
                .loaiGiam(v.getLoaiGiam())
                .giaTriGiam(v.getGiaTriGiam())
                .giaTriDonToiThieu(v.getGiaTriDonToiThieu())
                .giamToiDa(v.getGiamToiDa())
                .ngayBatDau(v.getNgayBatDau())
                .ngayKetThuc(v.getNgayKetThuc())
                .trangThai(v.getTrangThai())
                .trangThaiHienThi(statusText)
                .trangThaiBadgeClass(badgeClass)
                .loaiGiamHienThi(loaiGiamHienThi)
                .giamToiDaHienThi(giamToiDaHienThi)
                .donToiThieuHienThi(donToiThieuHienThi)
                .build();
    }

    private String formatMoney(BigDecimal amount) {
        if (amount == null) return "0đ";
        long val = amount.longValue();
        return String.format(Locale.GERMANY, "%,dđ", val).replace(".", ".");
    }

    private String formatDecimal(BigDecimal val) {
        if (val == null) return "0";
        if (val.remainder(BigDecimal.ONE).compareTo(BigDecimal.ZERO) == 0) {
            return String.valueOf(val.longValue());
        }
        return val.stripTrailingZeros().toPlainString();
    }
}
