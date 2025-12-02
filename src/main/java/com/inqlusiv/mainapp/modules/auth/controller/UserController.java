package com.inqlusiv.mainapp.modules.auth.controller;

import com.inqlusiv.mainapp.modules.auth.dto.CreateUserRequest;
import com.inqlusiv.mainapp.modules.auth.entity.Role;
import com.inqlusiv.mainapp.modules.auth.entity.User;
import com.inqlusiv.mainapp.modules.auth.repository.UserRepository;
import com.inqlusiv.mainapp.modules.company.entity.Company;
import com.inqlusiv.mainapp.modules.company.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping
    public ResponseEntity<?> createUser(@RequestHeader("Authorization") String token, @RequestBody CreateUserRequest request) {
        try {
            // 1. Validate Token & Role (Simple check for demo)
            String cleanToken = token.replace("Bearer ", "");
            if (!cleanToken.startsWith("mock-jwt-token-")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            String[] parts = cleanToken.split("-");
            // Format: mock-jwt-token-{companyId}-{role}-{userId}
            Long companyId = Long.parseLong(parts[3]);
            String roleStr = parts.length >= 5 ? parts[4] : "COMPANY_ADMIN";

            if (!"COMPANY_ADMIN".equals(roleStr) && !"HR_MANAGER".equals(roleStr)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Admins and HR can create users");
            }

            // 2. Check if user exists
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("User with this email already exists");
            }

            // 3. Create User
            User newUser = User.builder()
                    .fullName(request.getFullName())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(request.getRole())
                    .companyId(companyId)
                    .departmentId(request.getDepartmentId())
                    .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                    .build();

            User savedUser = userRepository.save(newUser);
            
            // Clear password before returning
            savedUser.setPassword(null);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error creating user: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getUsersByCompany(@RequestHeader("Authorization") String token) {
        try {
            String cleanToken = token.replace("Bearer ", "");
            String[] parts = cleanToken.split("-");
            Long companyId = Long.parseLong(parts[3]);

            List<User> users = new ArrayList<>(userRepository.findAll().stream()
                    .filter(u -> u.getCompanyId().equals(companyId))
                    .filter(u -> u.getRole() != Role.EMPLOYEE) // Exclude employees
                    .filter(u -> !u.getEmail().endsWith("@test.com")) // Exclude test users
                    .peek(u -> u.setPassword(null)) // Hide passwords
                    .toList());

            // Fetch Company Admin (Owner)
            Optional<Company> companyOpt = companyRepository.findById(companyId);
            if (companyOpt.isPresent()) {
                Company company = companyOpt.get();
                User companyAdmin = User.builder()
                        .id(0L) // Use 0 to distinguish
                        .fullName(company.getName())
                        .email(company.getEmail())
                        .password("") // Dummy password
                        .role(Role.COMPANY_ADMIN)
                        .companyId(companyId)
                        .isActive(true)
                        .isEditable(false) // Mark as not editable
                        .build();
                users.add(0, companyAdmin); // Add to top
            }

            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching users");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@RequestHeader("Authorization") String token, @PathVariable Long id, @RequestBody CreateUserRequest request) {
        try {
            // 1. Validate Token & Role
            String cleanToken = token.replace("Bearer ", "");
            if (!cleanToken.startsWith("mock-jwt-token-")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            String[] parts = cleanToken.split("-");
            Long companyId = Long.parseLong(parts[3]);
            String roleStr = parts.length >= 5 ? parts[4] : "COMPANY_ADMIN";

            if (!"COMPANY_ADMIN".equals(roleStr) && !"HR_MANAGER".equals(roleStr)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Admins and HR can update users");
            }

            // 2. Find User
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            User user = userOpt.get();

            // Check company ownership
            if (!user.getCompanyId().equals(companyId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cannot update user from another company");
            }

            // 3. Update Fields
            if (request.getFullName() != null) user.setFullName(request.getFullName());
            if (request.getEmail() != null) {
                // Check if email is taken by another user
                Optional<User> existing = userRepository.findByEmail(request.getEmail());
                if (existing.isPresent() && !existing.get().getId().equals(id)) {
                    return ResponseEntity.badRequest().body("Email already in use");
                }
                user.setEmail(request.getEmail());
            }
            if (request.getRole() != null) user.setRole(request.getRole());
            if (request.getDepartmentId() != null) user.setDepartmentId(request.getDepartmentId());
            if (request.getIsActive() != null) user.setIsActive(request.getIsActive());
            
            // Only update password if provided and not empty
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            User updatedUser = userRepository.save(user);
            updatedUser.setPassword(null);

            return ResponseEntity.ok(updatedUser);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error updating user: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        try {
            // 1. Validate Token & Role
            String cleanToken = token.replace("Bearer ", "");
            if (!cleanToken.startsWith("mock-jwt-token-")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            String[] parts = cleanToken.split("-");
            Long companyId = Long.parseLong(parts[3]);
            String roleStr = parts.length >= 5 ? parts[4] : "COMPANY_ADMIN";

            if (!"COMPANY_ADMIN".equals(roleStr) && !"HR_MANAGER".equals(roleStr)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Admins and HR can delete users");
            }

            // 2. Find User
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            User user = userOpt.get();

            // Check company ownership
            if (!user.getCompanyId().equals(companyId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cannot delete user from another company");
            }

            // 3. Delete User
            userRepository.delete(user);

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error deleting user: " + e.getMessage());
        }
    }
}
