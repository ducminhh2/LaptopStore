package com.laptopstore.service;

import com.laptopstore.entity.ChiTietSanPham;
import java.util.List;

public interface ChiTietSanPhamService {
    List<ChiTietSanPham> getAll();
    ChiTietSanPham getById(Integer id);
    ChiTietSanPham getByMaCtsp(String maCtsp);
    List<ChiTietSanPham> getBySanPham(Integer sanPhamId);
    List<ChiTietSanPham> getByTrangThai(Integer trangThai);
    ChiTietSanPham create(ChiTietSanPham chiTietSanPham);
    ChiTietSanPham update(Integer id, ChiTietSanPham chiTietSanPham);
    void delete(Integer id);
}
