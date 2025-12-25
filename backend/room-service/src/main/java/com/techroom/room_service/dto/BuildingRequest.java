package com.techroom.room_service.dto;
import lombok.Data;

@Data
public class BuildingRequest {
    private Integer landlordId;
    private String name;
    private String address;
    private String description;
    private LocationRef province;
    private LocationRef district;

    @Data
    public static class LocationRef {
        private Integer code;
    }
}