package com.laptopstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class XacNhanDonHangRequest {

    private List<ChiTietImeiItem> chiTietImei;
    private String username;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChiTietImeiItem {
        private Integer idChiTietHoaDon;
        private List<Integer> imeiIds;
    }
}
