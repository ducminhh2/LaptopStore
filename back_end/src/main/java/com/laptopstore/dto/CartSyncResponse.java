package com.laptopstore.dto;

import com.laptopstore.entity.ChiTietGioHang;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartSyncResponse {

    private boolean success;

    private String cartSource; // "DATABASE"

    private boolean imported;   // true if local items were imported, false if DB already had items or both were empty

    private String message;

    private Integer totalQuantity;

    private BigDecimal totalAmount;

    private List<ChiTietGioHang> items;
}
