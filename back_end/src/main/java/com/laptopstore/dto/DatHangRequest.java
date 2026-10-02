package com.laptopstore.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatHangRequest {

    private String tenNguoiNhan;

    private String dienThoai;

    private String diaChi;

    private String ghiChu;

    private Integer voucherId;

    private String phuongThucThanhToan;
}
