package com.laptopstore.service;

import com.laptopstore.entity.ChiTietKhuyenMai;
import java.util.List;

public interface ChiTietKhuyenMaiService {
    List<ChiTietKhuyenMai> getAll();
    ChiTietKhuyenMai getById(Integer id);
    List<ChiTietKhuyenMai> getByKhuyenMai(Integer khuyenMaiId);
    List<ChiTietKhuyenMai> getBySanPham(Integer sanPhamId);
    ChiTietKhuyenMai create(ChiTietKhuyenMai chiTietKhuyenMai);
    void delete(Integer id);
}
