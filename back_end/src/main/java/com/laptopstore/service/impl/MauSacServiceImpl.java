package com.laptopstore.service.impl;

import com.laptopstore.entity.MauSac;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.MauSacRepository;
import com.laptopstore.service.MauSacService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MauSacServiceImpl implements MauSacService {

    private final MauSacRepository mauSacRepository;

    @Override
    public List<MauSac> getAll() {
        return mauSacRepository.findAll();
    }

    @Override
    public MauSac getById(Integer id) {
        return mauSacRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Màu sắc", "id", id));
    }

    @Override
    public MauSac create(MauSac mauSac) {
        return mauSacRepository.save(mauSac);
    }

    @Override
    public MauSac update(Integer id, MauSac mauSac) {
        MauSac existing = getById(id);
        existing.setTenMau(mauSac.getTenMau());
        return mauSacRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        MauSac existing = getById(id);
        mauSacRepository.delete(existing);
    }
}
