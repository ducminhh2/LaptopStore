package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hinh_anh_chi_tiet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HinhAnhChiTiet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "url_hinh_anh", nullable = false, length = 500)
    private String urlHinhAnh;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_ctsp", nullable = false)
    private ChiTietSanPham chiTietSanPham;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getUrlHinhAnh() { return urlHinhAnh; }
    public void setUrlHinhAnh(String urlHinhAnh) { this.urlHinhAnh = urlHinhAnh; }
    public ChiTietSanPham getChiTietSanPham() { return chiTietSanPham; }
    public void setChiTietSanPham(ChiTietSanPham chiTietSanPham) { this.chiTietSanPham = chiTietSanPham; }
}
