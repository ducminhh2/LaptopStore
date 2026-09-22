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

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getMaSp() { return maSp; }
    public void setMaSp(String maSp) { this.maSp = maSp; }
    public String getTenSp() { return tenSp; }
    public void setTenSp(String tenSp) { this.tenSp = tenSp; }
    public BigDecimal getGiaCoBan() { return giaCoBan; }
    public void setGiaCoBan(BigDecimal giaCoBan) { this.giaCoBan = giaCoBan; }
    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }
    public DanhMuc getDanhMuc() { return danhMuc; }
    public void setDanhMuc(DanhMuc danhMuc) { this.danhMuc = danhMuc; }
    public ThuongHieu getThuongHieu() { return thuongHieu; }
    public void setThuongHieu(ThuongHieu thuongHieu) { this.thuongHieu = thuongHieu; }
    public java.util.List<HinhAnh> getDanhSachHinhAnh() { return danhSachHinhAnh; }
    public void setDanhSachHinhAnh(java.util.List<HinhAnh> danhSachHinhAnh) { this.danhSachHinhAnh = danhSachHinhAnh; }
}
