package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hinh_anh")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HinhAnh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "url_hinh_anh", nullable = false, length = 500)
    private String urlHinhAnh;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_san_pham", nullable = false)
    private SanPham sanPham;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getUrlHinhAnh() { return urlHinhAnh; }
    public void setUrlHinhAnh(String urlHinhAnh) { this.urlHinhAnh = urlHinhAnh; }
    public SanPham getSanPham() { return sanPham; }
    public void setSanPham(SanPham sanPham) { this.sanPham = sanPham; }
}
