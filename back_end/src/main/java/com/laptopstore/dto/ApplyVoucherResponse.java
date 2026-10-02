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
public class ApplyVoucherResponse {
    private Boolean success;
    private Integer voucherId;
    private String maVoucher;
    private String tenVoucher;
    private BigDecimal tamTinh;
    private BigDecimal tienGiamVoucher;
    private BigDecimal phiVanChuyen;
    private BigDecimal tongThanhToan;
    private String message;
}
