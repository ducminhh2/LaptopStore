package com.laptopstore.service;

import com.laptopstore.entity.MauSac;
import java.util.List;

public interface MauSacService {
    List<MauSac> getAll();
    MauSac getById(Integer id);
    MauSac create(MauSac mauSac);
    MauSac update(Integer id, MauSac mauSac);
    void delete(Integer id);
}
