package com.laptopstore.service.impl;

import com.laptopstore.entity.ManHinh;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ManHinhRepository;
import com.laptopstore.service.ManHinhService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ManHinhServiceImpl implements ManHinhService {

    private final ManHinhRepository manHinhRepository;

    @Override
    public List<ManHinh> getAll() {
        return manHinhRepository.findAll();
    }

    @Override
    public ManHinh getById(Integer id) {
        return manHinhRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Màn hình", "id", id));
    }

    @Override
    public ManHinh create(ManHinh manHinh) {
        return manHinhRepository.save(manHinh);
    }

    @Override
    public ManHinh update(Integer id, ManHinh manHinh) {
        ManHinh existing = getById(id);
        existing.setKichThuoc(manHinh.getKichThuoc());
        existing.setDoPhanGiai(manHinh.getDoPhanGiai());
        existing.setTanSoQuet(manHinh.getTanSoQuet());
        return manHinhRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        ManHinh existing = getById(id);
        manHinhRepository.delete(existing);
    }
}
