package com.laptopstore.repository;

import com.laptopstore.entity.ChiTietGioHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChiTietGioHangRepository extends JpaRepository<ChiTietGioHang, Integer> {
    List<ChiTietGioHang> findByGioHangId(Integer gioHangId);
    Optional<ChiTietGioHang> findByGioHangIdAndChiTietSanPhamId(Integer gioHangId, Integer chiTietSanPhamId);
    void deleteByGioHangId(Integer gioHangId);
}
