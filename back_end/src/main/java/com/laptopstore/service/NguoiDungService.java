package com.laptopstore.service;

import com.laptopstore.entity.NguoiDung;
import java.util.List;

public interface NguoiDungService {
    List<NguoiDung> getAll();
    NguoiDung getById(Integer id);
    NguoiDung getByUsername(String username);
    List<NguoiDung> getByVaiTro(Integer vaiTroId);
    NguoiDung create(NguoiDung nguoiDung);
    NguoiDung update(Integer id, NguoiDung nguoiDung);
    void delete(Integer id);
}
