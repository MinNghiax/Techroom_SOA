package com.techroom.authservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "landlords")
public class Landlord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    @Column(length = 20)
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

    @Column(columnDefinition = "ENUM('APPROVED') DEFAULT 'APPROVED'")
    private String approved;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}