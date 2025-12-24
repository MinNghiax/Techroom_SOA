package com.techroom.room_service.repository;

import com.techroom.room_service.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DistrictRepository extends JpaRepository<District, Integer> {
    // Tìm quận/huyện theo mã tỉnh
    List<District> findByProvinceCode(Integer provinceCode);
}