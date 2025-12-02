package com.inqlusiv.mainapp.modules.dashboard.service;

import com.inqlusiv.mainapp.modules.company.repository.DepartmentRepository;
import com.inqlusiv.mainapp.modules.dashboard.dto.DashboardStatsDTO;
import com.inqlusiv.mainapp.modules.employee.entity.EmployeeStatus;
import com.inqlusiv.mainapp.modules.employee.repository.EmployeeRepository;
import com.inqlusiv.mainapp.modules.survey.service.SurveyService;
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

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private SurveyService surveyService;

    public DashboardStatsDTO getStats(Long companyId) {
        return getStats(companyId, null);
    }

    public DashboardStatsDTO getStats(Long companyId, Long departmentId) {
        long activeCount;
        long onLeaveCount;
        long terminatedCount;
        long resignedCount;
        List<Object[]> genderStats;
        Map<String, Long> departmentHeadcount = new HashMap<>();
        long totalDepartments;

        if (departmentId != null) {
            activeCount = employeeRepository.countByDepartmentIdAndStatusOrNull(departmentId, EmployeeStatus.ACTIVE);
            onLeaveCount = employeeRepository.countByDepartmentIdAndStatus(departmentId, EmployeeStatus.ON_LEAVE);
            terminatedCount = employeeRepository.countByDepartmentIdAndStatus(departmentId, EmployeeStatus.TERMINATED);
            resignedCount = employeeRepository.countByDepartmentIdAndStatus(departmentId, EmployeeStatus.RESIGNED);
            genderStats = employeeRepository.countEmployeesByGenderAndDepartment(departmentId);
            
            departmentRepository.findById(departmentId).ifPresent(dept -> {
                departmentHeadcount.put(dept.getName(), activeCount + onLeaveCount);
            });
            totalDepartments = 1;
        } else {
            activeCount = employeeRepository.countByCompanyIdAndStatusOrNull(companyId, EmployeeStatus.ACTIVE);
            onLeaveCount = employeeRepository.countByCompanyIdAndStatus(companyId, EmployeeStatus.ON_LEAVE);
            terminatedCount = employeeRepository.countByCompanyIdAndStatus(companyId, EmployeeStatus.TERMINATED);
            resignedCount = employeeRepository.countByCompanyIdAndStatus(companyId, EmployeeStatus.RESIGNED);
            genderStats = employeeRepository.countEmployeesByGender(companyId);
            
            List<Object[]> deptStats = employeeRepository.countEmployeesByDepartment(companyId);
            for (Object[] result : deptStats) {
                String deptName = (String) result[0];
                Long count = (Long) result[1];
                if (deptName != null) {
                    departmentHeadcount.put(deptName, count);
                }
            }
            totalDepartments = departmentRepository.countByCompanyId(companyId);
        }

        long currentHeadcount = activeCount + onLeaveCount;
        long totalHistory = currentHeadcount + terminatedCount + resignedCount;
        
        String retentionRate = "100%";
        if (totalHistory > 0) {
            double rate = ((double) currentHeadcount / totalHistory) * 100;
            retentionRate = String.format("%.1f%%", rate);
        }

        Map<String, Long> genderDistribution = new HashMap<>();
        for (Object[] result : genderStats) {
            String gender = (String) result[0];
            Long count = (Long) result[1];
            if (gender != null) {
                genderDistribution.put(gender, count);
            }
        }

        // Mock recent activities for now
        List<String> recentActivities = List.of(
            "New employee added: Sarah Jenkins (Engineering)",
            "Q3 Engagement Survey completed",
            "Department headcount updated for Sales",
            "System maintenance scheduled"
        );

        Double sentimentScore = surveyService.getCompanySentimentScore(companyId);

        DashboardStatsDTO stats = DashboardStatsDTO.builder()
                .totalEmployees(currentHeadcount)
                .totalDepartments(totalDepartments)
                .genderDistribution(genderDistribution)
                .departmentHeadcount(departmentHeadcount)
                .openRoles(0L) // Placeholder: No Job Openings module yet
                .retentionRate(retentionRate)
                .averageSurveySentiment(sentimentScore)
                .recentActivities(recentActivities)
                .build();

        stats.setTips(recommendationService.generateSmartTips(stats));

        return stats;
    }
}
