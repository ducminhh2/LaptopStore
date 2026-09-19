package com.laptopstore.service.impl;

import com.laptopstore.entity.Ram;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.RamRepository;
import com.laptopstore.service.RamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RamServiceImpl implements RamService {

    private final RamRepository ramRepository;

    @Override
    public List<Ram> getAll() {
        return ramRepository.findAll();
    }

    @Override
    public Ram getById(Integer id) {
        return ramRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RAM", "id", id));
    }

    @Override
    public Ram create(Ram ram) {
        return ramRepository.save(ram);
    }

    @Override
    public Ram update(Integer id, Ram ram) {
        Ram existing = getById(id);
        existing.setDungLuong(ram.getDungLuong());
        existing.setLoaiRam(ram.getLoaiRam());
        return ramRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        Ram existing = getById(id);
        ramRepository.delete(existing);
    }
}
