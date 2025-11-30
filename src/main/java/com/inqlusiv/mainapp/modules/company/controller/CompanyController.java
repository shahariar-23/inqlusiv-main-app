package com.inqlusiv.mainapp.modules.company.controller;

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
}
