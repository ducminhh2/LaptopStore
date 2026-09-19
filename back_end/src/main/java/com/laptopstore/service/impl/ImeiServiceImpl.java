package com.laptopstore.service.impl;

import com.laptopstore.entity.Imei;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ImeiRepository;
import com.laptopstore.service.ImeiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ImeiServiceImpl implements ImeiService {

    private final ImeiRepository imeiRepository;

    @Override
    public List<Imei> getAll() {
        return imeiRepository.findAll();
    }

    @Override
    public Imei getById(Integer id) {
        return imeiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("IMEI", "id", id));
    }

    @Override
    public Imei getBySoImei(String soImei) {
        return imeiRepository.findBySoImei(soImei)
                .orElseThrow(() -> new ResourceNotFoundException("IMEI", "soImei", soImei));
    }

    @Override
    public List<Imei> getByChiTietSanPham(Integer ctspId) {
        return imeiRepository.findByChiTietSanPhamId(ctspId);
    }

    @Override
    public List<Imei> getByChiTietSanPhamAndTrangThai(Integer ctspId, Integer trangThai) {
        return imeiRepository.findByChiTietSanPhamIdAndTrangThai(ctspId, trangThai);
    }

    @Override
    public List<Imei> getByTrangThai(Integer trangThai) {
        return imeiRepository.findByTrangThai(trangThai);
    }

    @Override
    public Imei create(Imei imei) {
        return imeiRepository.save(imei);
    }

    @Override
    public Imei update(Integer id, Imei imei) {
        Imei existing = getById(id);
        existing.setSoImei(imei.getSoImei());
        existing.setTrangThai(imei.getTrangThai());
        if (imei.getChiTietSanPham() != null) {
            existing.setChiTietSanPham(imei.getChiTietSanPham());
        }
        return imeiRepository.save(existing);
    }

    @Override
    public Imei updateTrangThai(Integer id, Integer trangThai) {
        Imei existing = getById(id);
        existing.setTrangThai(trangThai);
        return imeiRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        Imei existing = getById(id);
        imeiRepository.delete(existing);
    }
}
