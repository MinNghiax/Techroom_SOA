package com.techroom.room_service.dto;

import lombok.Data;
import java.util.List;

@Data
public class RoomRequest {
    private Integer buildingId;
    private String name;
    private Double price;
    private Double area;
    private String status; // AVAILABLE, OCCUPIED, REPAIRING
    private String description;
    private List<Integer> amenityIds; // Danh sách ID tiện ích (Wifi, Máy lạnh...)
}