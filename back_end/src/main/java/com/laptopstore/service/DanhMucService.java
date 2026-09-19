package com.laptopstore.service;

import com.laptopstore.entity.DanhMuc;
import java.util.List;

public interface DanhMucService {
    List<DanhMuc> getAll();
    DanhMuc getById(Integer id);
    DanhMuc create(DanhMuc danhMuc);
    DanhMuc update(Integer id, DanhMuc danhMuc);
    void delete(Integer id);
}
