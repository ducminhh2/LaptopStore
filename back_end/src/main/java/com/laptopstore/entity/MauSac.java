package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mau_sac")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MauSac {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_mau", nullable = false, length = 50)
    private String tenMau;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getTenMau() { return tenMau; }
    public void setTenMau(String tenMau) { this.tenMau = tenMau; }
}
