package com.techroom.room_service.service;

import com.techroom.room_service.dto.ReviewRequest;
import com.techroom.room_service.dto.ReviewResponse;
import com.techroom.room_service.entity.Review;
import com.techroom.room_service.repository.ReviewRepository;
import com.techroom.room_service.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final RoomRepository roomRepository;

    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public List<ReviewResponse> getReviewsByRoomId(Integer roomId) {
        return reviewRepository.findByRoomId(roomId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        // Kiểm tra xem phòng có tồn tại không
        var room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));

        Review review = new Review();
        review.setRoom(room);
        review.setTenantId(request.getTenantId());
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .tenantId(review.getTenantId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}