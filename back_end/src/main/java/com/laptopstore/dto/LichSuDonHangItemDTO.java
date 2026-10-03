package com.laptopstore.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichSuDonHangItemDTO {

    private Integer idChiTietHoaDon;
    private Integer idChiTietSanPham;
    private String maCtsp;
    private String tenSanPham;
    private String hinhAnh;
    private String cauHinh;
    private Integer soLuong;
    private BigDecimal giaMua;
    private BigDecimal thanhTien;
    private List<String> imeis;
}
