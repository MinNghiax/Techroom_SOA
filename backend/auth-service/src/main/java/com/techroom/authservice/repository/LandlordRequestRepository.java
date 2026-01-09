package com.techroom.authservice.repository;

import com.techroom.authservice.model.LandlordRequest;
import com.techroom.authservice.model.RequestStatus;
import com.techroom.authservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LandlordRequestRepository extends JpaRepository<LandlordRequest, Integer> {

    /**
     * Tìm request của user theo status
     */
    Optional<LandlordRequest> findByUserAndStatus(User user, RequestStatus status);

    /**
     * Kiểm tra xem user đã có request PENDING chưa
     */
    boolean existsByUserAndStatus(User user, RequestStatus status);
}