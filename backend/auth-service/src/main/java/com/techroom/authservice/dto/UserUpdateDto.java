package com.techroom.authservice.dto;

import com.techroom.authservice.model.Role;
import com.techroom.authservice.model.UserStatus;
import lombok.Data;

@Data
public class UserUpdateDto {
    private String fullName;
    private String phone;
    private Role role;       // Để Admin thăng chức/giáng chức
    private UserStatus status; // Quan trọng: Để BAN (khóa) hoặc ACTIVE (mở) tài khoản
}