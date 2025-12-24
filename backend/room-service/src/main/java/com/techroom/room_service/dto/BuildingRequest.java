package com.techroom.room_service.dto;

import lombok.Data;

@Data
public class BuildingRequest {
    private Integer landlordId;
    private String name;
    private LocationId province; // Khớp với cấu hình {"code": 1} trong Postman của bạn
    private LocationId district;
    private String address;
    private String description;

    @Data
    public static class LocationId {
        private Integer code;
    }
}