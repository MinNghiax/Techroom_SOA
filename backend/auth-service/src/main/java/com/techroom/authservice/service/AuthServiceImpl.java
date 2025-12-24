package com.techroom.authservice.service;

import com.techroom.authservice.dto.AuthResponse;
import com.techroom.authservice.dto.LoginRequest;
import com.techroom.authservice.dto.RegisterRequest;
import com.techroom.authservice.model.*;
import com.techroom.authservice.repository.LandlordRepository;
import com.techroom.authservice.repository.TenantRepository;
import com.techroom.authservice.repository.UserRepository;
import com.techroom.authservice.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final LandlordRepository landlordRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        // 1. Xác thực username/password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // 2. Nếu xác thực thành công, lưu vào context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Tạo Access Token (JWT)
        String token = jwtTokenProvider.generateToken(loginRequest.getUsername());

        // 4. Lấy thông tin user
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 5. Tạo Refresh Token thật và lưu xuống DB
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUsername());

        // 6. Trả về Response chứa cả 2 loại token
        return AuthResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken.getToken())
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    @Override
    @Transactional
    public String register(RegisterRequest request) {
        // 1. Kiểm tra tồn tại
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        // 2. Tạo User entity
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        // 3. Lưu User xuống DB
        User savedUser = userRepository.save(user);

        // 4. Tạo bảng phụ tương ứng (Tenant hoặc Landlord)
        if (request.getRole() == Role.TENANT) {
            Tenant tenant = Tenant.builder()
                    .user(savedUser)
                    .build();
            tenantRepository.save(tenant);
        } else if (request.getRole() == Role.LANDLORD) {
            Landlord landlord = Landlord.builder()
                    .user(savedUser)
                    .approved("APPROVED")
                    .build();
            landlordRepository.save(landlord);
        }

        return "User registered successfully!";
    }

    @Override
    public void logout(String refreshToken) {
        refreshTokenService.deleteByToken(refreshToken);
    }
}