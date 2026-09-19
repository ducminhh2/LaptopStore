package com.laptopstore.repository;

import com.laptopstore.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Integer> {
    Optional<NguoiDung> findByUsername(String username);
    Optional<NguoiDung> findByEmail(String email);
    Optional<NguoiDung> findByMa(String ma);
    List<NguoiDung> findByVaiTroId(Integer vaiTroId);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByMa(String ma);
}
