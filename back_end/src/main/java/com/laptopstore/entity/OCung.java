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
}
