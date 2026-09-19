package com.laptopstore.service;

import com.laptopstore.entity.ChiTietHoaDon;
import java.util.List;

public interface ChiTietHoaDonService {
    List<ChiTietHoaDon> getAll();
    ChiTietHoaDon getById(Integer id);
    List<ChiTietHoaDon> getByHoaDon(Integer hoaDonId);
    List<ChiTietHoaDon> getByChiTietSanPham(Integer ctspId);
    ChiTietHoaDon create(ChiTietHoaDon chiTietHoaDon);
    ChiTietHoaDon update(Integer id, ChiTietHoaDon chiTietHoaDon);
    void delete(Integer id);
}
