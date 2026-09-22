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
    @JoinColumn(name = "id_imei", nullable = false, unique = true)
    private Imei imei;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public ChiTietHoaDon getChiTietHoaDon() { return chiTietHoaDon; }
    public void setChiTietHoaDon(ChiTietHoaDon chiTietHoaDon) { this.chiTietHoaDon = chiTietHoaDon; }
    public Imei getImei() { return imei; }
    public void setImei(Imei imei) { this.imei = imei; }
}
