package com.laptopstore.repository;

import com.laptopstore.entity.ThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThanhToanRepository extends JpaRepository<ThanhToan, Integer> {
    Optional<ThanhToan> findByMa(String ma);
}
