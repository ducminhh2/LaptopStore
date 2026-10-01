package com.laptopstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosCheckoutRequest {
    private String ma;
    private Integer customerId;
    private Integer cashierId;
    private String customerName;
    private String phone;
    private String address;
    private String payMethod; // TIEN_MAT, CHUYEN_KHOAN, QUET_THE
    private BigDecimal customerGiven; // Tiền khách đưa
    private Boolean isCompleted; // true: Hoàn thành (3), false: Chờ xác nhận (0)
    private String note;
    private Integer idVoucher; // Có thể null
    private List<PosItemRequest> items;
}
