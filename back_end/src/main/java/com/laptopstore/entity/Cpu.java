package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cpu")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cpu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_cpu", nullable = false, length = 100)
    private String tenCpu;
}
