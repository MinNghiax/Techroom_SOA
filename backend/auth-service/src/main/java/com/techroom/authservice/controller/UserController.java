package com.techroom.authservice.controller;

import com.techroom.authservice.dto.UserCreateDto; // Import DTO mới
import com.techroom.authservice.dto.UserDto;
import com.techroom.authservice.dto.UserUpdateDto;
import com.techroom.authservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus; // <--- ĐÃ THÊM IMPORT NÀY ĐỂ FIX LỖI
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 1. Xem danh sách (Chỉ Admin)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // 2. Xem chi tiết 1 người (Chỉ Admin)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // 3. Cập nhật / Khóa tài khoản (Chỉ Admin)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUser(@PathVariable Integer id, @RequestBody UserUpdateDto request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // 4. Xóa tài khoản (Chỉ Admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // 5. THÊM MỚI NGƯỜI DÙNG (ADMIN TẠO, CÓ THỂ CHỌN ROLE)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> createUser(@RequestBody UserCreateDto request) {
        // Sử dụng HttpStatus.CREATED (201) cho đúng chuẩn REST
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }
}