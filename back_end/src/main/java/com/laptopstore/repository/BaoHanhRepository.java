package com.laptopstore.repository;

import com.laptopstore.entity.BaoHanh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BaoHanhRepository extends JpaRepository<BaoHanh, Integer> {
    Optional<BaoHanh> findByMaPhieu(String maPhieu);
    Optional<BaoHanh> findByImeiId(Integer imeiId);
    Optional<BaoHanh> findByImeiSoImei(String soImei);
}
