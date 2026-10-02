package com.laptopstore.dto;

import com.laptopstore.entity.ChiTietSanPham;
import com.laptopstore.entity.DanhMuc;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhMucSectionDTO {

    private DanhMuc danhMuc;
    private List<ChiTietSanPham> chiTietSanPhams;
    private Long totalProducts;
}
