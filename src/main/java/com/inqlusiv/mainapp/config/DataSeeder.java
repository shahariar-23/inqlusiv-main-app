package com.inqlusiv.mainapp.config;

import com.inqlusiv.mainapp.modules.auth.entity.Role;
import com.inqlusiv.mainapp.modules.auth.entity.User;
import com.inqlusiv.mainapp.modules.auth.repository.UserRepository;
import com.inqlusiv.mainapp.modules.company.entity.Company;
import com.inqlusiv.mainapp.modules.company.entity.Department;
import com.inqlusiv.mainapp.modules.company.entity.SetupStatus;
import com.inqlusiv.mainapp.modules.company.repository.CompanyRepository;
import com.inqlusiv.mainapp.modules.company.repository.DepartmentRepository;
import com.inqlusiv.mainapp.modules.employee.entity.Employee;
import com.inqlusiv.mainapp.modules.employee.entity.EmployeeStatus;
import com.inqlusiv.mainapp.modules.employee.repository.EmployeeRepository;
import com.inqlusiv.mainapp.modules.goals.repository.GoalRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final GoalRepository goalRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, 
                      CompanyRepository companyRepository, 
                      DepartmentRepository departmentRepository,
                      GoalRepository goalRepository,
                      EmployeeRepository employeeRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.goalRepository = goalRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
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
        Department marketing = getOrCreateDepartment(company, "Marketing");

        // 3. Create Users
        String defaultPassword = passwordEncoder.encode("password");

        createUser("admin@test.com", "Admin User", defaultPassword, Role.COMPANY_ADMIN, company, null);
        createUser("hr@test.com", "HR Manager", defaultPassword, Role.HR_MANAGER, company, hrDept);
        createUser("manager@test.com", "Eng Manager", defaultPassword, Role.DEPT_MANAGER, company, engineering);
        
        // Create Employees distributed across departments
        createUser("emp1@test.com", "Eng Employee 1", defaultPassword, Role.EMPLOYEE, company, engineering);
        createEmployee("emp1@test.com", "Eng", "Employee 1", "Software Engineer", engineering, company);

        createUser("emp2@test.com", "Eng Employee 2", defaultPassword, Role.EMPLOYEE, company, engineering);
        createEmployee("emp2@test.com", "Eng", "Employee 2", "Senior Engineer", engineering, company);

        createUser("emp3@test.com", "Mkt Employee 1", defaultPassword, Role.EMPLOYEE, company, marketing);
        createEmployee("emp3@test.com", "Mkt", "Employee 1", "Marketing Specialist", marketing, company);

        createUser("emp4@test.com", "Mkt Employee 2", defaultPassword, Role.EMPLOYEE, company, marketing);
        createEmployee("emp4@test.com", "Mkt", "Employee 2", "Content Writer", marketing, company);

        createUser("emp5@test.com", "Sales Employee 1", defaultPassword, Role.EMPLOYEE, company, sales);
        createEmployee("emp5@test.com", "Sales", "Employee 1", "Sales Representative", sales, company);

        // 4. Create Goals
        // Clear existing goals for a fresh start
        // goalRepository.deleteAll();
        // System.out.println("Cleared all goals for fresh start");

        System.out.println("--- Data Seeding Completed ---");
        System.out.println("Admin: admin@test.com / password");
        System.out.println("Manager: manager@test.com / password");
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

    private void createUser(String email, String fullName, String password, Role role, Company company, Department dept) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            // Update existing user to ensure correct data
            user.setFullName(fullName);
            user.setRole(role);
            user.setCompanyId(company.getId());
            user.setDepartmentId(dept != null ? dept.getId() : null);
            user.setIsActive(true);
            System.out.println("Updated user: " + email);
        } else {
            user = User.builder()
                    .email(email)
                    .fullName(fullName)
                    .password(password)
                    .role(role)
                    .companyId(company.getId())
                    .departmentId(dept != null ? dept.getId() : null)
                    .isActive(true)
                    .build();
            System.out.println("Created user: " + email);
        }
        userRepository.save(user);
    }

    private void createEmployee(String email, String firstName, String lastName, String jobTitle, Department dept, Company company) {
        if (employeeRepository.existsByEmail(email)) {
            return;
        }
        
        Employee employee = Employee.builder()
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .jobTitle(jobTitle)
                .department(dept)
                .company(company)
                .status(EmployeeStatus.ACTIVE)
                .startDate(LocalDate.now().minusMonths(1))
                .build();
        
        employeeRepository.save(employee);
        System.out.println("Created employee: " + email);
    }
}
