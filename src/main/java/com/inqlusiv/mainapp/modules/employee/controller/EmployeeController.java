package com.inqlusiv.mainapp.modules.employee.controller;

import com.inqlusiv.mainapp.modules.employee.dto.EmployeeDTO;
import com.inqlusiv.mainapp.modules.employee.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    private Long extractCompanyId(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid token");
        }
        String cleanToken = token.replace("Bearer ", "");
        if (!cleanToken.startsWith("mock-jwt-token-")) {
            throw new RuntimeException("Invalid mock token");
        }
        return Long.parseLong(cleanToken.replace("mock-jwt-token-", ""));
    }

    @GetMapping
    public ResponseEntity<Page<EmployeeDTO>> getAllEmployees(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false, defaultValue = "basic") String scope,
            Pageable pageable) {
        Long companyId = extractCompanyId(token);
        return ResponseEntity.ok(employeeService.getAllEmployees(companyId, search, departmentId, scope, pageable));
    }

    @PostMapping
    public ResponseEntity<EmployeeDTO> createEmployee(
            @RequestHeader("Authorization") String token,
            @RequestBody EmployeeDTO dto) {
        Long companyId = extractCompanyId(token);
        return ResponseEntity.ok(employeeService.createEmployee(companyId, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDTO> updateEmployee(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody EmployeeDTO dto) {
        Long companyId = extractCompanyId(token);
        return ResponseEntity.ok(employeeService.updateEmployee(companyId, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        Long companyId = extractCompanyId(token);
        employeeService.deleteEmployee(companyId, id);
        return ResponseEntity.ok().build();
    }
}
