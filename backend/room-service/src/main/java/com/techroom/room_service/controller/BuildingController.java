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

    @GetMapping
    public ResponseEntity<List<BuildingResponse>> getAll() {
        return ResponseEntity.ok(buildingService.getAllBuildings());
    }

    // Lấy tòa nhà của chủ trọ đang đăng nhập dựa vào Header từ Gateway
    @GetMapping("/landlord/my")
    public ResponseEntity<List<BuildingResponse>> getMyBuildings(@RequestHeader("X-User-Id") Integer landlordId) {
        return ResponseEntity.ok(buildingService.getBuildingsByLandlord(landlordId));
    }

    @PostMapping
    public ResponseEntity<BuildingResponse> create(
            @RequestBody BuildingRequest request,
            @RequestHeader("X-User-Id") Integer landlordId) {
        return ResponseEntity.ok(buildingService.saveOrUpdate(null, request, landlordId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BuildingResponse> update(
            @PathVariable Integer id,
            @RequestBody BuildingRequest request,
            @RequestHeader("X-User-Id") Integer landlordId) {
        return ResponseEntity.ok(buildingService.saveOrUpdate(id, request, landlordId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBuilding(@PathVariable Integer id) {
        buildingService.deleteBuilding(id);
        return ResponseEntity.noContent().build();
    }
}