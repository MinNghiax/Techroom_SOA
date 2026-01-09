package com.techroom.room_service.service;

import com.techroom.room_service.dto.RoomRequest;
import com.techroom.room_service.dto.RoomResponse;
import com.techroom.room_service.entity.*;
import com.techroom.room_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final BuildingRepository buildingRepository;
    private final AmenityRepository amenityRepository;
    private final RoomImageRepository roomImageRepository;

    private final String UPLOAD_DIR = "uploads/rooms/";

    public List<RoomResponse> searchRooms(Double min, Double max, Integer province) {
        return roomRepository.searchRooms(min, max, province).stream().map(this::mapToResponse).toList();
    }

    public RoomResponse getRoomById(Integer id) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));
        return mapToResponse(room);
    }

    public List<RoomResponse> getRoomsByLandlord(Integer landlordId) {
        return roomRepository.findByBuilding_LandlordId(landlordId).stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest request, List<MultipartFile> files) {
        Room room = new Room();
        return processRoomSave(room, request, files);
    }

    @Transactional
    public RoomResponse updateRoom(Integer id, RoomRequest request, List<MultipartFile> files) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng để cập nhật"));
        return processRoomSave(room, request, files);
    }

    private RoomResponse processRoomSave(Room room, RoomRequest request, List<MultipartFile> files) {
        room.setBuilding(buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new RuntimeException("Tòa nhà không tồn tại")));
        RoomStatus newStatus = RoomStatus.valueOf(request.getStatus().toUpperCase());
        if (room.getId() != null) {
            if (room.getStatus() == RoomStatus.OCCUPIED && newStatus == RoomStatus.AVAILABLE) {
                throw new RuntimeException("Phòng đang có người ở, không thể chuyển trực tiếp về trạng thái trống. Vui lòng chuyển sang Đang sửa chữa!");
            }
        }
        room.setName(request.getName());
        room.setPrice(request.getPrice());
        room.setArea(request.getArea());
        room.setDescription(request.getDescription());
        room.setStatus(newStatus);

        // Lưu danh sách tiện ích từ mảng ID gửi lên
        if (request.getAmenityIds() != null) {
            room.setAmenities(amenityRepository.findAllById(request.getAmenityIds()));
        } else {
            room.getAmenities().clear(); // Nếu gửi null thì xóa trắng tiện ích
        }

        Room savedRoom = roomRepository.save(room);

        if (files != null && !files.isEmpty()) {
            saveRoomImages(savedRoom, files);
        }

        return mapToResponse(savedRoom);
    }

    private void saveRoomImages(Room room, List<MultipartFile> files) {
        files.forEach(file -> {
            try {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path path = Paths.get(UPLOAD_DIR + fileName);
                Files.createDirectories(path.getParent());
                Files.write(path, file.getBytes());

                RoomImage img = new RoomImage();
                img.setImageUrl("/api/rooms/images/" + fileName);
                img.setRoom(room);
                roomImageRepository.save(img);
            } catch (IOException e) {
                throw new RuntimeException("Lỗi lưu file ảnh", e);
            }
        });
    }

    private RoomResponse mapToResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .price(room.getPrice())
                .area(room.getArea())
                .status(room.getStatus().name())
                .buildingId(room.getBuilding() != null ? room.getBuilding().getId() : null)
                .buildingName(room.getBuilding() != null ? room.getBuilding().getName() : "N/A")
                .address(room.getBuilding() != null ? room.getBuilding().getAddress() : "N/A")

                // --- THÊM DÒNG NÀY ĐỂ FIX LỖI 500 VÀ TRUYỀN DỮ LIỆU ---
                .landlordId(room.getBuilding() != null ? room.getBuilding().getLandlordId() : null)
                // -----------------------------------------------------

                .description(room.getDescription())
                .imageUrls(room.getImages() != null ?
                        room.getImages().stream().map(RoomImage::getImageUrl).toList() : List.of())
                .amenities(room.getAmenities())
                .tenantName(room.getTenantName() != null ? room.getTenantName() : "---")
                .build();
    }

    @Transactional
    public void deleteRoom(Integer id) { roomRepository.deleteById(id); }

    // Trong file RoomService.java
    @Transactional
    public void updateStatus(Integer id, String statusName) {
        // Tìm phòng dựa trên ID
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));

        try {
            // Chuyển đổi String từ Frontend thành Enum RoomStatus
            // Ví dụ: "OCCUPIED" -> RoomStatus.OCCUPIED
            RoomStatus newStatus = RoomStatus.valueOf(statusName.toUpperCase());
            room.setStatus(newStatus);
            roomRepository.save(room);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + statusName);
        }
    }
}