package com.laptopstore.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutItemDTO {

    private Integer idChiTietGioHang;
    private Integer idChiTietSanPham;
    private String maCtsp;
    private String tenSanPham;
    private String hinhAnh;
    
    // Thông số cấu hình
    private String cpu;
    private String ram;
    private String oCung;
    private String cardDoHoa;
    private String manHinh;
    private String mauSac;
    private String cauHinhSummary;

    // Số lượng và giá
    private Integer soLuong;
    private BigDecimal giaGoc;
    private BigDecimal giaSauKhuyenMai;
    private Boolean coKhuyenMai;
    private BigDecimal giaTriGiam;
    private Integer loaiGiam;
    private BigDecimal thanhTien;

    // Tồn kho IMEI khả dụng
    private Integer soLuongTonKho;
    private Boolean vuotTonKho;
    private String canhBaoTonKho;
}
