package com.laptopstore.repository;

import com.laptopstore.entity.ChiTietKhuyenMai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietKhuyenMaiRepository extends JpaRepository<ChiTietKhuyenMai, Integer> {
    List<ChiTietKhuyenMai> findByKhuyenMaiId(Integer khuyenMaiId);
    List<ChiTietKhuyenMai> findBySanPhamId(Integer sanPhamId);
}
