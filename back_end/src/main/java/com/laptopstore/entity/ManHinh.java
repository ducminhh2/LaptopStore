package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "man_hinh")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManHinh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "kich_thuoc", nullable = false, length = 50)
    private String kichThuoc;

    @Column(name = "do_phan_giai", nullable = false, length = 50)
    private String doPhanGiai;

    @Column(name = "tan_so_quet", length = 50)
    private String tanSoQuet;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getKichThuoc() { return kichThuoc; }
    public void setKichThuoc(String kichThuoc) { this.kichThuoc = kichThuoc; }
    public String getDoPhanGiai() { return doPhanGiai; }
    public void setDoPhanGiai(String doPhanGiai) { this.doPhanGiai = doPhanGiai; }
    public String getTanSoQuet() { return tanSoQuet; }
    public void setTanSoQuet(String tanSoQuet) { this.tanSoQuet = tanSoQuet; }
}
