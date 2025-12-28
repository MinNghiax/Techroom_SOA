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

    // BookingController.java

    @GetMapping
    public ApiResponse<?> getBookings(
            @RequestHeader("X-User-Id") Integer userId,
            @RequestHeader("X-Role") String role
    ) {
        if ("LANDLORD".equals(role)) {
            // Chỉ lấy hợp đồng thuộc về chủ trọ này
            return ApiResponse.success(bookingService.getLandlordContracts(userId));
        } else if ("ADMIN".equals(role)) {
            // Admin mới được quyền xem tất cả
            return ApiResponse.success(contractRepository.findAll());
        }
        throw new RuntimeException("Unauthorized to view all bookings");
    }

    // TENANT tạo booking
    @PostMapping
    public ApiResponse<?> create(
            @RequestHeader(value = "X-User-Id", required = false) Integer tenantId,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestBody BookingDTO dto
    ) {
        // Kiểm tra thủ công để debug dễ hơn
        if (tenantId == null || role == null) {
            return new ApiResponse<>(false, "Thiếu thông tin xác thực (X-User-Id hoặc X-Role)", null);
        }

        if (!"TENANT".equals(role)) {
            return new ApiResponse<>(false, "Chỉ người thuê mới có thể đặt phòng", null);
        }

        return ApiResponse.success(bookingService.createBooking(dto, tenantId));
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
        if (!"LANDLORD".equalsIgnoreCase(role)) {
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

