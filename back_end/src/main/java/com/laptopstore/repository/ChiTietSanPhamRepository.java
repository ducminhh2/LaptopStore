package com.laptopstore.repository;

import com.laptopstore.entity.ChiTietSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChiTietSanPhamRepository extends JpaRepository<ChiTietSanPham, Integer> {
    Optional<ChiTietSanPham> findByMaCtsp(String maCtsp);
    List<ChiTietSanPham> findBySanPhamId(Integer sanPhamId);
    List<ChiTietSanPham> findByTrangThai(Integer trangThai);
    boolean existsByMaCtsp(String maCtsp);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE ChiTietSanPham c SET c.soLuong = :soLuong WHERE c.id = :id")
    void updateSoLuong(@org.springframework.data.repository.query.Param("id") Integer id, @org.springframework.data.repository.query.Param("soLuong") Integer soLuong);
}
