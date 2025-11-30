package com.inqlusiv.mainapp.modules.auth.controller;

import com.inqlusiv.mainapp.modules.auth.dto.LoginRequest;
import com.inqlusiv.mainapp.modules.auth.dto.LoginResponse;
import com.inqlusiv.mainapp.modules.company.entity.Company;
import com.inqlusiv.mainapp.modules.company.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<Company> companyOpt = companyRepository.findByEmail(loginRequest.getEmail());

        if (companyOpt.isPresent()) {
            Company company = companyOpt.get();
            
            if (passwordEncoder.matches(loginRequest.getPassword(), company.getPassword())) {
                
                String setupStatus = company.getSetupStatus() != null ? company.getSetupStatus().name() : "INCOMPLETE";

                // Mock token
                String token = "mock-jwt-token-" + company.getId();
                return ResponseEntity.ok(new LoginResponse(token, setupStatus));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }
}
