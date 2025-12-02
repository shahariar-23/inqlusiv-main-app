package com.inqlusiv.mainapp.modules.auth.dto;

import com.inqlusiv.mainapp.modules.auth.entity.Role;
import lombok.Data;

@Data
public class CreateUserRequest {
    private String fullName;
    private String email;
    private String password;
    private Role role;
    private Long departmentId;
    private Boolean isActive;
}
