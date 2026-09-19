package com.laptopstore.service;

import com.laptopstore.entity.HoaDon;
import java.util.List;

public interface HoaDonService {
    List<HoaDon> getAll();
    HoaDon getById(Integer id);
    HoaDon getByMa(String ma);
    List<HoaDon> getByKhachHang(Integer khachHangId);
    List<HoaDon> getByNhanVien(Integer nhanVienId);
    List<HoaDon> getByTrangThai(Integer trangThai);
    HoaDon create(HoaDon hoaDon);
    HoaDon update(Integer id, HoaDon hoaDon);
    HoaDon updateTrangThai(Integer id, Integer trangThai);
    void delete(Integer id);
}
