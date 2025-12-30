package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contracts") // Khớp với Gateway và Frontend
@RequiredArgsConstructor
public class ContractController {
    private final BookingService bookingService;

    @GetMapping("/landlord/{landlordId}")
    public ApiResponse<?> getLandlordContracts(@PathVariable Integer landlordId) {
        return ApiResponse.success(bookingService.getLandlordContracts(landlordId));
    }
}