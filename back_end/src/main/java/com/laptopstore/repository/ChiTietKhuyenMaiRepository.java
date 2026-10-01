package com.laptopstore.repository;

import com.laptopstore.entity.ChiTietKhuyenMai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChiTietKhuyenMaiRepository extends JpaRepository<ChiTietKhuyenMai, Integer> {
    List<ChiTietKhuyenMai> findByKhuyenMaiId(Integer khuyenMaiId);
    List<ChiTietKhuyenMai> findByChiTietSanPhamId(Integer ctspId);
    long countByKhuyenMaiId(Integer khuyenMaiId);

    @Query("SELECT ctkm FROM ChiTietKhuyenMai ctkm " +
           "JOIN ctkm.khuyenMai km " +
           "WHERE ctkm.chiTietSanPham.id = :ctspId " +
           "AND km.trangThai = 1 " +
           "AND km.ngayBatDau <= :now " +
           "AND km.ngayKetThuc >= :now")
    List<ChiTietKhuyenMai> findActiveByChiTietSanPhamId(@Param("ctspId") Integer ctspId, @Param("now") LocalDateTime now);

    @Query("SELECT ctkm FROM ChiTietKhuyenMai ctkm " +
           "JOIN FETCH ctkm.khuyenMai km " +
           "JOIN FETCH ctkm.chiTietSanPham ctsp " +
           "LEFT JOIN FETCH ctsp.sanPham sp " +
           "WHERE ctkm.chiTietSanPham.id IN :ctspIds " +
           "  AND km.trangThai = 1 " +
           "  AND (:excludeKmId IS NULL OR km.id <> :excludeKmId) " +
           "  AND km.ngayBatDau <= :end " +
           "  AND km.ngayKetThuc >= :start")
    List<ChiTietKhuyenMai> findOverlappingActivePromotions(
            @Param("ctspIds") List<Integer> ctspIds,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("excludeKmId") Integer excludeKmId);
}
