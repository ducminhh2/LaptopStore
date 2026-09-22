package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hoa_don")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma", unique = true, nullable = false, length = 50)
    private String ma;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_khach_hang", nullable = false)
    private NguoiDung khachHang;

    @Column(name = "dia_chi", nullable = false, length = 255)
    private String diaChi;

    @Column(name = "dien_thoai", nullable = false, length = 20)
    private String dienThoai;

    @Column(name = "ngay_tao")
    @Builder.Default
    private LocalDateTime ngayTao = LocalDateTime.now();

    @Column(name = "ten_nguoi_nhan", nullable = false, length = 100)
    private String tenNguoiNhan;

    @Column(name = "trang_thai")
    @Builder.Default
    private Integer trangThai = 0; // 0: Chờ xác nhận, 1: Đã xác nhận, 2: Đang giao, 3: Hoàn thành, 4: Đã hủy

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_thanh_toan")
    private ThanhToan thanhToan;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_nhan_vien")
    private NguoiDung nhanVien;

    @Column(name = "mo_ta", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getMa() { return ma; }
    public void setMa(String ma) { this.ma = ma; }
    public NguoiDung getKhachHang() { return khachHang; }
    public void setKhachHang(NguoiDung khachHang) { this.khachHang = khachHang; }
    public String getDiaChi() { return diaChi; }
    public void setDiaChi(String diaChi) { this.diaChi = diaChi; }
    public String getDienThoai() { return dienThoai; }
    public void setDienThoai(String dienThoai) { this.dienThoai = dienThoai; }
    public LocalDateTime getNgayTao() { return ngayTao; }
    public void setNgayTao(LocalDateTime ngayTao) { this.ngayTao = ngayTao; }
    public String getTenNguoiNhan() { return tenNguoiNhan; }
    public void setTenNguoiNhan(String tenNguoiNhan) { this.tenNguoiNhan = tenNguoiNhan; }
    public Integer getTrangThai() { return trangThai; }
    public void setTrangThai(Integer trangThai) { this.trangThai = trangThai; }
    public ThanhToan getThanhToan() { return thanhToan; }
    public void setThanhToan(ThanhToan thanhToan) { this.thanhToan = thanhToan; }
    public NguoiDung getNhanVien() { return nhanVien; }
    public void setNhanVien(NguoiDung nhanVien) { this.nhanVien = nhanVien; }
    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }
}
