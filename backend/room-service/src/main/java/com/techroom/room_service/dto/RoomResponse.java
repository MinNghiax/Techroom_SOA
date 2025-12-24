package com.techroom.room_service.dto;

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
    private String address;
    private String buildingName;
    private List<String> imageUrls;
    private List<String> amenities;
    private String description;
}