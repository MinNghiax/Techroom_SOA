package com.techroom.room_service.controller;

import com.techroom.room_service.dto.BuildingRequest;
import com.techroom.room_service.dto.BuildingResponse;
import com.techroom.room_service.service.BuildingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
public class BuildingController {
    private final BuildingService buildingService;

    // Lấy toàn bộ tòa nhà (Công khai cho trang Home)
    @GetMapping
    public ResponseEntity<List<BuildingResponse>> getAll() {
        return ResponseEntity.ok(buildingService.getAllBuildings());
    }

    @GetMapping("/landlord/{landlordId}")
    public ResponseEntity<List<BuildingResponse>> getByLandlord(@PathVariable Integer landlordId) {
        return ResponseEntity.ok(buildingService.getBuildingsByLandlord(landlordId));
    }

    @PostMapping
    public ResponseEntity<BuildingResponse> create(@RequestBody BuildingRequest request) {
        return ResponseEntity.ok(buildingService.saveOrUpdate(null, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BuildingResponse> update(@PathVariable Integer id, @RequestBody BuildingRequest request) {
        return ResponseEntity.ok(buildingService.saveOrUpdate(id, request));
    }
    // File: com.techroom.room_service.controller.BuildingController
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBuilding(@PathVariable Integer id) {
        buildingService.deleteBuilding(id);
        return ResponseEntity.noContent().build(); // Trả về 204 No Content nếu xóa thành công
    }
}