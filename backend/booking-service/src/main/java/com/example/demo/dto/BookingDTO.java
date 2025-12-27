package com.example.demo.dto;
import com.fasterxml.jackson.annotation.JsonFormat;
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


    private BigDecimal deposit;
    private BigDecimal monthlyRent;
    private String notes;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
}

