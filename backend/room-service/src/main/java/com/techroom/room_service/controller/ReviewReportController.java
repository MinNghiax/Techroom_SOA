package com.techroom.room_service.controller;

import com.techroom.room_service.dto.ReviewReportResponse;
import com.techroom.room_service.entity.ReportStatus;
import com.techroom.room_service.service.ReviewReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews/reports")
@RequiredArgsConstructor
public class ReviewReportController {
    private final ReviewReportService reportService;

    @GetMapping
    public ResponseEntity<List<ReviewReportResponse>> getAll() {
        // Phải dùng List DTO để làm phẳng dữ liệu
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @PostMapping
    public ResponseEntity<Void> createReport(
            @RequestParam Integer reviewId,
            @RequestParam String reason,
            @RequestParam String description,
            @RequestHeader("X-User-Id") Integer reporterId) {
        reportService.reportReview(reviewId, reason, description, reporterId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Integer id, @RequestParam ReportStatus status) {
        reportService.updateReportStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/review")
    public ResponseEntity<Void> deleteReviewByReport(@PathVariable Integer id) {
        reportService.deleteReviewByReport(id);
        return ResponseEntity.noContent().build();
    }
}