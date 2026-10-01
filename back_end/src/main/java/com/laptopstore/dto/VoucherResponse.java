package com.laptopstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherResponse {
    private Integer id;
    private String ma;
    private String tenVoucher;
    private Integer loaiGiam; // 1: %, 2: Tiền
    private BigDecimal giaTriGiam;
    private BigDecimal giaTriDonToiThieu;
    private BigDecimal giamToiDa;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private Integer trangThai; // 1: Hoạt động, 0: Ngừng hoạt động

    // Derived fields for clean UI display
    private String trangThaiHienThi;      // "Sắp diễn ra", "Đang diễn ra", "Đã kết thúc", "Ngừng hoạt động"
    private String trangThaiBadgeClass;   // "pending", "confirmed", "shipping", "cancelled"
    private String loaiGiamHienThi;       // "10%" hoặc "500.000đ"
    private String giamToiDaHienThi;      // "2.000.000đ", "Không giới hạn", "—"
    private String donToiThieuHienThi;    // "20.000.000đ" hoặc "0đ"

    // POS eligibility fields
    private Boolean duDieuKien;           // true if tongTienHang >= giaTriDonToiThieu
    private String lyDoKhongDuDieuKien;   // "Đơn tối thiểu 50.000.000đ - Chưa đủ điều kiện"

    public String getMaVoucher() {
        return this.ma;
    }
}
