package com.laptopstore.service;

import com.laptopstore.entity.ThanhToan;
import java.util.List;

public interface ThanhToanService {
    List<ThanhToan> getAll();
    ThanhToan getById(Integer id);
    ThanhToan create(ThanhToan thanhToan);
    ThanhToan update(Integer id, ThanhToan thanhToan);
    void delete(Integer id);
}
