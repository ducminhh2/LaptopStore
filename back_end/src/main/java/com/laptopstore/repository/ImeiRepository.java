package com.laptopstore.repository;

import com.laptopstore.entity.Imei;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImeiRepository extends JpaRepository<Imei, Integer> {
    Optional<Imei> findBySoImei(String soImei);
    List<Imei> findByChiTietSanPhamId(Integer chiTietSanPhamId);
    List<Imei> findByChiTietSanPhamIdAndTrangThai(Integer chiTietSanPhamId, Integer trangThai);
    List<Imei> findByTrangThai(Integer trangThai);
    boolean existsBySoImei(String soImei);
    List<Imei> findBySoImeiIn(List<String> soImeis);
    int countByChiTietSanPhamId(Integer chiTietSanPhamId);
    int countByChiTietSanPhamIdAndTrangThai(Integer chiTietSanPhamId, Integer trangThai);

    @org.springframework.data.jpa.repository.Query(
        "SELECT i FROM Imei i WHERE i.chiTietSanPham.id = :ctspId AND i.trangThai = 0 " +
        "AND NOT EXISTS (SELECT 1 FROM ChiTietHoaDonImei cthdi WHERE cthdi.imei.id = i.id)"
    )
    List<Imei> findAvailableByChiTietSanPhamId(@org.springframework.data.repository.query.Param("ctspId") Integer ctspId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(i) FROM Imei i WHERE i.chiTietSanPham.id = :ctspId AND i.trangThai = 0 " +
        "AND NOT EXISTS (SELECT 1 FROM ChiTietHoaDonImei cthdi WHERE cthdi.imei.id = i.id)"
    )
    int countAvailableByChiTietSanPhamId(@org.springframework.data.repository.query.Param("ctspId") Integer ctspId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT i.chiTietSanPham.id, COUNT(i) FROM Imei i WHERE i.trangThai = 0 " +
        "AND NOT EXISTS (SELECT 1 FROM ChiTietHoaDonImei cthdi WHERE cthdi.imei.id = i.id) " +
        "GROUP BY i.chiTietSanPham.id"
    )
    List<Object[]> countAvailableImeisGroupedByCtsp();

    @org.springframework.data.jpa.repository.Query(
        "SELECT i.chiTietSanPham.id, COUNT(i) FROM Imei i GROUP BY i.chiTietSanPham.id"
    )
    List<Object[]> countTotalImeisGroupedByCtsp();
}

