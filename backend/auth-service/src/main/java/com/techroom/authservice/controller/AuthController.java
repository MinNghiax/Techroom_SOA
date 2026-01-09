package com.techroom.authservice.controller;

import com.techroom.authservice.dto.AuthResponse;
import com.techroom.authservice.dto.LoginRequest;
import com.techroom.authservice.dto.RegisterRequest;
import com.techroom.authservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final AuthService authService;

    /**
     * Đăng ký tài khoản
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            String message = authService.register(request);
            return ResponseEntity.ok(createSuccessResponse(message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Đăng nhập
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            // 401 - Sai username/password
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Tên đăng nhập hoặc mật khẩu không chính xác"));
        } catch (RuntimeException e) {
            // Check nếu là lỗi tài khoản bị khóa
            if (e.getMessage().contains("khóa") || e.getMessage().contains("banned")) {
                // 403 - Tài khoản bị khóa
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse(e.getMessage()));
            }
            // 400 - Lỗi khác
            return ResponseEntity.badRequest()
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Đăng xuất
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            // Extract token if Bearer format
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            authService.logout(token);
            return ResponseEntity.ok(createSuccessResponse("Đăng xuất thành công"));
        } catch (Exception e) {
            return ResponseEntity.ok(createSuccessResponse("Đăng xuất thành công"));
        }
    }

    /**
     * Helper: Tạo success response
     */
    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }

    /**
     * Helper: Tạo error response
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}