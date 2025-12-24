package com.techroom.room_service.service;

import com.techroom.room_service.dto.RoomRequest;
import com.techroom.room_service.dto.RoomResponse;
import com.techroom.room_service.entity.Room;
import com.techroom.room_service.entity.RoomStatus;
import com.techroom.room_service.repository.AmenityRepository;
import com.techroom.room_service.repository.BuildingRepository;
import com.techroom.room_service.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final BuildingRepository buildingRepository;
    private final AmenityRepository amenityRepository;

    // 1. Tìm kiếm và Lọc phòng (Đã có)
    public List<RoomResponse> searchRooms(Double min, Double max, Integer province) {
        return roomRepository.searchRooms(min, max, province).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // 2. Lấy chi tiết 1 phòng (Đã có)
    public RoomResponse getRoomById(Integer id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng có ID: " + id));
        return mapToResponse(room);
    }

    // 3. Chức năng Landlord tạo phòng mới (MỚI)
    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        Room room = new Room();
        // Tìm tòa nhà để gán cho phòng
        room.setBuilding(buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new RuntimeException("Tòa nhà không tồn tại")));

        return saveOrUpdateRoom(room, request);
    }

    // 4. Chức năng Landlord cập nhật phòng (MỚI)
    @Transactional
    public RoomResponse updateRoom(Integer id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng để cập nhật"));

        return saveOrUpdateRoom(room, request);
    }

    // 5. Chức năng Xóa phòng (MỚI)
    @Transactional
    public void deleteRoom(Integer id) {
        if (!roomRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy phòng để xóa");
        }
        roomRepository.deleteById(id);
    }

    // --- Hàm dùng chung để gán dữ liệu từ Request vào Entity ---
    private RoomResponse saveOrUpdateRoom(Room room, RoomRequest request) {
        room.setName(request.getName());
        room.setPrice(request.getPrice());
        room.setArea(request.getArea());
        room.setDescription(request.getDescription());
        room.setStatus(RoomStatus.valueOf(request.getStatus().toUpperCase()));

        // Xử lý gán tiện ích (Amenities)
        if (request.getAmenityIds() != null) {
            room.setAmenities(amenityRepository.findAllById(request.getAmenityIds()));
        }

        Room savedRoom = roomRepository.save(room);
        return mapToResponse(savedRoom);
    }

    // --- Hàm chuyển đổi sang DTO trả về cho UI ---
    private RoomResponse mapToResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .price(room.getPrice())
                .area(room.getArea())
                .status(room.getStatus().name())
                .buildingName(room.getBuilding() != null ? room.getBuilding().getName() : "N/A")
                .address(room.getBuilding() != null ? room.getBuilding().getAddress() : "N/A")
                // Xử lý tránh lỗi Null nếu phòng chưa có ảnh hoặc tiện ích
                .imageUrls(room.getImages() != null ?
                        room.getImages().stream().map(img -> img.getImageUrl()).toList() : List.of())
                .amenities(room.getAmenities() != null ?
                        room.getAmenities().stream().map(a -> a.getName()).toList() : List.of())
                .build();
    }
}