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

import com.laptopstore.dto.LichSuDonHangDTO;
import com.laptopstore.dto.LichSuDonHangItemDTO;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
    private final HinhAnhRepository hinhAnhRepository;

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
            boolean isChuaThanhToan = (tt == null || tt.getTrangThai() == null || tt.getTrangThai() == 0);
            if (isChuaThanhToan) {
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

        // Cập nhật lại số lượng khả dụng trong kho cho các CTSP
        for (ChiTietHoaDon cthd : cthdList) {
            if (cthd.getChiTietSanPham() != null && cthd.getChiTietSanPham().getId() != null) {
                Integer ctspId = cthd.getChiTietSanPham().getId();
                chiTietSanPhamRepository.updateSoLuong(ctspId, imeiRepository.countAvailableByChiTietSanPhamId(ctspId));
            }
        }

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
    @Transactional(rollbackFor = Exception.class)
    public HoaDon xacNhanGiaoHangVaThuTien(Integer id) {
        HoaDon existing = getById(id);
        int currentStatus = existing.getTrangThai() != null ? existing.getTrangThai() : 0;
        if (currentStatus != 2) {
            throw new IllegalStateException("Chỉ có thể xác nhận đã giao & thu tiền khi đơn ở trạng thái 'Đang giao hàng' (2). Trạng thái hiện tại: " + currentStatus);
        }

        ThanhToan tt = existing.getThanhToan();
        if (tt == null) {
            throw new IllegalStateException("Hóa đơn không có thông tin thanh toán.");
        }
        if (tt.getTrangThai() != null && tt.getTrangThai() == 1) {
            throw new IllegalStateException("Đơn hàng này đã được thanh toán trước đó. Không thể thực hiện thu tiền lần 2.");
        }

        // 1. Cập nhật hóa đơn sang Hoàn thành (3)
        existing.setTrangThai(3);

        // 2. Cập nhật thanh toán sang Đã thanh toán (1) và ngayThanhToan = now
        tt.setTrangThai(1); // 1 = Đã thanh toán
        tt.setNgayThanhToan(LocalDateTime.now());
        thanhToanRepository.save(tt);

        // 3. Cập nhật toàn bộ IMEI thuộc hóa đơn sang 1 = Đã bán
        updateInvoiceImeisStatus(id, 1);

        return hoaDonRepository.save(existing);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public HoaDon xacNhanGiaoHangThanhCong(Integer id) {
        HoaDon existing = getById(id);
        int currentStatus = existing.getTrangThai() != null ? existing.getTrangThai() : 0;
        if (currentStatus != 2) {
            throw new IllegalStateException("Chỉ có thể xác nhận giao hàng thành công khi đơn ở trạng thái 'Đang giao hàng' (2). Trạng thái hiện tại: " + currentStatus);
        }

        ThanhToan tt = existing.getThanhToan();
        if (tt == null || tt.getTrangThai() == null || tt.getTrangThai() == 0) {
            throw new IllegalStateException("Đơn hàng chưa được thanh toán. Vui lòng sử dụng chức năng 'Xác Nhận Đã Giao & Thu Tiền'.");
        }

        // 1. Cập nhật hóa đơn sang Hoàn thành (3)
        existing.setTrangThai(3);

        // 2. ĐÃ THANH TOÁN TRƯỚC: TUYỆT ĐỐI KHÔNG thay đổi thanhToan.trangThai và KHÔNG cập nhật lại ngayThanhToan (giữ nguyên thời gian thanh toán trước đó)

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
            java.util.Set<Integer> affectedCtspIds = new java.util.HashSet<>();
            for (ChiTietHoaDonImei cti : cthdImeis) {
                Imei imei = cti.getImei();
                if (imei != null) {
                    imei.setTrangThai(0);
                    imeiRepository.save(imei);
                    if (imei.getChiTietSanPham() != null && imei.getChiTietSanPham().getId() != null) {
                        affectedCtspIds.add(imei.getChiTietSanPham().getId());
                    }
                }
            }
            chiTietHoaDonImeiRepository.deleteAll(cthdImeis);
            for (Integer ctspId : affectedCtspIds) {
                chiTietSanPhamRepository.updateSoLuong(ctspId, imeiRepository.countAvailableByChiTietSanPhamId(ctspId));
            }
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

        // 10. Cập nhật lại số lượng tồn kho khả dụng cho các CTSP trong hóa đơn
        for (ChiTietHoaDon cthd : cthdList) {
            if (cthd.getChiTietSanPham() != null && cthd.getChiTietSanPham().getId() != null) {
                Integer ctspId = cthd.getChiTietSanPham().getId();
                chiTietSanPhamRepository.updateSoLuong(ctspId, imeiRepository.countAvailableByChiTietSanPhamId(ctspId));
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
        // Nếu là giao hàng tận nơi: Đơn hàng vẫn giữ trạng thái 1 (Đã xác nhận), IMEI giữ trạng thái 0 (chờ giao hàng)
        boolean isGiaoHang = (existing.getMoTa() != null && existing.getMoTa().contains("Giao hàng tận nơi"))
                || (!"Tại quầy Store".equalsIgnoreCase(existing.getDiaChi()) 
                    && (existing.getMoTa() == null || !existing.getMoTa().contains("Nhận tại quầy")));
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
    @Transactional(readOnly = true)
    public List<LichSuDonHangDTO> getLichSuDonHangKhachHang(Integer khachHangId) {
        if (khachHangId == null) {
            return Collections.emptyList();
        }

        // 1. Lấy danh sách hóa đơn của khách hàng, sắp xếp ngayTao DESC (đã fetch thanhToan, voucher)
        List<HoaDon> hoaDons = hoaDonRepository.findLichSuByKhachHangId(khachHangId);
        if (hoaDons.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. Lấy toàn bộ chi tiết hóa đơn (chi_tiet_hoa_don) kèm CTSP, SanPham, CPU, RAM... trong 1 query duy nhất (tránh N+1)
        List<Integer> hoaDonIds = hoaDons.stream().map(HoaDon::getId).toList();
        List<ChiTietHoaDon> chiTiets = chiTietHoaDonRepository.findByHoaDonIdIn(hoaDonIds);
        Map<Integer, List<ChiTietHoaDon>> chiTietsByHoaDonId = chiTiets.stream()
                .collect(Collectors.groupingBy(c -> c.getHoaDon().getId()));

        // 3. Lấy ảnh đại diện sản phẩm theo danh sách sanPhamId trong 1 query
        List<Integer> sanPhamIds = chiTiets.stream()
                .map(c -> c.getChiTietSanPham() != null && c.getChiTietSanPham().getSanPham() != null 
                        ? c.getChiTietSanPham().getSanPham().getId() : null)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<Integer, String> hinhAnhBySanPhamId = new HashMap<>();
        if (!sanPhamIds.isEmpty()) {
            List<HinhAnh> hinhAnhs = hinhAnhRepository.findBySanPhamIdIn(sanPhamIds);
            for (HinhAnh ha : hinhAnhs) {
                if (ha.getSanPham() != null && !hinhAnhBySanPhamId.containsKey(ha.getSanPham().getId())) {
                    hinhAnhBySanPhamId.put(ha.getSanPham().getId(), ha.getUrlHinhAnh());
                }
            }
        }

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        // 4. Map từng hóa đơn sang DTO (sử dụng 100% snapshot, không tính lại giá hiện tại)
        List<LichSuDonHangDTO> result = new ArrayList<>();

        for (HoaDon h : hoaDons) {
            List<ChiTietHoaDon> itemsOfOrder = chiTietsByHoaDonId.getOrDefault(h.getId(), Collections.emptyList());

            int tongSoLuong = 0;
            BigDecimal tongTienHang = BigDecimal.ZERO;
            List<LichSuDonHangItemDTO> itemDTOs = new ArrayList<>();

            for (ChiTietHoaDon c : itemsOfOrder) {
                int qty = c.getSoLuong() != null ? c.getSoLuong() : 0;
                tongSoLuong += qty;

                // Giá mua SNAPSHOT từ chi_tiet_hoa_don.gia_tung_san_pham
                BigDecimal giaMua = c.getGiaTungSanPham() != null ? c.getGiaTungSanPham() : BigDecimal.ZERO;
                BigDecimal thanhTien = giaMua.multiply(BigDecimal.valueOf(qty));
                tongTienHang = tongTienHang.add(thanhTien);

                ChiTietSanPham ctsp = c.getChiTietSanPham();
                String tenSanPham = (ctsp != null && ctsp.getSanPham() != null) ? ctsp.getSanPham().getTenSp() : "Sản phẩm";
                String maCtsp = ctsp != null ? ctsp.getMaCtsp() : "";
                Integer idCtsp = ctsp != null ? ctsp.getId() : null;

                // Cấu hình tóm tắt
                String cauHinh = buildCauHinhSummary(ctsp);

                // Ảnh sản phẩm
                Integer spId = (ctsp != null && ctsp.getSanPham() != null) ? ctsp.getSanPham().getId() : null;
                String urlAnh = (spId != null) ? hinhAnhBySanPhamId.get(spId) : null;
                if (urlAnh == null || urlAnh.isBlank()) {
                    urlAnh = "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80";
                }

                itemDTOs.add(LichSuDonHangItemDTO.builder()
                        .idChiTietHoaDon(c.getId())
                        .idChiTietSanPham(idCtsp)
                        .maCtsp(maCtsp)
                        .tenSanPham(tenSanPham)
                        .hinhAnh(urlAnh)
                        .cauHinh(cauHinh)
                        .soLuong(qty)
                        .giaMua(giaMua)
                        .thanhTien(thanhTien)
                        .build());
            }

            // Snapshot Voucher
            BigDecimal tienGiamVoucher = h.getTienGiamVoucher() != null ? h.getTienGiamVoucher() : BigDecimal.ZERO;
            String maVoucher = h.getVoucher() != null ? h.getVoucher().getMa() : null;

            // Snapshot Tổng thanh toán từ thanh_toan.so_tien
            BigDecimal tongThanhToan;
            if (h.getThanhToan() != null && h.getThanhToan().getSoTien() != null) {
                tongThanhToan = h.getThanhToan().getSoTien();
            } else {
                tongThanhToan = tongTienHang.subtract(tienGiamVoucher).max(BigDecimal.ZERO);
            }

            // Trạng thái đơn hàng (0: Chờ xác nhận, 1: Đã xác nhận, 2: Đang giao hàng, 3: Hoàn thành, 4: Đã hủy)
            int orderStatus = h.getTrangThai() != null ? h.getTrangThai() : 0;
            String orderStatusText;
            String orderBadgeClass;
            switch (orderStatus) {
                case 0:
                    orderStatusText = "Chờ xác nhận";
                    orderBadgeClass = "badge-pending";
                    break;
                case 1:
                    orderStatusText = "Đã xác nhận";
                    orderBadgeClass = "badge-confirmed";
                    break;
                case 2:
                    orderStatusText = "Đang giao hàng";
                    orderBadgeClass = "badge-shipping";
                    break;
                case 3:
                    orderStatusText = "Hoàn thành";
                    orderBadgeClass = "badge-completed";
                    break;
                case 4:
                    orderStatusText = "Đã hủy";
                    orderBadgeClass = "badge-cancelled";
                    break;
                default:
                    orderStatusText = "Không xác định";
                    orderBadgeClass = "badge-unknown";
            }

            // Trạng thái thanh toán (0: Chưa thanh toán, 1: Đã thanh toán)
            int payStatus = (h.getThanhToan() != null && h.getThanhToan().getTrangThai() != null) 
                    ? h.getThanhToan().getTrangThai() : 0;
            String payStatusText = (payStatus == 1) ? "Đã thanh toán" : "Chưa thanh toán";
            String payBadgeClass = (payStatus == 1) ? "badge-paid" : "badge-unpaid";

            // Phương thức thanh toán
            String rawPayMethod = (h.getThanhToan() != null && h.getThanhToan().getPhuongThuc() != null)
                    ? h.getThanhToan().getPhuongThuc() : "COD";
            String payMethodText;
            if ("COD".equalsIgnoreCase(rawPayMethod)) {
                payMethodText = "Thanh toán khi nhận hàng (COD)";
            } else if ("CHUYEN_KHOAN".equalsIgnoreCase(rawPayMethod)) {
                payMethodText = "Chuyển khoản ngân hàng";
            } else if ("TIEN_MAT".equalsIgnoreCase(rawPayMethod)) {
                payMethodText = "Tiền mặt tại quầy";
            } else {
                payMethodText = rawPayMethod;
            }

            String ngayTaoStr = h.getNgayTao() != null ? h.getNgayTao().format(dtf) : "";

            result.add(LichSuDonHangDTO.builder()
                    .idHoaDon(h.getId())
                    .maHoaDon(h.getMa())
                    .ngayTao(h.getNgayTao())
                    .ngayTaoFormatted(ngayTaoStr)
                    .trangThai(orderStatus)
                    .trangThaiHienThi(orderStatusText)
                    .trangThaiBadgeClass(orderBadgeClass)
                    .trangThaiThanhToan(payStatus)
                    .trangThaiThanhToanHienThi(payStatusText)
                    .trangThaiThanhToanBadgeClass(payBadgeClass)
                    .phuongThucThanhToan(rawPayMethod)
                    .phuongThucThanhToanHienThi(payMethodText)
                    .tenNguoiNhan(h.getTenNguoiNhan())
                    .dienThoai(h.getDienThoai())
                    .diaChi(h.getDiaChi())
                    .moTa(h.getMoTa())
                    .tongSoLuong(tongSoLuong)
                    .tongTienHang(tongTienHang)
                    .tienGiamVoucher(tienGiamVoucher)
                    .maVoucher(maVoucher)
                    .tongThanhToan(tongThanhToan)
                    .items(itemDTOs)
                    .build());
        }

        return result;
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

    @Override
    @Transactional
    public void delete(Integer id) {
        HoaDon existing = getById(id);
        hoaDonRepository.delete(existing);
    }
}
