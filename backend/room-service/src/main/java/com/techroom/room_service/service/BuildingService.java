package com.techroom.room_service.service;

import com.techroom.room_service.dto.BuildingRequest;
import com.techroom.room_service.dto.BuildingResponse;
import com.techroom.room_service.entity.Building;
import com.techroom.room_service.repository.BuildingRepository;
import com.techroom.room_service.repository.ProvinceRepository;
import com.techroom.room_service.repository.DistrictRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BuildingService {
    private final BuildingRepository buildingRepository;
    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;

    public List<BuildingResponse> getAllBuildings() {
        return buildingRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public BuildingResponse createBuilding(BuildingRequest request) {
        Building building = new Building();
        building.setLandlordId(request.getLandlordId());
        building.setName(request.getName());
        building.setAddress(request.getAddress());
        building.setDescription(request.getDescription());

        // Lấy thông tin tỉnh/huyện từ DB gắn vào tòa nhà
        building.setProvince(provinceRepository.findById(request.getProvince().getCode())
                .orElseThrow(() -> new RuntimeException("Tỉnh không tồn tại")));
        building.setDistrict(districtRepository.findById(request.getDistrict().getCode())
                .orElseThrow(() -> new RuntimeException("Huyện không tồn tại")));

        Building saved = buildingRepository.save(building);
        return mapToResponse(saved);
    }

    private BuildingResponse mapToResponse(Building building) {
        return BuildingResponse.builder()
                .id(building.getId())
                .name(building.getName())
                .address(building.getAddress())
                .provinceName(building.getProvince().getName())
                .districtName(building.getDistrict().getName())
                .description(building.getDescription())
                .build();
    }
}