package com.inqlusiv.mainapp.modules.company.controller;

import com.inqlusiv.mainapp.modules.company.dto.DepartmentDTO;
import com.inqlusiv.mainapp.modules.company.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

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
    public ResponseEntity<List<DepartmentDTO>> getAllDepartments(@RequestHeader("Authorization") String token) {
        Long companyId = extractCompanyId(token);
        return ResponseEntity.ok(departmentService.getAllDepartments(companyId));
    }

    @PostMapping
    public ResponseEntity<DepartmentDTO> createDepartment(
            @RequestHeader("Authorization") String token,
            @RequestBody DepartmentDTO dto) {
        Long companyId = extractCompanyId(token);
        return ResponseEntity.ok(departmentService.createDepartment(companyId, dto));
    }
}
