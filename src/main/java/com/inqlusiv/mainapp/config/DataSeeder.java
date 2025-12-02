package com.inqlusiv.mainapp.config;

import com.inqlusiv.mainapp.modules.auth.entity.Role;
import com.inqlusiv.mainapp.modules.auth.entity.User;
import com.inqlusiv.mainapp.modules.auth.repository.UserRepository;
import com.inqlusiv.mainapp.modules.company.entity.Company;
import com.inqlusiv.mainapp.modules.company.entity.Department;
import com.inqlusiv.mainapp.modules.company.entity.SetupStatus;
import com.inqlusiv.mainapp.modules.company.repository.CompanyRepository;
import com.inqlusiv.mainapp.modules.company.repository.DepartmentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, 
                      CompanyRepository companyRepository, 
                      DepartmentRepository departmentRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Always run seedData. It has internal checks to avoid duplicates.
        seedData();
    }

    private void seedData() {
        System.out.println("--- Seeding Data ---");

        // 1. Get or Create Company
        Company company;
        if (companyRepository.count() > 0) {
            company = companyRepository.findAll().get(0);
            System.out.println("Using existing company: " + company.getName());
        } else {
            company = Company.builder()
                    .name("Inqlusiv Demo Corp")
                    .email("admin@inqlusiv.com")
                    .password(passwordEncoder.encode("password"))
                    .industry("Technology")
                    .region("North America")
                    .setupStatus(SetupStatus.COMPLETE)
                    .build();
            company = companyRepository.save(company);
            System.out.println("Created new company: " + company.getName());
        }

        // 2. Get or Create Departments
        Department engineering = getOrCreateDepartment(company, "Engineering");
        Department hrDept = getOrCreateDepartment(company, "Human Resources");
        Department sales = getOrCreateDepartment(company, "Sales");

        // 3. Create Users
        String defaultPassword = passwordEncoder.encode("password");

        // createUser("admin@test.com", defaultPassword, Role.COMPANY_ADMIN, company, null);
        // createUser("hr@test.com", defaultPassword, Role.HR_MANAGER, company, hrDept);
        // createUser("manager@test.com", defaultPassword, Role.DEPT_MANAGER, company, engineering);
        // createUser("employee@test.com", defaultPassword, Role.EMPLOYEE, company, engineering);

        System.out.println("--- Data Seeding Completed ---");
        // System.out.println("Admin: admin@test.com / password");
        // System.out.println("HR: hr@test.com / password");
        // System.out.println("Manager: manager@test.com / password");
        // System.out.println("Employee: employee@test.com / password");
    }

    private Department getOrCreateDepartment(Company company, String name) {
        List<Department> departments = departmentRepository.findByCompanyId(company.getId());
        
        Optional<Department> existing = departments.stream()
            .filter(d -> d.getName().equalsIgnoreCase(name))
            .findFirst();
            
        if (existing.isPresent()) {
            return existing.get();
        }
        
        Department dept = Department.builder()
                .name(name)
                .company(company)
                .build();
        return departmentRepository.save(dept);
    }

    private void createUser(String email, String password, Role role, Company company, Department dept) {
        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }
        
        User user = User.builder()
                .email(email)
                .password(password)
                .role(role)
                .companyId(company.getId())
                .departmentId(dept != null ? dept.getId() : null)
                .build();
        userRepository.save(user);
    }
}
