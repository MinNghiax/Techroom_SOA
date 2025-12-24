package com.techroom.authservice.dto;

import com.techroom.authservice.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor  // <--- Bắt buộc phải có cái này để nhận JSON
@AllArgsConstructor // <--- Nên có đi kèm với Builder
public class RegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String phone;
    private Role role; // Đảm bảo Frontend gửi chuỗi "TENANT" hoặc "LANDLORD"
}