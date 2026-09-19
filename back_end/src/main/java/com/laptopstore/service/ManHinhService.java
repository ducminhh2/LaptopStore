package com.laptopstore.service;

import com.laptopstore.entity.ManHinh;
import java.util.List;

public interface ManHinhService {
    List<ManHinh> getAll();
    ManHinh getById(Integer id);
    ManHinh create(ManHinh manHinh);
    ManHinh update(Integer id, ManHinh manHinh);
    void delete(Integer id);
}
