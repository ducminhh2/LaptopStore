package com.laptopstore.dto;

import com.laptopstore.entity.VaiTro;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private Integer id;
    private String ma;
    private String ten;
    private String username;
    private String email;
    private String dienThoai;
    private String diaChi;
    private VaiTro vaiTro;
    private String roleCode;
    private String redirectUrl;
    private String message;
    private CartSyncResponse cartSync;
}
