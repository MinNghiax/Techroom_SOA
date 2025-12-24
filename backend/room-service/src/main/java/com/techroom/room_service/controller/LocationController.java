package com.techroom.room_service.controller;

import com.techroom.room_service.entity.District;
import com.techroom.room_service.entity.Province;
import com.techroom.room_service.repository.DistrictRepository;
import com.techroom.room_service.repository.ProvinceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {
    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;

    @GetMapping("/provinces")
    public ResponseEntity<List<Province>> getProvinces() {
        return ResponseEntity.ok(provinceRepository.findAll());
    }

    @GetMapping("/districts/{provinceCode}")
    public ResponseEntity<List<District>> getDistricts(@PathVariable Integer provinceCode) {
        return ResponseEntity.ok(districtRepository.findByProvinceCode(provinceCode));
    }
}