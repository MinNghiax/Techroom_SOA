package com.techroom.room_service.service;

// Thêm các dòng này vào phần import của RoomController.java
import com.techroom.room_service.entity.Room;
import com.techroom.room_service.entity.RoomStatus;
import org.springframework.web.bind.annotation.RequestParam;
import com.techroom.room_service.dto.ReviewRequest;
import com.techroom.room_service.dto.ReviewResponse;
import com.techroom.room_service.entity.Review;
import com.techroom.room_service.repository.ReviewRepository;
import com.techroom.room_service.repository.RoomRepository;
import org.springframework.web.client.RestTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final RoomRepository roomRepository;

    // REST client để gọi sang AuthService lấy tên user
    private final RestTemplate restTemplate = new RestTemplate();
    private final String USER_SERVICE_URL = "http://localhost:8080/api/users/";

    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public List<ReviewResponse> getReviewsByRoomId(Integer roomId) {
        return reviewRepository.findByRoomId(roomId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ReviewResponse createReview(ReviewRequest request, Integer tenantId) {
        // Kiểm tra xem phòng có tồn tại không
        var room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));

        Review review = new Review();
        review.setRoom(room);
        review.setTenantId(tenantId);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    @Transactional
    public ReviewResponse updateReview(Integer id, ReviewRequest request, Integer userId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));

        // Kiểm tra bảo mật: Chỉ người tạo review mới được sửa
        if (!review.getTenantId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa đánh giá này");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        return mapToResponse(reviewRepository.save(review));
    }

    /**
     * Xóa đánh giá (Dành cho người dùng tự xóa bài của mình)
     */
    @Transactional
    public void deleteMyReview(Integer id, Integer userId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));

        // Kiểm tra bảo mật: Chỉ người tạo review mới được xóa
        if (!review.getTenantId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa đánh giá này");
        }

        // Database có ON DELETE CASCADE sẽ tự xóa các report liên quan
        reviewRepository.delete(review);
    }

    private ReviewResponse mapToResponse(Review review) {
        String fullName = "Người dùng #" + review.getTenantId();
        try {
            // Log thử xem URL có đúng không
            Map<String, Object> userObj = restTemplate.getForObject(USER_SERVICE_URL + review.getTenantId(), Map.class);
            if (userObj != null && userObj.containsKey("fullName")) {
                fullName = userObj.get("fullName").toString();
            }
        } catch (Exception e) {
            // Fallback giữ nguyên ID nếu lỗi
        }
        return ReviewResponse.builder()
                .id(review.getId())
                .tenantId(review.getTenantId())
                .username(fullName)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
    // RoomService.java

    @Transactional
    public void updateStatus(Integer id, String status) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));

        // Chuyển string từ frontend (vd: "OCCUPIED") thành Enum RoomStatus
        room.setStatus(RoomStatus.valueOf(status.toUpperCase()));
        roomRepository.save(room);
    }
}