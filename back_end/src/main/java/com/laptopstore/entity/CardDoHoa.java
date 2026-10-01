package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "card_do_hoa")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardDoHoa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_card", nullable = false, length = 100)
    private String tenCard;
}
