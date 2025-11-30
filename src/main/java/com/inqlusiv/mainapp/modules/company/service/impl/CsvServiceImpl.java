package com.inqlusiv.mainapp.modules.company.service.impl;

import com.inqlusiv.mainapp.modules.company.entity.Company;
import com.inqlusiv.mainapp.modules.company.service.CsvService;
import com.inqlusiv.mainapp.modules.employee.entity.Employee;
import com.inqlusiv.mainapp.modules.employee.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import com.inqlusiv.mainapp.modules.company.entity.Department;
import com.inqlusiv.mainapp.modules.company.repository.DepartmentRepository;

@Service
public class CsvServiceImpl implements CsvService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    public void saveEmployees(MultipartFile file, Company company) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<Employee> employees = new ArrayList<>();
            String line;
            
            // Cache departments to avoid repeated DB lookups
            java.util.Map<String, Department> deptMap = new java.util.HashMap<>();
            if (company.getDepartments() != null) {
                for (Department d : company.getDepartments()) {
                    deptMap.put(d.getName().toLowerCase(), d);
                }
            }

            // Header mapping
            java.util.Map<String, Integer> headerMap = new java.util.HashMap<>();
            boolean isHeader = true;
            
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;

                String[] data = line.split(",");
                
                if (isHeader) {
                    for (int i = 0; i < data.length; i++) {
                        headerMap.put(data[i].trim().toLowerCase(), i);
                    }
                    isHeader = false;
                    continue;
                }
                
                // Helper to safely get value by column name
                java.util.function.BiFunction<String, String, String> getValue = (colName, defaultValue) -> {
                    Integer index = headerMap.get(colName.toLowerCase());
                    if (index != null && index < data.length) {
                        return data[index].trim();
                    }
                    return defaultValue;
                };

                // Fallback for legacy/no-header files (assuming new 8-col format if headers missing or weird)
                // But if headers exist, we use them.
                
                String firstName = getValue.apply("firstname", data.length > 0 ? data[0].trim() : "");
                String lastName = getValue.apply("lastname", data.length > 1 ? data[1].trim() : "");
                String email = getValue.apply("email", data.length > 2 ? data[2].trim() : "");
                String jobTitle = getValue.apply("jobtitle", data.length > 3 ? data[3].trim() : "");
                
                // Smart detection for Department vs Gender if headers are missing or ambiguous
                // But relying on headers is best.
                String deptName = getValue.apply("department", null);
                String gender = getValue.apply("gender", "Prefer not to say");
                
                // Fallback logic if headers weren't found (e.g. file has no headers or different names)
                if (headerMap.isEmpty()) {
                     // Assume new format: 0:First, 1:Last, 2:Email, 3:Job, 4:Dept, 5:Gender
                     deptName = data.length > 4 ? data[4].trim() : null;
                     gender = data.length > 5 ? data[5].trim() : "Prefer not to say";
                }

                String startDateStr = getValue.apply("startdate", "");
                String location = getValue.apply("location", "");

                // Legacy fallback for StartDate/Location if using positional
                if (headerMap.isEmpty()) {
                    startDateStr = data.length > 6 ? data[6].trim() : "";
                    location = data.length > 7 ? data[7].trim() : "";
                }

                java.time.LocalDate startDate = null;
                if (!startDateStr.isEmpty()) {
                    try {
                        startDate = java.time.LocalDate.parse(startDateStr);
                    } catch (java.time.format.DateTimeParseException e) {
                        // Log or ignore invalid date
                    }
                }

                Department department = null;
                if (deptName != null && !deptName.isEmpty()) {
                    department = deptMap.get(deptName.toLowerCase());
                    if (department == null) {
                        // Create new department if it doesn't exist
                        Department newDept = Department.builder()
                                .name(deptName)
                                .company(company)
                                .build();
                        department = departmentRepository.save(newDept);
                        deptMap.put(deptName.toLowerCase(), department);
                    }
                }

                Employee employee = Employee.builder()
                        .firstName(firstName)
                        .lastName(lastName)
                        .email(email)
                        .jobTitle(jobTitle)
                        .gender(gender)
                        .startDate(startDate)
                        .location(location)
                        .department(department)
                        .company(company)
                        .build();
                employees.add(employee);
            }
            
            if (!employees.isEmpty()) {
                employeeRepository.saveAll(employees);
            }
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
        }
    }
}
