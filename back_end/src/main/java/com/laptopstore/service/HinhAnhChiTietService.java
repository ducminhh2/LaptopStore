package com.laptopstore.service;

import com.laptopstore.entity.HinhAnhChiTiet;
import java.util.List;

public interface HinhAnhChiTietService {
    List<HinhAnhChiTiet> getAll();
    HinhAnhChiTiet getById(Integer id);
    List<HinhAnhChiTiet> getByChiTietSanPham(Integer ctspId);
    HinhAnhChiTiet create(HinhAnhChiTiet hinhAnhChiTiet);
    HinhAnhChiTiet update(Integer id, HinhAnhChiTiet hinhAnhChiTiet);
    void delete(Integer id);
}
