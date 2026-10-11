package com.laptopstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyRequestCreateDTO {

    @NotNull(message = "Mã phiếu bảo hành không được để trống")
    private Integer idBaoHanh;

    @NotBlank(message = "Mô tả sự cố không được để trống")
    @Size(min = 10, max = 1000, message = "Mô tả sự cố phải có từ 10 đến 1000 ký tự")
    private String moTaLoi;

    @NotBlank(message = "Số điện thoại liên hệ không được để trống")
    @Pattern(regexp = "^0[0-9]{9}$", message = "Số điện thoại phải đúng 10 chữ số và bắt đầu bằng số 0")
    private String dienThoaiLienHe;

    @Size(max = 500, message = "Ghi chú bổ sung không được vượt quá 500 ký tự")
    private String ghiChuKhachHang;
}
