package com.laptopstore.service;

import com.laptopstore.entity.GioHang;
import java.util.List;

public interface GioHangService {
    List<GioHang> getAll();
    GioHang getById(Integer id);
    GioHang getByKhachHang(Integer khachHangId);
    GioHang create(GioHang gioHang);
    GioHang update(Integer id, GioHang gioHang);
    void delete(Integer id);
}
