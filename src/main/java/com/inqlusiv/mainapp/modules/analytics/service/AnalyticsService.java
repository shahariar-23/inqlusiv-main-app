package com.inqlusiv.mainapp.modules.analytics.service;

import com.inqlusiv.mainapp.modules.analytics.dto.AnalyticsResponseDTO;

public interface AnalyticsService {
    AnalyticsResponseDTO getAdvancedAnalytics(Long companyId, Long departmentId);
}
