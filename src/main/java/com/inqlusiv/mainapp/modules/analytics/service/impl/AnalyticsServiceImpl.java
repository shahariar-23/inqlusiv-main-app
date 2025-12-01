package com.inqlusiv.mainapp.modules.analytics.service.impl;

import com.inqlusiv.mainapp.modules.analytics.dto.AnalyticsResponseDTO;
import com.inqlusiv.mainapp.modules.analytics.service.AnalyticsService;
import com.inqlusiv.mainapp.modules.employee.entity.Employee;
import com.inqlusiv.mainapp.modules.employee.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public AnalyticsResponseDTO getAdvancedAnalytics(Long companyId, Long departmentId) {
        List<Employee> employees;
        if (departmentId != null) {
            employees = employeeRepository.findByCompanyIdAndDepartmentId(companyId, departmentId);
        } else {
            employees = employeeRepository.findByCompanyId(companyId);
        }

        return AnalyticsResponseDTO.builder()
                .headcountTrends(calculateHeadcountTrends(employees))
                .tenureDistribution(calculateTenureDistribution(employees))
                .genderDistribution(calculateGenderDistribution(employees))
                .build();
    }

    private List<AnalyticsResponseDTO.HeadcountTrendDTO> calculateHeadcountTrends(List<Employee> employees) {
        List<AnalyticsResponseDTO.HeadcountTrendDTO> trends = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();

        // Last 6 months including current
        for (int i = 5; i >= 0; i--) {
            YearMonth targetMonth = currentMonth.minusMonths(i);
            LocalDate endOfMonth = targetMonth.atEndOfMonth();
            
            long count = employees.stream().filter(e -> {
                LocalDate start = e.getStartDate();
                LocalDate exit = e.getExitDate();
                
                // Active if started before or on end of month AND (still active OR exited after end of month)
                boolean started = start != null && !start.isAfter(endOfMonth);
                boolean notExited = exit == null || exit.isAfter(endOfMonth);
                
                return started && notExited;
            }).count();

            trends.add(AnalyticsResponseDTO.HeadcountTrendDTO.builder()
                    .month(targetMonth.format(DateTimeFormatter.ofPattern("MMM yyyy")))
                    .count(count)
                    .build());
        }
        return trends;
    }

    private Map<String, Long> calculateTenureDistribution(List<Employee> employees) {
        Map<String, Long> distribution = new HashMap<>();
        distribution.put("< 1 Year", 0L);
        distribution.put("1-3 Years", 0L);
        distribution.put("3-5 Years", 0L);
        distribution.put("5+ Years", 0L);

        LocalDate now = LocalDate.now();

        for (Employee e : employees) {
            if (e.getStartDate() != null && (e.getExitDate() == null || e.getExitDate().isAfter(now))) {
                long years = ChronoUnit.YEARS.between(e.getStartDate(), now);
                
                if (years < 1) {
                    distribution.put("< 1 Year", distribution.get("< 1 Year") + 1);
                } else if (years < 3) {
                    distribution.put("1-3 Years", distribution.get("1-3 Years") + 1);
                } else if (years < 5) {
                    distribution.put("3-5 Years", distribution.get("3-5 Years") + 1);
                } else {
                    distribution.put("5+ Years", distribution.get("5+ Years") + 1);
                }
            }
        }
        return distribution;
    }

    private Map<String, Long> calculateGenderDistribution(List<Employee> employees) {
        return employees.stream()
                .filter(e -> e.getGender() != null)
                .collect(Collectors.groupingBy(Employee::getGender, Collectors.counting()));
    }
}
