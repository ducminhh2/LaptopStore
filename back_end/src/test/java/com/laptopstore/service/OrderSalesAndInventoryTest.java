package com.laptopstore.service;

import com.laptopstore.dto.*;
import com.laptopstore.entity.*;
import com.laptopstore.repository.*;
import com.laptopstore.service.impl.GioHangServiceImpl;
import com.laptopstore.service.impl.HoaDonServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderSalesAndInventoryTest {

    // Mocks for GioHangService
    @Mock private GioHangRepository gioHangRepository;
    @Mock private ChiTietGioHangRepository chiTietGioHangRepository;
    @Mock private ChiTietSanPhamRepository chiTietSanPhamRepository;
    @Mock private ImeiRepository imeiRepository;
    @Mock private NguoiDungRepository nguoiDungRepository;
    @Mock private HoaDonRepository hoaDonRepository;
    @Mock private ThanhToanRepository thanhToanRepository;
    @Mock private ChiTietHoaDonRepository chiTietHoaDonRepository;
    @Mock private ChiTietHoaDonImeiRepository chiTietHoaDonImeiRepository;
    @Mock private VoucherRepository voucherRepository;
    @Mock private VoucherService voucherService;
    @Mock private KhuyenMaiService khuyenMaiService;
    @Mock private HinhAnhRepository hinhAnhRepository;
    @Mock private LichSuHoaDonRepository lichSuHoaDonRepository;
    @Mock private BaoHanhService baoHanhService;

    @InjectMocks
    private GioHangServiceImpl gioHangService;

    @InjectMocks
    private HoaDonServiceImpl hoaDonService;

    private NguoiDung customer;
    private NguoiDung staff;
    private SanPham sanPham;
    private ChiTietSanPham ctsp;
    private GioHang gioHang;
    private ChiTietGioHang cartItem;
    private Imei imei1;
    private Imei imei2;

    @BeforeEach
    void setUp() {
        customer = NguoiDung.builder()
                .id(10)
                .ma("KH010")
                .ten("Trần Văn Khách")
                .dienThoai("0987654321")
                .email("khach@gmail.com")
                .diaChi("Hà Nội")
                .build();

        staff = NguoiDung.builder()
                .id(4)
                .ma("NV004")
                .ten("Nhân Viên Bán Hàng")
                .dienThoai("0912345678")
                .email("staff@gmail.com")
                .build();

        sanPham = SanPham.builder()
                .id(100)
                .maSp("SP100")
                .tenSp("Dell XPS 13 Plus")
                .build();

        ctsp = ChiTietSanPham.builder()
                .id(200)
                .maCtsp("CTSP200")
                .sanPham(sanPham)
                .gia(new BigDecimal("35000000"))
                .giaBan(new BigDecimal("35000000"))
                .soLuong(5)
                .trangThai(1) // 1: Đang kinh doanh
                .build();

        gioHang = GioHang.builder()
                .id(300)
                .khachHang(customer)
                .tongSoLuong(1)
                .tongSoTien(new BigDecimal("35000000"))
                .build();

        cartItem = ChiTietGioHang.builder()
                .id(400)
                .gioHang(gioHang)
                .chiTietSanPham(ctsp)
                .soLuong(1)
                .build();

        imei1 = Imei.builder()
                .id(501)
                .soImei("860000000000001")
                .chiTietSanPham(ctsp)
                .trangThai(0) // 0: Trong kho
                .build();

        imei2 = Imei.builder()
                .id(502)
                .soImei("860000000000002")
                .chiTietSanPham(ctsp)
                .trangThai(0) // 0: Trong kho
                .build();
    }

    // =========================================================================
    // I. BÁN HÀNG ONLINE TESTS
    // =========================================================================

    @Test
    @DisplayName("Online-01: Đặt hàng COD online thành công -> Hóa đơn trạng thái 0, Thanh toán 0, giỏ hàng được xóa")
    void testDatHangOnlineCodSuccess() {
        DatHangRequest req = new DatHangRequest();
        req.setTenNguoiNhan("Trần Văn Khách");
        req.setDienThoai("0987654321");
        req.setDiaChi("123 Cầu Giấy, Hà Nội");
        req.setPhuongThucThanhToan("COD");

        when(nguoiDungRepository.findById(10)).thenReturn(Optional.of(customer));
        when(gioHangRepository.findByKhachHangId(10)).thenReturn(Optional.of(gioHang));
        when(chiTietGioHangRepository.findByGioHangId(300)).thenReturn(List.of(cartItem));
        when(chiTietSanPhamRepository.findById(200)).thenReturn(Optional.of(ctsp));
        when(imeiRepository.countAvailableByChiTietSanPhamId(200)).thenReturn(5);

        GiaKhuyenMaiResponse promo = GiaKhuyenMaiResponse.builder()
                .giaGoc(new BigDecimal("35000000"))
                .giaBan(new BigDecimal("33000000"))
                .build();
        when(khuyenMaiService.tinhGiaBanHienTai(200)).thenReturn(promo);

        when(thanhToanRepository.save(any(ThanhToan.class))).thenAnswer(i -> {
            ThanhToan tt = i.getArgument(0);
            tt.setId(1);
            return tt;
        });

        when(hoaDonRepository.save(any(HoaDon.class))).thenAnswer(i -> {
            HoaDon hd = i.getArgument(0);
            hd.setId(1);
            return hd;
        });

        DatHangResponse response = gioHangService.datHangOnline(10, req);

        assertNotNull(response);
        assertTrue(response.getSuccess());
        assertEquals(new BigDecimal("33000000"), response.getTongThanhToan());

        // Verify: Hóa đơn & thanh toán được tạo đúng
        verify(thanhToanRepository).save(argThat(tt ->
                "COD".equals(tt.getPhuongThuc()) &&
                Integer.valueOf(0).equals(tt.getTrangThai()) &&
                tt.getNgayThanhToan() == null
        ));

        verify(hoaDonRepository).save(argThat(hd ->
                Integer.valueOf(0).equals(hd.getTrangThai()) &&
                hd.getNhanVien() == null
        ));

        // Verify: Giỏ hàng được xóa rỗng
        verify(chiTietGioHangRepository).deleteAll(List.of(cartItem));
        verify(gioHangRepository).save(argThat(gh -> gh.getTongSoLuong() == 0));
    }

    @Test
    @DisplayName("Online-02: Đặt hàng Online thất bại khi số lượng vượt tồn kho IMEI khả dụng")
    void testDatHangOnlineVuotTonKho() {
        DatHangRequest req = new DatHangRequest();
        req.setTenNguoiNhan("Trần Văn Khách");
        req.setDienThoai("0987654321");
        req.setDiaChi("123 Cầu Giấy, Hà Nội");
        req.setPhuongThucThanhToan("COD");

        cartItem.setSoLuong(5); // Khách muốn mua 5
        when(nguoiDungRepository.findById(10)).thenReturn(Optional.of(customer));
        when(gioHangRepository.findByKhachHangId(10)).thenReturn(Optional.of(gioHang));
        when(chiTietGioHangRepository.findByGioHangId(300)).thenReturn(List.of(cartItem));
        when(chiTietSanPhamRepository.findById(200)).thenReturn(Optional.of(ctsp));
        when(imeiRepository.countAvailableByChiTietSanPhamId(200)).thenReturn(2); // Kho chỉ còn 2

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                gioHangService.datHangOnline(10, req)
        );
        assertTrue(ex.getMessage().contains("khả dụng trong kho"));
        verify(hoaDonRepository, never()).save(any());
    }

    @Test
    @DisplayName("Online-03: Đặt hàng thất bại khi số điện thoại không hợp lệ")
    void testDatHangOnlineSaiSoDienThoai() {
        DatHangRequest req = new DatHangRequest();
        req.setTenNguoiNhan("Trần Văn Khách");
        req.setDienThoai("12345"); // Không đủ 10 số
        req.setDiaChi("123 Cầu Giấy");
        req.setPhuongThucThanhToan("COD");

        when(nguoiDungRepository.findById(10)).thenReturn(Optional.of(customer));

        assertThrows(IllegalArgumentException.class, () ->
                gioHangService.datHangOnline(10, req)
        );
    }

    // =========================================================================
    // II. BÁN HÀNG TẠI QUẦY (POS) TESTS
    // =========================================================================

    @Test
    @DisplayName("POS-01: Thanh toán POS tại quầy nhận máy ngay -> Hoàn thành (3), Đã thanh toán (1), IMEI đã bán (1), Kích hoạt BH")
    void testPosCheckoutImmediateSuccess() {
        PosItemRequest itemReq = new PosItemRequest();
        itemReq.setCtspId(200);
        itemReq.setQty(1);
        itemReq.setImeiIds(List.of(501));

        PosCheckoutRequest req = new PosCheckoutRequest();
        req.setCustomerId(10);
        req.setCashierId(4);
        req.setItems(List.of(itemReq));
        req.setDeliveryType("TAI_QUAY");
        req.setIsCompleted(true);
        req.setPayMethod("TIEN_MAT");
        req.setCustomerGiven(new BigDecimal("40000000"));

        when(nguoiDungRepository.findById(10)).thenReturn(Optional.of(customer));
        when(nguoiDungRepository.findById(4)).thenReturn(Optional.of(staff));
        when(chiTietSanPhamRepository.findById(200)).thenReturn(Optional.of(ctsp));
        when(imeiRepository.findById(501)).thenReturn(Optional.of(imei1));
        when(chiTietHoaDonImeiRepository.findByImeiId(501)).thenReturn(Optional.empty());

        GiaKhuyenMaiResponse promo = GiaKhuyenMaiResponse.builder()
                .giaBan(new BigDecimal("35000000"))
                .build();
        when(khuyenMaiService.tinhGiaBanHienTai(ctsp)).thenReturn(promo);

        when(thanhToanRepository.save(any(ThanhToan.class))).thenAnswer(i -> i.getArgument(0));
        when(hoaDonRepository.save(any(HoaDon.class))).thenAnswer(i -> {
            HoaDon hd = i.getArgument(0);
            hd.setId(99);
            return hd;
        });
        when(chiTietHoaDonRepository.save(any(ChiTietHoaDon.class))).thenAnswer(i -> i.getArgument(0));

        HoaDon result = hoaDonService.posCheckout(req);

        assertNotNull(result);
        assertEquals(3, result.getTrangThai()); // 3: Hoàn thành
        assertEquals(1, result.getThanhToan().getTrangThai()); // 1: Đã thanh toán
        verify(imeiRepository).save(argThat(i -> i.getId().equals(501) && i.getTrangThai().equals(1))); // 1: Đã bán
        verify(baoHanhService).kichHoatBaoHanhTheoHoaDon(99);
    }

    @Test
    @DisplayName("POS-02: Chọn trùng IMEI trong cùng 1 đơn hàng POS -> Bị từ chối")
    void testPosCheckoutDuplicateImeiRejected() {
        PosItemRequest itemReq = new PosItemRequest();
        itemReq.setCtspId(200);
        itemReq.setQty(2);
        itemReq.setImeiIds(List.of(501, 501)); // Trùng IMEI 501

        PosCheckoutRequest req = new PosCheckoutRequest();
        req.setCustomerId(10);
        req.setCashierId(4);
        req.setItems(List.of(itemReq));

        when(nguoiDungRepository.findById(10)).thenReturn(Optional.of(customer));
        when(nguoiDungRepository.findById(4)).thenReturn(Optional.of(staff));
        when(chiTietSanPhamRepository.findById(200)).thenReturn(Optional.of(ctsp));
        when(imeiRepository.findById(501)).thenReturn(Optional.of(imei1));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                hoaDonService.posCheckout(req)
        );
        assertTrue(ex.getMessage().contains("chọn trùng lặp"));
    }

    @Test
    @DisplayName("POS-03: Gán IMEI đã bán (trang_thai = 1) -> Bị từ chối")
    void testPosCheckoutImeiAlreadySoldRejected() {
        imei1.setTrangThai(1); // Đã bán
        PosItemRequest itemReq = new PosItemRequest();
        itemReq.setCtspId(200);
        itemReq.setQty(1);
        itemReq.setImeiIds(List.of(501));

        PosCheckoutRequest req = new PosCheckoutRequest();
        req.setCustomerId(10);
        req.setCashierId(4);
        req.setItems(List.of(itemReq));

        when(nguoiDungRepository.findById(10)).thenReturn(Optional.of(customer));
        when(nguoiDungRepository.findById(4)).thenReturn(Optional.of(staff));
        when(chiTietSanPhamRepository.findById(200)).thenReturn(Optional.of(ctsp));
        when(imeiRepository.findById(501)).thenReturn(Optional.of(imei1));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                hoaDonService.posCheckout(req)
        );
        assertTrue(ex.getMessage().contains("Trong kho"));
    }

    @Test
    @DisplayName("POS-04: Gán IMEI của CTSP khác -> Bị từ chối")
    void testPosCheckoutImeiWrongCtspRejected() {
        ChiTietSanPham ctspKhac = ChiTietSanPham.builder().id(999).build();
        imei1.setChiTietSanPham(ctspKhac); // Không thuộc CTSP 200

        PosItemRequest itemReq = new PosItemRequest();
        itemReq.setCtspId(200);
        itemReq.setQty(1);
        itemReq.setImeiIds(List.of(501));

        PosCheckoutRequest req = new PosCheckoutRequest();
        req.setCustomerId(10);
        req.setCashierId(4);
        req.setItems(List.of(itemReq));

        when(nguoiDungRepository.findById(10)).thenReturn(Optional.of(customer));
        when(nguoiDungRepository.findById(4)).thenReturn(Optional.of(staff));
        when(chiTietSanPhamRepository.findById(200)).thenReturn(Optional.of(ctsp));
        when(imeiRepository.findById(501)).thenReturn(Optional.of(imei1));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                hoaDonService.posCheckout(req)
        );
        assertTrue(ex.getMessage().contains("không thuộc cấu hình"));
    }

    // =========================================================================
    // III. QUẢN LÝ HÓA ĐƠN VÀ CHUYỂN TRẠNG THÁI TESTS
    // =========================================================================

    @Test
    @DisplayName("HD-01: Chuyển trạng thái hóa đơn đúng quy trình: 0 -> 1 -> 2 -> 3")
    void testOrderWorkflowSuccess() {
        ThanhToan tt = ThanhToan.builder().id(1).trangThai(0).soTien(new BigDecimal("35000000")).build();
        HoaDon hd = HoaDon.builder().id(10).ma("HD10").trangThai(0).thanhToan(tt).build();

        when(hoaDonRepository.findById(10)).thenReturn(Optional.of(hd));
        when(nguoiDungRepository.findById(4)).thenReturn(Optional.of(staff));
        when(hoaDonRepository.save(any(HoaDon.class))).thenAnswer(i -> i.getArgument(0));

        // 1. Xác nhận đơn: 0 -> 1
        HoaDon hd1 = hoaDonService.xacNhanDonHang(10, 4);
        assertEquals(1, hd1.getTrangThai());
        assertEquals(staff, hd1.getNhanVien());

        // 2. Bắt đầu giao hàng: 1 -> 2
        HoaDon hd2 = hoaDonService.giaoHang(10, null, 4);
        assertEquals(2, hd2.getTrangThai());

        // 3. Giao hàng & thu tiền thành công (COD): 2 -> 3
        HoaDon hd3 = hoaDonService.xacNhanGiaoHangVaThuTien(10, null, 4);
        assertEquals(3, hd3.getTrangThai());
        assertEquals(1, hd3.getThanhToan().getTrangThai());
        assertNotNull(hd3.getThanhToan().getNgayThanhToan());
        verify(baoHanhService).kichHoatBaoHanhTheoHoaDon(10);
    }

    @Test
    @DisplayName("HD-02: Không cho nhảy cóc trạng thái trái quy trình (bắt đầu giao khi đơn chưa xác nhận)")
    void testOrderInvalidTransitionRejected() {
        HoaDon hd = HoaDon.builder().id(10).ma("HD10").trangThai(0).build(); // Đang ở 0
        when(hoaDonRepository.findById(10)).thenReturn(Optional.of(hd));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                hoaDonService.giaoHang(10)
        );
        assertTrue(ex.getMessage().contains("Đã xác nhận"));
    }

    @Test
    @DisplayName("HD-03: Khách hàng hủy đơn hàng (0 hoặc 1) -> Trạng thái sang 4 và giải phóng IMEI về kho")
    void testCustomerCancelOrderReleasesImei() {
        HoaDon hd = HoaDon.builder()
                .id(10)
                .ma("HD10")
                .trangThai(1)
                .khachHang(customer)
                .thanhToan(ThanhToan.builder().trangThai(0).build())
                .build();

        ChiTietHoaDon cthd = ChiTietHoaDon.builder().id(20).hoaDon(hd).build();
        ChiTietHoaDonImei cti = ChiTietHoaDonImei.builder().id(30).chiTietHoaDon(cthd).imei(imei1).build();

        when(hoaDonRepository.findById(10)).thenReturn(Optional.of(hd));
        when(chiTietHoaDonImeiRepository.findByChiTietHoaDonHoaDonId(10)).thenReturn(List.of(cti));
        when(hoaDonRepository.save(any(HoaDon.class))).thenAnswer(i -> i.getArgument(0));

        HoaDon result = hoaDonService.huyDonHangKhachHang(10, 10);

        assertEquals(4, result.getTrangThai());
        verify(chiTietHoaDonImeiRepository).deleteAll(List.of(cti));
        verify(chiTietSanPhamRepository).updateSoLuong(eq(200), anyInt());
    }

    @Test
    @DisplayName("HD-04: Đơn hàng đã hoàn thành (3) không được phép hủy")
    void testCannotCancelCompletedOrder() {
        HoaDon hd = HoaDon.builder().id(10).ma("HD10").trangThai(3).khachHang(customer).build();
        when(hoaDonRepository.findById(10)).thenReturn(Optional.of(hd));

        assertThrows(IllegalStateException.class, () ->
                hoaDonService.huyDonHangKhachHang(10, 10)
        );
    }
}
