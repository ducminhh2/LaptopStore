package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chi_tiet_hoa_don_imei")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietHoaDonImei {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_chi_tiet_hoa_don", nullable = false)
    private ChiTietHoaDon chiTietHoaDon;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_imei", unique = true, nullable = false)
    private Imei imei;
}
