package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class BookingDTO {

    private Integer roomId;
    private Integer landlordId;

    private String fullName;
    private String cccd;
    private String phone;
    private String address;

    private LocalDate startDate;
    private LocalDate endDate;

    private BigDecimal deposit;
    private BigDecimal monthlyRent;
    private String notes;
}

