package com.laptopstore.service.impl;

import com.laptopstore.dto.PosCheckoutRequest;
import com.laptopstore.dto.PosItemRequest;
import com.laptopstore.dto.VoucherCalculationResponse;
import com.laptopstore.dto.XacNhanDonHangRequest;
import com.laptopstore.entity.*;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.*;
import com.laptopstore.service.HoaDonService;
import com.laptopstore.service.KhuyenMaiService;
import com.laptopstore.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HoaDonServiceImpl implements HoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final ThanhToanRepository thanhToanRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final ChiTietHoaDonImeiRepository chiTietHoaDonImeiRepository;
    private final ImeiRepository imeiRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final ChiTietSanPhamRepository chiTietSanPhamRepository;
    private final VoucherRepository voucherRepository;
    private final VoucherService voucherService;
    private final KhuyenMaiService khuyenMaiService;

    @Override
    public List<HoaDon> getAll() {
        return hoaDonRepository.findAll();
    }

    @Override
    public HoaDon getById(Integer id) {
        return hoaDonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn", "id", id));
    }

    @Override
    public HoaDon getByMa(String ma) {
        return hoaDonRepository.findByMa(ma)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn", "ma", ma));
    }

    @Override
    public List<HoaDon> getByKhachHang(Integer khachHangId) {
        return hoaDonRepository.findByKhachHangId(khachHangId);
    }

    @Override
    public List<HoaDon> getByNhanVien(Integer nhanVienId) {
        return hoaDonRepository.findByNhanVienId(nhanVienId);
    }

    @Override
    public List<HoaDon> getByTrangThai(Integer trangThai) {
        return hoaDonRepository.findByTrangThai(trangThai);
    }

    @Override
    @Transactional
    public HoaDon create(HoaDon hoaDon) {
        return hoaDonRepository.save(hoaDon);
    }

    @Override
    @Transactional
    public HoaDon update(Integer id, HoaDon hoaDon) {
        HoaDon existing = getById(id);
        existing.setMa(hoaDon.getMa());
        existing.setDiaChi(hoaDon.getDiaChi());
        existing.setDienThoai(hoaDon.getDienThoai());
        existing.setTenNguoiNhan(hoaDon.getTenNguoiNhan());
        existing.setTrangThai(hoaDon.getTrangThai());
        existing.setMoTa(hoaDon.getMoTa());

        if (hoaDon.getKhachHang() != null) existing.setKhachHang(hoaDon.getKhachHang());
        if (existing.getNhanVien() == null && hoaDon.getNhanVien() != null) {
            existing.setNhanVien(hoaDon.getNhanVien());
        }
        if (hoaDon.getThanhToan() != null) existing.setThanhToan(hoaDon.getThanhToan());
        if (hoaDon.getVoucher() != null) existing.setVoucher(hoaDon.getVoucher());
        if (hoaDon.getTienGiamVoucher() != null) existing.setTienGiamVoucher(hoaDon.getTienGiamVoucher());

        return hoaDonRepository.save(existing);
    }

    @Override
    @Transactional
    public HoaDon updateTrangThai(Integer id, Integer targetStatus) {
        HoaDon existing = getById(id);
        int currentStatus = existing.getTrangThai() != null ? existing.getTrangThai() : 0;

        if (currentStatus == targetStatus) {
            return existing;
        }

        // Validate state transitions
        if (targetStatus == 4) {
            return huyHoaDon(id, "Hủy hóa đơn từ giao diện quản lý");
        }

        if (targetStatus == 1) {
            return xacNhanDonHang(id);
        }

        if (targetStatus == 2) {
            return giaoHang(id);
        }

        if (targetStatus == 3) {
            ThanhToan tt = existing.getThanhToan();
            boolean isCODChuaThanhToan = tt != null 
                    && (tt.getTrangThai() == null || tt.getTrangThai() == 0)
                    && (tt.getPhuongThuc() != null && tt.getPhuongThuc().toUpperCase().contains("COD"));
            
            if (isCODChuaThanhToan) {
                return xacNhanGiaoHangVaThuTien(id);
            } else {
                return xacNhanGiaoHangThanhCong(id);
            }
        }

        throw new IllegalArgumentException("Không thể chuyển từ trạng thái " + currentStatus + " sang " + targetStatus);
    }

    @Override
    @Transactional
    public HoaDon xacNhanDonHang(Integer id) {
        return xacNhanDonHang(id, null);
    }

    @Override
    @Transactional
    public HoaDon xacNhanDonHang(Integer id, Integer nhanVienId) {
        HoaDon existing = getById(id);
        if (existing.getNhanVien() != null) {
            throw new IllegalStateException("Hóa đơn đã được nhân viên khác tiếp nhận xử lý.");
        }
        int currentStatus = existing.getTrangThai() != null ? existing.getTrangThai() : 0;
        if (currentStatus != 0) {
            throw new IllegalStateException("Chỉ có thể xác nhận đơn hàng khi đơn ở trạng thái 'Chờ xác nhận' (0). Trạng thái hiện tại: " + currentStatus);
        }
        if (nhanVienId == null) {
            throw new IllegalArgumentException("Vui lòng cung cấp thông tin nhân viên xử lý đơn hàng.");
        }
        NguoiDung nv = nguoiDungRepository.findById(nhanVienId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", nhanVienId));

        existing.setNhanVien(nv);
        existing.setTrangThai(1); // 1 = Đã xác nhận
        return hoaDonRepository.save(existing);
    }

    @Override
    @Transactional
    public HoaDon xacNhanDonHangWithImei(Integer id, XacNhanDonHangRequest request, String username, Integer nhanVienId) {
        // 1. Tìm hóa đơn
        HoaDon existing = getById(id);

        // 2. Tránh 2 nhân viên xác nhận cùng lúc: Kiểm tra nhân viên hiện tại & trạng thái
        if (existing.getNhanVien() != null) {
            throw new IllegalStateException("Hóa đơn đã được nhân viên khác tiếp nhận xử lý.");
        }
        int currentStatus = existing.getTrangThai() != null ? existing.getTrangThai() : 0;
        if (currentStatus != 0) {
            throw new IllegalStateException("Chỉ có thể xác nhận đơn hàng khi đơn ở trạng thái 'Chờ xác nhận' (0). Trạng thái hiện tại: " + currentStatus);
        }

        // 3. Lấy nhân viên đang đăng nhập (ưu tiên username đăng nhập -> NguoiDung -> nhân viên hiện tại)
        NguoiDung nv = null;
        if (username != null && !username.isBlank()) {
            nv = nguoiDungRepository.findByUsername(username.trim()).orElse(null);
            if (nv == null) {
                nv = nguoiDungRepository.findByEmail(username.trim()).orElse(null);
            }
        }
        if (nv == null && nhanVienId != null) {
            nv = nguoiDungRepository.findById(nhanVienId).orElse(null);
        }
        if (nv == null) {
            // Thử lấy nhân viên mặc định nếu không truyền
            nv = nguoiDungRepository.findById(4).orElse(null); // NV001
        }
        if (nv == null) {
            throw new IllegalArgumentException("Không tìm thấy thông tin nhân viên xử lý hợp lệ.");
        }

        // 4. Lấy danh sách chi tiết hóa đơn
        List<ChiTietHoaDon> cthdList = chiTietHoaDonRepository.findByHoaDonId(id);
        if (cthdList == null || cthdList.isEmpty()) {
            throw new IllegalStateException("Hóa đơn không có sản phẩm nào để phân bổ IMEI.");
        }

        // 5. Kiểm tra request chiTietImei
        if (request == null || request.getChiTietImei() == null || request.getChiTietImei().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn IMEI cho các sản phẩm trong đơn hàng.");
        }

        // Đảm bảo tất cả idChiTietHoaDon trong request thuộc về hóa đơn này
        Map<Integer, ChiTietHoaDon> cthdMap = cthdList.stream()
                .collect(Collectors.toMap(ChiTietHoaDon::getId, c -> c));

        for (XacNhanDonHangRequest.ChiTietImeiItem item : request.getChiTietImei()) {
            if (item.getIdChiTietHoaDon() == null || !cthdMap.containsKey(item.getIdChiTietHoaDon())) {
                throw new IllegalArgumentException("Chi tiết hóa đơn (id=" + item.getIdChiTietHoaDon() + ") không thuộc hóa đơn đang xác nhận.");
            }
        }

        // Lấy danh sách IMEI theo từng CTHD
        Map<Integer, List<Integer>> requestImeiMap = request.getChiTietImei().stream()
                .collect(Collectors.toMap(
                        XacNhanDonHangRequest.ChiTietImeiItem::getIdChiTietHoaDon,
                        item -> item.getImeiIds() != null ? item.getImeiIds() : Collections.emptyList(),
                        (existingList, newList) -> newList
                ));

        Set<Integer> allSelectedImeiIds = new HashSet<>();

        // 6. Kiểm tra số lượng và trùng lặp
        for (ChiTietHoaDon cthd : cthdList) {
            List<Integer> imeiIds = requestImeiMap.get(cthd.getId());
            int requiredQty = cthd.getSoLuong() != null ? cthd.getSoLuong() : 1;
            if (imeiIds == null || imeiIds.size() != requiredQty) {
                String spName = (cthd.getChiTietSanPham() != null && cthd.getChiTietSanPham().getSanPham() != null)
                        ? cthd.getChiTietSanPham().getSanPham().getTenSp() : ("CTHD " + cthd.getId());
                throw new IllegalArgumentException("Vui lòng chọn đúng " + requiredQty + " IMEI cho sản phẩm: " + spName + " (hiện chọn: " + (imeiIds != null ? imeiIds.size() : 0) + ").");
            }

            for (Integer imeiId : imeiIds) {
                if (imeiId == null) {
                    throw new IllegalArgumentException("Mã IMEI không hợp lệ.");
                }
                if (!allSelectedImeiIds.add(imeiId)) {
                    throw new IllegalArgumentException("Phát hiện IMEI (id=" + imeiId + ") bị chọn trùng lặp trong yêu cầu.");
                }
            }
        }

        // 7. Validate từng IMEI: Tồn tại, trang_thai == 0, đúng CTSP, chưa có trong chi_tiet_hoa_don_imei
        List<ChiTietHoaDonImei> toSaveList = new ArrayList<>();

        for (ChiTietHoaDon cthd : cthdList) {
            List<Integer> imeiIds = requestImeiMap.get(cthd.getId());
            Integer expectedCtspId = cthd.getChiTietSanPham() != null ? cthd.getChiTietSanPham().getId() : null;

            for (Integer imeiId : imeiIds) {
                Imei imei = imeiRepository.findById(imeiId)
                        .orElseThrow(() -> new ResourceNotFoundException("IMEI", "id", imeiId));

                // 1) trang_thai == 0
                if (imei.getTrangThai() == null || imei.getTrangThai() != 0) {
                    throw new IllegalStateException("IMEI '" + imei.getSoImei() + "' không ở trạng thái 'Trong kho' (trang_thai = 0).");
                }

                // 2) Thuộc đúng CTSP
                Integer imeiCtspId = imei.getChiTietSanPham() != null ? imei.getChiTietSanPham().getId() : null;
                if (expectedCtspId != null && !expectedCtspId.equals(imeiCtspId)) {
                    throw new IllegalArgumentException("IMEI '" + imei.getSoImei() + "' không thuộc cấu hình sản phẩm của chi tiết hóa đơn này.");
                }

                // 3) Chưa tồn tại trong chi_tiet_hoa_don_imei
                if (chiTietHoaDonImeiRepository.findByImeiId(imeiId).isPresent()) {
                    throw new IllegalStateException("IMEI này đã được phân bổ cho hóa đơn khác.");
                }

                ChiTietHoaDonImei cthdImei = ChiTietHoaDonImei.builder()
                        .chiTietHoaDon(cthd)
                        .imei(imei)
                        .build();
                toSaveList.add(cthdImei);
            }
        }

        // 8. Lưu tất cả chi_tiet_hoa_don_imei (IMEI.trang_thai vẫn giữ = 0)
        chiTietHoaDonImeiRepository.saveAll(toSaveList);

        // 9. Gán nhân viên xử lý & chuyển trạng thái sang 1 (Đã xác nhận)
        existing.setNhanVien(nv);
        existing.setTrangThai(1);

        return hoaDonRepository.save(existing);
    }

    @Override
    @Transactional
    public HoaDon giaoHang(Integer id) {
        HoaDon existing = getById(id);
        int currentStatus = existing.getTrangThai() != null ? existing.getTrangThai() : 0;
        if (currentStatus != 1) {
            throw new IllegalStateException("Chỉ có thể bắt đầu giao hàng khi đơn ở trạng thái 'Đã xác nhận' (1). Trạng thái hiện tại: " + currentStatus);
        }
        existing.setTrangThai(2); // 2 = Đang giao hàng
        return hoaDonRepository.save(existing);
    }

    @Override
    @Transactional
    public HoaDon xacNhanGiaoHangVaThuTien(Integer id) {
        HoaDon existing = getById(id);
        int currentStatus = existing.getTrangThai() != null ? existing.getTrangThai() : 0;
        if (currentStatus != 2) {
            throw new IllegalStateException("Chỉ có thể xác nhận đã giao & thu tiền khi đơn ở trạng thái 'Đang giao hàng' (2). Trạng thái hiện tại: " + currentStatus);
        }

        // 1. Cập nhật hóa đơn sang Hoàn thành (3)
        existing.setTrangThai(3);

        // 2. Cập nhật thanh toán sang Đã thanh toán (1) và ngayThanhToan = now
        ThanhToan tt = existing.getThanhToan();
        if (tt != null) {
            tt.setTrangThai(1); // 1 = Đã thanh toán
            tt.setNgayThanhToan(LocalDateTime.now());
            thanhToanRepository.save(tt);
        }

        // 3. Cập nhật toàn bộ IMEI thuộc hóa đơn sang 1 = Đã bán
        updateInvoiceImeisStatus(id, 1);

        return hoaDonRepository.save(existing);
    }

    @Override
    @Transactional
    public HoaDon xacNhanGiaoHangThanhCong(Integer id) {
        HoaDon existing = getById(id);
        int currentStatus = existing.getTrangThai() != null ? existing.getTrangThai() : 0;
        if (currentStatus != 2) {
            throw new IllegalStateException("Chỉ có thể xác nhận giao hàng thành công khi đơn ở trạng thái 'Đang giao hàng' (2). Trạng thái hiện tại: " + currentStatus);
        }

        // 1. Cập nhật hóa đơn sang Hoàn thành (3)
        existing.setTrangThai(3);

        // 2. KHÔNG thay đổi thanhToan.trangThai và KHÔNG cập nhật lại ngayThanhToan (giữ nguyên thời gian thanh toán trước đó)
        ThanhToan tt = existing.getThanhToan();
        if (tt != null && (tt.getTrangThai() == null || tt.getTrangThai() == 0)) {
            tt.setTrangThai(1);
            if (tt.getNgayThanhToan() == null) {
                tt.setNgayThanhToan(LocalDateTime.now());
            }
            thanhToanRepository.save(tt);
        }

        // 3. Cập nhật toàn bộ IMEI thuộc hóa đơn sang 1 = Đã bán
        updateInvoiceImeisStatus(id, 1);

        return hoaDonRepository.save(existing);
    }

    @Override
    @Transactional
    public HoaDon huyHoaDon(Integer id, String lyDo) {
        HoaDon existing = getById(id);
        int currentStatus = existing.getTrangThai() != null ? existing.getTrangThai() : 0;
        if (currentStatus == 3) {
            throw new IllegalStateException("Không thể hủy hóa đơn đã 'Hoàn thành'!");
        }
        if (currentStatus == 4) {
            throw new IllegalStateException("Hóa đơn này đã ở trạng thái 'Đã hủy'!");
        }

        existing.setTrangThai(4); // 4 = Đã hủy
        if (lyDo != null && !lyDo.isBlank()) {
            String moTaHienTai = existing.getMoTa() != null ? existing.getMoTa() : "";
            existing.setMoTa((moTaHienTai.isEmpty() ? "" : moTaHienTai + " | ") + "Lý do hủy: " + lyDo);
        }

        // Giải phóng IMEI: Đảm bảo các IMEI thuộc hóa đơn trở về trạng thái 0 (Trong kho)
        // và XÓA các bản ghi liên kết chi_tiet_hoa_don_imei để IMEI trở lại khả dụng
        List<ChiTietHoaDonImei> cthdImeis = chiTietHoaDonImeiRepository.findByChiTietHoaDonHoaDonId(id);
        if (cthdImeis != null && !cthdImeis.isEmpty()) {
            for (ChiTietHoaDonImei cti : cthdImeis) {
                Imei imei = cti.getImei();
                if (imei != null) {
                    imei.setTrangThai(0);
                    imeiRepository.save(imei);
                }
            }
            chiTietHoaDonImeiRepository.deleteAll(cthdImeis);
        }

        return hoaDonRepository.save(existing);
    }

    private void updateInvoiceImeisStatus(Integer hoaDonId, Integer imeiStatus) {
        List<ChiTietHoaDonImei> cthdImeis = chiTietHoaDonImeiRepository.findByChiTietHoaDonHoaDonId(hoaDonId);
        if (cthdImeis != null && !cthdImeis.isEmpty()) {
            for (ChiTietHoaDonImei cti : cthdImeis) {
                Imei imei = cti.getImei();
                if (imei != null) {
                    imei.setTrangThai(imeiStatus);
                    imeiRepository.save(imei);
                }
            }
        }
    }

    @Override
    @Transactional
    public HoaDon posCheckout(PosCheckoutRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu thanh toán đơn hàng không hợp lệ.");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ít nhất 1 sản phẩm vào đơn hàng.");
        }

        // 1. Lấy thông tin khách hàng và nhân viên
        Integer customerId = request.getCustomerId() != null ? request.getCustomerId() : 1;
        NguoiDung khachHang = nguoiDungRepository.findById(customerId).orElse(null);
        if (khachHang == null) {
            khachHang = nguoiDungRepository.findById(1).orElseThrow(() -> new ResourceNotFoundException("Khách hàng", "id", customerId));
        }

        Integer cashierId = request.getCashierId() != null ? request.getCashierId() : 4;
        NguoiDung nhanVien = nguoiDungRepository.findById(cashierId).orElse(null);
        if (nhanVien == null) {
            nhanVien = nguoiDungRepository.findById(4).orElse(null);
        }

        // 2. Tính lại tổng tiền hàng từ CTSP và khuyến mãi thực tế (dữ liệu backend đáng tin cậy)
        BigDecimal tongTienHang = BigDecimal.ZERO;
        List<ChiTietHoaDon> cthdList = new ArrayList<>();
        Map<Integer, List<Imei>> itemImeiObjectsMap = new HashMap<>();
        Set<Integer> allSelectedImeiIds = new HashSet<>();
        List<Imei> imeisToUpdateSold = new ArrayList<>();

        for (int i = 0; i < request.getItems().size(); i++) {
            PosItemRequest itemReq = request.getItems().get(i);
            if (itemReq.getCtspId() == null || itemReq.getQty() == null || itemReq.getQty() <= 0) {
                continue;
            }
            ChiTietSanPham ctsp = chiTietSanPhamRepository.findById(itemReq.getCtspId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chi tiết sản phẩm", "id", itemReq.getCtspId()));

            String spName = (ctsp.getSanPham() != null) ? ctsp.getSanPham().getTenSp() : ("CTSP " + ctsp.getId());
            int requiredQty = itemReq.getQty();

            // Validate số lượng IMEI cho từng CTSP
            if (itemReq.getImeiIds() == null || itemReq.getImeiIds().size() != requiredQty) {
                int currentCount = itemReq.getImeiIds() != null ? itemReq.getImeiIds().size() : 0;
                throw new IllegalArgumentException(String.format("%s cần chọn đủ %d IMEI trước khi xác nhận hóa đơn (hiện chọn: %d).",
                        spName, requiredQty, currentCount));
            }

            // Validate từng IMEI của item
            List<Imei> currentItemImeis = new ArrayList<>();
            for (Integer imeiId : itemReq.getImeiIds()) {
                if (imeiId == null) {
                    throw new IllegalArgumentException("Mã IMEI không hợp lệ.");
                }
                if (!allSelectedImeiIds.add(imeiId)) {
                    throw new IllegalArgumentException("Phát hiện IMEI (id=" + imeiId + ") bị chọn trùng lặp trong yêu cầu.");
                }

                Imei imei = imeiRepository.findById(imeiId)
                        .orElseThrow(() -> new ResourceNotFoundException("IMEI", "id", imeiId));

                // 1) Trạng thái trong kho: trang_thai == 0
                if (imei.getTrangThai() == null || imei.getTrangThai() != 0) {
                    throw new IllegalStateException("IMEI '" + imei.getSoImei() + "' không ở trạng thái 'Trong kho' (trang_thai = 0).");
                }

                // 2) Thuộc đúng CTSP
                Integer imeiCtspId = imei.getChiTietSanPham() != null ? imei.getChiTietSanPham().getId() : null;
                if (!ctsp.getId().equals(imeiCtspId)) {
                    throw new IllegalArgumentException("IMEI '" + imei.getSoImei() + "' không thuộc cấu hình sản phẩm của " + spName);
                }

                // 3) Chưa phân bổ cho hóa đơn khác (chưa có trong chi_tiet_hoa_don_imei)
                if (chiTietHoaDonImeiRepository.findByImeiId(imeiId).isPresent()) {
                    throw new IllegalStateException("IMEI '" + imei.getSoImei() + "' vừa được sử dụng cho hóa đơn khác. Vui lòng chọn IMEI khác.");
                }

                currentItemImeis.add(imei);
                imeisToUpdateSold.add(imei);
            }
            itemImeiObjectsMap.put(cthdList.size(), currentItemImeis);

            // Lấy giá bán thực tế sau KM sản phẩm (snapshot giá sản phẩm)
            com.laptopstore.dto.GiaKhuyenMaiResponse giaKm = khuyenMaiService.tinhGiaBanHienTai(ctsp);
            BigDecimal giaBan = (giaKm != null && giaKm.getGiaBan() != null) ? giaKm.getGiaBan() : (ctsp.getGia() != null ? ctsp.getGia() : BigDecimal.ZERO);

            BigDecimal lineTotal = giaBan.multiply(BigDecimal.valueOf(itemReq.getQty()));
            tongTienHang = tongTienHang.add(lineTotal);

            ChiTietHoaDon cthd = ChiTietHoaDon.builder()
                    .chiTietSanPham(ctsp)
                    .soLuong(itemReq.getQty())
                    .giaTungSanPham(giaBan) // Snapshot giá bán tại thời điểm mua
                    .build();
            cthdList.add(cthd);
        }

        if (cthdList.isEmpty()) {
            throw new IllegalArgumentException("Không có sản phẩm hợp lệ trong đơn hàng.");
        }

        // 3. Xử lý Voucher và tính tiền giảm
        Voucher voucher = null;
        BigDecimal tienGiamVoucher = BigDecimal.ZERO;

        if (request.getIdVoucher() != null) {
            VoucherCalculationResponse vCalc = voucherService.calculateVoucherDiscount(request.getIdVoucher(), tongTienHang);
            if (!Boolean.TRUE.equals(vCalc.getHopLe())) {
                throw new IllegalArgumentException(vCalc.getThongBao());
            }
            voucher = voucherRepository.findById(request.getIdVoucher()).orElse(null);
            tienGiamVoucher = vCalc.getTienGiamVoucher() != null ? vCalc.getTienGiamVoucher() : BigDecimal.ZERO;
        }

        BigDecimal khachPhaiTra = tongTienHang.subtract(tienGiamVoucher);
        if (khachPhaiTra.compareTo(BigDecimal.ZERO) < 0) {
            khachPhaiTra = BigDecimal.ZERO;
        }

        // 4. Validate tiền khách đưa nếu thanh toán tiền mặt và đơn hoàn thành
        boolean isCompleted = Boolean.TRUE.equals(request.getIsCompleted());
        String payMethod = (request.getPayMethod() != null && !request.getPayMethod().isBlank()) ? request.getPayMethod().trim() : "TIEN_MAT";

        if (isCompleted && "TIEN_MAT".equalsIgnoreCase(payMethod)) {
            BigDecimal given = request.getCustomerGiven() != null ? request.getCustomerGiven() : BigDecimal.ZERO;
            if (given.compareTo(khachPhaiTra) < 0) {
                throw new IllegalArgumentException(String.format("Tiền khách đưa (%s) không đủ để thanh toán đơn hàng (%s).",
                        formatMoney(given), formatMoney(khachPhaiTra)));
            }
        }

        // 5. Xác định hình thức nhận hàng (Tại quầy vs Giao hàng tận nơi)
        boolean isGiaoHang = "GIAO_HANG".equalsIgnoreCase(request.getDeliveryType());
        String diaChi = isGiaoHang ? (request.getAddress() != null && !request.getAddress().isBlank() ? request.getAddress().trim() : "Địa chỉ giao hàng") : "Tại quầy Store";
        String kieuBanMoTa = isGiaoHang ? "Bán tại quầy (Giao hàng tận nơi)" : "Bán tại quầy (Nhận tại quầy)";

        int targetHoaDonStatus;
        int targetThanhToanStatus;
        LocalDateTime ngayThanhToan = null;
        boolean markImeisAsSold = false;

        if (!isGiaoHang) {
            // Mua nhận tại quầy:
            if (isCompleted) {
                targetHoaDonStatus = 3; // Hoàn thành ngay
                targetThanhToanStatus = 1; // Đã thanh toán
                ngayThanhToan = LocalDateTime.now();
                markImeisAsSold = true; // IMEI -> 1 (Đã bán)
            } else {
                targetHoaDonStatus = 1; // Đã xác nhận (chưa thanh toán)
                targetThanhToanStatus = 0; // Chưa thanh toán
                ngayThanhToan = null;
                markImeisAsSold = false; // IMEI -> giữ 0 (Trong kho, đã giữ)
            }
        } else {
            // Giao hàng tận nơi: Đơn hàng ở trạng thái 1 (Đã xác nhận), sau này sẽ đi qua bước giao hàng
            targetHoaDonStatus = 1; // Đã xác nhận
            markImeisAsSold = false; // IMEI giữ 0 (chờ giao thành công mới đổi thành 1)
            if (isCompleted) {
                targetThanhToanStatus = 1; // Đã thanh toán trước
                ngayThanhToan = LocalDateTime.now();
            } else {
                targetThanhToanStatus = 0; // Chưa thanh toán (COD)
                ngayThanhToan = null;
            }
        }

        // 6. Tạo ThanhToan
        ThanhToan tt = ThanhToan.builder()
                .ma("TT" + Math.floor(System.currentTimeMillis() / 1000) + "_" + (int)(Math.random() * 1000))
                .phuongThuc(payMethod)
                .soTien(khachPhaiTra)
                .trangThai(targetThanhToanStatus)
                .ngayThanhToan(ngayThanhToan)
                .build();
        tt = thanhToanRepository.save(tt);

        // 7. Tạo HoaDon
        String maHd = (request.getMa() != null && !request.getMa().isBlank()) ? request.getMa().trim() : "HD" + Math.floor(System.currentTimeMillis() / 1000);
        if (hoaDonRepository.findByMa(maHd).isPresent()) {
            maHd = "HD" + System.currentTimeMillis();
        }

        HoaDon hoaDon = HoaDon.builder()
                .ma(maHd)
                .khachHang(khachHang)
                .nhanVien(nhanVien)
                .tenNguoiNhan(request.getCustomerName() != null ? request.getCustomerName() : khachHang.getTen())
                .dienThoai(request.getPhone() != null ? request.getPhone() : khachHang.getDienThoai())
                .diaChi(diaChi)
                .trangThai(targetHoaDonStatus)
                .thanhToan(tt)
                .voucher(voucher)
                .tienGiamVoucher(tienGiamVoucher)
                .moTa((request.getNote() != null && !request.getNote().isBlank() ? request.getNote() + " - " : "") + kieuBanMoTa + " (" + payMethod + ")")
                .ngayTao(LocalDateTime.now())
                .build();

        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);

        // 8. Lưu ChiTietHoaDon và phân bổ ChiTietHoaDonImei
        List<ChiTietHoaDonImei> toSaveImeiLinks = new ArrayList<>();
        for (int i = 0; i < cthdList.size(); i++) {
            ChiTietHoaDon cthd = cthdList.get(i);
            cthd.setHoaDon(savedHoaDon);
            cthd.setMa(String.format("CTHD_%s_%d", savedHoaDon.getMa(), i + 1));
            ChiTietHoaDon savedCthd = chiTietHoaDonRepository.save(cthd);

            List<Imei> itemImeis = itemImeiObjectsMap.get(i);
            if (itemImeis != null) {
                for (Imei imei : itemImeis) {
                    ChiTietHoaDonImei link = ChiTietHoaDonImei.builder()
                            .chiTietHoaDon(savedCthd)
                            .imei(imei)
                            .build();
                    toSaveImeiLinks.add(link);
                }
            }
        }
        chiTietHoaDonImeiRepository.saveAll(toSaveImeiLinks);

        // 9. Cập nhật IMEI sang 1 (Đã bán) nếu thanh toán xong ngay tại quầy
        if (markImeisAsSold) {
            for (Imei imei : imeisToUpdateSold) {
                imei.setTrangThai(1); // 1 = Đã bán
                imeiRepository.save(imei);
            }
        }

        return savedHoaDon;
    }

    @Override
    @Transactional
    public HoaDon thanhToanTaiQuay(Integer id, String username) {
        HoaDon existing = getById(id);
        int currentStatus = existing.getTrangThai() != null ? existing.getTrangThai() : 0;
        if (currentStatus != 1) {
            throw new IllegalStateException("Chỉ có thể thanh toán cho hóa đơn ở trạng thái 'Đã xác nhận' (1). Trạng thái hiện tại: " + currentStatus);
        }

        ThanhToan tt = existing.getThanhToan();
        if (tt == null) {
            throw new IllegalStateException("Hóa đơn không có thông tin thanh toán.");
        }
        if (tt.getTrangThai() != null && tt.getTrangThai() == 1) {
            throw new IllegalStateException("Hóa đơn này đã được thanh toán trước đó.");
        }

        // 1. Cập nhật trạng thái thanh toán sang Đã thanh toán
        tt.setTrangThai(1);
        tt.setNgayThanhToan(LocalDateTime.now());
        thanhToanRepository.save(tt);

        // 2. Nếu là mua nhận tại quầy (không phải giao hàng tận nơi):
        // Hoàn thành ngay hóa đơn (1 -> 3) và cập nhật toàn bộ IMEI sang 1 (Đã bán)
        boolean isGiaoHang = existing.getMoTa() != null && existing.getMoTa().contains("Giao hàng tận nơi");
        if (!isGiaoHang) {
            existing.setTrangThai(3); // 3 = Hoàn thành
            updateInvoiceImeisStatus(id, 1); // 1 = Đã bán
        }

        return hoaDonRepository.save(existing);
    }

    private String formatMoney(BigDecimal amount) {
        if (amount == null) return "0đ";
        long val = amount.longValue();
        return String.format(Locale.GERMANY, "%,dđ", val);
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        HoaDon existing = getById(id);
        hoaDonRepository.delete(existing);
    }
}
