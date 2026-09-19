package com.laptopstore.repository;

import com.laptopstore.entity.Cpu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CpuRepository extends JpaRepository<Cpu, Integer> {
    Optional<Cpu> findByTenCpu(String tenCpu);
}
