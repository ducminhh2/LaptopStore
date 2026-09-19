package com.laptopstore.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "chi_tiet_san_pham")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietSanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_ctsp", unique = true, nullable = false, length = 50)
    private String maCtsp;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_san_pham", nullable = false)
    private SanPham sanPham;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_mau_sac", nullable = false)
    private MauSac mauSac;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cpu", nullable = false)
    private Cpu cpu;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_ram", nullable = false)
    private Ram ram;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_o_cung", nullable = false)
    private OCung oCung;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_card_do_hoa", nullable = false)
    private CardDoHoa cardDoHoa;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_man_hinh", nullable = false)
    private ManHinh manHinh;

    @Column(name = "so_luong")
    @Builder.Default
    private Integer soLuong = 0;

    @Column(name = "gia", nullable = false, precision = 18, scale = 2)
    private BigDecimal gia;

    @Column(name = "mo_ta", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @Column(name = "trang_thai")
    @Builder.Default
    private Integer trangThai = 1;

    @OneToMany(mappedBy = "chiTietSanPham", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnoreProperties("chiTietSanPham")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private java.util.List<HinhAnhChiTiet> danhSachHinhAnh;
}
