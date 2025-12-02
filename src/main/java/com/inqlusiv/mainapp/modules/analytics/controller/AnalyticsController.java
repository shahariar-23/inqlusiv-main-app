package com.inqlusiv.mainapp.modules.analytics.controller;

import com.inqlusiv.mainapp.modules.analytics.dto.AnalyticsResponseDTO;
import com.inqlusiv.mainapp.modules.analytics.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/advanced")
    public ResponseEntity<?> getAdvancedAnalytics(
            @RequestHeader("Authorization") String token,
            @RequestParam(value = "departmentId", required = false) Long departmentId) {
        try {
            Long companyId = extractCompanyId(token);
            AnalyticsResponseDTO data = analyticsService.getAdvancedAnalytics(companyId, departmentId);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching analytics: " + e.getMessage());
        }
    }

    private Long extractCompanyId(String token) {
        String cleanToken = token.replace("Bearer ", "");
        if (!cleanToken.startsWith("mock-jwt-token-")) {
            throw new RuntimeException("Invalid token");
        }
        
        String[] parts = cleanToken.split("-");
        // Format: mock-jwt-token-{companyId}-{role}-{userId}
        if (parts.length >= 4) {
            return Long.parseLong(parts[3]);
        }
        
        return Long.parseLong(cleanToken.replace("mock-jwt-token-", ""));
    }
}
