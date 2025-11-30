package com.inqlusiv.mainapp.modules.company.service;

import com.inqlusiv.mainapp.modules.company.dto.CompanySetupRequest;

public interface CompanyService {
    void setupCompany(Long companyId, CompanySetupRequest request);
    void resetCompany(Long companyId);
}
