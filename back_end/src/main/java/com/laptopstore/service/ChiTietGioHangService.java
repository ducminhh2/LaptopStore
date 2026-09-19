package com.laptopstore.service;

import com.laptopstore.entity.ChiTietGioHang;
import java.util.List;

public interface ChiTietGioHangService {
    List<ChiTietGioHang> getAll();
    ChiTietGioHang getById(Integer id);
    List<ChiTietGioHang> getByGioHang(Integer gioHangId);
    ChiTietGioHang addToCart(ChiTietGioHang chiTietGioHang);
    ChiTietGioHang updateQuantity(Integer id, Integer soLuong);
    void delete(Integer id);
    void clearCart(Integer gioHangId);
}
