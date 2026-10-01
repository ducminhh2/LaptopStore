package com.laptopstore.service;

import com.laptopstore.entity.Imei;
import java.util.List;

import com.laptopstore.dto.ThemImeiRequest;
import java.util.Map;

public interface ImeiService {
    List<Imei> getAll();
    Imei getById(Integer id);
    Imei getBySoImei(String soImei);
    List<Imei> getByChiTietSanPham(Integer ctspId);
    List<Imei> getByChiTietSanPhamAndTrangThai(Integer ctspId, Integer trangThai);
    List<Imei> getByTrangThai(Integer trangThai);
    Imei create(Imei imei);
    Imei update(Integer id, Imei imei);
    Imei updateTrangThai(Integer id, Integer trangThai);
    void delete(Integer id);
    boolean existsBySoImei(String soImei);
    List<String> findExistingImeis(List<String> soImeis);
    Map<String, Object> addImeisToCtsp(ThemImeiRequest request);
    List<Imei> getAvailableByChiTietSanPham(Integer ctspId);
}
