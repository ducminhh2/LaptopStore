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
}
