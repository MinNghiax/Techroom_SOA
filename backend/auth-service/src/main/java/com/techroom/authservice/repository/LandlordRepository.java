package com.techroom.authservice.repository;

import com.techroom.authservice.model.Landlord;
import com.techroom.authservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LandlordRepository extends JpaRepository<Landlord, Integer> {
    // Tìm kiếm xem user này đã là landlord chưa
    Optional<Landlord> findByUser(User user);
}