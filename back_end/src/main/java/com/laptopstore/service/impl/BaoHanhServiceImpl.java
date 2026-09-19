package com.laptopstore.service.impl;

import com.laptopstore.entity.BaoHanh;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.BaoHanhRepository;
import com.laptopstore.service.BaoHanhService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BaoHanhServiceImpl implements BaoHanhService {

    private final BaoHanhRepository baoHanhRepository;

    @Override
    public List<BaoHanh> getAll() {
        return baoHanhRepository.findAll();
    }

    @Override
    public BaoHanh getById(Integer id) {
        return baoHanhRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu bảo hành", "id", id));
    }

    @Override
    public BaoHanh getByMaPhieu(String maPhieu) {
        return baoHanhRepository.findByMaPhieu(maPhieu)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu bảo hành", "maPhieu", maPhieu));
    }

    @Override
    public BaoHanh getByImei(Integer imeiId) {
        return baoHanhRepository.findByImeiId(imeiId)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu bảo hành", "imeiId", imeiId));
    }

    @Override
    public BaoHanh getBySoImei(String soImei) {
        return baoHanhRepository.findByImeiSoImei(soImei)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu bảo hành", "soImei", soImei));
    }

    @Override
    public BaoHanh create(BaoHanh baoHanh) {
        return baoHanhRepository.save(baoHanh);
    }

    @Override
    public BaoHanh update(Integer id, BaoHanh baoHanh) {
        BaoHanh existing = getById(id);
        existing.setMaPhieu(baoHanh.getMaPhieu());
        existing.setNgayKichHoat(baoHanh.getNgayKichHoat());
        existing.setNgayHetHan(baoHanh.getNgayHetHan());
        existing.setTrangThai(baoHanh.getTrangThai());
        if (baoHanh.getImei() != null) {
            existing.setImei(baoHanh.getImei());
        }
        return baoHanhRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        BaoHanh existing = getById(id);
        baoHanhRepository.delete(existing);
    }
}
