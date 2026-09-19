package com.laptopstore.service.impl;

import com.laptopstore.entity.GioHang;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.GioHangRepository;
import com.laptopstore.service.GioHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GioHangServiceImpl implements GioHangService {

    private final GioHangRepository gioHangRepository;

    @Override
    public List<GioHang> getAll() {
        return gioHangRepository.findAll();
    }

    @Override
    public GioHang getById(Integer id) {
        return gioHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng", "id", id));
    }

    @Override
    public GioHang getByKhachHang(Integer khachHangId) {
        return gioHangRepository.findByKhachHangId(khachHangId)
                .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng", "khachHangId", khachHangId));
    }

    @Override
    public GioHang create(GioHang gioHang) {
        return gioHangRepository.save(gioHang);
    }

    @Override
    public GioHang update(Integer id, GioHang gioHang) {
        GioHang existing = getById(id);
        existing.setMa(gioHang.getMa());
        existing.setTongSoTien(gioHang.getTongSoTien());
        existing.setTongSoLuong(gioHang.getTongSoLuong());
        if (gioHang.getKhachHang() != null) {
            existing.setKhachHang(gioHang.getKhachHang());
        }
        return gioHangRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        GioHang existing = getById(id);
        gioHangRepository.delete(existing);
    }
}
