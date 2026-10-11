package com.laptopstore.service;

import com.laptopstore.entity.*;
import com.laptopstore.repository.*;
import com.laptopstore.service.impl.BaoHanhServiceImpl;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BaoHanhActivationTest {

    @Mock
    private BaoHanhRepository baoHanhRepository;

    @Mock
    private ChiTietHoaDonImeiRepository chiTietHoaDonImeiRepository;

    @Mock
    private YeuCauBaoHanhRepository yeuCauBaoHanhRepository;

    @Mock
    private HinhAnhRepository hinhAnhRepository;

    @Mock
    private HoaDonRepository hoaDonRepository;

    @Mock
    private ChiTietHoaDonRepository chiTietHoaDonRepository;

    @InjectMocks
    private BaoHanhServiceImpl baoHanhService;

    private HoaDon hoaDon;
    private ThanhToan thanhToan;
    private ChiTietHoaDon cthd1;
    private Imei imei1;
    private Imei imei2;
    private ChiTietHoaDonImei cti1;
    private ChiTietHoaDonImei cti2;

    @BeforeEach
    void setUp() {
        thanhToan = ThanhToan.builder()
                .id(10)
                .ma("TT1001")
                .trangThai(1) // Đã thanh toán
                .ngayThanhToan(LocalDateTime.now())
                .soTien(new BigDecimal("30000000"))
                .build();

        hoaDon = HoaDon.builder()
                .id(1)
                .ma("HD1001")
                .trangThai(3) // Hoàn thành
                .thanhToan(thanhToan)
                .build();

        cthd1 = ChiTietHoaDon.builder()
                .id(101)
                .hoaDon(hoaDon)
                .soLuong(2)
                .build();

        imei1 = Imei.builder().id(11).soImei("IMEI0001").trangThai(1).build();
        imei2 = Imei.builder().id(12).soImei("IMEI0002").trangThai(1).build();

        cti1 = ChiTietHoaDonImei.builder().id(201).chiTietHoaDon(cthd1).imei(imei1).build();
        cti2 = ChiTietHoaDonImei.builder().id(202).chiTietHoaDon(cthd1).imei(imei2).build();
    }

    @Test
    @DisplayName("Kích hoạt bảo hành thành công cho 2 IMEI khi hóa đơn hoàn thành và đã thanh toán")
    void testKichHoatBaoHanhSuccess() {
        when(hoaDonRepository.findById(1)).thenReturn(Optional.of(hoaDon));
        when(chiTietHoaDonImeiRepository.findByChiTietHoaDonHoaDonId(1)).thenReturn(List.of(cti1, cti2));
        when(chiTietHoaDonRepository.findByHoaDonId(1)).thenReturn(List.of(cthd1));
        when(baoHanhRepository.findByImeiId(11)).thenReturn(Optional.empty());
        when(baoHanhRepository.findByImeiId(12)).thenReturn(Optional.empty());

        when(baoHanhRepository.save(any(BaoHanh.class))).thenAnswer(invocation -> {
            BaoHanh bh = invocation.getArgument(0);
            if (bh.getId() == null) {
                bh.setId(bh.getImei().getId() == 11 ? 1 : 2);
            }
            return bh;
        });

        List<BaoHanh> result = baoHanhService.kichHoatBaoHanhTheoHoaDon(1);

        assertNotNull(result);
        assertEquals(2, result.size());

        BaoHanh bh1 = result.get(0);
        assertEquals(1, bh1.getTrangThai());
        assertEquals("IMEI0001", bh1.getImei().getSoImei());
        assertEquals("BH-000001", bh1.getMaPhieu());
        assertNotNull(bh1.getNgayKichHoat());
        assertEquals(bh1.getNgayKichHoat().plusMonths(12).getMonth(), bh1.getNgayHetHan().getMonth());

        BaoHanh bh2 = result.get(1);
        assertEquals(1, bh2.getTrangThai());
        assertEquals("IMEI0002", bh2.getImei().getSoImei());
        assertEquals("BH-000002", bh2.getMaPhieu());

        verify(baoHanhRepository, times(4)).save(any(BaoHanh.class));
    }

    @Test
    @DisplayName("Từ chối kích hoạt khi hóa đơn chưa ở trạng thái 3 (Hoàn thành)")
    void testTuChoiKhiHoaDonChuaHoanThanh() {
        hoaDon.setTrangThai(2); // Đang giao hàng
        when(hoaDonRepository.findById(1)).thenReturn(Optional.of(hoaDon));

        assertThrows(IllegalStateException.class, () -> {
            baoHanhService.kichHoatBaoHanhTheoHoaDon(1);
        });

        verify(baoHanhRepository, never()).save(any());
    }

    @Test
    @DisplayName("Từ chối kích hoạt khi thanh toán chưa hoàn tất (trangThai != 1)")
    void testTuChoiKhiChuaThanhToan() {
        thanhToan.setTrangThai(0); // Chưa thanh toán
        when(hoaDonRepository.findById(1)).thenReturn(Optional.of(hoaDon));

        assertThrows(IllegalStateException.class, () -> {
            baoHanhService.kichHoatBaoHanhTheoHoaDon(1);
        });

        verify(baoHanhRepository, never()).save(any());
    }

    @Test
    @DisplayName("Từ chối kích hoạt khi số lượng IMEI không khớp với số lượng mua")
    void testTuChoiKhiThieuImei() {
        when(hoaDonRepository.findById(1)).thenReturn(Optional.of(hoaDon));
        // Chỉ có 1 IMEI nhưng cthd1 yêu cầu 2
        when(chiTietHoaDonImeiRepository.findByChiTietHoaDonHoaDonId(1)).thenReturn(List.of(cti1));
        when(chiTietHoaDonRepository.findByHoaDonId(1)).thenReturn(List.of(cthd1));

        assertThrows(IllegalStateException.class, () -> {
            baoHanhService.kichHoatBaoHanhTheoHoaDon(1);
        });

        verify(baoHanhRepository, never()).save(any());
    }

    @Test
    @DisplayName("Chống tạo trùng: Khi IMEI đã có phiếu bảo hành, giữ nguyên không tạo mới")
    void testChongTaoTrungKhiDaCoBaoHanh() {
        BaoHanh existingBh = BaoHanh.builder()
                .id(99)
                .maPhieu("BH-000099")
                .imei(imei1)
                .ngayKichHoat(LocalDateTime.now().minusDays(5))
                .ngayHetHan(LocalDateTime.now().plusMonths(12).minusDays(5))
                .trangThai(1)
                .build();

        when(hoaDonRepository.findById(1)).thenReturn(Optional.of(hoaDon));
        when(chiTietHoaDonImeiRepository.findByChiTietHoaDonHoaDonId(1)).thenReturn(List.of(cti1, cti2));
        when(chiTietHoaDonRepository.findByHoaDonId(1)).thenReturn(List.of(cthd1));

        // imei1 đã có bảo hành từ trước
        when(baoHanhRepository.findByImeiId(11)).thenReturn(Optional.of(existingBh));
        // imei2 chưa có bảo hành
        when(baoHanhRepository.findByImeiId(12)).thenReturn(Optional.empty());

        when(baoHanhRepository.save(any(BaoHanh.class))).thenAnswer(invocation -> {
            BaoHanh bh = invocation.getArgument(0);
            if (bh.getId() == null) bh.setId(100);
            return bh;
        });

        List<BaoHanh> result = baoHanhService.kichHoatBaoHanhTheoHoaDon(1);

        assertEquals(2, result.size());
        assertEquals("BH-000099", result.get(0).getMaPhieu()); // Phiếu cũ giữ nguyên
        assertEquals("BH-000100", result.get(1).getMaPhieu()); // Phiếu mới được tạo

        // Chỉ gọi save cho imei2 (2 lần: temp và final id)
        verify(baoHanhRepository, times(2)).save(any(BaoHanh.class));
    }
}
