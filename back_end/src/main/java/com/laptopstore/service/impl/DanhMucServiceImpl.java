package com.laptopstore.service.impl;

import com.laptopstore.entity.DanhMuc;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.DanhMucRepository;
import com.laptopstore.service.DanhMucService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DanhMucServiceImpl implements DanhMucService {

    private final DanhMucRepository danhMucRepository;

    @Override
    public List<DanhMuc> getAll() {
        return danhMucRepository.findAll();
    }

    @Override
    public DanhMuc getById(Integer id) {
        return danhMucRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", id));
    }

    @Override
    public DanhMuc create(DanhMuc danhMuc) {
        return danhMucRepository.save(danhMuc);
    }

    @Override
    public DanhMuc update(Integer id, DanhMuc danhMuc) {
        DanhMuc existing = getById(id);
        existing.setTenDanhMuc(danhMuc.getTenDanhMuc());
        return danhMucRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        DanhMuc existing = getById(id);
        danhMucRepository.delete(existing);
    }
}
