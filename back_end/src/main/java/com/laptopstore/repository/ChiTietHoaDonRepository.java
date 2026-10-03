package com.laptopstore.repository;

import com.laptopstore.entity.ChiTietHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietHoaDonRepository extends JpaRepository<ChiTietHoaDon, Integer> {
    List<ChiTietHoaDon> findByHoaDonId(Integer hoaDonId);
    List<ChiTietHoaDon> findByChiTietSanPhamId(Integer chiTietSanPhamId);

    @Query("SELECT c FROM ChiTietHoaDon c " +
           "JOIN FETCH c.chiTietSanPham ct " +
           "JOIN FETCH ct.sanPham sp " +
           "LEFT JOIN FETCH ct.mauSac " +
           "LEFT JOIN FETCH ct.cpu " +
           "LEFT JOIN FETCH ct.ram " +
           "LEFT JOIN FETCH ct.oCung " +
           "LEFT JOIN FETCH ct.cardDoHoa " +
           "LEFT JOIN FETCH ct.manHinh " +
           "WHERE c.hoaDon.id IN :hoaDonIds")
    List<ChiTietHoaDon> findByHoaDonIdIn(@Param("hoaDonIds") List<Integer> hoaDonIds);

    @Query("SELECT c FROM ChiTietHoaDon c " +
           "JOIN FETCH c.chiTietSanPham ct " +
           "JOIN FETCH ct.sanPham sp " +
           "LEFT JOIN FETCH ct.mauSac " +
           "LEFT JOIN FETCH ct.cpu " +
           "LEFT JOIN FETCH ct.ram " +
           "LEFT JOIN FETCH ct.oCung " +
           "LEFT JOIN FETCH ct.cardDoHoa " +
           "LEFT JOIN FETCH ct.manHinh " +
           "WHERE c.hoaDon.id = :hoaDonId")
    List<ChiTietHoaDon> findChiTietByHoaDonId(@Param("hoaDonId") Integer hoaDonId);
}
