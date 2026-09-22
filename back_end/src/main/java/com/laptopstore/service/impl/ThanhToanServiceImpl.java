package com.laptopstore.service.impl;

import com.laptopstore.entity.ThanhToan;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ThanhToanRepository;
import com.laptopstore.service.ThanhToanService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ThanhToanServiceImpl implements ThanhToanService {

    private final ThanhToanRepository thanhToanRepository;

    public ThanhToanServiceImpl(ThanhToanRepository thanhToanRepository) {
        this.thanhToanRepository = thanhToanRepository;
    }

    @Override
    public List<ThanhToan> getAll() {
        return thanhToanRepository.findAll();
    }

    @Override
    public ThanhToan getById(Integer id) {
        return thanhToanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "id", id));
    }

    @Override
    public ThanhToan create(ThanhToan thanhToan) {
        return thanhToanRepository.save(thanhToan);
    }

    @Override
    public ThanhToan update(Integer id, ThanhToan thanhToan) {
        ThanhToan existing = getById(id);
        existing.setMa(thanhToan.getMa());
        existing.setPhuongThuc(thanhToan.getPhuongThuc());
        existing.setSoTien(thanhToan.getSoTien());
        existing.setNgayThanhToan(thanhToan.getNgayThanhToan());
        return thanhToanRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        ThanhToan existing = getById(id);
        thanhToanRepository.delete(existing);
    }
}
