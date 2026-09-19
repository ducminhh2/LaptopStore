package com.laptopstore.repository;

import com.laptopstore.entity.ChiTietSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChiTietSanPhamRepository extends JpaRepository<ChiTietSanPham, Integer> {
    Optional<ChiTietSanPham> findByMaCtsp(String maCtsp);
    List<ChiTietSanPham> findBySanPhamId(Integer sanPhamId);
    List<ChiTietSanPham> findByTrangThai(Integer trangThai);
    boolean existsByMaCtsp(String maCtsp);
}
