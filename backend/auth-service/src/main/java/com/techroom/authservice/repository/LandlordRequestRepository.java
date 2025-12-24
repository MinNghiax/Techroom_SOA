package com.techroom.authservice.repository;

import com.techroom.authservice.model.LandlordRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LandlordRequestRepository extends JpaRepository<LandlordRequest, Integer> {
    // Tìm các yêu cầu theo trạng thái (ví dụ: lấy danh sách PENDING để duyệt)
    List<LandlordRequest> findByStatus(LandlordRequest.RequestStatus status);

    // Tìm yêu cầu của 1 user cụ thể
    List<LandlordRequest> findByUserId(Integer userId);
}