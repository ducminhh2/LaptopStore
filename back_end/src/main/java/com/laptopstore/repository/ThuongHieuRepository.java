package com.laptopstore.repository;

import com.laptopstore.entity.ThuongHieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThuongHieuRepository extends JpaRepository<ThuongHieu, Integer> {
    Optional<ThuongHieu> findByTenThuongHieu(String tenThuongHieu);
}
