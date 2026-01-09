package com.techroom.authservice.controller;

import com.techroom.authservice.dto.AuthResponse;
import com.techroom.authservice.dto.LoginRequest;
import com.techroom.authservice.dto.RegisterRequest;
import com.techroom.authservice.dto.TokenRefreshRequest;
import com.techroom.authservice.model.RefreshToken;
import com.techroom.authservice.model.User;
import com.techroom.authservice.security.CustomUserDetails;
import com.techroom.authservice.security.JwtTokenProvider;
import com.techroom.authservice.service.AuthService;
import com.techroom.authservice.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if ("ACCOUNT_LOCKED".equals(e.getMessage())) {
                // Trả về 403 Forbidden khi tài khoản bị khóa
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(java.util.Map.of("message", "Tài khoản của bạn đã bị khóa bởi quản trị viên."));
            }
            // Trả về 401 Unauthorized cho các lỗi sai thông tin khác
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("message", e.getMessage()));
        }
    }

    // API Đăng ký
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        String message = authService.register(registerRequest);
        // Trả về JSON dạng: {"message": "User registered successfully!"}
        return ResponseEntity.ok(java.util.Map.of("message", message));
    }

    // API Cấp lại Token mới
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshtoken(@RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtTokenProvider.generateToken(user);
                    AuthResponse response = AuthResponse.builder()
                            .userId(user.getId())
                            .accessToken(token)
                            .refreshToken(requestRefreshToken)
                            .username(user.getUsername())
                            .role(user.getRole().name())
                            .build();
                    return ResponseEntity.ok(response);
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    // API Đăng xuất (Mới)
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody TokenRefreshRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok("Log out successful!");
    }

    // API Lấy thông tin User hiện tại (Mới - Cần Access Token)
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userDetails.getUser());
    }
}