package com.laptopstore.service.impl;

import com.laptopstore.entity.VaiTro;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.VaiTroRepository;
import com.laptopstore.service.VaiTroService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VaiTroServiceImpl implements VaiTroService {

    private final VaiTroRepository vaiTroRepository;

    @Override
    public List<VaiTro> getAll() {
        return vaiTroRepository.findAll();
    }

    @Override
    public VaiTro getById(Integer id) {
        return vaiTroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vai trò", "id", id));
    }

    @Override
    public VaiTro create(VaiTro vaiTro) {
        return vaiTroRepository.save(vaiTro);
    }

    @Override
    public VaiTro update(Integer id, VaiTro vaiTro) {
        VaiTro existing = getById(id);
        existing.setTenVaiTro(vaiTro.getTenVaiTro());
        return vaiTroRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        VaiTro existing = getById(id);
        vaiTroRepository.delete(existing);
    }
}
