package com.laptopstore.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyRequestStatsDTO {
    private long choTiepNhan;
    private long daTiepNhan;
    private long dangXuLy;
    private long hoanThanh;
    private long tuChoi;
    private long tongSo;
}
