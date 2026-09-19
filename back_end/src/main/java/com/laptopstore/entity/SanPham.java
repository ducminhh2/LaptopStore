package com.laptopstore.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "san_pham")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_sp", unique = true, nullable = false, length = 50)
    private String maSp;

    @Column(name = "ten_sp", nullable = false, length = 200)
    private String tenSp;

    @Column(name = "gia_co_ban", precision = 18, scale = 2)
    private BigDecimal giaCoBan;

    @Column(name = "mo_ta", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_danh_muc", nullable = false)
    private DanhMuc danhMuc;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_thuong_hieu", nullable = false)
    private ThuongHieu thuongHieu;

    @OneToMany(mappedBy = "sanPham", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnoreProperties("sanPham")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private java.util.List<HinhAnh> danhSachHinhAnh;
}
