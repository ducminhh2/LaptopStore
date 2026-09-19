package com.laptopstore.service.impl;

import com.laptopstore.entity.KhuyenMai;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.KhuyenMaiRepository;
import com.laptopstore.service.KhuyenMaiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KhuyenMaiServiceImpl implements KhuyenMaiService {

    private final KhuyenMaiRepository khuyenMaiRepository;

    @Override
    public List<KhuyenMai> getAll() {
        return khuyenMaiRepository.findAll();
    }

    @Override
    public KhuyenMai getById(Integer id) {
        return khuyenMaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi", "id", id));
    }

    @Override
    public KhuyenMai getByMa(String ma) {
        return khuyenMaiRepository.findByMa(ma)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi", "ma", ma));
    }

    @Override
    public KhuyenMai create(KhuyenMai khuyenMai) {
        return khuyenMaiRepository.save(khuyenMai);
    }

    @Override
    public KhuyenMai update(Integer id, KhuyenMai khuyenMai) {
        KhuyenMai existing = getById(id);
        existing.setMa(khuyenMai.getMa());
        existing.setTenKm(khuyenMai.getTenKm());
        existing.setPhanTramGiam(khuyenMai.getPhanTramGiam());
        existing.setNgayBatDau(khuyenMai.getNgayBatDau());
        existing.setNgayKetThuc(khuyenMai.getNgayKetThuc());
        return khuyenMaiRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        KhuyenMai existing = getById(id);
        khuyenMaiRepository.delete(existing);
    }
}
