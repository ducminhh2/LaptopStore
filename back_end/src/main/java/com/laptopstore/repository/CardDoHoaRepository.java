package com.laptopstore.repository;

import com.laptopstore.entity.CardDoHoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CardDoHoaRepository extends JpaRepository<CardDoHoa, Integer> {
    Optional<CardDoHoa> findByTenCard(String tenCard);
}
