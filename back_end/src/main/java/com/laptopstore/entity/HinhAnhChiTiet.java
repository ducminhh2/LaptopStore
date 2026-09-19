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
}
