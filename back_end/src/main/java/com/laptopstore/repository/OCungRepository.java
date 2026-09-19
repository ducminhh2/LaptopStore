package com.laptopstore.repository;

import com.laptopstore.entity.OCung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OCungRepository extends JpaRepository<OCung, Integer> {
    List<OCung> findByDungLuong(String dungLuong);
}
