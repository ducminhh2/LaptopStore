package com.laptopstore.repository;

import com.laptopstore.entity.ManHinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ManHinhRepository extends JpaRepository<ManHinh, Integer> {
    List<ManHinh> findByKichThuoc(String kichThuoc);
}
