package com.laptopstore.service;

import com.laptopstore.entity.KhuyenMai;
import java.util.List;

public interface KhuyenMaiService {
    List<KhuyenMai> getAll();
    KhuyenMai getById(Integer id);
    KhuyenMai getByMa(String ma);
    KhuyenMai create(KhuyenMai khuyenMai);
    KhuyenMai update(Integer id, KhuyenMai khuyenMai);
    void delete(Integer id);
}
