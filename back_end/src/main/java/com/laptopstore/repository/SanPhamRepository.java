package com.laptopstore.repository;

import com.laptopstore.entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamRepository extends JpaRepository<SanPham, Integer> {
    Optional<SanPham> findByMaSp(String maSp);
    List<SanPham> findByDanhMucId(Integer danhMucId);
    List<SanPham> findByThuongHieuId(Integer thuongHieuId);
    List<SanPham> findByTenSpContainingIgnoreCase(String keyword);
    boolean existsByMaSp(String maSp);
}
