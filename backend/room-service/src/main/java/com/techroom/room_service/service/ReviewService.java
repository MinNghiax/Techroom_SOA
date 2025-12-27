package com.techroom.room_service.service;

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

    private ReviewResponse mapToResponse(Review review) {
        String username = null;
        try {
            // Gọi sang AuthService để lấy fullName
            var userObj = restTemplate.getForObject(USER_SERVICE_URL + review.getTenantId(), java.util.Map.class);
            if (userObj != null && userObj.get("fullName") != null) {
                username = userObj.get("fullName").toString();
            }
        } catch (Exception e) {
            // Nếu lỗi thì fallback về "User #id"
            username = "User #" + review.getTenantId();
        }
        return ReviewResponse.builder()
                .id(review.getId())
                .tenantId(review.getTenantId())
                .username(username)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}