package com.laptopstore.service;

import com.laptopstore.dto.*;
import com.laptopstore.entity.*;
import com.laptopstore.repository.*;
import com.laptopstore.service.impl.*;
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
public class E2EIntegrationFlowTest {

    // Repositories
    @Mock private HoaDonRepository hoaDonRepository;
    @Mock private ThanhToanRepository thanhToanRepository;
    @Mock private ChiTietHoaDonRepository chiTietHoaDonRepository;
    @Mock private ChiTietHoaDonImeiRepository chiTietHoaDonImeiRepository;
    @Mock private ImeiRepository imeiRepository;
    @Mock private NguoiDungRepository nguoiDungRepository;
    @Mock private ChiTietSanPhamRepository chiTietSanPhamRepository;
    @Mock private VoucherRepository voucherRepository;
    @Mock private VoucherService voucherService;
    @Mock private KhuyenMaiService khuyenMaiService;
    @Mock private HinhAnhRepository hinhAnhRepository;
    @Mock private LichSuHoaDonRepository lichSuHoaDonRepository;
    @Mock private BaoHanhRepository baoHanhRepository;
    @Mock private YeuCauBaoHanhRepository yeuCauBaoHanhRepository;

    private HoaDonServiceImpl hoaDonService;
    private BaoHanhServiceImpl baoHanhService;
    private YeuCauBaoHanhServiceImpl yeuCauBaoHanhService;

    private NguoiDung customer;
    private NguoiDung staffA;
    private NguoiDung staffB;
    private VaiTro vaiTroNhanVien;
    private ChiTietSanPham ctsp;
    private Imei imei;

    @BeforeEach
    void setUp() {
        baoHanhService = new BaoHanhServiceImpl(
                baoHanhRepository,
                chiTietHoaDonImeiRepository,
                yeuCauBaoHanhRepository,
                hinhAnhRepository,
                hoaDonRepository,
                chiTietHoaDonRepository
        );

        hoaDonService = new HoaDonServiceImpl(
                hoaDonRepository,
                thanhToanRepository,
                chiTietHoaDonRepository,
                chiTietHoaDonImeiRepository,
                imeiRepository,
                nguoiDungRepository,
                chiTietSanPhamRepository,
                voucherRepository,
                voucherService,
                khuyenMaiService,
                hinhAnhRepository,
                lichSuHoaDonRepository,
                baoHanhService
        );

        yeuCauBaoHanhService = new YeuCauBaoHanhServiceImpl(
                yeuCauBaoHanhRepository,
                baoHanhRepository,
                chiTietHoaDonImeiRepository,
                hinhAnhRepository,
                nguoiDungRepository
        );
        vaiTroNhanVien = VaiTro.builder().id(2).tenVaiTro("Nhân viên").build();

        customer = NguoiDung.builder()
                .id(10)
                .ma("KH010")
                .ten("Nguyễn Văn Khách")
                .dienThoai("0912345678")
                .email("khach@gmail.com")
                .diaChi("Hà Nội")
                .build();

        staffA = NguoiDung.builder()
                .id(4)
                .ma("NV001")
                .ten("Nhân Viên 1")
                .vaiTro(vaiTroNhanVien)
                .build();

        staffB = NguoiDung.builder()
                .id(5)
                .ma("NV002")
                .ten("Nhân Viên 2")
                .vaiTro(vaiTroNhanVien)
                .build();

        ctsp = ChiTietSanPham.builder()
                .id(200)
                .maCtsp("CTSP200")
                .sanPham(SanPham.builder().id(100).tenSp("Lenovo ThinkPad X1").build())
                .gia(new BigDecimal("30000000"))
                .giaBan(new BigDecimal("30000000"))
                .soLuong(5)
                .trangThai(1)
                .build();

        imei = Imei.builder()
                .id(501)
                .soImei("861234567890001")
                .chiTietSanPham(ctsp)
                .trangThai(0) // 0: Trong kho
                .build();
    }

    @Test
    @DisplayName("E2E-01: Online COD xuyên suốt 5 module thành công")
    void testE2E01_OnlineCodFullLifecycle() {
        // 1. Tạo hóa đơn COD online (trạng thái 0, thanh toán 0)
        ThanhToan tt = ThanhToan.builder()
                .id(101)
                .ma("TT101")
                .phuongThuc("COD")
                .soTien(new BigDecimal("30000000"))
                .trangThai(0)
                .build();

        HoaDon hd = HoaDon.builder()
                .id(1)
                .ma("HD1001")
                .khachHang(customer)
                .trangThai(0)
                .thanhToan(tt)
                .diaChi("Hà Nội")
                .dienThoai("0912345678")
                .build();

        ChiTietHoaDon cthd = ChiTietHoaDon.builder()
                .id(1001)
                .hoaDon(hd)
                .chiTietSanPham(ctsp)
                .soLuong(1)
                .giaTungSanPham(new BigDecimal("30000000"))
                .build();

        when(hoaDonRepository.findById(1)).thenReturn(Optional.of(hd));
        when(nguoiDungRepository.findById(4)).thenReturn(Optional.of(staffA));
        when(chiTietHoaDonRepository.findByHoaDonId(1)).thenReturn(List.of(cthd));
        when(imeiRepository.findById(501)).thenReturn(Optional.of(imei));
        when(chiTietHoaDonImeiRepository.findByImeiId(501)).thenReturn(Optional.empty());
        when(hoaDonRepository.save(any(HoaDon.class))).thenAnswer(i -> i.getArgument(0));

        // 2. Nhân viên xác nhận đơn & phân bổ IMEI (0 -> 1)
        XacNhanDonHangRequest xnReq = new XacNhanDonHangRequest();
        XacNhanDonHangRequest.ChiTietImeiItem item = new XacNhanDonHangRequest.ChiTietImeiItem();
        item.setIdChiTietHoaDon(1001);
        item.setImeiIds(List.of(501));
        xnReq.setChiTietImei(List.of(item));

        HoaDon confirmedHd = hoaDonService.xacNhanDonHangWithImei(1, xnReq, null, 4);
        assertEquals(1, confirmedHd.getTrangThai());
        verify(chiTietHoaDonImeiRepository).saveAll(anyList());

        // 3. Nhân viên giao hàng (1 -> 2)
        HoaDon deliveringHd = hoaDonService.giaoHang(1, null, 4);
        assertEquals(2, deliveringHd.getTrangThai());

        // 4. Giao hàng thành công & thu tiền COD (2 -> 3)
        ChiTietHoaDonImei cti = ChiTietHoaDonImei.builder().id(2001).chiTietHoaDon(cthd).imei(imei).build();
        when(chiTietHoaDonImeiRepository.findByChiTietHoaDonHoaDonId(1)).thenReturn(List.of(cti));
        when(baoHanhRepository.findByImeiId(501)).thenReturn(Optional.empty());
        when(baoHanhRepository.save(any(BaoHanh.class))).thenAnswer(i -> {
            BaoHanh b = i.getArgument(0);
            b.setId(301);
            return b;
        });

        HoaDon completedHd = hoaDonService.xacNhanGiaoHangVaThuTien(1, null, 4);
        assertEquals(3, completedHd.getTrangThai());
        assertEquals(1, completedHd.getThanhToan().getTrangThai());

        // 5. Phiếu bảo hành đã được tự động tạo trong bao_hanh khi hoàn thành đơn
        BaoHanh bh = BaoHanh.builder()
                .id(301)
                .maPhieu("BH-000301")
                .imei(imei)
                .ngayKichHoat(LocalDateTime.now())
                .ngayHetHan(LocalDateTime.now().plusMonths(12))
                .trangThai(1)
                .build();

        // 6. Khách hàng gửi yêu cầu bảo hành
        when(nguoiDungRepository.findById(10)).thenReturn(Optional.of(customer));
        when(baoHanhRepository.findByIdForUpdate(301)).thenReturn(Optional.of(bh));
        when(baoHanhRepository.isWarrantyOwnedByCustomer(301, 10)).thenReturn(true);
        when(yeuCauBaoHanhRepository.existsOpenRequestByBaoHanhId(301)).thenReturn(false);
        when(yeuCauBaoHanhRepository.save(any(YeuCauBaoHanh.class))).thenAnswer(i -> {
            YeuCauBaoHanh y = i.getArgument(0);
            y.setId(401);
            return y;
        });

        WarrantyRequestCreateDTO ycbhReq = WarrantyRequestCreateDTO.builder()
                .idBaoHanh(301)
                .moTaLoi("Laptop bị lỗi pin không sạc được")
                .dienThoaiLienHe("0912345678")
                .build();

        WarrantyRequestResponseDTO createdReq = yeuCauBaoHanhService.guiYeuCauBaoHanh(ycbhReq, 10);
        assertNotNull(createdReq);
        assertEquals(0, createdReq.getTrangThai());

        // 7. Nhân viên tiếp nhận (0 -> 1)
        YeuCauBaoHanh ycbhEntity = YeuCauBaoHanh.builder()
                .id(401)
                .baoHanh(bh)
                .khachHang(customer)
                .trangThai(0)
                .build();
        when(yeuCauBaoHanhRepository.findByIdForUpdate(401)).thenReturn(Optional.of(ycbhEntity));

        WarrantyRequestResponseDTO receivedReq = yeuCauBaoHanhService.tiepNhanYeuCau(401, 4);
        assertEquals(1, receivedReq.getTrangThai());

        // 8. Nhân viên bắt đầu xử lý (1 -> 2)
        WarrantyRequestResponseDTO processingReq = yeuCauBaoHanhService.batDauXuLy(401, 4);
        assertEquals(2, processingReq.getTrangThai());

        // 9. Nhân viên hoàn thành xử lý (2 -> 3)
        WarrantyRequestResponseDTO finishedReq = yeuCauBaoHanhService.hoanThanhYeuCau(401, "Đã thay cell pin chính hãng mới", 4);
        assertEquals(3, finishedReq.getTrangThai());
        assertNotNull(finishedReq.getNgayHoanThanh());
    }

    @Test
    @DisplayName("E2E-02: POS thành công -> Hoàn thành đơn, IMEI đã bán, bảo hành tự kích hoạt")
    void testE2E02_PosCheckoutFullLifecycle() {
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
        req.setCustomerGiven(new BigDecimal("30000000"));

        when(nguoiDungRepository.findById(10)).thenReturn(Optional.of(customer));
        when(nguoiDungRepository.findById(4)).thenReturn(Optional.of(staffA));
        when(chiTietSanPhamRepository.findById(200)).thenReturn(Optional.of(ctsp));
        when(imeiRepository.findById(501)).thenReturn(Optional.of(imei));
        when(chiTietHoaDonImeiRepository.findByImeiId(501)).thenReturn(Optional.empty());

        GiaKhuyenMaiResponse promo = GiaKhuyenMaiResponse.builder()
                .giaBan(new BigDecimal("30000000"))
                .build();
        when(khuyenMaiService.tinhGiaBanHienTai(ctsp)).thenReturn(promo);

        when(thanhToanRepository.save(any(ThanhToan.class))).thenAnswer(i -> i.getArgument(0));
        when(hoaDonRepository.save(any(HoaDon.class))).thenAnswer(i -> {
            HoaDon hd = i.getArgument(0);
            hd.setId(100);
            return hd;
        });
        when(hoaDonRepository.findById(100)).thenAnswer(i -> Optional.of(HoaDon.builder()
                .id(100)
                .ma("HD100")
                .trangThai(3)
                .thanhToan(ThanhToan.builder().id(1).trangThai(1).build())
                .build()));
        when(chiTietHoaDonRepository.save(any(ChiTietHoaDon.class))).thenAnswer(i -> i.getArgument(0));

        when(chiTietHoaDonImeiRepository.findByChiTietHoaDonHoaDonId(100)).thenReturn(List.of(
                ChiTietHoaDonImei.builder().id(999).imei(imei).chiTietHoaDon(ChiTietHoaDon.builder().id(888).soLuong(1).build()).build()
        ));
        when(chiTietHoaDonRepository.findByHoaDonId(100)).thenReturn(List.of(
                ChiTietHoaDon.builder().id(888).soLuong(1).build()
        ));
        when(baoHanhRepository.findByImeiId(501)).thenReturn(Optional.empty());
        when(baoHanhRepository.save(any(BaoHanh.class))).thenAnswer(i -> {
            BaoHanh b = i.getArgument(0);
            b.setId(555);
            return b;
        });

        HoaDon posHd = hoaDonService.posCheckout(req);

        assertNotNull(posHd);
        assertEquals(3, posHd.getTrangThai()); // 3: Hoàn thành
        assertEquals(1, posHd.getThanhToan().getTrangThai()); // 1: Đã thanh toán
        verify(imeiRepository).save(argThat(i -> i.getId().equals(501) && Integer.valueOf(1).equals(i.getTrangThai()))); // IMEI đã bán
    }

    @Test
    @DisplayName("E2E-04: POS thanh toán thất bại (tiền khách đưa không đủ) -> Thao tác rollback, không bán IMEI, không tạo bảo hành")
    void testE2E04_PosPaymentFailureSimulation() {
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
        req.setCustomerGiven(new BigDecimal("10000000")); // Đơn 30tr nhưng khách đưa 10tr

        when(nguoiDungRepository.findById(10)).thenReturn(Optional.of(customer));
        when(nguoiDungRepository.findById(4)).thenReturn(Optional.of(staffA));
        when(chiTietSanPhamRepository.findById(200)).thenReturn(Optional.of(ctsp));
        when(imeiRepository.findById(501)).thenReturn(Optional.of(imei));
        when(chiTietHoaDonImeiRepository.findByImeiId(501)).thenReturn(Optional.empty());

        GiaKhuyenMaiResponse promo = GiaKhuyenMaiResponse.builder()
                .giaBan(new BigDecimal("30000000"))
                .build();
        when(khuyenMaiService.tinhGiaBanHienTai(ctsp)).thenReturn(promo);

        // Ném ngoại lệ do thiếu tiền
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                hoaDonService.posCheckout(req)
        );
        assertTrue(ex.getMessage().contains("không đủ để thanh toán"));

        // Xác nhận không tạo hóa đơn và không cập nhật IMEI
        verify(hoaDonRepository, never()).save(any());
        assertEquals(0, imei.getTrangThai()); // IMEI vẫn nguyên trạng thái 0 (Trong kho)
    }

    @Test
    @DisplayName("E2E-03: Hóa đơn Online bị hủy -> Giải phóng IMEI và không có bảo hành nào được tạo")
    void testE2E03_OnlineOrderCancelled_RollsBackStock() {
        ThanhToan tt = ThanhToan.builder().id(101).trangThai(0).build();
        HoaDon hd = HoaDon.builder().id(1).khachHang(customer).trangThai(1).thanhToan(tt).build();
        ChiTietHoaDon cthd = ChiTietHoaDon.builder().id(1001).hoaDon(hd).chiTietSanPham(ctsp).build();
        ChiTietHoaDonImei cti = ChiTietHoaDonImei.builder().id(2001).chiTietHoaDon(cthd).imei(imei).build();

        when(hoaDonRepository.findById(1)).thenReturn(Optional.of(hd));
        when(chiTietHoaDonImeiRepository.findByChiTietHoaDonHoaDonId(1)).thenReturn(List.of(cti));
        when(hoaDonRepository.save(any(HoaDon.class))).thenAnswer(i -> i.getArgument(0));

        // Khách hàng hủy đơn
        HoaDon cancelled = hoaDonService.huyDonHangKhachHang(1, 10);
        assertEquals(4, cancelled.getTrangThai());

        // IMEI được trả về kho (0) và xóa khỏi chi_tiet_hoa_don_imei
        verify(chiTietHoaDonImeiRepository).deleteAll(List.of(cti));
        verify(chiTietSanPhamRepository).updateSoLuong(eq(200), anyInt());

        // Thử kích hoạt bảo hành cho đơn đã hủy -> Phải ném ngoại lệ
        assertThrows(IllegalStateException.class, () ->
                baoHanhService.kichHoatBaoHanhTheoHoaDon(1)
        );
    }

    @Test
    @DisplayName("E2E-05: Tranh chấp IMEI giữa 2 hóa đơn -> Hóa đơn sau bị chặn khi cố gán IMEI đã phân bổ")
    void testE2E05_TwoOrdersCompetingForSameImei() {
        // Giả sử imei 501 đã được gán cho 1 chi tiết hóa đơn khác
        when(chiTietHoaDonImeiRepository.findByImeiId(501))
                .thenReturn(Optional.of(ChiTietHoaDonImei.builder().id(999).build()));

        HoaDon hd2 = HoaDon.builder().id(2).trangThai(0).build();
        ChiTietHoaDon cthd2 = ChiTietHoaDon.builder().id(1002).hoaDon(hd2).chiTietSanPham(ctsp).soLuong(1).build();

        when(hoaDonRepository.findById(2)).thenReturn(Optional.of(hd2));
        when(nguoiDungRepository.findById(4)).thenReturn(Optional.of(staffA));
        when(chiTietHoaDonRepository.findByHoaDonId(2)).thenReturn(List.of(cthd2));
        when(imeiRepository.findById(501)).thenReturn(Optional.of(imei));

        XacNhanDonHangRequest req = new XacNhanDonHangRequest();
        XacNhanDonHangRequest.ChiTietImeiItem item = new XacNhanDonHangRequest.ChiTietImeiItem();
        item.setIdChiTietHoaDon(1002);
        item.setImeiIds(List.of(501));
        req.setChiTietImei(List.of(item));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                hoaDonService.xacNhanDonHangWithImei(2, req, null, 4)
        );
        assertTrue(ex.getMessage().contains("đã được phân bổ cho hóa đơn khác"));
    }

    @Test
    @DisplayName("E2E-06: Bảo hành hết hạn -> Khách không gửi được yêu cầu bảo hành mới")
    void testE2E06_ExpiredWarrantyBlocksNewRequest() {
        BaoHanh expiredBh = BaoHanh.builder()
                .id(302)
                .maPhieu("BH-EXPIRED")
                .imei(imei)
                .ngayKichHoat(LocalDateTime.now().minusMonths(13))
                .ngayHetHan(LocalDateTime.now().minusMonths(1)) // Đã hết hạn 1 tháng trước
                .trangThai(1)
                .build();

        when(nguoiDungRepository.findById(10)).thenReturn(Optional.of(customer));
        when(baoHanhRepository.findByIdForUpdate(302)).thenReturn(Optional.of(expiredBh));
        when(baoHanhRepository.isWarrantyOwnedByCustomer(302, 10)).thenReturn(true);

        WarrantyRequestCreateDTO req = WarrantyRequestCreateDTO.builder()
                .idBaoHanh(302)
                .moTaLoi("Hỏng bàn phím bấm không ăn")
                .dienThoaiLienHe("0912345678")
                .build();

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                yeuCauBaoHanhService.guiYeuCauBaoHanh(req, 10)
        );
        assertTrue(ex.getMessage().contains("hết hạn"));
    }

    @Test
    @DisplayName("E2E-07: Yêu cầu đã tiếp nhận hợp lệ vẫn hoàn thành được dù thời hạn bảo hành vừa hết hạn trong lúc xử lý")
    void testE2E07_OngoingRequestCanCompleteEvenIfWarrantyExpires() {
        // Phiếu bảo hành đã hết hạn tại thời điểm hiện tại
        BaoHanh expiredBh = BaoHanh.builder()
                .id(303)
                .maPhieu("BH-000303")
                .imei(imei)
                .ngayKichHoat(LocalDateTime.now().minusMonths(13))
                .ngayHetHan(LocalDateTime.now().minusDays(1)) // Vừa hết hạn hôm qua
                .trangThai(1)
                .build();

        // Nhưng yêu cầu đã được tiếp nhận và đang ở trạng thái 2 (Đang xử lý)
        YeuCauBaoHanh ongoingReq = YeuCauBaoHanh.builder()
                .id(403)
                .baoHanh(expiredBh)
                .khachHang(customer)
                .nhanVien(staffA)
                .ngayYeuCau(LocalDateTime.now().minusDays(5)) // Gửi lúc còn hạn
                .ngayTiepNhan(LocalDateTime.now().minusDays(4))
                .ngayBatDauXuLy(LocalDateTime.now().minusDays(3))
                .trangThai(2) // 2: Đang xử lý
                .build();

        when(nguoiDungRepository.findById(4)).thenReturn(Optional.of(staffA));
        when(yeuCauBaoHanhRepository.findByIdForUpdate(403)).thenReturn(Optional.of(ongoingReq));
        when(yeuCauBaoHanhRepository.save(any(YeuCauBaoHanh.class))).thenAnswer(i -> i.getArgument(0));

        // Kỹ thuật viên hoàn thành sửa chữa
        WarrantyRequestResponseDTO finished = yeuCauBaoHanhService.hoanThanhYeuCau(403, "Đã sửa thành công card wifi", 4);
        assertNotNull(finished);
        assertEquals(3, finished.getTrangThai());
        assertNotNull(finished.getNgayHoanThanh());
    }

    @Test
    @DisplayName("E2E-08: Hai nhân viên cùng thao tác tiếp nhận 1 yêu cầu -> Chỉ 1 người thành công, người thứ hai bị từ chối")
    void testE2E08_TwoStaffSimultaneousReceipt_OnlyOneSucceeds() {
        YeuCauBaoHanh req = YeuCauBaoHanh.builder()
                .id(404)
                .trangThai(0) // 0: Chờ tiếp nhận
                .build();

        when(nguoiDungRepository.findById(4)).thenReturn(Optional.of(staffA));
        when(nguoiDungRepository.findById(5)).thenReturn(Optional.of(staffB));
        when(yeuCauBaoHanhRepository.findByIdForUpdate(404)).thenReturn(Optional.of(req));
        when(yeuCauBaoHanhRepository.save(any(YeuCauBaoHanh.class))).thenAnswer(i -> i.getArgument(0));

        // Nhân viên A tiếp nhận thành công
        WarrantyRequestResponseDTO resA = yeuCauBaoHanhService.tiepNhanYeuCau(404, 4);
        assertEquals(1, resA.getTrangThai());
        assertEquals(1, req.getTrangThai()); // Bây giờ trạng thái đã là 1

        // Nhân viên B thao tác trên cùng yêu cầu -> Trạng thái không còn là 0 -> Bị từ chối
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                yeuCauBaoHanhService.tiepNhanYeuCau(404, 5)
        );
        assertTrue(ex.getMessage().contains("người khác") || ex.getMessage().contains("Chờ tiếp nhận"));
    }
}
