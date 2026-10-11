package com.laptopstore.service;

import com.laptopstore.dto.WarrantyRequestCreateDTO;
import com.laptopstore.dto.WarrantyRequestResponseDTO;
import com.laptopstore.entity.*;
import com.laptopstore.repository.*;
import com.laptopstore.service.impl.YeuCauBaoHanhServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WarrantyProcessingTest {

    @Mock
    private YeuCauBaoHanhRepository yeuCauBaoHanhRepository;

    @Mock
    private BaoHanhRepository baoHanhRepository;

    @Mock
    private ChiTietHoaDonImeiRepository chiTietHoaDonImeiRepository;

    @Mock
    private HinhAnhRepository hinhAnhRepository;

    @Mock
    private NguoiDungRepository nguoiDungRepository;

    @InjectMocks
    private YeuCauBaoHanhServiceImpl yeuCauBaoHanhService;

    private VaiTro vaiTroAdmin;
    private VaiTro vaiTroNhanVien;
    private VaiTro vaiTroKhachHang;

    private NguoiDung adminUser;
    private NguoiDung staffA;
    private NguoiDung staffB;
    private NguoiDung customerUser;

    private BaoHanh baoHanh;
    private Imei imei;
    private YeuCauBaoHanh requestPending;

    @BeforeEach
    void setUp() {
        vaiTroAdmin = VaiTro.builder().id(1).tenVaiTro("Quản trị viên").build();
        vaiTroNhanVien = VaiTro.builder().id(2).tenVaiTro("Nhân viên").build();
        vaiTroKhachHang = VaiTro.builder().id(3).tenVaiTro("Khách hàng").build();

        adminUser = NguoiDung.builder().id(1).ma("AD001").ten("Admin System").vaiTro(vaiTroAdmin).build();
        staffA = NguoiDung.builder().id(2).ma("NV001").ten("Nguyễn Minh Đức").vaiTro(vaiTroNhanVien).build();
        staffB = NguoiDung.builder().id(3).ma("NV002").ten("Nguyễn Thanh Liêm").vaiTro(vaiTroNhanVien).build();
        customerUser = NguoiDung.builder().id(6).ma("KH001").ten("Nguyễn Văn An").vaiTro(vaiTroKhachHang).build();

        imei = Imei.builder().id(101).soImei("864501020000001").trangThai(1).build();

        baoHanh = BaoHanh.builder()
                .id(201)
                .maPhieu("BH-000201")
                .imei(imei)
                .ngayKichHoat(LocalDateTime.now().minusMonths(1))
                .ngayHetHan(LocalDateTime.now().plusMonths(11))
                .trangThai(1)
                .build();

        requestPending = YeuCauBaoHanh.builder()
                .id(501)
                .maYeuCau("YCBH-20261010-001")
                .baoHanh(baoHanh)
                .khachHang(customerUser)
                .moTaLoi("Màn hình bị sọc ngang khi khởi động máy")
                .dienThoaiLienHe("0912345678")
                .ngayYeuCau(LocalDateTime.now().minusDays(1))
                .trangThai(0)
                .build();
    }

    @Test
    @DisplayName("1. Admin tiếp nhận yêu cầu trạng thái 0 thành công -> trạng thái chuyển sang 1")
    void testAdminTiepNhanThanhCong() {
        when(nguoiDungRepository.findById(adminUser.getId())).thenReturn(Optional.of(adminUser));
        when(yeuCauBaoHanhRepository.findByIdForUpdate(requestPending.getId())).thenReturn(Optional.of(requestPending));
        when(yeuCauBaoHanhRepository.save(any(YeuCauBaoHanh.class))).thenAnswer(i -> i.getArgument(0));

        WarrantyRequestResponseDTO result = yeuCauBaoHanhService.tiepNhanYeuCau(requestPending.getId(), adminUser.getId());

        assertNotNull(result);
        assertEquals(1, result.getTrangThai());
        assertNotNull(result.getNgayTiepNhan());
        assertEquals(adminUser.getId(), result.getIdNhanVien());
        assertTrue(result.getTenNhanVien().contains("Admin System"));
        verify(yeuCauBaoHanhRepository).save(requestPending);
    }

    @Test
    @DisplayName("2. Nhân viên tiếp nhận yêu cầu trạng thái 0 thành công -> ghi nhận đúng nhân viên phụ trách")
    void testNhanVienTiepNhanThanhCong() {
        when(nguoiDungRepository.findById(staffA.getId())).thenReturn(Optional.of(staffA));
        when(yeuCauBaoHanhRepository.findByIdForUpdate(requestPending.getId())).thenReturn(Optional.of(requestPending));
        when(yeuCauBaoHanhRepository.save(any(YeuCauBaoHanh.class))).thenAnswer(i -> i.getArgument(0));

        WarrantyRequestResponseDTO result = yeuCauBaoHanhService.tiepNhanYeuCau(requestPending.getId(), staffA.getId());

        assertNotNull(result);
        assertEquals(1, result.getTrangThai());
        assertNotNull(result.getNgayTiepNhan());
        assertEquals(staffA.getId(), result.getIdNhanVien());
        assertTrue(result.getTenNhanVien().contains("Nguyễn Minh Đức"));
    }

    @Test
    @DisplayName("3. Tiếp nhận thất bại nếu yêu cầu đã ở trạng thái khác 0 (Chống xử lý đồng thời)")
    void testTiepNhanThatBaiKhiTrangThaiKhongPhai0() {
        requestPending.setTrangThai(1); // Đã có người tiếp nhận trước
        when(nguoiDungRepository.findById(staffA.getId())).thenReturn(Optional.of(staffA));
        when(yeuCauBaoHanhRepository.findByIdForUpdate(requestPending.getId())).thenReturn(Optional.of(requestPending));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                yeuCauBaoHanhService.tiepNhanYeuCau(requestPending.getId(), staffA.getId()));

        assertTrue(ex.getMessage().contains("không ở trạng thái Chờ tiếp nhận"));
        verify(yeuCauBaoHanhRepository, never()).save(any());
    }

    @Test
    @DisplayName("4. Khách hàng không được quyền tiếp nhận yêu cầu (Chặn Unauthorized / SecurityException)")
    void testKhachHangKhongDuocTiepNhan() {
        when(nguoiDungRepository.findById(customerUser.getId())).thenReturn(Optional.of(customerUser));

        SecurityException ex = assertThrows(SecurityException.class, () ->
                yeuCauBaoHanhService.tiepNhanYeuCau(requestPending.getId(), customerUser.getId()));

        assertTrue(ex.getMessage().contains("không có quyền"));
        verify(yeuCauBaoHanhRepository, never()).findByIdForUpdate(any());
    }

    @Test
    @DisplayName("5. Từ chối yêu cầu trạng thái 0 thành công -> trạng thái chuyển sang 4 và lưu lý do")
    void testTuChoiThanhCong() {
        String lyDo = "Máy bị vào nước làm cháy mạch nguồn, tem bảo hành bị rách.";
        when(nguoiDungRepository.findById(staffA.getId())).thenReturn(Optional.of(staffA));
        when(yeuCauBaoHanhRepository.findByIdForUpdate(requestPending.getId())).thenReturn(Optional.of(requestPending));
        when(yeuCauBaoHanhRepository.save(any(YeuCauBaoHanh.class))).thenAnswer(i -> i.getArgument(0));

        WarrantyRequestResponseDTO result = yeuCauBaoHanhService.tuChoiYeuCau(requestPending.getId(), lyDo, staffA.getId());

        assertNotNull(result);
        assertEquals(4, result.getTrangThai());
        assertEquals(lyDo, result.getLyDoTuChoi());
        assertEquals(staffA.getId(), result.getIdNhanVien());
        assertNull(result.getNgayTiepNhan());
        assertNull(result.getNgayBatDauXuLy());
        assertNull(result.getNgayHoanThanh());
    }

    @Test
    @DisplayName("6. Từ chối thất bại nếu lý do dưới 10 ký tự hoặc để trống")
    void testTuChoiThatBaiKhiLyDoNgan() {
        when(nguoiDungRepository.findById(staffA.getId())).thenReturn(Optional.of(staffA));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                yeuCauBaoHanhService.tuChoiYeuCau(requestPending.getId(), "Quá ngắn", staffA.getId()));

        assertTrue(ex.getMessage().contains("tối thiểu 10 ký tự"));
        verify(yeuCauBaoHanhRepository, never()).save(any());
    }

    @Test
    @DisplayName("7. Không thể từ chối yêu cầu đã được tiếp nhận (trạng thái = 1)")
    void testTuChoiThatBaiKhiDaTiepNhan() {
        requestPending.setTrangThai(1);
        when(nguoiDungRepository.findById(staffA.getId())).thenReturn(Optional.of(staffA));
        when(yeuCauBaoHanhRepository.findByIdForUpdate(requestPending.getId())).thenReturn(Optional.of(requestPending));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                yeuCauBaoHanhService.tuChoiYeuCau(requestPending.getId(), "Lý do từ chối máy hợp lệ hơn 10 ký tự", staffA.getId()));

        assertTrue(ex.getMessage().contains("không ở trạng thái Chờ tiếp nhận"));
    }

    @Test
    @DisplayName("8. Bắt đầu xử lý (1 -> 2): Nhân viên khác (Staff B) thực hiện vẫn giữ nguyên nhân viên tiếp nhận ban đầu (Staff A)")
    void testBatDauXuLyThanhCong() {
        requestPending.setTrangThai(1);
        requestPending.setNhanVien(staffA); // Staff A đã tiếp nhận
        requestPending.setNgayTiepNhan(LocalDateTime.now().minusHours(2));

        when(nguoiDungRepository.findById(staffB.getId())).thenReturn(Optional.of(staffB));
        when(yeuCauBaoHanhRepository.findByIdForUpdate(requestPending.getId())).thenReturn(Optional.of(requestPending));
        when(yeuCauBaoHanhRepository.save(any(YeuCauBaoHanh.class))).thenAnswer(i -> i.getArgument(0));

        // Staff B bấm bắt đầu xử lý
        WarrantyRequestResponseDTO result = yeuCauBaoHanhService.batDauXuLy(requestPending.getId(), staffB.getId());

        assertNotNull(result);
        assertEquals(2, result.getTrangThai());
        assertNotNull(result.getNgayBatDauXuLy());
        // Nhân viên phụ trách vẫn giữ nguyên là Staff A theo quy tắc Mục VI.2 & VIII
        assertEquals(staffA.getId(), result.getIdNhanVien());
        assertTrue(result.getTenNhanVien().contains("Nguyễn Minh Đức"));
    }

    @Test
    @DisplayName("9. Bắt đầu xử lý thất bại nếu trạng thái không phải 1")
    void testBatDauXuLyThatBaiKhiSaiTrangThai() {
        requestPending.setTrangThai(0); // Chưa tiếp nhận
        when(nguoiDungRepository.findById(staffA.getId())).thenReturn(Optional.of(staffA));
        when(yeuCauBaoHanhRepository.findByIdForUpdate(requestPending.getId())).thenReturn(Optional.of(requestPending));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                yeuCauBaoHanhService.batDauXuLy(requestPending.getId(), staffA.getId()));

        assertTrue(ex.getMessage().contains("không ở trạng thái Đã tiếp nhận"));
    }

    @Test
    @DisplayName("10. Hoàn thành xử lý (2 -> 3) thành công với kết quả kỹ thuật hợp lệ")
    void testHoanThanhThanhCong() {
        requestPending.setTrangThai(2);
        requestPending.setNhanVien(staffA);
        requestPending.setNgayTiepNhan(LocalDateTime.now().minusDays(1));
        requestPending.setNgayBatDauXuLy(LocalDateTime.now().minusHours(4));

        String ketQua = "Đã thay cáp màn hình EDP mới chính hãng, chạy test kiểm tra màn hình hiển thị bình thường.";

        when(nguoiDungRepository.findById(adminUser.getId())).thenReturn(Optional.of(adminUser));
        when(yeuCauBaoHanhRepository.findByIdForUpdate(requestPending.getId())).thenReturn(Optional.of(requestPending));
        when(yeuCauBaoHanhRepository.save(any(YeuCauBaoHanh.class))).thenAnswer(i -> i.getArgument(0));

        // Admin hoàn thành yêu cầu do Staff A tiếp nhận
        WarrantyRequestResponseDTO result = yeuCauBaoHanhService.hoanThanhYeuCau(requestPending.getId(), ketQua, adminUser.getId());

        assertNotNull(result);
        assertEquals(3, result.getTrangThai());
        assertEquals(ketQua, result.getGhiChuXuLy());
        assertNotNull(result.getNgayHoanThanh());
        // Vẫn giữ người tiếp nhận ban đầu
        assertEquals(staffA.getId(), result.getIdNhanVien());
    }

    @Test
    @DisplayName("11. Hoàn thành thất bại nếu thiếu kết quả xử lý (< 10 ký tự)")
    void testHoanThanhThatBaiKhiThieuKetQua() {
        when(nguoiDungRepository.findById(staffA.getId())).thenReturn(Optional.of(staffA));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                yeuCauBaoHanhService.hoanThanhYeuCau(requestPending.getId(), "Đã xong", staffA.getId()));

        assertTrue(ex.getMessage().contains("tối thiểu 10 ký tự"));
    }

    @Test
    @DisplayName("12. Không thể thay đổi trạng thái khi yêu cầu đã hoàn thành (trạng thái = 3)")
    void testKhongChoSuaYeuCauDaHoanThanh() {
        requestPending.setTrangThai(3); // Đã hoàn thành
        when(nguoiDungRepository.findById(staffA.getId())).thenReturn(Optional.of(staffA));
        when(yeuCauBaoHanhRepository.findByIdForUpdate(requestPending.getId())).thenReturn(Optional.of(requestPending));

        assertThrows(IllegalStateException.class, () ->
                yeuCauBaoHanhService.tiepNhanYeuCau(requestPending.getId(), staffA.getId()));

        assertThrows(IllegalStateException.class, () ->
                yeuCauBaoHanhService.tuChoiYeuCau(requestPending.getId(), "Lý do từ chối yêu cầu dài hơn 10 ký tự", staffA.getId()));

        assertThrows(IllegalStateException.class, () ->
                yeuCauBaoHanhService.batDauXuLy(requestPending.getId(), staffA.getId()));

        assertThrows(IllegalStateException.class, () ->
                yeuCauBaoHanhService.hoanThanhYeuCau(requestPending.getId(), "Ghi chú kết quả xử lý dài hơn 10 ký tự", staffA.getId()));
    }

    @Test
    @DisplayName("13. Không thể thay đổi trạng thái khi yêu cầu đã bị từ chối (trạng thái = 4)")
    void testKhongChoSuaYeuCauDaTuChoi() {
        requestPending.setTrangThai(4); // Đã từ chối
        when(nguoiDungRepository.findById(staffA.getId())).thenReturn(Optional.of(staffA));
        when(yeuCauBaoHanhRepository.findByIdForUpdate(requestPending.getId())).thenReturn(Optional.of(requestPending));

        assertThrows(IllegalStateException.class, () ->
                yeuCauBaoHanhService.tiepNhanYeuCau(requestPending.getId(), staffA.getId()));

        assertThrows(IllegalStateException.class, () ->
                yeuCauBaoHanhService.batDauXuLy(requestPending.getId(), staffA.getId()));
    }

    @Test
    @DisplayName("14. Khách hàng gửi yêu cầu bảo hành thành công -> Trạng thái 0, mã YCBH-XXXXXX, id_nhan_vien = null")
    void testKhachHangGuiYeuCauThanhCong() {
        WarrantyRequestCreateDTO dto = new WarrantyRequestCreateDTO();
        dto.setIdBaoHanh(baoHanh.getId());
        dto.setMoTaLoi("Màn hình máy bị chớp nháy liên tục khi cắm sạc");
        dto.setDienThoaiLienHe("0987654321");
        dto.setGhiChuKhachHang("Xin hỗ trợ kiểm tra sớm");

        when(nguoiDungRepository.findById(customerUser.getId())).thenReturn(Optional.of(customerUser));
        when(baoHanhRepository.findByIdForUpdate(baoHanh.getId())).thenReturn(Optional.of(baoHanh));
        when(baoHanhRepository.isWarrantyOwnedByCustomer(baoHanh.getId(), customerUser.getId())).thenReturn(true);
        when(yeuCauBaoHanhRepository.existsOpenRequestByBaoHanhId(baoHanh.getId())).thenReturn(false);
        when(yeuCauBaoHanhRepository.save(any(YeuCauBaoHanh.class))).thenAnswer(i -> {
            YeuCauBaoHanh arg = i.getArgument(0);
            if (arg.getId() == null) {
                arg.setId(777);
            }
            return arg;
        });

        WarrantyRequestResponseDTO result = yeuCauBaoHanhService.guiYeuCauBaoHanh(dto, customerUser.getId());

        assertNotNull(result);
        assertEquals("YCBH-000777", result.getMaYeuCau());
        assertEquals(0, result.getTrangThai());
        assertNull(result.getIdNhanVien());
        assertNull(result.getNgayTiepNhan());
        assertNull(result.getNgayBatDauXuLy());
        assertNull(result.getNgayHoanThanh());
        assertEquals("0987654321", result.getDienThoaiLienHe());
        assertEquals("Màn hình máy bị chớp nháy liên tục khi cắm sạc", result.getMoTaLoi());
        assertEquals("Xin hỗ trợ kiểm tra sớm", result.getGhiChuKhachHang());
        assertEquals(customerUser.getId(), result.getIdKhachHang());
        assertEquals(baoHanh.getId(), result.getIdBaoHanh());
    }

    @Test
    @DisplayName("15. Gửi yêu cầu thất bại nếu không sở hữu IMEI qua hóa đơn hoàn thành và thanh toán")
    void testGuiYeuCauThatBaiKhiKhongSoHuuImei() {
        WarrantyRequestCreateDTO dto = new WarrantyRequestCreateDTO();
        dto.setIdBaoHanh(baoHanh.getId());
        dto.setMoTaLoi("Bàn phím bị liệt một số phím");
        dto.setDienThoaiLienHe("0987654321");

        when(nguoiDungRepository.findById(customerUser.getId())).thenReturn(Optional.of(customerUser));
        when(baoHanhRepository.findByIdForUpdate(baoHanh.getId())).thenReturn(Optional.of(baoHanh));
        when(baoHanhRepository.isWarrantyOwnedByCustomer(baoHanh.getId(), customerUser.getId())).thenReturn(false);

        SecurityException ex = assertThrows(SecurityException.class, () ->
                yeuCauBaoHanhService.guiYeuCauBaoHanh(dto, customerUser.getId()));

        assertTrue(ex.getMessage().contains("không sở hữu laptop"));
    }

    @Test
    @DisplayName("16. Gửi yêu cầu thất bại nếu bảo hành đã hết hạn")
    void testGuiYeuCauThatBaiKhiBaoHanhHetHan() {
        baoHanh.setNgayHetHan(LocalDateTime.now().minusDays(1)); // Đã hết hạn

        WarrantyRequestCreateDTO dto = new WarrantyRequestCreateDTO();
        dto.setIdBaoHanh(baoHanh.getId());
        dto.setMoTaLoi("Loa ngoài rè khi mở âm lượng lớn");
        dto.setDienThoaiLienHe("0987654321");

        when(nguoiDungRepository.findById(customerUser.getId())).thenReturn(Optional.of(customerUser));
        when(baoHanhRepository.findByIdForUpdate(baoHanh.getId())).thenReturn(Optional.of(baoHanh));
        when(baoHanhRepository.isWarrantyOwnedByCustomer(baoHanh.getId(), customerUser.getId())).thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                yeuCauBaoHanhService.guiYeuCauBaoHanh(dto, customerUser.getId()));

        assertTrue(ex.getMessage().contains("đã hết hạn"));
    }

    @Test
    @DisplayName("17. Gửi yêu cầu thất bại nếu bảo hành đã bị thu hồi/vô hiệu (trạng thái != 1)")
    void testGuiYeuCauThatBaiKhiBaoHanhBiThuHoi() {
        baoHanh.setTrangThai(0); // Thu hồi

        WarrantyRequestCreateDTO dto = new WarrantyRequestCreateDTO();
        dto.setIdBaoHanh(baoHanh.getId());
        dto.setMoTaLoi("Pin bị chai không nhận sạc");
        dto.setDienThoaiLienHe("0987654321");

        when(nguoiDungRepository.findById(customerUser.getId())).thenReturn(Optional.of(customerUser));
        when(baoHanhRepository.findByIdForUpdate(baoHanh.getId())).thenReturn(Optional.of(baoHanh));
        when(baoHanhRepository.isWarrantyOwnedByCustomer(baoHanh.getId(), customerUser.getId())).thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                yeuCauBaoHanhService.guiYeuCauBaoHanh(dto, customerUser.getId()));

        assertTrue(ex.getMessage().contains("ngừng hiệu lực"));
    }

    @Test
    @DisplayName("18. Gửi yêu cầu thất bại nếu đang có yêu cầu bảo hành mở (trạng thái 0, 1 hoặc 2)")
    void testGuiYeuCauThatBaiKhiDangCoYeuCauMo() {
        WarrantyRequestCreateDTO dto = new WarrantyRequestCreateDTO();
        dto.setIdBaoHanh(baoHanh.getId());
        dto.setMoTaLoi("Quạt tản nhiệt kêu to bất thường");
        dto.setDienThoaiLienHe("0987654321");

        when(nguoiDungRepository.findById(customerUser.getId())).thenReturn(Optional.of(customerUser));
        when(baoHanhRepository.findByIdForUpdate(baoHanh.getId())).thenReturn(Optional.of(baoHanh));
        when(baoHanhRepository.isWarrantyOwnedByCustomer(baoHanh.getId(), customerUser.getId())).thenReturn(true);
        when(yeuCauBaoHanhRepository.existsOpenRequestByBaoHanhId(baoHanh.getId())).thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                yeuCauBaoHanhService.guiYeuCauBaoHanh(dto, customerUser.getId()));

        assertTrue(ex.getMessage().contains("đang có một yêu cầu bảo hành khác"));
    }

    @Test
    @DisplayName("19. Gửi yêu cầu thất bại nếu mô tả sự cố < 10 ký tự hoặc sđt không đúng định dạng VN")
    void testGuiYeuCauThatBaiKhiDuLieuKhongHopLe() {
        when(nguoiDungRepository.findById(customerUser.getId())).thenReturn(Optional.of(customerUser));
        when(baoHanhRepository.findByIdForUpdate(baoHanh.getId())).thenReturn(Optional.of(baoHanh));
        when(baoHanhRepository.isWarrantyOwnedByCustomer(baoHanh.getId(), customerUser.getId())).thenReturn(true);
        when(yeuCauBaoHanhRepository.existsOpenRequestByBaoHanhId(baoHanh.getId())).thenReturn(false);

        // Mô tả quá ngắn
        WarrantyRequestCreateDTO dtoShortMoTa = new WarrantyRequestCreateDTO();
        dtoShortMoTa.setIdBaoHanh(baoHanh.getId());
        dtoShortMoTa.setMoTaLoi("Hỏng máy");
        dtoShortMoTa.setDienThoaiLienHe("0987654321");
        assertThrows(IllegalArgumentException.class, () ->
                yeuCauBaoHanhService.guiYeuCauBaoHanh(dtoShortMoTa, customerUser.getId()));

        // SĐT không hợp lệ (không bắt đầu bằng 0 hoặc không đủ 10 số)
        WarrantyRequestCreateDTO dtoBadPhone = new WarrantyRequestCreateDTO();
        dtoBadPhone.setIdBaoHanh(baoHanh.getId());
        dtoBadPhone.setMoTaLoi("Màn hình không hiển thị đèn nền khi bật");
        dtoBadPhone.setDienThoaiLienHe("19001234");
        assertThrows(IllegalArgumentException.class, () ->
                yeuCauBaoHanhService.guiYeuCauBaoHanh(dtoBadPhone, customerUser.getId()));
    }

    @Test
    @DisplayName("20. Kiểm thử toàn bộ quy trình: Khách gửi -> Nhân viên tiếp nhận -> Bắt đầu xử lý -> Hoàn thành")
    void testQuyTrinhToanDienTuKhachGuiDenHoanThanh() {
        // 1. Khách gửi yêu cầu
        WarrantyRequestCreateDTO createDto = new WarrantyRequestCreateDTO();
        createDto.setIdBaoHanh(baoHanh.getId());
        createDto.setMoTaLoi("Trackpad bị đơ không phản hồi khi di chuột");
        createDto.setDienThoaiLienHe("0909123456");

        when(nguoiDungRepository.findById(customerUser.getId())).thenReturn(Optional.of(customerUser));
        when(baoHanhRepository.findByIdForUpdate(baoHanh.getId())).thenReturn(Optional.of(baoHanh));
        when(baoHanhRepository.isWarrantyOwnedByCustomer(baoHanh.getId(), customerUser.getId())).thenReturn(true);
        when(yeuCauBaoHanhRepository.existsOpenRequestByBaoHanhId(baoHanh.getId())).thenReturn(false);

        YeuCauBaoHanh persistedEntity = new YeuCauBaoHanh();
        when(yeuCauBaoHanhRepository.save(any(YeuCauBaoHanh.class))).thenAnswer(i -> {
            YeuCauBaoHanh arg = i.getArgument(0);
            if (arg.getId() == null) {
                arg.setId(888);
            }
            persistedEntity.setId(arg.getId());
            persistedEntity.setMaYeuCau(arg.getMaYeuCau());
            persistedEntity.setBaoHanh(arg.getBaoHanh());
            persistedEntity.setKhachHang(arg.getKhachHang());
            persistedEntity.setNhanVien(arg.getNhanVien());
            persistedEntity.setMoTaLoi(arg.getMoTaLoi());
            persistedEntity.setDienThoaiLienHe(arg.getDienThoaiLienHe());
            persistedEntity.setGhiChuKhachHang(arg.getGhiChuKhachHang());
            persistedEntity.setNgayYeuCau(arg.getNgayYeuCau());
            persistedEntity.setNgayTiepNhan(arg.getNgayTiepNhan());
            persistedEntity.setNgayBatDauXuLy(arg.getNgayBatDauXuLy());
            persistedEntity.setNgayHoanThanh(arg.getNgayHoanThanh());
            persistedEntity.setTrangThai(arg.getTrangThai());
            persistedEntity.setGhiChuXuLy(arg.getGhiChuXuLy());
            persistedEntity.setLyDoTuChoi(arg.getLyDoTuChoi());
            return arg;
        });

        WarrantyRequestResponseDTO created = yeuCauBaoHanhService.guiYeuCauBaoHanh(createDto, customerUser.getId());
        assertEquals(0, created.getTrangThai());
        assertEquals("YCBH-000888", created.getMaYeuCau());
        assertNull(created.getIdNhanVien());

        // 2. Nhân viên tiếp nhận
        when(nguoiDungRepository.findById(staffA.getId())).thenReturn(Optional.of(staffA));
        when(yeuCauBaoHanhRepository.findByIdForUpdate(888)).thenReturn(Optional.of(persistedEntity));

        WarrantyRequestResponseDTO accepted = yeuCauBaoHanhService.tiepNhanYeuCau(888, staffA.getId());
        assertEquals(1, accepted.getTrangThai());
        assertEquals(staffA.getId(), accepted.getIdNhanVien());
        assertNotNull(accepted.getNgayTiepNhan());

        // 3. Nhân viên bắt đầu xử lý
        WarrantyRequestResponseDTO processing = yeuCauBaoHanhService.batDauXuLy(888, staffA.getId());
        assertEquals(2, processing.getTrangThai());
        assertNotNull(processing.getNgayBatDauXuLy());
        assertEquals(staffA.getId(), processing.getIdNhanVien());

        // 4. Nhân viên hoàn thành xử lý
        String cleanKetQua = "Đã thay cáp Trackpad chính hãng và kiểm tra touchpad hoạt động mượt mà.";
        WarrantyRequestResponseDTO completed = yeuCauBaoHanhService.hoanThanhYeuCau(888, cleanKetQua, staffA.getId());
        assertEquals(3, completed.getTrangThai());
        assertEquals(cleanKetQua, completed.getGhiChuXuLy());
        assertNotNull(completed.getNgayHoanThanh());
        assertEquals(staffA.getId(), completed.getIdNhanVien());
    }
}
