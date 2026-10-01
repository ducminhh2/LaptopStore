package com.laptopstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhuyenMaiCtspItemResponse {
    private Integer idCtsp;
    private String maCtsp;
    private Integer idSanPham;
    private String tenSp;
    private String maSp;
    private String cauHinhChiTiet;
    private BigDecimal giaGoc;
    private BigDecimal tienGiam;
    private BigDecimal giaSauGiam;
    private String hinhAnh;
    private Integer soLuongKho;
}
