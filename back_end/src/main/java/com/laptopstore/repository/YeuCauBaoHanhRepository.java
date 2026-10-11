package com.laptopstore.repository;

import com.laptopstore.entity.YeuCauBaoHanh;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface YeuCauBaoHanhRepository extends JpaRepository<YeuCauBaoHanh, Integer> {

    Optional<YeuCauBaoHanh> findByMaYeuCau(String maYeuCau);

    List<YeuCauBaoHanh> findByBaoHanhIdOrderByNgayYeuCauDescIdDesc(Integer idBaoHanh);

    List<YeuCauBaoHanh> findByKhachHangIdOrderByNgayYeuCauDescIdDesc(Integer idKhachHang);

    List<YeuCauBaoHanh> findByBaoHanhImeiSoImeiOrderByNgayYeuCauDescIdDesc(String soImei);

    List<YeuCauBaoHanh> findAllByOrderByNgayYeuCauDescIdDesc();

    long countByTrangThai(Integer trangThai);

    @Query("SELECT COUNT(y) FROM YeuCauBaoHanh y WHERE y.baoHanh.id = :idBaoHanh")
    int countByBaoHanhId(@Param("idBaoHanh") Integer idBaoHanh);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT y FROM YeuCauBaoHanh y WHERE y.id = :id")
    Optional<YeuCauBaoHanh> findByIdForUpdate(@Param("id") Integer id);

    @Query("SELECT COUNT(y) > 0 FROM YeuCauBaoHanh y WHERE y.baoHanh.id = :idBaoHanh AND y.trangThai IN (0, 1, 2)")
    boolean existsOpenRequestByBaoHanhId(@Param("idBaoHanh") Integer idBaoHanh);
}
