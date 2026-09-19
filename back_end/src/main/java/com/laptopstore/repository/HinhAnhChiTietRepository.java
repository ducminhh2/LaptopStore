package com.laptopstore.repository;

import com.laptopstore.entity.HinhAnhChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HinhAnhChiTietRepository extends JpaRepository<HinhAnhChiTiet, Integer> {
    List<HinhAnhChiTiet> findByChiTietSanPhamId(Integer chiTietSanPhamId);
}
