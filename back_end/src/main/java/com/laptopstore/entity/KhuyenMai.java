package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "khuyen_mai")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhuyenMai {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma", unique = true, nullable = false, length = 50)
    private String ma;

    @Column(name = "ten_km", nullable = false, length = 200)
    private String tenKm;

    @Column(name = "loai_giam", nullable = false)
    @Builder.Default
    private Integer loaiGiam = 1; // 1: Giảm theo %, 2: Giảm theo số tiền

    @Column(name = "gia_tri_giam", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal giaTriGiam = BigDecimal.ZERO;

    @Column(name = "ngay_bat_dau", nullable = false)
    private LocalDateTime ngayBatDau;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDateTime ngayKetThuc;

    @Column(name = "trang_thai")
    @Builder.Default
    private Integer trangThai = 1; // 0: Ngừng hoạt động, 1: Hoạt động
}
