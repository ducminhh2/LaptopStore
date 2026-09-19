package com.laptopstore.service;

import com.laptopstore.entity.SanPham;
import java.util.List;

public interface SanPhamService {
    List<SanPham> getAll();
    SanPham getById(Integer id);
    SanPham getByMaSp(String maSp);
    List<SanPham> getByDanhMuc(Integer danhMucId);
    List<SanPham> getByThuongHieu(Integer thuongHieuId);
    List<SanPham> search(String keyword);
    SanPham create(SanPham sanPham);
    SanPham update(Integer id, SanPham sanPham);
    void delete(Integer id);
}
