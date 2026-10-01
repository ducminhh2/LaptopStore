package com.laptopstore.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherRequest {
    private Integer id;
    private String ma;

    @JsonAlias({"ten", "ten_voucher"})
    private String tenVoucher;

    private Integer loaiGiam; // 1: Giảm theo %, 2: Giảm theo số tiền
    private BigDecimal giaTriGiam;
    private BigDecimal giaTriDonToiThieu;
    private BigDecimal giamToiDa;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private Integer trangThai; // 1: Hoạt động, 0: Ngừng hoạt động
}
