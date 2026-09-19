package com.laptopstore.service;

import com.laptopstore.entity.HinhAnh;
import java.util.List;

public interface HinhAnhService {
    List<HinhAnh> getAll();
    HinhAnh getById(Integer id);
    List<HinhAnh> getBySanPham(Integer sanPhamId);
    HinhAnh create(HinhAnh hinhAnh);
    HinhAnh update(Integer id, HinhAnh hinhAnh);
    void delete(Integer id);
}
