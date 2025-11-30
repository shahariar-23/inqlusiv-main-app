package com.inqlusiv.mainapp.modules.dashboard.controller;

import com.inqlusiv.mainapp.modules.dashboard.dto.DashboardStatsDTO;
import com.inqlusiv.mainapp.modules.dashboard.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<?> getStats(@RequestHeader("Authorization") String token) {
        try {
            // Extract ID from mock token "mock-jwt-token-{id}"
            String cleanToken = token.replace("Bearer ", "");
            if (!cleanToken.startsWith("mock-jwt-token-")) {
                 return ResponseEntity.status(401).body("Invalid token");
            }
            
            String tokenIdPart = cleanToken.replace("mock-jwt-token-", "");
            Long companyId = Long.parseLong(tokenIdPart);
            
            DashboardStatsDTO stats = dashboardService.getStats(companyId);
            return ResponseEntity.ok(stats);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid token format");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching dashboard stats: " + e.getMessage());
        }
    }
}
