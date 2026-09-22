package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ram")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "dung_luong", nullable = false, length = 50)
    private String dungLuong;

    @Column(name = "loai_ram", length = 50)
    private String loaiRam;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getDungLuong() { return dungLuong; }
    public void setDungLuong(String dungLuong) { this.dungLuong = dungLuong; }
    public String getLoaiRam() { return loaiRam; }
    public void setLoaiRam(String loaiRam) { this.loaiRam = loaiRam; }
}
