package com.inqlusiv.mainapp.modules.company.service.impl;

import com.inqlusiv.mainapp.modules.company.dto.CompanySettingsDTO;
import com.inqlusiv.mainapp.modules.company.dto.CompanySetupRequest;
import com.inqlusiv.mainapp.modules.company.entity.Company;
import com.inqlusiv.mainapp.modules.company.entity.CompanySettings;
import com.inqlusiv.mainapp.modules.company.entity.CompanyUser;
import com.inqlusiv.mainapp.modules.company.entity.Department;
import com.inqlusiv.mainapp.modules.company.entity.SetupStatus;
import com.inqlusiv.mainapp.modules.company.repository.CompanyRepository;
import com.inqlusiv.mainapp.modules.company.repository.CompanyUserRepository;
import com.inqlusiv.mainapp.modules.company.service.CompanyService;
import com.inqlusiv.mainapp.modules.employee.entity.Employee;
import com.inqlusiv.mainapp.modules.employee.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class CompanyServiceImpl implements CompanyService {

    @Autowired
    private CompanyRepository companyRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CompanyUserRepository companyUserRepository;

    @PersistenceContext
    private EntityManager entityManager;

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

    @Override
    @Transactional
    public void resetCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        company.setSetupStatus(SetupStatus.INCOMPLETE);
        
        // Clear existing data
        company.getEmployees().clear();
        company.getDepartments().clear();
        
        // Force flush to ensure deletes are executed before we try to reset auto_increment
        companyRepository.saveAndFlush(company);
        
        // Attempt to reset auto_increment if possible (Best effort)
        // This will only work if we deleted the latest rows.
        try {
            // We need to check if there are ANY employees left in the table.
            // If the table is empty, we can reset to 1.
            // If not, we reset to MAX(id) + 1.
            
            Long maxId = (Long) entityManager.createNativeQuery("SELECT MAX(id) FROM employees").getSingleResult();
            long nextId = (maxId == null) ? 1 : maxId + 1;
            entityManager.createNativeQuery("ALTER TABLE employees AUTO_INCREMENT = " + nextId).executeUpdate();
            
            Long maxDeptId = (Long) entityManager.createNativeQuery("SELECT MAX(id) FROM departments").getSingleResult();
            long nextDeptId = (maxDeptId == null) ? 1 : maxDeptId + 1;
            entityManager.createNativeQuery("ALTER TABLE departments AUTO_INCREMENT = " + nextDeptId).executeUpdate();
            
        } catch (Exception e) {
            // Ignore if we can't reset auto_increment (e.g. permissions)
            System.err.println("Could not reset AUTO_INCREMENT: " + e.getMessage());
        }
    }

    @Override
    public CompanySettingsDTO getCompanySettings(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        List<CompanyUser> admins = companyUserRepository.findByCompanyId(companyId);
        List<CompanySettingsDTO.AdminUserDTO> adminDTOs = admins.stream()
                .map(admin -> CompanySettingsDTO.AdminUserDTO.builder()
                        .id(admin.getId())
                        .fullName(admin.getFullName())
                        .email(admin.getEmail())
                        .role(admin.getRole())
                        .status(admin.getStatus())
                        .lastActive(admin.getLastActive() != null ? admin.getLastActive().toString() : "Never")
                        .build())
                .collect(Collectors.toList());

        return CompanySettingsDTO.builder()
                .companyName(company.getName())
                .industry(company.getIndustry())
                .logoUrl(company.getLogoUrl())
                .admins(adminDTOs)
                .build();
    }

    @Override
    @Transactional
    public void updateCompanySettings(Long companyId, CompanySettingsDTO settingsDTO) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (settingsDTO.getCompanyName() != null) {
            company.setName(settingsDTO.getCompanyName());
        }
        if (settingsDTO.getIndustry() != null) {
            company.setIndustry(settingsDTO.getIndustry());
        }
        
        companyRepository.save(company);
    }

    @Override
    @Transactional
    public String updateCompanyLogo(Long companyId, MultipartFile file) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // In a real app, upload to S3/Cloudinary. Here we mock it.
        String encodedName = URLEncoder.encode(company.getName(), StandardCharsets.UTF_8);
        String mockUrl = "https://ui-avatars.com/api/?name=" + encodedName + "&background=random";
        
        // If we could actually save the file, we would do it here.
        // For now, let's just pretend we did and return a generated avatar based on the name.
        
        company.setLogoUrl(mockUrl);
        companyRepository.save(company);
        
        return mockUrl;
    }

    @Override
    @Transactional
    public void inviteAdmin(Long companyId, String email, String role, String fullName) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (companyUserRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        CompanyUser newAdmin = CompanyUser.builder()
                .email(email)
                .role(role)
                .company(company)
                .status("Pending") // Invite sent
                .fullName(fullName != null && !fullName.isEmpty() ? fullName : "Invited User")
                .build();

        companyUserRepository.save(newAdmin);
        
        // In a real app, send email here.
    }

    @Override
    @Transactional
    public void updateAdminUser(Long companyId, Long userId, String role, String status) {
        CompanyUser user = companyUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("User does not belong to this company");
        }

        if (role != null) {
            user.setRole(role);
        }
        if (status != null) {
            user.setStatus(status);
        }
        
        companyUserRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteAdminUser(Long companyId, Long userId) {
        CompanyUser user = companyUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("User does not belong to this company");
        }

        companyUserRepository.delete(user);
    }
}
