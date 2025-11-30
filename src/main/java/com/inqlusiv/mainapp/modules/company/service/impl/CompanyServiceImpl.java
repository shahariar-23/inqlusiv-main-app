package com.inqlusiv.mainapp.modules.company.service.impl;

import com.inqlusiv.mainapp.modules.company.dto.CompanySetupRequest;
import com.inqlusiv.mainapp.modules.company.entity.Company;
import com.inqlusiv.mainapp.modules.company.entity.CompanySettings;
import com.inqlusiv.mainapp.modules.company.entity.Department;
import com.inqlusiv.mainapp.modules.company.entity.SetupStatus;
import com.inqlusiv.mainapp.modules.company.repository.CompanyRepository;
import com.inqlusiv.mainapp.modules.company.service.CompanyService;
import com.inqlusiv.mainapp.modules.employee.entity.Employee;
import com.inqlusiv.mainapp.modules.employee.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyServiceImpl implements CompanyService {

    @Autowired
    private CompanyRepository companyRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public void setupCompany(Long companyId, CompanySetupRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Update Company Details
        company.setName(request.getCompanyName());
        company.setIndustry(request.getIndustry());
        company.setRegion(request.getRegion());
        company.setSetupStatus(SetupStatus.COMPLETE);

        // Create Settings
        CompanySettings settings = CompanySettings.builder()
                .notificationsEnabled(request.getPreferences().isNotifications())
                .analyticsEnabled(request.getPreferences().isAnalytics())
                .autoInviteEnabled(request.getPreferences().isAutoInvite())
                .selectedMetrics(request.getSelectedMetrics())
                .company(company)
                .build();
        company.setSettings(settings);

        // Create Departments
        if (request.getDepartments() != null) {
            List<Department> departments = request.getDepartments().stream()
                    .map(deptName -> Department.builder()
                            .name(deptName)
                            .company(company)
                            .build())
                    .collect(Collectors.toList());
            company.getDepartments().clear();
            company.getDepartments().addAll(departments);
        }

        // Create Admin as Employee
        // Check if admin already exists globally (since email is unique)
        boolean adminExists = employeeRepository.existsByEmail(request.getAdminEmail());

        if (!adminExists) {
            // Simple name split logic
            String[] names = request.getAdminName().split(" ", 2);
            String firstName = names[0];
            String lastName = names.length > 1 ? names[1] : "";

            Employee admin = Employee.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(request.getAdminEmail())
                    .jobTitle(request.getAdminTitle())
                    .company(company)
                    .build();
            
            company.getEmployees().add(admin);
        } else {
            // If admin exists but belongs to this company, update details
            // If belongs to another company, we might have a conflict, but for now let's just update if it's ours
            company.getEmployees().stream()
                .filter(e -> e.getEmail().equalsIgnoreCase(request.getAdminEmail()))
                .findFirst()
                .ifPresent(admin -> {
                    String[] names = request.getAdminName().split(" ", 2);
                    admin.setFirstName(names[0]);
                    admin.setLastName(names.length > 1 ? names[1] : "");
                    admin.setJobTitle(request.getAdminTitle());
                });
        }

        companyRepository.save(company);
    }
}
