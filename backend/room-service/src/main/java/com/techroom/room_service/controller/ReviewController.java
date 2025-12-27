package com.techroom.room_service.controller;

import com.techroom.room_service.dto.ReviewRequest;
import com.techroom.room_service.dto.ReviewResponse;
import com.techroom.room_service.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    // 1. Lấy tất cả đánh giá của 1 phòng cụ thể
    // GET http://localhost:8082/api/reviews/room/1
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByRoom(@PathVariable Integer roomId) {
        return ResponseEntity.ok(reviewService.getReviewsByRoomId(roomId));
    }

    // 2. Tenant gửi đánh giá mới
    // POST http://localhost:8082/api/reviews
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @RequestBody ReviewRequest request,
            @RequestHeader("X-User-Id") Integer tenantId
    ) {
        return new ResponseEntity<>(reviewService.createReview(request, tenantId), HttpStatus.CREATED);
    }

    // 3. (Mở rộng) Lấy tất cả đánh giá hiện có (để admin dễ test)
    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }
}