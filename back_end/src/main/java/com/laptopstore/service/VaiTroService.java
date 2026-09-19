package com.laptopstore.service;

import com.laptopstore.entity.VaiTro;
import java.util.List;

public interface VaiTroService {
    List<VaiTro> getAll();
    VaiTro getById(Integer id);
    VaiTro create(VaiTro vaiTro);
    VaiTro update(Integer id, VaiTro vaiTro);
    void delete(Integer id);
}
