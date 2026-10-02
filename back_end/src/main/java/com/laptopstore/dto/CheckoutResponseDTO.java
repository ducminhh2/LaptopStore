package com.laptopstore.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutResponseDTO {

    private Boolean success;
    private String message;

    // Thông tin người nhận mặc định từ tài khoản người dùng
    private Integer khachHangId;
    private String hoTen;
    private String soDienThoai;
    private String diaChi;
    private String email;

    // Danh sách mặt hàng từ chi_tiet_gio_hang
    @Builder.Default
    private List<CheckoutItemDTO> items = new ArrayList<>();

    // Tổng số lượng và tổng tiền hàng
    private Integer tongSoLuong;
    private BigDecimal tongTienHang;

    // Trạng thái kiểm tra tồn kho
    private Boolean coCanhBaoTonKho;
    private String thongBaoTonKho;
}
