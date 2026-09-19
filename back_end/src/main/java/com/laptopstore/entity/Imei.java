package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "imei")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Imei {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "so_imei", unique = true, nullable = false, length = 100)
    private String soImei;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_chi_tiet_san_pham", nullable = false)
    private ChiTietSanPham chiTietSanPham;

    @Column(name = "trang_thai")
    @Builder.Default
    private Integer trangThai = 0; // 0: Trong kho, 1: Đã bán, 2: Đang giao, 3: Lỗi/Đổi trả, 4: Bảo hành

    @Column(name = "ngay_nhap")
    @Builder.Default
    private LocalDateTime ngayNhap = LocalDateTime.now();
}
