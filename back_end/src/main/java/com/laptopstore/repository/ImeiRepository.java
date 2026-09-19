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
}
