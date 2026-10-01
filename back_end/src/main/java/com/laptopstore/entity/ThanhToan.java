package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "thanh_toan")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma", unique = true, nullable = false, length = 50)
    private String ma;

    @Column(name = "phuong_thuc", nullable = false, length = 100)
    private String phuongThuc;

    @Column(name = "so_tien", nullable = false, precision = 18, scale = 2)
    private BigDecimal soTien;

    @Column(name = "trang_thai")
    @Builder.Default
    private Integer trangThai = 0; // 0: Chưa thanh toán, 1: Đã thanh toán

    @Column(name = "ngay_thanh_toan")
    private LocalDateTime ngayThanhToan;
}
