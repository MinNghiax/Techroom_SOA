package com.techroom.room_service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewReportResponse {
    private Integer id;
    private Integer reviewId;
    private String reviewComment; // Nội dung đánh giá bị báo cáo
    private String reporterName;  // Tên người báo cáo
    private Integer reporterId;
    private String reason;
    private String description;
    private String status;
    private LocalDateTime createdAt;
}