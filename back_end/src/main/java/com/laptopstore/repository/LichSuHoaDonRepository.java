package com.laptopstore.repository;

import com.laptopstore.entity.LichSuHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichSuHoaDonRepository extends JpaRepository<LichSuHoaDon, Integer> {

    @Query("SELECT l FROM LichSuHoaDon l LEFT JOIN FETCH l.nhanVien WHERE l.hoaDon.id = :hoaDonId ORDER BY l.thoiGian ASC, l.id ASC")
    List<LichSuHoaDon> findByHoaDonIdOrderByThoiGianAsc(@Param("hoaDonId") Integer hoaDonId);

    List<LichSuHoaDon> findByHoaDonId(Integer hoaDonId);
}
