package com.laptopstore.service.impl;

import com.laptopstore.entity.HoaDon;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.HoaDonRepository;
import com.laptopstore.service.HoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HoaDonServiceImpl implements HoaDonService {

    private final HoaDonRepository hoaDonRepository;

    @Override
    public List<HoaDon> getAll() {
        return hoaDonRepository.findAll();
    }

    @Override
    public HoaDon getById(Integer id) {
        return hoaDonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn", "id", id));
    }

    @Override
    public HoaDon getByMa(String ma) {
        return hoaDonRepository.findByMa(ma)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn", "ma", ma));
    }

    @Override
    public List<HoaDon> getByKhachHang(Integer khachHangId) {
        return hoaDonRepository.findByKhachHangId(khachHangId);
    }

    @Override
    public List<HoaDon> getByNhanVien(Integer nhanVienId) {
        return hoaDonRepository.findByNhanVienId(nhanVienId);
    }

    @Override
    public List<HoaDon> getByTrangThai(Integer trangThai) {
        return hoaDonRepository.findByTrangThai(trangThai);
    }

    @Override
    public HoaDon create(HoaDon hoaDon) {
        return hoaDonRepository.save(hoaDon);
    }

    @Override
    public HoaDon update(Integer id, HoaDon hoaDon) {
        HoaDon existing = getById(id);
        existing.setMa(hoaDon.getMa());
        existing.setDiaChi(hoaDon.getDiaChi());
        existing.setDienThoai(hoaDon.getDienThoai());
        existing.setTenNguoiNhan(hoaDon.getTenNguoiNhan());
        existing.setTrangThai(hoaDon.getTrangThai());
        existing.setMoTa(hoaDon.getMoTa());

        if (hoaDon.getKhachHang() != null) existing.setKhachHang(hoaDon.getKhachHang());
        if (hoaDon.getNhanVien() != null) existing.setNhanVien(hoaDon.getNhanVien());
        if (hoaDon.getThanhToan() != null) existing.setThanhToan(hoaDon.getThanhToan());

        return hoaDonRepository.save(existing);
    }

    @Override
    public HoaDon updateTrangThai(Integer id, Integer trangThai) {
        HoaDon existing = getById(id);
        existing.setTrangThai(trangThai);
        return hoaDonRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        HoaDon existing = getById(id);
        hoaDonRepository.delete(existing);
    }
}
