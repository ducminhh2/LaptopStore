package com.laptopstore.repository;

import com.laptopstore.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Integer> {
    Optional<HoaDon> findByMa(String ma);
    List<HoaDon> findByKhachHangId(Integer khachHangId);
    List<HoaDon> findByNhanVienId(Integer nhanVienId);
    List<HoaDon> findByTrangThai(Integer trangThai);
}
