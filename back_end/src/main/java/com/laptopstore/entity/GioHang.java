package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "gio_hang")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GioHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma", unique = true, nullable = false, length = 50)
    private String ma;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_khach_hang", nullable = false)
    private NguoiDung khachHang;

    @Column(name = "tong_so_tien", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal tongSoTien = BigDecimal.ZERO;

    @Column(name = "tong_so_luong")
    @Builder.Default
    private Integer tongSoLuong = 0;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getMa() { return ma; }
    public void setMa(String ma) { this.ma = ma; }
    public NguoiDung getKhachHang() { return khachHang; }
    public void setKhachHang(NguoiDung khachHang) { this.khachHang = khachHang; }
    public BigDecimal getTongSoTien() { return tongSoTien; }
    public void setTongSoTien(BigDecimal tongSoTien) { this.tongSoTien = tongSoTien; }
    public Integer getTongSoLuong() { return tongSoLuong; }
    public void setTongSoLuong(Integer tongSoLuong) { this.tongSoLuong = tongSoLuong; }
}
