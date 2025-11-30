package com.inqlusiv.mainapp.modules.dashboard.service;

import com.inqlusiv.mainapp.modules.company.repository.DepartmentRepository;
import com.inqlusiv.mainapp.modules.dashboard.dto.DashboardStatsDTO;
import com.inqlusiv.mainapp.modules.employee.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    public DashboardStatsDTO getDashboardStats(Long companyId) {
        long totalEmployees = employeeRepository.countByCompanyId(companyId);
        long totalDepartments = departmentRepository.countByCompanyId(companyId);

        List<Object[]> genderStats = employeeRepository.countEmployeesByGender(companyId);
        Map<String, Long> genderDistribution = new HashMap<>();
        for (Object[] result : genderStats) {
            String gender = (String) result[0];
            Long count = (Long) result[1];
            if (gender != null) {
                genderDistribution.put(gender, count);
            }
        }

        List<Object[]> deptStats = employeeRepository.countEmployeesByDepartment(companyId);
        Map<String, Long> departmentHeadcount = new HashMap<>();
        for (Object[] result : deptStats) {
            String deptName = (String) result[0];
            Long count = (Long) result[1];
            if (deptName != null) {
                departmentHeadcount.put(deptName, count);
            }
        }

        // Mock recent activities for now
        List<String> recentActivities = List.of(
            "New employee added: Sarah Jenkins (Engineering)",
            "Q3 Engagement Survey completed",
            "Department headcount updated for Sales",
            "System maintenance scheduled"
        );

        return DashboardStatsDTO.builder()
                .totalEmployees(totalEmployees)
                .totalDepartments(totalDepartments)
                .genderDistribution(genderDistribution)
                .departmentHeadcount(departmentHeadcount)
                .recentActivities(recentActivities)
                .build();
    }
}
