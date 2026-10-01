package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "nguoi_dung")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NguoiDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma", unique = true, nullable = false, length = 50)
    private String ma;

    @Column(name = "ten", nullable = false, length = 100)
    private String ten;

    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "dia_chi", length = 255)
    private String diaChi;

    @Column(name = "dien_thoai", length = 20)
    private String dienThoai;

    @Column(name = "email", length = 100)
    private String email;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_vai_tro", nullable = false)
    private VaiTro vaiTro;
}
