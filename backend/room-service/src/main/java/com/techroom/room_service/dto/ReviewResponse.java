package com.techroom.room_service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Integer id;
    private String username;
    private Integer tenantId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}