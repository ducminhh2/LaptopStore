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
}
