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
public class VoucherCalculationResponse {
    private Integer idVoucher;
    private String maVoucher;
    private String tenVoucher;
    private Integer loaiGiam;
    private BigDecimal giaTriGiam;
    private BigDecimal tongTienHang;
    private BigDecimal tienGiamVoucher;
    private BigDecimal khachPhaiTra;
    private Boolean hopLe;
    private String thongBao;
}
