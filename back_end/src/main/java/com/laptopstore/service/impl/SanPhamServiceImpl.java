package com.laptopstore.service.impl;

import com.laptopstore.entity.SanPham;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.SanPhamRepository;
import com.laptopstore.service.SanPhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SanPhamServiceImpl implements SanPhamService {

    private final SanPhamRepository sanPhamRepository;

    @Override
    public List<SanPham> getAll() {
        return sanPhamRepository.findAll();
    }

    @Override
    public SanPham getById(Integer id) {
        return sanPhamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", id));
    }

    @Override
    public SanPham getByMaSp(String maSp) {
        return sanPhamRepository.findByMaSp(maSp)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "maSp", maSp));
    }

    @Override
    public List<SanPham> getByDanhMuc(Integer danhMucId) {
        return sanPhamRepository.findByDanhMucId(danhMucId);
    }

    @Override
    public List<SanPham> getByThuongHieu(Integer thuongHieuId) {
        return sanPhamRepository.findByThuongHieuId(thuongHieuId);
    }

    @Override
    public List<SanPham> search(String keyword) {
        return sanPhamRepository.findByTenSpContainingIgnoreCase(keyword);
    }

    @Override
    public SanPham create(SanPham sanPham) {
        return sanPhamRepository.save(sanPham);
    }

    @Override
    public SanPham update(Integer id, SanPham sanPham) {
        SanPham existing = getById(id);
        existing.setMaSp(sanPham.getMaSp());
        existing.setTenSp(sanPham.getTenSp());
        existing.setGiaCoBan(sanPham.getGiaCoBan());
        existing.setMoTa(sanPham.getMoTa());
        if (sanPham.getDanhMuc() != null) {
            existing.setDanhMuc(sanPham.getDanhMuc());
        }
        if (sanPham.getThuongHieu() != null) {
            existing.setThuongHieu(sanPham.getThuongHieu());
        }
        return sanPhamRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        SanPham existing = getById(id);
        sanPhamRepository.delete(existing);
    }
}
