package com.laptopstore.repository;

import com.laptopstore.entity.GioHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GioHangRepository extends JpaRepository<GioHang, Integer> {
    Optional<GioHang> findByKhachHangId(Integer khachHangId);
    Optional<GioHang> findByMa(String ma);
}
