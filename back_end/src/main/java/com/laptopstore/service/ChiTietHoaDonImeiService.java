package com.laptopstore.service;

import com.laptopstore.entity.ChiTietHoaDonImei;
import java.util.List;

public interface ChiTietHoaDonImeiService {
    List<ChiTietHoaDonImei> getAll();
    ChiTietHoaDonImei getById(Integer id);
    List<ChiTietHoaDonImei> getByChiTietHoaDon(Integer cthdId);
    ChiTietHoaDonImei getByImei(Integer imeiId);
    ChiTietHoaDonImei create(ChiTietHoaDonImei chiTietHoaDonImei);
    void delete(Integer id);
}
