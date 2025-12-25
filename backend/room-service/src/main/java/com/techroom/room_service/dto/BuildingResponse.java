package com.techroom.room_service.dto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BuildingResponse {
    private Integer id;
    private String name;
    private String address;
    private String description;
    private Integer provinceCode;
    private String provinceName;
    private Integer districtCode;
    private String districtName;
}