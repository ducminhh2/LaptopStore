package com.laptopstore.service;

import com.laptopstore.entity.BaoHanh;
import java.util.List;

public interface BaoHanhService {
    List<BaoHanh> getAll();
    BaoHanh getById(Integer id);
    BaoHanh getByMaPhieu(String maPhieu);
    BaoHanh getByImei(Integer imeiId);
    BaoHanh getBySoImei(String soImei);
    BaoHanh create(BaoHanh baoHanh);
    BaoHanh update(Integer id, BaoHanh baoHanh);
    void delete(Integer id);
}
