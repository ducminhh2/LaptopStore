package com.laptopstore.dto;

import com.laptopstore.entity.ChiTietSanPham;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImeiResponseDTO {
    private Integer id;
    private String soImei;
    private ChiTietSanPham chiTietSanPham;
    private Integer trangThai;
    private String tenTrangThai;
    private String badgeClass;
    private LocalDateTime ngayNhap;
    private String ngayNhapFormatted;

    // Thông tin hóa đơn liên kết (đối với IMEI đã bán hoặc đã xuất theo đơn)
    private Integer idHoaDon;
    private String maHoaDon;
    private String tenKhachHang;
    private String soDienThoai;
    private LocalDateTime ngayBan;
    private String ngayBanFormatted;
    private Integer trangThaiHoaDon;
    private String tenTrangThaiHoaDon;
}
