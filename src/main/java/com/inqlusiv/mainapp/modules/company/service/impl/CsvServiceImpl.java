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

@Service
public class CsvServiceImpl implements CsvService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public void saveEmployees(MultipartFile file, Company company) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<Employee> employees = new ArrayList<>();
            String line;
            boolean isHeader = true;
            
            while ((line = reader.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }
                
                String[] data = line.split(",");
                if (data.length >= 3) {
                    // Assuming CSV format: FirstName, LastName, Email, JobTitle, Gender
                    String firstName = data[0].trim();
                    String lastName = data.length > 1 ? data[1].trim() : "";
                    String email = data.length > 2 ? data[2].trim() : "";
                    String jobTitle = data.length > 3 ? data[3].trim() : "";
                    String gender = data.length > 4 ? data[4].trim() : "Prefer not to say";

                    Employee employee = Employee.builder()
                            .firstName(firstName)
                            .lastName(lastName)
                            .email(email)
                            .jobTitle(jobTitle)
                            .gender(gender)
                            .company(company)
                            .build();
                    employees.add(employee);
                }
            }
            
            if (!employees.isEmpty()) {
                employeeRepository.saveAll(employees);
            }
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
        }
    }
}
