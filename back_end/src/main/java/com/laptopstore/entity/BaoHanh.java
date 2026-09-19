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
    @JoinColumn(name = "id_imei", unique = true, nullable = false)
    private Imei imei;

    @Column(name = "ngay_kich_hoat")
    @Builder.Default
    private LocalDateTime ngayKichHoat = LocalDateTime.now();

    @Column(name = "ngay_het_han", nullable = false)
    private LocalDateTime ngayHetHan;

    @Column(name = "trang_thai")
    @Builder.Default
    private Integer trangThai = 1; // 1: Đang còn hạn bảo hành, 0: Hết hạn
}
