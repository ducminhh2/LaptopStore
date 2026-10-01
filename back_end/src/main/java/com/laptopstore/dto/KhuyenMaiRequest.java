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
public class KhuyenMaiRequest {
    private Integer id;
    private String ma;
    @com.fasterxml.jackson.annotation.JsonAlias({"tenKhuyenMai", "tenKM", "ten"})
    private String tenKm;
    private Integer loaiGiam; // 1: Giảm theo %, 2: Giảm theo số tiền
    private BigDecimal giaTriGiam;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private Integer trangThai; // 1: Hoạt động, 0: Ngừng hoạt động

    @com.fasterxml.jackson.annotation.JsonAlias({"chiTietSanPhamIds", "ctspIds", "idCtspList"})
    private List<Integer> idChiTietSanPhams; // Danh sách ID CTSP áp dụng
}
