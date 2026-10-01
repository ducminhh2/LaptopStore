package com.laptopstore.repository;

import com.laptopstore.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Integer> {

    Optional<Voucher> findByMaIgnoreCase(String ma);

    boolean existsByMaIgnoreCase(String ma);

    boolean existsByMaIgnoreCaseAndIdNot(String ma, Integer id);

    List<Voucher> findAllByOrderByIdDesc();

    @Query("SELECT v FROM Voucher v WHERE " +
           "(:keyword IS NULL OR LOWER(v.ma) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(v.tenVoucher) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY v.id DESC")
    List<Voucher> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT v FROM Voucher v WHERE v.trangThai = 1 " +
           "AND v.ngayBatDau <= :now AND v.ngayKetThuc >= :now " +
           "ORDER BY v.id DESC")
    List<Voucher> findActiveVouchersAtDate(@Param("now") java.time.LocalDateTime now);
}
