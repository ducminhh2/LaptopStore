package com.laptopstore.service.impl;

import com.laptopstore.entity.ChiTietGioHang;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ChiTietGioHangRepository;
import com.laptopstore.service.ChiTietGioHangService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChiTietGioHangServiceImpl implements ChiTietGioHangService {

    private final ChiTietGioHangRepository chiTietGioHangRepository;

    public ChiTietGioHangServiceImpl(ChiTietGioHangRepository chiTietGioHangRepository) {
        this.chiTietGioHangRepository = chiTietGioHangRepository;
    }

    @Override
    public List<ChiTietGioHang> getAll() {
        return chiTietGioHangRepository.findAll();
    }

    @Override
    public ChiTietGioHang getById(Integer id) {
        return chiTietGioHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết giỏ hàng", "id", id));
    }

    @Override
    public List<ChiTietGioHang> getByGioHang(Integer gioHangId) {
        return chiTietGioHangRepository.findByGioHangId(gioHangId);
    }

    @Override
    public ChiTietGioHang addToCart(ChiTietGioHang chiTietGioHang) {
        return chiTietGioHangRepository.save(chiTietGioHang);
    }

    @Override
    public ChiTietGioHang updateQuantity(Integer id, Integer soLuong) {
        ChiTietGioHang existing = getById(id);
        existing.setSoLuong(soLuong);
        return chiTietGioHangRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        ChiTietGioHang existing = getById(id);
        chiTietGioHangRepository.delete(existing);
    }

    @Override
    public void clearCart(Integer gioHangId) {
        List<ChiTietGioHang> items = getByGioHang(gioHangId);
        chiTietGioHangRepository.deleteAll(items);
    }
}
