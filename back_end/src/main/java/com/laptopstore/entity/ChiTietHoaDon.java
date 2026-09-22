package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "chi_tiet_hoa_don")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietHoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma", length = 50)
    private String ma;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_hoa_don", nullable = false)
    private HoaDon hoaDon;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_chi_tiet_san_pham", nullable = false)
    private ChiTietSanPham chiTietSanPham;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "gia_tung_san_pham", nullable = false, precision = 18, scale = 2)
    private BigDecimal giaTungSanPham;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getMa() { return ma; }
    public void setMa(String ma) { this.ma = ma; }
    public HoaDon getHoaDon() { return hoaDon; }
    public void setHoaDon(HoaDon hoaDon) { this.hoaDon = hoaDon; }
    public ChiTietSanPham getChiTietSanPham() { return chiTietSanPham; }
    public void setChiTietSanPham(ChiTietSanPham chiTietSanPham) { this.chiTietSanPham = chiTietSanPham; }
    public Integer getSoLuong() { return soLuong; }
    public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }
    public BigDecimal getGiaTungSanPham() { return giaTungSanPham; }
    public void setGiaTungSanPham(BigDecimal giaTungSanPham) { this.giaTungSanPham = giaTungSanPham; }
}
