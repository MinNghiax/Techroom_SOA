package com.techroom.room_service.service;

import com.techroom.room_service.dto.ReviewReportResponse;
import com.techroom.room_service.entity.ReportStatus;
import com.techroom.room_service.entity.Review;
import com.techroom.room_service.entity.ReviewReport;
import com.techroom.room_service.repository.ReviewReportRepository;
import com.techroom.room_service.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewReportService {
    private final ReviewReportRepository reportRepository;
    private final ReviewRepository reviewRepository;

    public List<ReviewReportResponse> getAllReports() {
        return reportRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public void reportReview(Integer reviewId, String reason, String desc, Integer reporterId) {
        var review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review không tồn tại"));
        ReviewReport report = new ReviewReport();
        report.setReview(review);
        report.setReason(reason);
        report.setDescription(desc);
        report.setReporterId(reporterId);
        report.setStatus(ReportStatus.PENDING);
        reportRepository.save(report);
    }

    @Transactional
    public void updateReportStatus(Integer id, ReportStatus status) {
        ReviewReport report = reportRepository.findById(id).orElseThrow();
        report.setStatus(status);
        reportRepository.save(report);
    }

    @Transactional
    public void deleteReviewByReport(Integer reportId) {
        ReviewReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Báo cáo không tồn tại"));

        // Lấy Review và thực hiện xóa trực tiếp
        Review review = report.getReview();
        reviewRepository.delete(review);
    }

    private ReviewReportResponse mapToResponse(ReviewReport report) {
        return ReviewReportResponse.builder()
                .id(report.getId())
                .reviewId(report.getReview().getId())
                .reviewComment(report.getReview().getComment())
                .reporterId(report.getReporterId())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus().name())
                .createdAt(report.getReview().getCreatedAt())
                .build();
    }
}