package com.laptopstore.service;

import com.laptopstore.entity.CardDoHoa;
import java.util.List;

public interface CardDoHoaService {
    List<CardDoHoa> getAll();
    CardDoHoa getById(Integer id);
    CardDoHoa create(CardDoHoa cardDoHoa);
    CardDoHoa update(Integer id, CardDoHoa cardDoHoa);
    void delete(Integer id);
}
