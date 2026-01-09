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

    @Column(name = "contract_id")
    private Long contractId;

    @Column(name = "tenant_id")
    private Long tenantId;

    @Column(name = "landlord_id")
    private Long landlordId;

    private BigDecimal amount;
    private Integer month;
    private Integer year;
    private String description;

    private String status; // UNPAID, PAID, FAILED
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt = LocalDateTime.now();
}
