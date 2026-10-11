package com.laptopstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyCompleteRequest {

    @NotBlank(message = "Kết quả kiểm tra và xử lý không được để trống")
    @Size(min = 10, max = 1000, message = "Kết quả kiểm tra và xử lý phải có độ dài từ 10 đến 1000 ký tự")
    private String ghiChuXuLy;
}
