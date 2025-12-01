package com.inqlusiv.mainapp.modules.company.controller;

import com.inqlusiv.mainapp.modules.company.dto.CompanySettingsDTO;
import com.inqlusiv.mainapp.modules.company.dto.CompanySetupRequest;
import com.inqlusiv.mainapp.modules.company.entity.Company;
import com.inqlusiv.mainapp.modules.company.repository.CompanyRepository;
import com.inqlusiv.mainapp.modules.company.service.CompanyService;
import com.inqlusiv.mainapp.modules.company.service.CsvService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/company")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @Autowired
    private CsvService csvService;

    @Autowired
    private CompanyRepository companyRepository;

    @PostMapping(value = "/setup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> setupCompany(
            @RequestHeader("Authorization") String token,
            @RequestParam("companyName") String companyName,
            @RequestParam("industry") String industry,
            @RequestParam("region") String region,
            @RequestParam("adminName") String adminName,
            @RequestParam("adminTitle") String adminTitle,
            @RequestParam("adminEmail") String adminEmail,
            @RequestParam(value = "departments", required = false) List<String> departments,
            @RequestParam(value = "notifications", defaultValue = "false") boolean notifications,
            @RequestParam(value = "analytics", defaultValue = "false") boolean analytics,
            @RequestParam(value = "autoInvite", defaultValue = "false") boolean autoInvite,
            @RequestParam(value = "selectedMetrics", required = false) List<String> selectedMetrics,
            @RequestParam(value = "employeeFile", required = false) MultipartFile employeeFile
    ) {
        try {
            // Extract ID from mock token "mock-jwt-token-{id}"
            String cleanToken = token.replace("Bearer ", "");
            if (!cleanToken.startsWith("mock-jwt-token-")) {
                 return ResponseEntity.status(401).body("Invalid token");
            }
            
            String tokenIdPart = cleanToken.replace("mock-jwt-token-", "");
            Long companyId = Long.parseLong(tokenIdPart);
            
            // Build DTO
            CompanySetupRequest request = new CompanySetupRequest();
            request.setCompanyName(companyName);
            request.setIndustry(industry);
            request.setRegion(region);
            request.setAdminName(adminName);
            request.setAdminTitle(adminTitle);
            request.setAdminEmail(adminEmail);
            request.setDepartments(departments);
            request.setSelectedMetrics(selectedMetrics);
            
            CompanySetupRequest.PreferencesDTO prefs = new CompanySetupRequest.PreferencesDTO();
            prefs.setNotifications(notifications);
            prefs.setAnalytics(analytics);
            prefs.setAutoInvite(autoInvite);
            request.setPreferences(prefs);

            // Save Company Data
            companyService.setupCompany(companyId, request);

            // Handle CSV Upload
            if (employeeFile != null && !employeeFile.isEmpty()) {
                Company company = companyRepository.findById(companyId)
                        .orElseThrow(() -> new RuntimeException("Company not found"));
                csvService.saveEmployees(employeeFile, company);
            }

            return ResponseEntity.ok("Company setup completed successfully");
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid token format");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error setting up company: " + e.getMessage());
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetCompanySetup(@RequestHeader("Authorization") String token) {
        try {
            String cleanToken = token.replace("Bearer ", "");
            if (!cleanToken.startsWith("mock-jwt-token-")) {
                return ResponseEntity.status(401).body("Invalid token");
            }

            String tokenIdPart = cleanToken.replace("mock-jwt-token-", "");
            Long companyId = Long.parseLong(tokenIdPart);

            companyService.resetCompany(companyId);

            return ResponseEntity.ok("Company setup reset to INCOMPLETE");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error resetting company: " + e.getMessage());
        }
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getCompanySettings(@RequestHeader("Authorization") String token) {
        try {
            Long companyId = extractCompanyId(token);
            CompanySettingsDTO settings = companyService.getCompanySettings(companyId);
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Unauthorized or Error: " + e.getMessage());
        }
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateCompanySettings(
            @RequestHeader("Authorization") String token,
            @RequestBody CompanySettingsDTO settingsDTO) {
        try {
            Long companyId = extractCompanyId(token);
            companyService.updateCompanySettings(companyId, settingsDTO);
            return ResponseEntity.ok("Settings updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating settings: " + e.getMessage());
        }
    }

    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateCompanyLogo(
            @RequestHeader("Authorization") String token,
            @RequestParam("file") MultipartFile file) {
        try {
            Long companyId = extractCompanyId(token);
            String logoUrl = companyService.updateCompanyLogo(companyId, file);
            return ResponseEntity.ok(Map.of("logoUrl", logoUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating logo: " + e.getMessage());
        }
    }

    @PostMapping("/invite-admin")
    public ResponseEntity<?> inviteAdmin(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> request) {
        try {
            Long companyId = extractCompanyId(token);
            String email = request.get("email");
            String role = request.get("role");
            String fullName = request.get("fullName");
            
            if (email == null || role == null) {
                return ResponseEntity.badRequest().body("Email and Role are required");
            }

            companyService.inviteAdmin(companyId, email, role, fullName);
            return ResponseEntity.ok("Invitation sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error inviting admin: " + e.getMessage());
        }
    }

    @PutMapping("/admin/{userId}")
    public ResponseEntity<?> updateAdminUser(
            @RequestHeader("Authorization") String token,
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        try {
            Long companyId = extractCompanyId(token);
            String role = request.get("role");
            String status = request.get("status");
            
            companyService.updateAdminUser(companyId, userId, role, status);
            return ResponseEntity.ok("User updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating user: " + e.getMessage());
        }
    }

    @DeleteMapping("/admin/{userId}")
    public ResponseEntity<?> deleteAdminUser(
            @RequestHeader("Authorization") String token,
            @PathVariable Long userId) {
        try {
            Long companyId = extractCompanyId(token);
            companyService.deleteAdminUser(companyId, userId);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting user: " + e.getMessage());
        }
    }

    private Long extractCompanyId(String token) {
        String cleanToken = token.replace("Bearer ", "");
        if (!cleanToken.startsWith("mock-jwt-token-")) {
            throw new RuntimeException("Invalid token");
        }
        return Long.parseLong(cleanToken.replace("mock-jwt-token-", ""));
    }
}
