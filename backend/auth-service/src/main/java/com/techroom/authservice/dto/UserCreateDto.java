package com.techroom.authservice.dto;

import com.techroom.authservice.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateDto {
    private String username;
    private String password; // Bắt buộc khi tạo mới
    private String fullName;
    private String email;
    private String phone;
    private Role role; // Admin có thể chọn LANDLORD, ADMIN, TENANT
}