package com.laptopstore.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiaKhuyenMaiResponse {
    private Integer idCtsp;
    private String maCtsp;
    private BigDecimal giaGoc;
    private Boolean coKhuyenMai;
    private Integer loaiGiam; // 1: Giảm theo %, 2: Giảm theo số tiền
    private BigDecimal giaTriGiam;
    private BigDecimal tienGiam;
    private BigDecimal giaBan;
    private String tenKhuyenMai;
    private String maKhuyenMai;
}
