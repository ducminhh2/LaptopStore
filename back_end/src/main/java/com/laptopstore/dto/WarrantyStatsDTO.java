package com.laptopstore.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyStatsDTO {
    private long tongSo;
    private long conHan;
    private long hetHan;
    private long ngungHieuLuc;
}
