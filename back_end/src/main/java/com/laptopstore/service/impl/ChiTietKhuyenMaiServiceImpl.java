package com.laptopstore.service.impl;

import com.laptopstore.entity.ChiTietKhuyenMai;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ChiTietKhuyenMaiRepository;
import com.laptopstore.service.ChiTietKhuyenMaiService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChiTietKhuyenMaiServiceImpl implements ChiTietKhuyenMaiService {

    private final ChiTietKhuyenMaiRepository chiTietKhuyenMaiRepository;

    public ChiTietKhuyenMaiServiceImpl(ChiTietKhuyenMaiRepository chiTietKhuyenMaiRepository) {
        this.chiTietKhuyenMaiRepository = chiTietKhuyenMaiRepository;
    }

    @Override
    public List<ChiTietKhuyenMai> getAll() {
        return chiTietKhuyenMaiRepository.findAll();
    }

    @Override
    public ChiTietKhuyenMai getById(Integer id) {
        return chiTietKhuyenMaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết khuyến mãi", "id", id));
    }

    @Override
    public List<ChiTietKhuyenMai> getBySanPham(Integer sanPhamId) {
        return chiTietKhuyenMaiRepository.findBySanPhamId(sanPhamId);
    }

    @Override
    public List<ChiTietKhuyenMai> getByKhuyenMai(Integer khuyenMaiId) {
        return chiTietKhuyenMaiRepository.findByKhuyenMaiId(khuyenMaiId);
    }

    @Override
    public ChiTietKhuyenMai create(ChiTietKhuyenMai chiTietKhuyenMai) {
        return chiTietKhuyenMaiRepository.save(chiTietKhuyenMai);
    }

    @Override
    public void delete(Integer id) {
        ChiTietKhuyenMai existing = getById(id);
        chiTietKhuyenMaiRepository.delete(existing);
    }
}
