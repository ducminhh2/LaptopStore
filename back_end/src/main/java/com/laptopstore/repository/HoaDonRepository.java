package com.laptopstore.repository;

import com.laptopstore.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Integer> {
    Optional<HoaDon> findByMa(String ma);
    List<HoaDon> findByKhachHangId(Integer khachHangId);
    List<HoaDon> findByKhachHangIdOrderByNgayTaoDesc(Integer khachHangId);
    List<HoaDon> findByNhanVienId(Integer nhanVienId);
    List<HoaDon> findByTrangThai(Integer trangThai);

    @Query("SELECT DISTINCT h FROM HoaDon h " +
           "LEFT JOIN FETCH h.thanhToan " +
           "LEFT JOIN FETCH h.voucher " +
           "WHERE h.khachHang.id = :khachHangId " +
           "ORDER BY h.ngayTao DESC")
    List<HoaDon> findLichSuByKhachHangId(@Param("khachHangId") Integer khachHangId);
}
