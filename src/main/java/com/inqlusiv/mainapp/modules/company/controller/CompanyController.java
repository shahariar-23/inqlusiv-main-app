package com.inqlusiv.mainapp.modules.company.controller;

import com.inqlusiv.mainapp.modules.company.dto.CompanySetupRequest;
import com.inqlusiv.mainapp.modules.company.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/company")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @PostMapping("/setup")
    public ResponseEntity<?> setupCompany(@RequestHeader("Authorization") String token, @RequestBody CompanySetupRequest request) {
        try {
            // Extract ID from mock token "mock-jwt-token-{id}"
            // Remove "Bearer " if present (though frontend might not send it yet, let's handle both)
            String cleanToken = token.replace("Bearer ", "");
            if (!cleanToken.startsWith("mock-jwt-token-")) {
                 return ResponseEntity.status(401).body("Invalid token");
            }
            
            String tokenIdPart = cleanToken.replace("mock-jwt-token-", "");
            Long companyId = Long.parseLong(tokenIdPart);
            
            companyService.setupCompany(companyId, request);
            return ResponseEntity.ok("Company setup completed successfully");
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid token format");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error setting up company: " + e.getMessage());
        }
    }
}
