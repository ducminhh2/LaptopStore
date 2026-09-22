package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bao_hanh")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaoHanh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_phieu", unique = true, nullable = false, length = 50)
    private String maPhieu;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_imei", nullable = false, unique = true)
    private Imei imei;

    @Column(name = "ngay_kich_hoat")
    @Builder.Default
    private LocalDateTime ngayKichHoat = LocalDateTime.now();

    @Column(name = "ngay_het_han", nullable = false)
    private LocalDateTime ngayHetHan;

    @Column(name = "trang_thai")
    @Builder.Default
    private Integer trangThai = 1;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getMaPhieu() { return maPhieu; }
    public void setMaPhieu(String maPhieu) { this.maPhieu = maPhieu; }
    public Imei getImei() { return imei; }
    public void setImei(Imei imei) { this.imei = imei; }
    public LocalDateTime getNgayKichHoat() { return ngayKichHoat; }
    public void setNgayKichHoat(LocalDateTime ngayKichHoat) { this.ngayKichHoat = ngayKichHoat; }
    public LocalDateTime getNgayHetHan() { return ngayHetHan; }
    public void setNgayHetHan(LocalDateTime ngayHetHan) { this.ngayHetHan = ngayHetHan; }
    public Integer getTrangThai() { return trangThai; }
    public void setTrangThai(Integer trangThai) { this.trangThai = trangThai; }
}
