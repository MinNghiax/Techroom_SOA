package com.techroom.room_service.dto;

import com.techroom.room_service.entity.Amenity; // Đảm bảo import Entity Amenity
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class RoomResponse {
    private Integer id;
    private String name;
    private Double price;
    private Double area;
    private String status;
    private String tenantName;
    private String address;
    private Integer buildingId;
    private String buildingName;
    private List<String> imageUrls;
    private List<Amenity> amenities; // SỬA: Thay List<String> thành List<Amenity>
    private String description;
    // THÊM TRƯỜNG NÀY
    private Integer landlordId;
}