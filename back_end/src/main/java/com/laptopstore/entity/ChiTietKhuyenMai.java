package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chi_tiet_khuyen_mai")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietKhuyenMai {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_ctkm", length = 50)
    private String maCtkm;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_sp", nullable = false)
    private SanPham sanPham;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_khuyen_mai", nullable = false)
    private KhuyenMai khuyenMai;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getMaCtkm() { return maCtkm; }
    public void setMaCtkm(String maCtkm) { this.maCtkm = maCtkm; }
    public SanPham getSanPham() { return sanPham; }
    public void setSanPham(SanPham sanPham) { this.sanPham = sanPham; }
    public KhuyenMai getKhuyenMai() { return khuyenMai; }
    public void setKhuyenMai(KhuyenMai khuyenMai) { this.khuyenMai = khuyenMai; }
}
