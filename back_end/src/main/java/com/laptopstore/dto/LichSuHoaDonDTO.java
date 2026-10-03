package com.laptopstore.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichSuHoaDonDTO {

    private Integer id;
    private Integer idHoaDon;
    private Integer trangThai;
    private String tenTrangThai;
    private LocalDateTime thoiGian;
    private String thoiGianFormatted;
    private String thoiGianShort;
    private Integer idNhanVien;
    private String tenNguoiThucHien;
    private String ghiChu;
}
