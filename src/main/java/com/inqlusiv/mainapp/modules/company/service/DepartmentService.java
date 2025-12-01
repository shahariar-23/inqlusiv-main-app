package com.inqlusiv.mainapp.modules.company.service;

import com.inqlusiv.mainapp.modules.company.dto.DepartmentDTO;
import com.inqlusiv.mainapp.modules.company.entity.Company;
import com.inqlusiv.mainapp.modules.company.entity.Department;
import com.inqlusiv.mainapp.modules.company.repository.CompanyRepository;
import com.inqlusiv.mainapp.modules.company.repository.DepartmentRepository;
import com.inqlusiv.mainapp.modules.employee.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<DepartmentDTO> getAllDepartments(Long companyId) {
        List<Department> departments = departmentRepository.findByCompanyId(companyId);
        
        // Get counts
        List<Object[]> counts = employeeRepository.countEmployeesByDepartment(companyId);
        java.util.Map<String, Long> countMap = new java.util.HashMap<>();
        for (Object[] row : counts) {
            countMap.put((String) row[0], (Long) row[1]);
        }

        return departments.stream().map(dept -> DepartmentDTO.builder()
                .id(dept.getId())
                .name(dept.getName())
                .headcount(countMap.getOrDefault(dept.getName(), 0L))
                .build())
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public DepartmentDTO createDepartment(Long companyId, DepartmentDTO dto) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Department department = Department.builder()
                .name(dto.getName())
                .company(company)
                .build();

        Department saved = departmentRepository.save(department);
        return DepartmentDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .headcount(0L)
                .build();
    }

    @Transactional
    public DepartmentDTO updateDepartment(Long companyId, Long deptId, DepartmentDTO dto) {
        Department department = departmentRepository.findById(deptId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        if (!department.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("Unauthorized access to department");
        }

        department.setName(dto.getName());
        Department saved = departmentRepository.save(department);
        
        long headcount = employeeRepository.countByDepartmentId(saved.getId());

        return DepartmentDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .headcount(headcount)
                .build();
    }

    @Transactional
    public void deleteDepartment(Long companyId, Long deptId) {
        Department department = departmentRepository.findById(deptId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        if (!department.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("Unauthorized access to department");
        }

        long employeeCount = employeeRepository.countByDepartmentId(deptId);
        if (employeeCount > 0) {
            throw new RuntimeException("Cannot delete department with active employees. Move them first.");
        }

        departmentRepository.delete(department);
    }
}
