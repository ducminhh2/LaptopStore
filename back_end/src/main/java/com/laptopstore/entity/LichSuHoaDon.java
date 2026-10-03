package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lich_su_hoa_don")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichSuHoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_hoa_don", nullable = false)
    private HoaDon hoaDon;

    @Column(name = "trang_thai", nullable = false)
    private Integer trangThai;

    @Column(name = "thoi_gian", nullable = false)
    @Builder.Default
    private LocalDateTime thoiGian = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nhan_vien")
    private NguoiDung nhanVien;

    @Column(name = "ten_nguoi_thuc_hien", length = 100)
    private String tenNguoiThucHien;

    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;
}
