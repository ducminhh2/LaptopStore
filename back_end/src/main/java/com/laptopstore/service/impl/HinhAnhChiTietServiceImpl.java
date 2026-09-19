package com.laptopstore.service.impl;

import com.laptopstore.entity.HinhAnhChiTiet;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.HinhAnhChiTietRepository;
import com.laptopstore.service.HinhAnhChiTietService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HinhAnhChiTietServiceImpl implements HinhAnhChiTietService {

    private final HinhAnhChiTietRepository hinhAnhChiTietRepository;

    @Override
    public List<HinhAnhChiTiet> getAll() {
        return hinhAnhChiTietRepository.findAll();
    }

    @Override
    public HinhAnhChiTiet getById(Integer id) {
        return hinhAnhChiTietRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hình ảnh chi tiết", "id", id));
    }

    @Override
    public List<HinhAnhChiTiet> getByChiTietSanPham(Integer ctspId) {
        return hinhAnhChiTietRepository.findByChiTietSanPhamId(ctspId);
    }

    @Override
    public HinhAnhChiTiet create(HinhAnhChiTiet hinhAnhChiTiet) {
        return hinhAnhChiTietRepository.save(hinhAnhChiTiet);
    }

    @Override
    public HinhAnhChiTiet update(Integer id, HinhAnhChiTiet hinhAnhChiTiet) {
        HinhAnhChiTiet existing = getById(id);
        existing.setUrlHinhAnh(hinhAnhChiTiet.getUrlHinhAnh());
        if (hinhAnhChiTiet.getChiTietSanPham() != null) {
            existing.setChiTietSanPham(hinhAnhChiTiet.getChiTietSanPham());
        }
        return hinhAnhChiTietRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        HinhAnhChiTiet existing = getById(id);
        hinhAnhChiTietRepository.delete(existing);
    }
}
