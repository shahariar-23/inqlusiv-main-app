package com.inqlusiv.mainapp.modules.auth.controller;

import com.inqlusiv.mainapp.modules.auth.dto.LoginRequest;
import com.inqlusiv.mainapp.modules.auth.dto.LoginResponse;
import com.inqlusiv.mainapp.modules.auth.entity.User;
import com.inqlusiv.mainapp.modules.auth.repository.UserRepository;
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
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // 1. Check DB for User
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Check password (support both encoded and plain text for demo)
            boolean passwordMatch = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword()) 
                                    || loginRequest.getPassword().equals(user.getPassword());

            if (passwordMatch) {
                // Fetch company for setup status
                String setupStatus = "COMPLETE";
                Optional<Company> companyOpt = companyRepository.findById(user.getCompanyId());
                if (companyOpt.isPresent()) {
                    setupStatus = companyOpt.get().getSetupStatus() != null ? companyOpt.get().getSetupStatus().name() : "INCOMPLETE";
                }

                // Generate Token: mock-jwt-token-{companyId}-{role}-{userId}
                String token = String.format("mock-jwt-token-%d-%s-%d", 
                        user.getCompanyId(), 
                        user.getRole().name(), 
                        user.getId());
                
                return ResponseEntity.ok(new LoginResponse(token, setupStatus));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }
}
