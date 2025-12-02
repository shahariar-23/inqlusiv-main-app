package com.inqlusiv.mainapp.modules.auth.controller;

import com.inqlusiv.mainapp.modules.auth.dto.CreateUserRequest;
import com.inqlusiv.mainapp.modules.auth.entity.Role;
import com.inqlusiv.mainapp.modules.auth.entity.User;
import com.inqlusiv.mainapp.modules.auth.repository.UserRepository;
import com.inqlusiv.mainapp.modules.company.entity.Company;
import com.inqlusiv.mainapp.modules.company.repository.CompanyRepository;
import com.inqlusiv.mainapp.modules.company.entity.Department;
import com.inqlusiv.mainapp.modules.company.repository.DepartmentRepository;
import com.inqlusiv.mainapp.modules.employee.entity.Employee;
import com.inqlusiv.mainapp.modules.employee.entity.EmployeeStatus;
import com.inqlusiv.mainapp.modules.employee.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.Random;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

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

    @GetMapping("/my-team")
    public ResponseEntity<?> getMyTeam(@RequestHeader("Authorization") String token) {
        try {
            // 1. Validate Token
            String cleanToken = token.replace("Bearer ", "");
            if (!cleanToken.startsWith("mock-jwt-token-")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            String[] parts = cleanToken.split("-");
            // Format: mock-jwt-token-{companyId}-{role}-{userId}
            Long companyId = Long.parseLong(parts[3]);
            Long userId = Long.parseLong(parts[5]);
            String roleStr = parts.length >= 5 ? parts[4] : "EMPLOYEE";

            // 2. Check Role
            if (!"DEPT_MANAGER".equals(roleStr) && !"COMPANY_ADMIN".equals(roleStr)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Department Managers and Admins can view their team");
            }

            // 3. Get User Details
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            User currentUser = userOpt.get();
            
            List<Employee> teamMembers;
            String departmentName;

            if (currentUser.getDepartmentId() != null) {
                // If user has a department, show that department's employees
                teamMembers = employeeRepository.findByCompanyIdAndDepartmentId(companyId, currentUser.getDepartmentId());
                Optional<Department> deptOpt = departmentRepository.findById(currentUser.getDepartmentId());
                departmentName = deptOpt.map(Department::getName).orElse("Unknown Department");
            } else if ("COMPANY_ADMIN".equals(roleStr)) {
                // If Admin has no department, show ALL company employees
                teamMembers = employeeRepository.findByCompanyId(companyId);
                departmentName = "All Company Employees";
            } else {
                return ResponseEntity.badRequest().body("Manager is not assigned to a department");
            }

            // 4. Build Response
            List<Map<String, Object>> response = new ArrayList<>();
            
            for (Employee emp : teamMembers) {
                // Skip if the employee is the current user (by email)
                if (emp.getEmail().equalsIgnoreCase(currentUser.getEmail())) continue;

                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", emp.getId());
                userMap.put("fullName", emp.getFirstName() + " " + emp.getLastName());
                userMap.put("email", emp.getEmail());
                userMap.put("role", emp.getJobTitle() != null ? emp.getJobTitle() : "EMPLOYEE");
                userMap.put("departmentName", departmentName);
                
                String status = "Not Started";
                if (emp.getStatus() == EmployeeStatus.ACTIVE) status = "Completed";
                else if (emp.getStatus() == EmployeeStatus.ON_LEAVE) status = "Pending";
                
                userMap.put("status", status);
                
                response.add(userMap);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error fetching team: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        try {
            // 1. Validate Token
            String cleanToken = token.replace("Bearer ", "");
            if (!cleanToken.startsWith("mock-jwt-token-")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }
            
            // 2. Handle Company Admin (ID 0)
            if (id == 0) {
                 String[] parts = cleanToken.split("-");
                 Long companyId = Long.parseLong(parts[3]);
                 Optional<Company> companyOpt = companyRepository.findById(companyId);
                 if (companyOpt.isPresent()) {
                     Company company = companyOpt.get();
                     Map<String, Object> response = new HashMap<>();
                     response.put("id", 0L);
                     response.put("fullName", company.getName());
                     response.put("email", company.getEmail());
                     response.put("role", Role.COMPANY_ADMIN);
                     response.put("companyId", companyId);
                     return ResponseEntity.ok(response);
                 }
            }

            // 3. Find User
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("fullName", user.getFullName());
                response.put("email", user.getEmail());
                response.put("role", user.getRole());
                response.put("companyId", user.getCompanyId());
                response.put("departmentId", user.getDepartmentId());
                response.put("isActive", user.getIsActive());
                
                if (user.getDepartmentId() != null) {
                    departmentRepository.findById(user.getDepartmentId())
                        .ifPresent(dept -> response.put("departmentName", dept.getName()));
                }
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching user");
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
