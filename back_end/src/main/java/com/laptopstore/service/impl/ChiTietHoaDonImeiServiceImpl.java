package com.laptopstore.service.impl;

import com.laptopstore.entity.ChiTietHoaDonImei;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ChiTietHoaDonImeiRepository;
import com.laptopstore.service.ChiTietHoaDonImeiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChiTietHoaDonImeiServiceImpl implements ChiTietHoaDonImeiService {

    private final ChiTietHoaDonImeiRepository chiTietHoaDonImeiRepository;

    @Override
    public List<ChiTietHoaDonImei> getAll() {
        return chiTietHoaDonImeiRepository.findAll();
    }

    @Override
    public ChiTietHoaDonImei getById(Integer id) {
        return chiTietHoaDonImeiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết hóa đơn IMEI", "id", id));
    }

    @Override
    public List<ChiTietHoaDonImei> getByChiTietHoaDon(Integer cthdId) {
        return chiTietHoaDonImeiRepository.findByChiTietHoaDonId(cthdId);
    }

    @Override
    public ChiTietHoaDonImei getByImei(Integer imeiId) {
        return chiTietHoaDonImeiRepository.findByImeiId(imeiId)
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết hóa đơn IMEI", "imeiId", imeiId));
    }

    @Override
    public ChiTietHoaDonImei create(ChiTietHoaDonImei chiTietHoaDonImei) {
        return chiTietHoaDonImeiRepository.save(chiTietHoaDonImei);
    }

    @Override
    public void delete(Integer id) {
        ChiTietHoaDonImei existing = getById(id);
        chiTietHoaDonImeiRepository.delete(existing);
    }
}
