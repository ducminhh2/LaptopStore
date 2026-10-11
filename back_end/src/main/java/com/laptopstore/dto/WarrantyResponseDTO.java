package com.laptopstore.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyResponseDTO {

    private Integer id;
    private String maPhieu;
    private Integer idImei;
    private String soImei;

    // Thông tin Laptop
    private String tenLaptop;
    private String cauHinh;
    private String hinhAnh;

    // Hóa đơn & Khách hàng sở hữu
    private String maHoaDon;
    private Integer idKhachHang;
    private String tenKhachHang;
    private String soDienThoaiKhachHang;
    private String emailKhachHang;
    private String diaChiKhachHang;

    // Thời hạn bảo hành
    private LocalDateTime ngayKichHoat;
    private LocalDateTime ngayHetHan;
    private Integer thoiHanThang;

    // Trạng thái (0: Ngừng hiệu lực, 1: Có hiệu lực)
    private Integer trangThai;

    // Trạng thái tính toán hiển thị: ACTIVE, EXPIRED, REVOKED
    private String statusKey;

    // Số lần yêu cầu bảo hành đã phát sinh
    private Integer soLanYeuCau;
}
