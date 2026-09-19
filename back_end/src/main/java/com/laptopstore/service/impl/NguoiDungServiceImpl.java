package com.laptopstore.service.impl;

import com.laptopstore.entity.NguoiDung;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.NguoiDungRepository;
import com.laptopstore.service.NguoiDungService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NguoiDungServiceImpl implements NguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;

    @Override
    public List<NguoiDung> getAll() {
        return nguoiDungRepository.findAll();
    }

    @Override
    public NguoiDung getById(Integer id) {
        return nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", id));
    }

    @Override
    public NguoiDung getByUsername(String username) {
        return nguoiDungRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "username", username));
    }

    @Override
    public List<NguoiDung> getByVaiTro(Integer vaiTroId) {
        return nguoiDungRepository.findByVaiTroId(vaiTroId);
    }

    @Override
    public NguoiDung create(NguoiDung nguoiDung) {
        return nguoiDungRepository.save(nguoiDung);
    }

    @Override
    public NguoiDung update(Integer id, NguoiDung nguoiDung) {
        NguoiDung existing = getById(id);
        existing.setTen(nguoiDung.getTen());
        existing.setPassword(nguoiDung.getPassword());
        existing.setDiaChi(nguoiDung.getDiaChi());
        existing.setDienThoai(nguoiDung.getDienThoai());
        existing.setEmail(nguoiDung.getEmail());
        if (nguoiDung.getVaiTro() != null) {
            existing.setVaiTro(nguoiDung.getVaiTro());
        }
        return nguoiDungRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        NguoiDung existing = getById(id);
        nguoiDungRepository.delete(existing);
    }
}
