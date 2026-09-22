package com.laptopstore.service.impl;

import com.laptopstore.entity.ThuongHieu;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ThuongHieuRepository;
import com.laptopstore.service.ThuongHieuService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ThuongHieuServiceImpl implements ThuongHieuService {

    private final ThuongHieuRepository thuongHieuRepository;

    public ThuongHieuServiceImpl(ThuongHieuRepository thuongHieuRepository) {
        this.thuongHieuRepository = thuongHieuRepository;
    }

    @Override
    public List<ThuongHieu> getAll() {
        return thuongHieuRepository.findAll();
    }

    @Override
    public ThuongHieu getById(Integer id) {
        return thuongHieuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thương hiệu", "id", id));
    }

    @Override
    public ThuongHieu create(ThuongHieu thuongHieu) {
        return thuongHieuRepository.save(thuongHieu);
    }

    @Override
    public ThuongHieu update(Integer id, ThuongHieu thuongHieu) {
        ThuongHieu existing = getById(id);
        existing.setTenThuongHieu(thuongHieu.getTenThuongHieu());
        return thuongHieuRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        ThuongHieu existing = getById(id);
        thuongHieuRepository.delete(existing);
    }
}
