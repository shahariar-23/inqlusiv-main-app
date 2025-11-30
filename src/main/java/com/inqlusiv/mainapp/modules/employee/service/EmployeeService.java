package com.inqlusiv.mainapp.modules.employee.service;

import com.inqlusiv.mainapp.modules.company.entity.Company;
import com.inqlusiv.mainapp.modules.company.entity.Department;
import com.inqlusiv.mainapp.modules.company.repository.CompanyRepository;
import com.inqlusiv.mainapp.modules.company.repository.DepartmentRepository;
import com.inqlusiv.mainapp.modules.employee.dto.EmployeeDTO;
import com.inqlusiv.mainapp.modules.employee.entity.Employee;
import com.inqlusiv.mainapp.modules.employee.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    public Page<EmployeeDTO> getAllEmployees(Long companyId, String search, Long departmentId, String scope, Pageable pageable) {
        Page<Employee> employees;
        if (search != null && !search.trim().isEmpty()) {
            if ("global".equalsIgnoreCase(scope)) {
                employees = employeeRepository.searchByCompanyIdGlobal(companyId, search, pageable);
            } else {
                employees = employeeRepository.searchByCompanyId(companyId, search, pageable);
            }
        } else if (departmentId != null) {
            employees = employeeRepository.findByCompanyIdAndDepartmentId(companyId, departmentId, pageable);
        } else {
            employees = employeeRepository.findByCompanyId(companyId, pageable);
        }
        return employees.map(this::convertToDTO);
    }

    @Transactional
    public EmployeeDTO createEmployee(Long companyId, EmployeeDTO dto) {
        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Department department = null;
        if (dto.getDepartmentId() != null) {
            department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
        }

        Employee employee = Employee.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .jobTitle(dto.getJobTitle())
                .gender(dto.getGender())
                .startDate(dto.getStartDate())
                .location(dto.getLocation())
                .company(company)
                .department(department)
                .build();

        Employee saved = employeeRepository.save(employee);
        return convertToDTO(saved);
    }

    @Transactional
    public EmployeeDTO updateEmployee(Long companyId, Long id, EmployeeDTO dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("Unauthorized access to employee");
        }

        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setJobTitle(dto.getJobTitle());
        employee.setGender(dto.getGender());
        employee.setStartDate(dto.getStartDate());
        employee.setLocation(dto.getLocation());

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            employee.setDepartment(department);
        } else {
            employee.setDepartment(null);
        }

        Employee saved = employeeRepository.save(employee);
        return convertToDTO(saved);
    }

    @Transactional
    public void deleteEmployee(Long companyId, Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("Unauthorized access to employee");
        }

        employeeRepository.delete(employee);
    }

    private EmployeeDTO convertToDTO(Employee employee) {
        return EmployeeDTO.builder()
                .id(employee.getId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .jobTitle(employee.getJobTitle())
                .gender(employee.getGender())
                .startDate(employee.getStartDate())
                .location(employee.getLocation())
                .departmentId(employee.getDepartment() != null ? employee.getDepartment().getId() : null)
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .build();
    }
}
