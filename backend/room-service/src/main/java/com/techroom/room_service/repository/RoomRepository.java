package com.techroom.room_service.repository;

import com.techroom.room_service.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {

    @Query("SELECT r FROM Room r WHERE r.status = 'AVAILABLE' " +
            "AND (:minPrice IS NULL OR r.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR r.price <= :maxPrice) " +
            "AND (:provinceCode IS NULL OR r.building.province.code = :provinceCode)")
    List<Room> searchRooms(Double minPrice, Double maxPrice, Integer provinceCode);
}