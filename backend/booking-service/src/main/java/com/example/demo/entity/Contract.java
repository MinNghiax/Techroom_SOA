package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
@Getter
@Setter
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String contractCode;

    @Column(name = "room_id")
    private Integer roomId;

    @Column(name = "tenant_id")
    private Integer tenantId;

    @Column(name = "landlord_id")
    private Integer landlordId;

    private String fullName;
    private String cccd;
    private String phone;
    private String address;

    private LocalDate startDate;
    private LocalDate endDate;

    private BigDecimal deposit;
    private BigDecimal monthlyRent;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Enumerated(EnumType.STRING)
    private ContractStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
