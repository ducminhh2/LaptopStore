package com.laptopstore.service.impl;

import com.laptopstore.entity.HinhAnh;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.HinhAnhRepository;
import com.laptopstore.service.HinhAnhService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HinhAnhServiceImpl implements HinhAnhService {

    private final HinhAnhRepository hinhAnhRepository;

    public HinhAnhServiceImpl(HinhAnhRepository hinhAnhRepository) {
        this.hinhAnhRepository = hinhAnhRepository;
    }

    @Override
    public List<HinhAnh> getAll() {
        return hinhAnhRepository.findAll();
    }

    @Override
    public HinhAnh getById(Integer id) {
        return hinhAnhRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hình ảnh", "id", id));
    }

    @Override
    public List<HinhAnh> getBySanPham(Integer sanPhamId) {
        return hinhAnhRepository.findBySanPhamId(sanPhamId);
    }

    @Override
    public HinhAnh create(HinhAnh hinhAnh) {
        return hinhAnhRepository.save(hinhAnh);
    }

    @Override
    public HinhAnh update(Integer id, HinhAnh hinhAnh) {
        HinhAnh existing = getById(id);
        existing.setUrlHinhAnh(hinhAnh.getUrlHinhAnh());
        existing.setSanPham(hinhAnh.getSanPham());
        return hinhAnhRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        HinhAnh existing = getById(id);
        hinhAnhRepository.delete(existing);
    }
}
