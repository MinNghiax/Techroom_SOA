package com.techroom.room_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "review_reports")
@Data
public class ReviewReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "review_id")
    private Review review;

    @Column(name = "reporter_id")
    private Integer reporterId;
    private String reason;
    private String description;

    @Enumerated(EnumType.STRING)
    private ReportStatus status = ReportStatus.PENDING;
}

