package com.techroom.room_service.repository;

import com.techroom.room_service.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Integer> {
    // Tìm tất cả tòa nhà của một chủ trọ
    List<Building> findByLandlordId(Integer landlordId);
}
