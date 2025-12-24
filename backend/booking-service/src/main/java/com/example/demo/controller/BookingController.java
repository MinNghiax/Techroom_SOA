package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.BookingDTO;
import com.example.demo.dto.RejectDTO;
import com.example.demo.repository.ContractRepository;
import com.example.demo.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final ContractRepository contractRepository;

    @GetMapping
    public ApiResponse<?> getAllBookings() {
        return ApiResponse.success(contractRepository.findAll());
    }

    // TENANT tạo booking
    @PostMapping
    public ApiResponse<?> create(
            @RequestHeader("X-User-Id") Integer tenantId,
            @RequestHeader("X-Role") String role,
            @RequestBody BookingDTO dto
    ) {
        if (!"TENANT".equals(role)) {
            throw new RuntimeException("Only tenant can book");
        }
        return ApiResponse.success(
                bookingService.createBooking(dto, tenantId)
        );
    }

    // TENANT xem hợp đồng
    @GetMapping("/my-contracts")
    public ApiResponse<?> myContracts(
            @RequestHeader("X-User-Id") Integer tenantId
    ) {
        return ApiResponse.success(
                bookingService.getTenantContracts(tenantId)
        );
    }

    // LANDLORD duyệt
    @PutMapping("/{id}/approve")
    public ApiResponse<?> approve(
            @PathVariable Integer id,
            @RequestHeader("X-User-Id") Integer landlordId,
            @RequestHeader("X-Role") String role
    ) {
        if (!"LANDLORD".equals(role)) {
            throw new RuntimeException("Only landlord can approve");
        }
        return ApiResponse.success(
                bookingService.approve(id, landlordId)
        );
    }

    // LANDLORD từ chối
    @PutMapping("/{id}/reject")
    public ApiResponse<?> reject(
            @PathVariable Integer id,
            @RequestHeader("X-User-Id") Integer landlordId,
            @RequestHeader("X-Role") String role,
            @RequestBody RejectDTO dto
    ) {
        if (!"LANDLORD".equals(role)) {
            throw new RuntimeException("Only landlord can reject");
        }
        return ApiResponse.success(
                bookingService.reject(id, landlordId, dto.getReason())
        );
    }
}

