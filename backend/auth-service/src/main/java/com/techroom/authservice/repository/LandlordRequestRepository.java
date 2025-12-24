package com.techroom.authservice.repository;

import com.techroom.authservice.model.LandlordRequest;
import com.techroom.authservice.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LandlordRequestRepository extends JpaRepository<LandlordRequest, Integer> {
    List<LandlordRequest> findByUserId(Integer userId);
    List<LandlordRequest> findByStatus(RequestStatus status);
}