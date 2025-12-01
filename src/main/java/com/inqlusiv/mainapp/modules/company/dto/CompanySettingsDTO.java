package com.inqlusiv.mainapp.modules.company.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanySettingsDTO {
    private String companyName;
    private String industry;
    private String region;
    private String logoUrl;
    private List<AdminUserDTO> admins;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminUserDTO {
        private Long id;
        private String fullName;
        private String email;
        private String role;
        private String status;
        private String lastActive;
        private boolean isOwner;
    }
}
