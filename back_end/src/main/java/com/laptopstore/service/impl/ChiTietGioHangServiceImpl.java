package com.laptopstore.service.impl;

import com.laptopstore.entity.ChiTietGioHang;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ChiTietGioHangRepository;
import com.laptopstore.service.ChiTietGioHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChiTietGioHangServiceImpl implements ChiTietGioHangService {

    private final ChiTietGioHangRepository chiTietGioHangRepository;

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
        if (chiTietGioHang.getGioHang() != null && chiTietGioHang.getChiTietSanPham() != null) {
            Optional<ChiTietGioHang> existing = chiTietGioHangRepository.findByGioHangIdAndChiTietSanPhamId(
                    chiTietGioHang.getGioHang().getId(), chiTietGioHang.getChiTietSanPham().getId());
            if (existing.isPresent()) {
                ChiTietGioHang item = existing.get();
                item.setSoLuong(item.getSoLuong() + chiTietGioHang.getSoLuong());
                return chiTietGioHangRepository.save(item);
            }
        }
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
    @Transactional
    public void clearCart(Integer gioHangId) {
        chiTietGioHangRepository.deleteByGioHangId(gioHangId);
    }
}
