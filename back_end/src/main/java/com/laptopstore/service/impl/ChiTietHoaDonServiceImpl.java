package com.laptopstore.service.impl;

import com.laptopstore.entity.ChiTietHoaDon;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ChiTietHoaDonRepository;
import com.laptopstore.service.ChiTietHoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChiTietHoaDonServiceImpl implements ChiTietHoaDonService {

    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final com.laptopstore.service.KhuyenMaiService khuyenMaiService;

    @Override
    public List<ChiTietHoaDon> getAll() {
        return chiTietHoaDonRepository.findAll();
    }

    @Override
    public ChiTietHoaDon getById(Integer id) {
        return chiTietHoaDonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết hóa đơn", "id", id));
    }

    @Override
    public List<ChiTietHoaDon> getByHoaDon(Integer hoaDonId) {
        return chiTietHoaDonRepository.findByHoaDonId(hoaDonId);
    }

    @Override
    public List<ChiTietHoaDon> getByChiTietSanPham(Integer ctspId) {
        return chiTietHoaDonRepository.findByChiTietSanPhamId(ctspId);
    }

    @Override
    public ChiTietHoaDon create(ChiTietHoaDon chiTietHoaDon) {
        // Server calculates authoritative snapshot sale price with promotions
        if (chiTietHoaDon.getChiTietSanPham() != null && chiTietHoaDon.getChiTietSanPham().getId() != null) {
            com.laptopstore.dto.GiaKhuyenMaiResponse pricing = khuyenMaiService.tinhGiaBanHienTai(chiTietHoaDon.getChiTietSanPham().getId());
            if (pricing != null && pricing.getGiaBan() != null) {
                chiTietHoaDon.setGiaTungSanPham(pricing.getGiaBan());
            }
        }
        return chiTietHoaDonRepository.save(chiTietHoaDon);
    }

    @Override
    public ChiTietHoaDon update(Integer id, ChiTietHoaDon chiTietHoaDon) {
        ChiTietHoaDon existing = getById(id);
        existing.setMa(chiTietHoaDon.getMa());
        existing.setSoLuong(chiTietHoaDon.getSoLuong());
        existing.setGiaTungSanPham(chiTietHoaDon.getGiaTungSanPham());

        if (chiTietHoaDon.getHoaDon() != null) existing.setHoaDon(chiTietHoaDon.getHoaDon());
        if (chiTietHoaDon.getChiTietSanPham() != null) existing.setChiTietSanPham(chiTietHoaDon.getChiTietSanPham());

        return chiTietHoaDonRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        ChiTietHoaDon existing = getById(id);
        chiTietHoaDonRepository.delete(existing);
    }
}
