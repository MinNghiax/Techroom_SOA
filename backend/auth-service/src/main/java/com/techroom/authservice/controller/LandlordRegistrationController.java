package com.techroom.authservice.controller;

import com.techroom.authservice.service.LandlordRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/landlord-registration")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class LandlordRegistrationController {

    private final LandlordRegistrationService registrationService;

    // Inject biến đường dẫn lưu file từ application.properties
    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * API: Lấy danh sách yêu cầu đăng ký chủ trọ (chỉ cho admin)
     * GET /api/landlord-registration/requests?status=PENDING
     */
    @GetMapping("/requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllRequests(@RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(registrationService.getAllRequests(status));
    }

    /**
     * API: Phục vụ file ảnh upload cho yêu cầu chủ trọ
     * GET /api/landlord-registration/uploads/{filename}
     */
    @GetMapping("/uploads/{filename}")
    public ResponseEntity<?> serveFile(@PathVariable String filename) {
        try {
            // Sử dụng uploadDir đã cấu hình thay vì fix cứng "uploads/rooms"
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(createErrorResponse("Không tìm thấy file: " + filename));
            }
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse("Lỗi tải file: " + e.getMessage()));
        }
    }

    /**
     * API: Duyệt yêu cầu chủ trọ
     * POST /api/landlord-registration/approve/{id}
     */
    @PostMapping("/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveRequest(@PathVariable Integer id) {
        try {
            registrationService.approveRequest(id);
            return ResponseEntity.ok(createSuccessResponse("Duyệt yêu cầu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * API: Từ chối yêu cầu chủ trọ
     * POST /api/landlord-registration/reject/{id}
     */
    @PostMapping("/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectRequest(@PathVariable Integer id, @RequestParam("reason") String reason) {
        try {
            registrationService.rejectRequest(id, reason);
            return ResponseEntity.ok(createSuccessResponse("Đã từ chối yêu cầu!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * API: Gửi yêu cầu đăng ký chủ trọ (Có up ảnh)
     * POST http://localhost:8081/api/landlord-registration/register
     */
    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<?> registerLandlord(
            @RequestParam("cccd") String cccd,
            @RequestParam("address") String address,
            @RequestParam("roomCount") Integer roomCount,
            @RequestParam("frontImage") MultipartFile frontImage,
            @RequestParam("backImage") MultipartFile backImage,
            @RequestParam(value = "licenseImage", required = false) MultipartFile licenseImage
    ) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Vui lòng đăng nhập để thực hiện chức năng này"));
            }

            String username = auth.getName();

            if (cccd == null || cccd.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Số CCCD không được để trống"));
            }
            if (address == null || address.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Địa chỉ không được để trống"));
            }
            if (roomCount == null || roomCount < 1) {
                return ResponseEntity.badRequest().body(createErrorResponse("Số lượng phòng phải lớn hơn 0"));
            }

            String result = registrationService.submitRequest(
                    username, cccd, address, roomCount,
                    frontImage, backImage, licenseImage
            );

            return ResponseEntity.ok(createSuccessResponse(result));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("đã có yêu cầu")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(createErrorResponse(e.getMessage()));
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse("Lỗi upload file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse("Đã xảy ra lỗi: " + e.getMessage()));
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }

    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }
}