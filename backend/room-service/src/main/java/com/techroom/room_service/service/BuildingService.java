package com.techroom.room_service.service;

import com.techroom.room_service.dto.BuildingRequest;
import com.techroom.room_service.dto.BuildingResponse;
import com.techroom.room_service.entity.Building;
import com.techroom.room_service.repository.BuildingRepository;
import com.techroom.room_service.repository.DistrictRepository;
import com.techroom.room_service.repository.ProvinceRepository;
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
        return buildingRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public BuildingResponse saveOrUpdate(Integer id, BuildingRequest request) {
        Building building = (id == null) ? new Building() : buildingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tòa nhà"));

        building.setLandlordId(request.getLandlordId());
        building.setName(request.getName());
        building.setAddress(request.getAddress());
        building.setDescription(request.getDescription());

        building.setProvince(provinceRepository.findById(request.getProvince().getCode())
                .orElseThrow(() -> new RuntimeException("Tỉnh không hợp lệ")));
        building.setDistrict(districtRepository.findById(request.getDistrict().getCode())
                .orElseThrow(() -> new RuntimeException("Huyện không hợp lệ")));

        return mapToResponse(buildingRepository.save(building));
    }

    // File: com.techroom.room_service.service.BuildingService
    @Transactional
    public void deleteBuilding(Integer id) {
        // Kiểm tra tòa nhà có tồn tại không trước khi xóa
        if (!buildingRepository.existsById(id)) {
            throw new RuntimeException("Tòa nhà không tồn tại!");
        }
        buildingRepository.deleteById(id);
        // Lưu ý: Nhờ cấu hình ON DELETE CASCADE trong DB, các phòng liên quan sẽ tự động bị xóa.
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