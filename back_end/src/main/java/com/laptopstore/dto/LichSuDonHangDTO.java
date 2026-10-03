package com.laptopstore.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichSuDonHangDTO {

    private Integer idHoaDon;
    private String maHoaDon;
    private LocalDateTime ngayTao;
    private String ngayTaoFormatted;

    // Trạng thái đơn hàng
    private Integer trangThai;
    private String trangThaiHienThi;
    private String trangThaiBadgeClass;

    // Trạng thái thanh toán
    private Integer trangThaiThanhToan;
    private String trangThaiThanhToanHienThi;
    private String trangThaiThanhToanBadgeClass;
    private LocalDateTime ngayThanhToan;
    private String ngayThanhToanFormatted;

    // Phương thức thanh toán
    private String phuongThucThanhToan;
    private String phuongThucThanhToanHienThi;

    // Nhân viên phụ trách
    private String tenNhanVien;

    // Thông tin giao hàng
    private String tenNguoiNhan;
    private String dienThoai;
    private String diaChi;
    private String moTa;

    // Tiền và số lượng snapshot
    private Integer tongSoLuong;
    private BigDecimal tongTienHang;
    private BigDecimal tienGiamVoucher;
    private String maVoucher;
    private BigDecimal tongThanhToan;

    // Danh sách mặt hàng snapshot
    private List<LichSuDonHangItemDTO> items;
}
