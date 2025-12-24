package com.techroom.room_service.controller;

import com.techroom.room_service.dto.BuildingRequest;
import com.techroom.room_service.dto.BuildingResponse;
import com.techroom.room_service.service.BuildingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
public class BuildingController {
    private final BuildingService buildingService;

    @GetMapping
    public ResponseEntity<List<BuildingResponse>> getBuildings() {
        return ResponseEntity.ok(buildingService.getAllBuildings());
    }

    @PostMapping
    public ResponseEntity<BuildingResponse> createBuilding(@RequestBody BuildingRequest request) {
        return new ResponseEntity<>(buildingService.createBuilding(request), HttpStatus.CREATED);
    }
}