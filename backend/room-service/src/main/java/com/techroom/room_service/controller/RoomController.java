package com.techroom.room_service.controller;

import com.techroom.room_service.dto.RoomRequest;
import com.techroom.room_service.dto.RoomResponse;
import com.techroom.room_service.entity.Amenity;
import com.techroom.room_service.repository.AmenityRepository;
import com.techroom.room_service.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final AmenityRepository amenityRepository; // Inject trực tiếp để lấy danh sách nhanh

    // --- CÁC PHƯƠNG THỨC CŨ (GIỮ NGUYÊN) ---
    @GetMapping
    public ResponseEntity<List<RoomResponse>> getRooms(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer provinceCode) {
        return ResponseEntity.ok(roomService.searchRooms(minPrice, maxPrice, provinceCode));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    /**
     * API chỉ cho phép chủ trọ (LANDLORD) truy cập để xem phòng của mình.
     * Nếu không phải landlord sẽ trả về 403 Forbidden.
     */
    @GetMapping("/landlord")
    public ResponseEntity<List<RoomResponse>> getRoomsByLandlord(
            @RequestHeader("X-User-Id") Integer landlordId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role == null || !"LANDLORD".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(roomService.getRoomsByLandlord(landlordId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomResponse> createRoom(
            @RequestPart("room") RoomRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> files) {
        return new ResponseEntity<>(roomService.createRoom(request, files), HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable Integer id,
            @RequestPart("room") RoomRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> files) {
        return ResponseEntity.ok(roomService.updateRoom(id, request, files));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Integer id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    // --- CÁC PHƯƠNG THỨC MỚI CHO AMENITIES ---

    @GetMapping("/amenities")
    public ResponseEntity<List<Amenity>> getAllAmenities() {
        return ResponseEntity.ok(amenityRepository.findAll());
    }

    @PostMapping("/amenities")
    public ResponseEntity<Amenity> createAmenity(@RequestBody Amenity amenity) {
        return ResponseEntity.ok(amenityRepository.save(amenity));
    }
}