package com.inqlusiv.mainapp.modules.company.service;

import com.inqlusiv.mainapp.modules.company.dto.CompanySettingsDTO;
import com.inqlusiv.mainapp.modules.company.dto.CompanySetupRequest;
import org.springframework.web.multipart.MultipartFile;

public interface CompanyService {
    void setupCompany(Long companyId, CompanySetupRequest request);
    void resetCompany(Long companyId);
    CompanySettingsDTO getCompanySettings(Long companyId);
    void updateCompanySettings(Long companyId, CompanySettingsDTO dto);
    String updateCompanyLogo(Long companyId, MultipartFile file);
    void inviteAdmin(Long companyId, String email, String role, String fullName);
    void updateAdminUser(Long companyId, Long userId, String role, String status);
    void deleteAdminUser(Long companyId, Long userId);
}
