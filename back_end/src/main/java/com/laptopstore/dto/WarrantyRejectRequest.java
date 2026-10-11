package com.laptopstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyRejectRequest {

    @NotBlank(message = "Lý do từ chối không được để trống")
    @Size(min = 10, max = 1000, message = "Lý do từ chối phải có độ dài từ 10 đến 1000 ký tự")
    private String lyDoTuChoi;
}
