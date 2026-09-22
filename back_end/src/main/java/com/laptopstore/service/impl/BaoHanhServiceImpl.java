package com.laptopstore.service.impl;

import com.laptopstore.entity.BaoHanh;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.BaoHanhRepository;
import com.laptopstore.service.BaoHanhService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BaoHanhServiceImpl implements BaoHanhService {

    private final BaoHanhRepository baoHanhRepository;

    public BaoHanhServiceImpl(BaoHanhRepository baoHanhRepository) {
        this.baoHanhRepository = baoHanhRepository;
    }

    @Override
    public List<BaoHanh> getAll() {
        return baoHanhRepository.findAll();
    }

    @Override
    public BaoHanh getById(Integer id) {
        return baoHanhRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bảo hành", "id", id));
    }

    @Override
    public BaoHanh getByMaPhieu(String maPhieu) {
        return baoHanhRepository.findByMaPhieu(maPhieu)
                .orElseThrow(() -> new ResourceNotFoundException("Bảo hành", "maPhieu", maPhieu));
    }

    @Override
    public BaoHanh getByImei(Integer imeiId) {
        return baoHanhRepository.findByImeiId(imeiId)
                .orElseThrow(() -> new ResourceNotFoundException("Bảo hành", "imeiId", imeiId));
    }

    @Override
    public BaoHanh getBySoImei(String soImei) {
        return baoHanhRepository.findByImeiSoImei(soImei)
                .orElseThrow(() -> new ResourceNotFoundException("Bảo hành", "soImei", soImei));
    }

    @Override
    public BaoHanh create(BaoHanh baoHanh) {
        return baoHanhRepository.save(baoHanh);
    }

    @Override
    public BaoHanh update(Integer id, BaoHanh baoHanh) {
        BaoHanh existing = getById(id);
        existing.setMaPhieu(baoHanh.getMaPhieu());
        existing.setImei(baoHanh.getImei());
        existing.setNgayKichHoat(baoHanh.getNgayKichHoat());
        existing.setNgayHetHan(baoHanh.getNgayHetHan());
        existing.setTrangThai(baoHanh.getTrangThai());
        return baoHanhRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        BaoHanh existing = getById(id);
        baoHanhRepository.delete(existing);
    }
}
