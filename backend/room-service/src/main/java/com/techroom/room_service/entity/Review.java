package com.techroom.room_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
// Thêm uniqueConstraints để đảm bảo 1 tenant chỉ đánh giá 1 phòng 1 lần duy nhất
@Table(name = "reviews", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"room_id", "tenant_id"})
})
@Data
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "tenant_id", nullable = false)
    private Integer tenantId; // user_id từ auth_db

    @Column(nullable = false)
    private Integer rating; // Nên có validation từ 1-5 ở tầng DTO

    @Column(columnDefinition = "LONGTEXT") // Khớp với kiểu LONGTEXT trong SQL của bạn
    private String comment;

    @CreationTimestamp // Tự động lấy thời gian khi tạo mới
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp // Tự động cập nhật thời gian khi chỉnh sửa
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}