package com.example.invoices_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long contractId;
    private Long tenantId;
    private Long landlordId;

    private BigDecimal amount;
    private Integer month;
    private Integer year;
    private String description;

    private String status; // UNPAID, PAID, FAILED
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt = LocalDateTime.now();
}
