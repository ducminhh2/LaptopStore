package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "chi_tiet_gio_hang")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietGioHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma", length = 50)
    private String ma;

    @Column(name = "so_luong", nullable = false)
    @Builder.Default
    private Integer soLuong = 1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_gio_hang", nullable = false)
    private GioHang gioHang;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_chi_tiet_san_pham", nullable = false)
    private ChiTietSanPham chiTietSanPham;

    @Column(name = "gia_tung_san_pham", nullable = false, precision = 18, scale = 2)
    private BigDecimal giaTungSanPham;
}
