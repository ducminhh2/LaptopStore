package com.laptopstore.service;

import com.laptopstore.entity.Ram;
import java.util.List;

public interface RamService {
    List<Ram> getAll();
    Ram getById(Integer id);
    Ram create(Ram ram);
    Ram update(Integer id, Ram ram);
    void delete(Integer id);
}
