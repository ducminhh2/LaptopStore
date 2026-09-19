package com.laptopstore.service;

import com.laptopstore.entity.OCung;
import java.util.List;

public interface OCungService {
    List<OCung> getAll();
    OCung getById(Integer id);
    OCung create(OCung oCung);
    OCung update(Integer id, OCung oCung);
    void delete(Integer id);
}
