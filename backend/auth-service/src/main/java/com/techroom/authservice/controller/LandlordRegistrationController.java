package com.techroom.authservice.controller;

import com.techroom.authservice.service.LandlordRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/landlord-registration")
@RequiredArgsConstructor
public class LandlordRegistrationController {

    private final LandlordRegistrationService registrationService;

    // API: Gửi yêu cầu đăng ký chủ trọ (Có up ảnh)
    // POST http://localhost:8081/api/landlord-registration/register
    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<String> registerLandlord(
            @RequestParam("cccd") String cccd,
            @RequestParam("address") String address,
            @RequestParam("roomCount") Integer roomCount,
            @RequestParam("frontImage") MultipartFile frontImage,
            @RequestParam("backImage") MultipartFile backImage,
            @RequestParam("licenseImage") MultipartFile licenseImage
    ) {
        try {
            // Lấy username người đang đăng nhập
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            String result = registrationService.submitRequest(username, cccd, address, roomCount, frontImage, backImage, licenseImage);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Lỗi upload file: " + e.getMessage());
        }
    }
}