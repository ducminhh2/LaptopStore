package com.laptopstore.service.impl;

import com.laptopstore.entity.OCung;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.OCungRepository;
import com.laptopstore.service.OCungService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OCungServiceImpl implements OCungService {

    private final OCungRepository oCungRepository;

    public OCungServiceImpl(OCungRepository oCungRepository) {
        this.oCungRepository = oCungRepository;
    }

    @Override
    public List<OCung> getAll() {
        return oCungRepository.findAll();
    }

    @Override
    public OCung getById(Integer id) {
        return oCungRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ổ cứng", "id", id));
    }

    @Override
    public OCung create(OCung oCung) {
        return oCungRepository.save(oCung);
    }

    @Override
    public OCung update(Integer id, OCung oCung) {
        OCung existing = getById(id);
        existing.setLoaiOCung(oCung.getLoaiOCung());
        existing.setDungLuong(oCung.getDungLuong());
        return oCungRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        OCung existing = getById(id);
        oCungRepository.delete(existing);
    }
}
