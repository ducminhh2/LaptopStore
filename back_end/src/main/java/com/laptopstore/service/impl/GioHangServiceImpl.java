package com.laptopstore.service.impl;

import com.laptopstore.dto.CartSyncResponse;
import com.laptopstore.dto.CheckoutItemDTO;
import com.laptopstore.dto.CheckoutResponseDTO;
import com.laptopstore.dto.GiaKhuyenMaiResponse;
import com.laptopstore.dto.GuestCartItemRequest;
import com.laptopstore.entity.ChiTietGioHang;
import com.laptopstore.entity.ChiTietSanPham;
import com.laptopstore.entity.GioHang;
import com.laptopstore.entity.NguoiDung;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ChiTietGioHangRepository;
import com.laptopstore.repository.ChiTietSanPhamRepository;
import com.laptopstore.repository.GioHangRepository;
import com.laptopstore.repository.ImeiRepository;
import com.laptopstore.repository.NguoiDungRepository;
import com.laptopstore.service.GioHangService;
import com.laptopstore.service.KhuyenMaiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GioHangServiceImpl implements GioHangService {

    private final GioHangRepository gioHangRepository;
    private final ChiTietGioHangRepository chiTietGioHangRepository;
    private final ChiTietSanPhamRepository chiTietSanPhamRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final ImeiRepository imeiRepository;
    private final KhuyenMaiService khuyenMaiService;

    @Override
    public List<GioHang> getAll() {
        return gioHangRepository.findAll();
    }

    @Override
    public GioHang getById(Integer id) {
        return gioHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng", "id", id));
    }

    @Override
    public GioHang getByKhachHang(Integer khachHangId) {
        return gioHangRepository.findByKhachHangId(khachHangId)
                .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng", "khachHangId", khachHangId));
    }

    @Override
    public GioHang create(GioHang gioHang) {
        return gioHangRepository.save(gioHang);
    }

    @Override
    public GioHang update(Integer id, GioHang gioHang) {
        GioHang existing = getById(id);
        existing.setMa(gioHang.getMa());
        existing.setTongSoTien(gioHang.getTongSoTien());
        existing.setTongSoLuong(gioHang.getTongSoLuong());
        if (gioHang.getKhachHang() != null) {
            existing.setKhachHang(gioHang.getKhachHang());
        }
        return gioHangRepository.save(existing);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Integer id) {
        GioHang existing = getById(id);
        chiTietGioHangRepository.deleteByGioHangId(existing.getId());
        gioHangRepository.delete(existing);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CartSyncResponse syncLoginCart(Integer khachHangId, List<GuestCartItemRequest> guestCartItems) {
        NguoiDung khachHang = nguoiDungRepository.findById(khachHangId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", khachHangId));

        Optional<GioHang> gioHangOpt = gioHangRepository.findByKhachHangId(khachHangId);
        GioHang gioHang = null;
        List<ChiTietGioHang> existingItems = List.of();

        if (gioHangOpt.isPresent()) {
            gioHang = gioHangOpt.get();
            existingItems = chiTietGioHangRepository.findByGioHangId(gioHang.getId());
        }

        // =========================================================================
        // QUY TẮC: NẾU GIỎ DATABASE ĐÃ CÓ ÍT NHẤT 1 SẢN PHẨM:
        // -> Ưu tiên giỏ DB, KHÔNG import bất kỳ item nào từ localStorage
        // =========================================================================
        if (!existingItems.isEmpty()) {
            recalculateGioHangTotals(gioHang);
            List<ChiTietGioHang> updatedItems = chiTietGioHangRepository.findByGioHangId(gioHang.getId());
            return CartSyncResponse.builder()
                    .success(true)
                    .cartSource("DATABASE")
                    .imported(false)
                    .message("Tài khoản của bạn đã có giỏ hàng trong hệ thống. Đang hiển thị giỏ hàng của bạn.")
                    .totalQuantity(gioHang.getTongSoLuong())
                    .totalAmount(gioHang.getTongSoTien())
                    .items(updatedItems)
                    .build();
        }

        // =========================================================================
        // QUY TẮC: NẾU GIỎ DATABASE TRỐNG
        // =========================================================================
        if (guestCartItems == null || guestCartItems.isEmpty()) {
            return CartSyncResponse.builder()
                    .success(true)
                    .cartSource("DATABASE")
                    .imported(false)
                    .message("Giỏ hàng của bạn hiện tại đang trống.")
                    .totalQuantity(0)
                    .totalAmount(BigDecimal.ZERO)
                    .items(List.of())
                    .build();
        }

        // DB trống nhưng localStorage có hàng -> Chuyển vào DB
        if (gioHang == null) {
            gioHang = getOrCreateGioHang(khachHang);
        }

        List<ChiTietGioHang> importedItems = new ArrayList<>();
        for (GuestCartItemRequest itemReq : guestCartItems) {
            if (itemReq.getIdChiTietSanPham() == null || itemReq.getSoLuong() == null || itemReq.getSoLuong() <= 0) {
                continue;
            }

            // 1. Kiểm tra CTSP còn tồn tại và đang kinh doanh
            Optional<ChiTietSanPham> ctspOpt = chiTietSanPhamRepository.findById(itemReq.getIdChiTietSanPham());
            if (ctspOpt.isEmpty()) {
                continue;
            }
            ChiTietSanPham ctsp = ctspOpt.get();
            if (ctsp.getTrangThai() != null && ctsp.getTrangThai() != 1) {
                continue;
            }

            // 2. Kiểm tra tồn kho khả dụng qua IMEI (trang_thai = 0 và chưa bị giữ bởi chi tiết hóa đơn)
            int tonKhaDung = imeiRepository.countAvailableByChiTietSanPhamId(ctsp.getId());
            if (tonKhaDung <= 0) {
                continue;
            }

            // 3. Giới hạn số lượng import tối đa theo tồn kho khả dụng
            int soLuongImport = Math.min(itemReq.getSoLuong(), tonKhaDung);

            // 4. Lấy giá bán thực tế sau khuyến mãi qua KhuyenMaiService (tuyệt đối không tin giá client gửi)
            GiaKhuyenMaiResponse pricing = khuyenMaiService.tinhGiaBanHienTai(ctsp.getId());
            BigDecimal giaBan = (pricing != null && pricing.getGiaBan() != null)
                    ? pricing.getGiaBan()
                    : (ctsp.getGiaBan() != null ? ctsp.getGiaBan() : ctsp.getGia());
            if (giaBan == null) {
                giaBan = BigDecimal.ZERO;
            }

            // Lưu vào chi tiết giỏ hàng
            ChiTietGioHang ctgh = ChiTietGioHang.builder()
                    .gioHang(gioHang)
                    .chiTietSanPham(ctsp)
                    .soLuong(soLuongImport)
                    .giaTungSanPham(giaBan)
                    .ma("CTGH_" + gioHang.getId() + "_" + ctsp.getId())
                    .build();

            ctgh = chiTietGioHangRepository.save(ctgh);
            importedItems.add(ctgh);
        }

        // Tính lại tổng số lượng và tổng tiền của giỏ
        recalculateGioHangTotals(gioHang);
        List<ChiTietGioHang> finalItems = chiTietGioHangRepository.findByGioHangId(gioHang.getId());

        return CartSyncResponse.builder()
                .success(true)
                .cartSource("DATABASE")
                .imported(!importedItems.isEmpty())
                .message(!importedItems.isEmpty()
                        ? "Đã chuyển giỏ hàng khách vãng lai vào tài khoản thành công."
                        : "Các sản phẩm trong giỏ tạm thời không còn khả dụng.")
                .totalQuantity(gioHang.getTongSoLuong())
                .totalAmount(gioHang.getTongSoTien())
                .items(finalItems)
                .build();
    }

    @Override
    public List<ChiTietGioHang> getCartItemsByKhachHang(Integer khachHangId) {
        Optional<GioHang> gioHangOpt = gioHangRepository.findByKhachHangId(khachHangId);
        if (gioHangOpt.isEmpty()) {
            return List.of();
        }
        return chiTietGioHangRepository.findByGioHangId(gioHangOpt.get().getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<ChiTietGioHang> addToDbCart(Integer khachHangId, Integer ctspId, Integer soLuong) {
        if (soLuong == null || soLuong <= 0) {
            soLuong = 1;
        }

        NguoiDung khachHang = nguoiDungRepository.findById(khachHangId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", khachHangId));

        ChiTietSanPham ctsp = chiTietSanPhamRepository.findById(ctspId)
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết sản phẩm", "id", ctspId));

        if (ctsp.getTrangThai() != null && ctsp.getTrangThai() != 1) {
            throw new IllegalArgumentException("Sản phẩm hiện đang tạm ngừng kinh doanh!");
        }

        int tonKhaDung = imeiRepository.countAvailableByChiTietSanPhamId(ctsp.getId());
        if (tonKhaDung <= 0) {
            throw new IllegalArgumentException("Sản phẩm này hiện tại đã hết hàng!");
        }

        GioHang gioHang = getOrCreateGioHang(khachHang);

        Optional<ChiTietGioHang> existingOpt = chiTietGioHangRepository.findByGioHangIdAndChiTietSanPhamId(gioHang.getId(), ctsp.getId());

        GiaKhuyenMaiResponse pricing = khuyenMaiService.tinhGiaBanHienTai(ctsp.getId());
        BigDecimal giaBan = (pricing != null && pricing.getGiaBan() != null)
                ? pricing.getGiaBan()
                : (ctsp.getGiaBan() != null ? ctsp.getGiaBan() : ctsp.getGia());
        if (giaBan == null) {
            giaBan = BigDecimal.ZERO;
        }

        if (existingOpt.isPresent()) {
            ChiTietGioHang existing = existingOpt.get();
            int newQty = existing.getSoLuong() + soLuong;
            if (newQty > tonKhaDung) {
                newQty = tonKhaDung;
            }
            existing.setSoLuong(newQty);
            existing.setGiaTungSanPham(giaBan);
            chiTietGioHangRepository.save(existing);
        } else {
            int initQty = Math.min(soLuong, tonKhaDung);
            ChiTietGioHang ctgh = ChiTietGioHang.builder()
                    .gioHang(gioHang)
                    .chiTietSanPham(ctsp)
                    .soLuong(initQty)
                    .giaTungSanPham(giaBan)
                    .ma("CTGH_" + gioHang.getId() + "_" + ctsp.getId())
                    .build();
            chiTietGioHangRepository.save(ctgh);
        }

        recalculateGioHangTotals(gioHang);
        return chiTietGioHangRepository.findByGioHangId(gioHang.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<ChiTietGioHang> updateDbCartQuantity(Integer khachHangId, Integer chiTietGioHangId, Integer soLuong) {
        ChiTietGioHang item = chiTietGioHangRepository.findById(chiTietGioHangId)
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết giỏ hàng", "id", chiTietGioHangId));

        GioHang gioHang = item.getGioHang();
        if (gioHang == null || gioHang.getKhachHang() == null || !gioHang.getKhachHang().getId().equals(khachHangId)) {
            throw new IllegalArgumentException("Món hàng không thuộc giỏ hàng của bạn!");
        }

        if (soLuong == null || soLuong <= 0) {
            chiTietGioHangRepository.delete(item);
        } else {
            int tonKhaDung = imeiRepository.countAvailableByChiTietSanPhamId(item.getChiTietSanPham().getId());
            int finalQty = Math.min(soLuong, tonKhaDung > 0 ? tonKhaDung : 1);
            item.setSoLuong(finalQty);
            chiTietGioHangRepository.save(item);
        }

        recalculateGioHangTotals(gioHang);
        return chiTietGioHangRepository.findByGioHangId(gioHang.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<ChiTietGioHang> removeDbCartItem(Integer khachHangId, Integer chiTietGioHangId) {
        ChiTietGioHang item = chiTietGioHangRepository.findById(chiTietGioHangId)
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết giỏ hàng", "id", chiTietGioHangId));

        GioHang gioHang = item.getGioHang();
        if (gioHang == null || gioHang.getKhachHang() == null || !gioHang.getKhachHang().getId().equals(khachHangId)) {
            throw new IllegalArgumentException("Món hàng không thuộc giỏ hàng của bạn!");
        }

        chiTietGioHangRepository.delete(item);
        recalculateGioHangTotals(gioHang);
        return chiTietGioHangRepository.findByGioHangId(gioHang.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public CheckoutResponseDTO getCheckoutInfo(Integer khachHangId) {
        NguoiDung khachHang = nguoiDungRepository.findById(khachHangId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", khachHangId));

        Optional<GioHang> gioHangOpt = gioHangRepository.findByKhachHangId(khachHangId);
        if (gioHangOpt.isEmpty()) {
            return CheckoutResponseDTO.builder()
                    .success(false)
                    .message("Giỏ hàng của bạn đang trống.")
                    .khachHangId(khachHang.getId())
                    .hoTen(khachHang.getTen())
                    .soDienThoai(khachHang.getDienThoai())
                    .diaChi(khachHang.getDiaChi())
                    .email(khachHang.getEmail())
                    .items(new ArrayList<>())
                    .tongSoLuong(0)
                    .tongTienHang(BigDecimal.ZERO)
                    .coCanhBaoTonKho(false)
                    .build();
        }

        GioHang gioHang = gioHangOpt.get();
        List<ChiTietGioHang> cartItems = chiTietGioHangRepository.findByGioHangId(gioHang.getId());
        if (cartItems == null || cartItems.isEmpty()) {
            return CheckoutResponseDTO.builder()
                    .success(false)
                    .message("Giỏ hàng của bạn đang trống.")
                    .khachHangId(khachHang.getId())
                    .hoTen(khachHang.getTen())
                    .soDienThoai(khachHang.getDienThoai())
                    .diaChi(khachHang.getDiaChi())
                    .email(khachHang.getEmail())
                    .items(new ArrayList<>())
                    .tongSoLuong(0)
                    .tongTienHang(BigDecimal.ZERO)
                    .coCanhBaoTonKho(false)
                    .build();
        }

        List<CheckoutItemDTO> checkoutItems = new ArrayList<>();
        int totalQty = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;
        boolean coCanhBaoTonKho = false;
        StringBuilder canhBaoTongHop = new StringBuilder();

        for (ChiTietGioHang it : cartItems) {
            ChiTietSanPham ctsp = it.getChiTietSanPham();
            if (ctsp == null) continue;

            int cartQty = it.getSoLuong() != null ? it.getSoLuong() : 1;

            // 1. Kiểm tra tồn kho IMEI khả dụng
            int tonKhoKhaDung = imeiRepository.countAvailableByChiTietSanPhamId(ctsp.getId());
            boolean vuotTon = cartQty > tonKhoKhaDung;
            String canhBaoItem = null;
            if (vuotTon) {
                coCanhBaoTonKho = true;
                if (tonKhoKhaDung <= 0) {
                    canhBaoItem = "Sản phẩm hiện đã hết hàng trong kho!";
                } else {
                    canhBaoItem = "Sản phẩm hiện chỉ còn " + tonKhoKhaDung + " máy trong kho!";
                }
                if (canhBaoTongHop.length() > 0) canhBaoTongHop.append("; ");
                String spTen = ctsp.getSanPham() != null ? ctsp.getSanPham().getTenSp() : ctsp.getMaCtsp();
                canhBaoTongHop.append(spTen).append(": ").append(canhBaoItem);
            }

            // 2. Lấy giá bán có khuyến mãi từ Backend
            GiaKhuyenMaiResponse promo = khuyenMaiService.tinhGiaBanHienTai(ctsp.getId());
            BigDecimal giaGoc = (promo != null && promo.getGiaGoc() != null)
                    ? promo.getGiaGoc()
                    : (ctsp.getGia() != null ? ctsp.getGia() : BigDecimal.ZERO);
            BigDecimal giaBan = (promo != null && promo.getGiaBan() != null)
                    ? promo.getGiaBan()
                    : giaGoc;
            boolean coKM = promo != null && Boolean.TRUE.equals(promo.getCoKhuyenMai());
            BigDecimal giaTriGiam = (promo != null && promo.getGiaTriGiam() != null) ? promo.getGiaTriGiam() : BigDecimal.ZERO;
            Integer loaiGiam = (promo != null && promo.getLoaiGiam() != null) ? promo.getLoaiGiam() : Integer.valueOf(0);
            BigDecimal thanhTien = giaBan.multiply(BigDecimal.valueOf(cartQty));

            totalQty += cartQty;
            totalAmount = totalAmount.add(thanhTien);

            // 3. Tên & Cấu hình chi tiết
            String tenSp = ctsp.getSanPham() != null ? ctsp.getSanPham().getTenSp() : "Laptop";
            String cpu = ctsp.getCpu() != null ? ctsp.getCpu().getTenCpu() : "";
            String ram = ctsp.getRam() != null ? ctsp.getRam().getDungLuong() : "";
            String oCung = ctsp.getOCung() != null ? ctsp.getOCung().getDungLuong() : "";
            String gpu = ctsp.getCardDoHoa() != null ? ctsp.getCardDoHoa().getTenCard() : "";
            String manHinh = ctsp.getManHinh() != null ? ctsp.getManHinh().getKichThuoc() : "";
            String mauSac = ctsp.getMauSac() != null ? ctsp.getMauSac().getTenMau() : "";

            List<String> specsParts = new ArrayList<>();
            if (!cpu.isEmpty()) specsParts.add(cpu);
            if (!ram.isEmpty()) specsParts.add(ram);
            if (!oCung.isEmpty()) specsParts.add(oCung);
            if (!gpu.isEmpty()) specsParts.add(gpu);
            if (!manHinh.isEmpty()) specsParts.add(manHinh);
            String cauHinhSummary = String.join(" / ", specsParts);

            // 4. Hình ảnh sản phẩm
            String hinhAnh = null;
            if (ctsp.getDanhSachHinhAnh() != null && !ctsp.getDanhSachHinhAnh().isEmpty()) {
                hinhAnh = ctsp.getDanhSachHinhAnh().get(0).getUrlHinhAnh();
            } else if (ctsp.getSanPham() != null && ctsp.getSanPham().getDanhSachHinhAnh() != null && !ctsp.getSanPham().getDanhSachHinhAnh().isEmpty()) {
                hinhAnh = ctsp.getSanPham().getDanhSachHinhAnh().get(0).getUrlHinhAnh();
            }

            CheckoutItemDTO itemDTO = CheckoutItemDTO.builder()
                    .idChiTietGioHang(it.getId())
                    .idChiTietSanPham(ctsp.getId())
                    .maCtsp(ctsp.getMaCtsp())
                    .tenSanPham(tenSp)
                    .hinhAnh(hinhAnh)
                    .cpu(cpu)
                    .ram(ram)
                    .oCung(oCung)
                    .cardDoHoa(gpu)
                    .manHinh(manHinh)
                    .mauSac(mauSac)
                    .cauHinhSummary(cauHinhSummary)
                    .soLuong(cartQty)
                    .giaGoc(giaGoc)
                    .giaSauKhuyenMai(giaBan)
                    .coKhuyenMai(coKM)
                    .giaTriGiam(giaTriGiam)
                    .loaiGiam(loaiGiam)
                    .thanhTien(thanhTien)
                    .soLuongTonKho(tonKhoKhaDung)
                    .vuotTonKho(vuotTon)
                    .canhBaoTonKho(canhBaoItem)
                    .build();

            checkoutItems.add(itemDTO);
        }

        return CheckoutResponseDTO.builder()
                .success(true)
                .message("Lấy thông tin thanh toán thành công")
                .khachHangId(khachHang.getId())
                .hoTen(khachHang.getTen())
                .soDienThoai(khachHang.getDienThoai())
                .diaChi(khachHang.getDiaChi())
                .email(khachHang.getEmail())
                .items(checkoutItems)
                .tongSoLuong(totalQty)
                .tongTienHang(totalAmount)
                .coCanhBaoTonKho(coCanhBaoTonKho)
                .thongBaoTonKho(canhBaoTongHop.length() > 0 ? canhBaoTongHop.toString() : null)
                .build();
    }

    private GioHang getOrCreateGioHang(NguoiDung khachHang) {
        return gioHangRepository.findByKhachHangId(khachHang.getId())
                .orElseGet(() -> {
                    String ma = "GH" + String.format("%04d", khachHang.getId());
                    if (gioHangRepository.findByMa(ma).isPresent()) {
                        ma = "GH" + khachHang.getId() + "_" + (System.currentTimeMillis() % 10000);
                    }
                    GioHang newCart = GioHang.builder()
                            .ma(ma)
                            .khachHang(khachHang)
                            .tongSoLuong(0)
                            .tongSoTien(BigDecimal.ZERO)
                            .build();
                    return gioHangRepository.save(newCart);
                });
    }

    private void recalculateGioHangTotals(GioHang gioHang) {
        List<ChiTietGioHang> items = chiTietGioHangRepository.findByGioHangId(gioHang.getId());
        int totalQty = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (ChiTietGioHang item : items) {
            int qty = item.getSoLuong() != null ? item.getSoLuong() : 0;
            BigDecimal price = item.getGiaTungSanPham() != null ? item.getGiaTungSanPham() : BigDecimal.ZERO;
            totalQty += qty;
            totalAmount = totalAmount.add(price.multiply(BigDecimal.valueOf(qty)));
        }
        gioHang.setTongSoLuong(totalQty);
        gioHang.setTongSoTien(totalAmount);
        gioHangRepository.save(gioHang);
    }
}
