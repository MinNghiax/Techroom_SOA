package com.techroom.authservice.dto;

import com.techroom.authservice.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String phone;
    private Role role; // ADMIN, LANDLORD, hoặc TENANT
}