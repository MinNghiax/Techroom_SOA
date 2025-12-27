package com.techroom.room_service.service;

import com.techroom.room_service.dto.BuildingRequest;
import com.techroom.room_service.dto.BuildingResponse;
import com.techroom.room_service.entity.Building;
import com.techroom.room_service.repository.*;
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

    public List<BuildingResponse> getBuildingsByLandlord(Integer landlordId) {
        return buildingRepository.findByLandlordId(landlordId).stream()
                .map(this::mapToResponse).toList();
    }

    public List<BuildingResponse> getAllBuildings() {
        return buildingRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public BuildingResponse saveOrUpdate(Integer id, BuildingRequest request, Integer authenticatedLandlordId) {
        Building building = (id == null) ? new Building() : buildingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tòa nhà"));

        // Luôn gán landlordId từ Header để tránh lưu nhầm cho người khác
        building.setLandlordId(authenticatedLandlordId);
        building.setName(request.getName());
        building.setAddress(request.getAddress());
        building.setDescription(request.getDescription());

        building.setProvince(provinceRepository.findById(request.getProvince().getCode())
                .orElseThrow(() -> new RuntimeException("Tỉnh không hợp lệ")));
        building.setDistrict(districtRepository.findById(request.getDistrict().getCode())
                .orElseThrow(() -> new RuntimeException("Huyện không hợp lệ")));

        return mapToResponse(buildingRepository.save(building));
    }

    @Transactional
    public void deleteBuilding(Integer id) {
        if (!buildingRepository.existsById(id)) {
            throw new RuntimeException("Tòa nhà không tồn tại!");
        }
        buildingRepository.deleteById(id);
    }

    private BuildingResponse mapToResponse(Building building) {
        return BuildingResponse.builder()
                .id(building.getId())
                .name(building.getName())
                .address(building.getAddress())
                .description(building.getDescription())
                .provinceCode(building.getProvince().getCode())
                .provinceName(building.getProvince().getName())
                .districtCode(building.getDistrict().getCode())
                .districtName(building.getDistrict().getName())
                .build();
    }
}