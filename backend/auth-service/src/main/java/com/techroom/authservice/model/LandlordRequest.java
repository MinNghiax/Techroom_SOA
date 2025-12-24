package com.techroom.authservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "landlord_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LandlordRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String cccd;
    private String address;

    @Column(name = "expected_room_count")
    private Integer expectedRoomCount;

    @Column(name = "province_code")
    private Integer provinceCode;

    @Column(name = "district_code")
    private Integer districtCode;

    @Column(name = "front_image_path")
    private String frontImagePath;

    @Column(name = "back_image_path")
    private String backImagePath;

    @Column(name = "business_license_path")
    private String businessLicensePath;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = RequestStatus.PENDING;
    }

    public enum RequestStatus {
        PENDING, APPROVED, REJECTED
    }
}