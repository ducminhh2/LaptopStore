package com.laptopstore.repository;

import com.laptopstore.entity.BaoHanh;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaoHanhRepository extends JpaRepository<BaoHanh, Integer> {

    Optional<BaoHanh> findByMaPhieu(String maPhieu);

    Optional<BaoHanh> findByImeiId(Integer imeiId);

    Optional<BaoHanh> findByImeiSoImei(String soImei);

    List<BaoHanh> findAllByOrderByNgayKichHoatDescIdDesc();

    long countByTrangThai(Integer trangThai);

    @Query("SELECT bh FROM BaoHanh bh " +
           "WHERE bh.imei.id IN (" +
           "  SELECT cthdi.imei.id FROM ChiTietHoaDonImei cthdi " +
           "  WHERE cthdi.chiTietHoaDon.hoaDon.khachHang.id = :khachHangId " +
           "  AND cthdi.chiTietHoaDon.hoaDon.trangThai = 3 " +
           "  AND cthdi.chiTietHoaDon.hoaDon.thanhToan.trangThai = 1" +
           ") ORDER BY bh.ngayKichHoat DESC, bh.id DESC")
    List<BaoHanh> findWarrantiesByKhachHangId(@Param("khachHangId") Integer khachHangId);

    @Query("SELECT COUNT(bh) > 0 FROM BaoHanh bh " +
           "WHERE bh.id = :baoHanhId AND bh.imei.id IN (" +
           "  SELECT cthdi.imei.id FROM ChiTietHoaDonImei cthdi " +
           "  WHERE cthdi.chiTietHoaDon.hoaDon.khachHang.id = :khachHangId " +
           "  AND cthdi.chiTietHoaDon.hoaDon.trangThai = 3 " +
           "  AND cthdi.chiTietHoaDon.hoaDon.thanhToan.trangThai = 1" +
           ")")
    boolean isWarrantyOwnedByCustomer(@Param("baoHanhId") Integer baoHanhId, @Param("khachHangId") Integer khachHangId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT bh FROM BaoHanh bh WHERE bh.id = :id")
    Optional<BaoHanh> findByIdForUpdate(@Param("id") Integer id);
}
