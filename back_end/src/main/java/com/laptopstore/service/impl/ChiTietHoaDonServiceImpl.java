package com.laptopstore.service.impl;

import com.laptopstore.entity.ChiTietHoaDon;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ChiTietHoaDonRepository;
import com.laptopstore.service.ChiTietHoaDonService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChiTietHoaDonServiceImpl implements ChiTietHoaDonService {

    private final ChiTietHoaDonRepository chiTietHoaDonRepository;

    public ChiTietHoaDonServiceImpl(ChiTietHoaDonRepository chiTietHoaDonRepository) {
        this.chiTietHoaDonRepository = chiTietHoaDonRepository;
    }

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
        return chiTietHoaDonRepository.save(chiTietHoaDon);
    }

    @Override
    public ChiTietHoaDon update(Integer id, ChiTietHoaDon chiTietHoaDon) {
        ChiTietHoaDon existing = getById(id);
        existing.setMa(chiTietHoaDon.getMa());
        existing.setHoaDon(chiTietHoaDon.getHoaDon());
        existing.setChiTietSanPham(chiTietHoaDon.getChiTietSanPham());
        existing.setSoLuong(chiTietHoaDon.getSoLuong());
        existing.setGiaTungSanPham(chiTietHoaDon.getGiaTungSanPham());
        return chiTietHoaDonRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        ChiTietHoaDon existing = getById(id);
        chiTietHoaDonRepository.delete(existing);
    }
}
