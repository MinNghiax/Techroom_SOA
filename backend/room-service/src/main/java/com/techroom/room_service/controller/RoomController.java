package com.techroom.room_service.controller;

import com.techroom.room_service.dto.RoomRequest;
import com.techroom.room_service.dto.RoomResponse;
import com.techroom.room_service.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    /**
     * 1. API Tìm kiếm và Lọc phòng
     * GET /api/rooms?minPrice=1000000&maxPrice=5000000&provinceCode=1
     */
    @GetMapping
    public ResponseEntity<List<RoomResponse>> getRooms(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer provinceCode) {
        return ResponseEntity.ok(roomService.searchRooms(minPrice, maxPrice, provinceCode));
    }

    /**
     * 2. API Lấy chi tiết một phòng
     * GET /api/rooms/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    // Thêm endpoint này vào RoomController
    @GetMapping("/landlord")
    public ResponseEntity<List<RoomResponse>> getRoomsByLandlord() {
        // Trong thực tế, bạn sẽ lấy username từ SecurityContextHolder
        // Ở đây tôi giả định Service sẽ xử lý việc lấy user hiện tại
        return ResponseEntity.ok(roomService.getRoomsByLandlord());
    }

    /**
     * 3. API Tạo phòng mới (Cho Landlord)
     * POST /api/rooms
     */
    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@RequestBody RoomRequest request) {
        RoomResponse createdRoom = roomService.createRoom(request);
        return new ResponseEntity<>(createdRoom, HttpStatus.CREATED);
    }

    /**
     * 4. API Cập nhật thông tin phòng
     * PUT /api/rooms/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable Integer id,
            @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }

    /**
     * 5. API Xóa phòng
     * DELETE /api/rooms/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Integer id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}