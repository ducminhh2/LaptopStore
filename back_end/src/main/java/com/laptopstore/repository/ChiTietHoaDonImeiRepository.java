package com.laptopstore.repository;

import com.laptopstore.entity.ChiTietHoaDonImei;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChiTietHoaDonImeiRepository extends JpaRepository<ChiTietHoaDonImei, Integer> {
    List<ChiTietHoaDonImei> findByChiTietHoaDonId(Integer chiTietHoaDonId);
    List<ChiTietHoaDonImei> findByChiTietHoaDonHoaDonId(Integer hoaDonId);
    Optional<ChiTietHoaDonImei> findByImeiId(Integer imeiId);
}
