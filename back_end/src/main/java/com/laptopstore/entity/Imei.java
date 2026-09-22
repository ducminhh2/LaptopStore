package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "imei")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Imei {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "so_imei", unique = true, nullable = false, length = 100)
    private String soImei;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_chi_tiet_san_pham", nullable = false)
    private ChiTietSanPham chiTietSanPham;

    @Column(name = "trang_thai")
    @Builder.Default
    private Integer trangThai = 0;

    @Column(name = "ngay_nhap")
    @Builder.Default
    private LocalDateTime ngayNhap = LocalDateTime.now();

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getSoImei() { return soImei; }
    public void setSoImei(String soImei) { this.soImei = soImei; }
    public ChiTietSanPham getChiTietSanPham() { return chiTietSanPham; }
    public void setChiTietSanPham(ChiTietSanPham chiTietSanPham) { this.chiTietSanPham = chiTietSanPham; }
    public Integer getTrangThai() { return trangThai; }
    public void setTrangThai(Integer trangThai) { this.trangThai = trangThai; }
    public LocalDateTime getNgayNhap() { return ngayNhap; }
    public void setNgayNhap(LocalDateTime ngayNhap) { this.ngayNhap = ngayNhap; }
}
