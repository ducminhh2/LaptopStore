package com.laptopstore.repository;

import com.laptopstore.entity.ChiTietHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietHoaDonRepository extends JpaRepository<ChiTietHoaDon, Integer> {
    List<ChiTietHoaDon> findByHoaDonId(Integer hoaDonId);
    List<ChiTietHoaDon> findByChiTietSanPhamId(Integer chiTietSanPhamId);
}
