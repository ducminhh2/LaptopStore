package com.laptopstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhuyenMaiResponse {
    private Integer id;
    private String ma;
    private String tenKm;
    private Integer loaiGiam; // 1: %, 2: tiền
    private BigDecimal giaTriGiam;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private Integer trangThai; // 1: Hoạt động, 0: Ngừng hoạt động
    private Integer soCtspApDung;
    private String trangThaiHienThi; // "Sắp diễn ra", "Đang diễn ra", "Đã kết thúc", "Ngừng hoạt động"
    private String trangThaiBadgeClass; // "pending", "confirmed", "completed", "cancelled"
    private List<KhuyenMaiCtspItemResponse> danhSachCtsp;
}
