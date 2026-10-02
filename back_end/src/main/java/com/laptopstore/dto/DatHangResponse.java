package com.laptopstore.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatHangResponse {

    private Boolean success;

    private String message;

    private String maHoaDon;

    private Integer idHoaDon;

    private BigDecimal tongThanhToan;
}
