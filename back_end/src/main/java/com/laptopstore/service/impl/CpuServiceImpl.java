package com.laptopstore.service.impl;

import com.laptopstore.entity.Cpu;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.CpuRepository;
import com.laptopstore.service.CpuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CpuServiceImpl implements CpuService {

    private final CpuRepository cpuRepository;

    @Override
    public List<Cpu> getAll() {
        return cpuRepository.findAll();
    }

    @Override
    public Cpu getById(Integer id) {
        return cpuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CPU", "id", id));
    }

    @Override
    public Cpu create(Cpu cpu) {
        return cpuRepository.save(cpu);
    }

    @Override
    public Cpu update(Integer id, Cpu cpu) {
        Cpu existing = getById(id);
        existing.setTenCpu(cpu.getTenCpu());
        return cpuRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        Cpu existing = getById(id);
        cpuRepository.delete(existing);
    }
}
