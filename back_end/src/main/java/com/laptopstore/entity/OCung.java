package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "o_cung")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OCung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "loai_o_cung", nullable = false, length = 50)
    private String loaiOCung;

    @Column(name = "dung_luong", nullable = false, length = 50)
    private String dungLuong;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getLoaiOCung() { return loaiOCung; }
    public void setLoaiOCung(String loaiOCung) { this.loaiOCung = loaiOCung; }
    public String getDungLuong() { return dungLuong; }
    public void setDungLuong(String dungLuong) { this.dungLuong = dungLuong; }
}
