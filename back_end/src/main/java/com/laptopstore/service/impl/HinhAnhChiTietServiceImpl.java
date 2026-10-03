package com.laptopstore.service.impl;

import com.laptopstore.entity.ChiTietSanPham;
import com.laptopstore.entity.HinhAnhChiTiet;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ChiTietSanPhamRepository;
import com.laptopstore.repository.HinhAnhChiTietRepository;
import com.laptopstore.service.HinhAnhChiTietService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class HinhAnhChiTietServiceImpl implements HinhAnhChiTietService {

    private final HinhAnhChiTietRepository hinhAnhChiTietRepository;
    private final ChiTietSanPhamRepository chiTietSanPhamRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HinhAnhChiTiet> getAll() {
        return hinhAnhChiTietRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public HinhAnhChiTiet getById(Integer id) {
        return hinhAnhChiTietRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hình ảnh chi tiết", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HinhAnhChiTiet> getByChiTietSanPham(Integer ctspId) {
        return hinhAnhChiTietRepository.findByChiTietSanPhamId(ctspId);
    }

    @Override
    public HinhAnhChiTiet create(HinhAnhChiTiet hinhAnhChiTiet) {
        if (hinhAnhChiTiet.getChiTietSanPham() != null && hinhAnhChiTiet.getChiTietSanPham().getId() != null) {
            ChiTietSanPham ctsp = chiTietSanPhamRepository.findById(hinhAnhChiTiet.getChiTietSanPham().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chi tiết sản phẩm", "id", hinhAnhChiTiet.getChiTietSanPham().getId()));
            hinhAnhChiTiet.setChiTietSanPham(ctsp);
        }
        return hinhAnhChiTietRepository.save(hinhAnhChiTiet);
    }

    @Override
    public HinhAnhChiTiet update(Integer id, HinhAnhChiTiet hinhAnhChiTiet) {
        HinhAnhChiTiet existing = getById(id);
        existing.setUrlHinhAnh(hinhAnhChiTiet.getUrlHinhAnh());
        if (hinhAnhChiTiet.getChiTietSanPham() != null && hinhAnhChiTiet.getChiTietSanPham().getId() != null) {
            ChiTietSanPham ctsp = chiTietSanPhamRepository.findById(hinhAnhChiTiet.getChiTietSanPham().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chi tiết sản phẩm", "id", hinhAnhChiTiet.getChiTietSanPham().getId()));
            existing.setChiTietSanPham(ctsp);
        }
        return hinhAnhChiTietRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        HinhAnhChiTiet existing = getById(id);
        hinhAnhChiTietRepository.delete(existing);
    }
}
