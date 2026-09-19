package com.laptopstore.service;

import com.laptopstore.entity.Cpu;
import java.util.List;

public interface CpuService {
    List<Cpu> getAll();
    Cpu getById(Integer id);
    Cpu create(Cpu cpu);
    Cpu update(Integer id, Cpu cpu);
    void delete(Integer id);
}
