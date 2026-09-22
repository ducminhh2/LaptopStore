package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "thuong_hieu")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThuongHieu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_thuong_hieu", nullable = false, length = 100)
    private String tenThuongHieu;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getTenThuongHieu() { return tenThuongHieu; }
    public void setTenThuongHieu(String tenThuongHieu) { this.tenThuongHieu = tenThuongHieu; }
}
