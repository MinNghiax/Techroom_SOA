package com.techroom.room_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BuildingResponse {
    private Integer id;
    private String name;
    private String address;
    private String provinceName;
    private String districtName;
    private String description;
}