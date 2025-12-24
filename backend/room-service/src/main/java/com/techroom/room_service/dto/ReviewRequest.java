package com.techroom.room_service.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Integer roomId;
    private Integer tenantId; // user_id từ auth_db
    private Integer rating;   // 1 đến 5
    private String comment;
}