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
        long activeCount = employeeRepository.countByCompanyIdAndStatusOrNull(companyId, EmployeeStatus.ACTIVE);
        long onLeaveCount = employeeRepository.countByCompanyIdAndStatus(companyId, EmployeeStatus.ON_LEAVE);
        long terminatedCount = employeeRepository.countByCompanyIdAndStatus(companyId, EmployeeStatus.TERMINATED);
        long resignedCount = employeeRepository.countByCompanyIdAndStatus(companyId, EmployeeStatus.RESIGNED);

        long currentHeadcount = activeCount + onLeaveCount;
        long totalHistory = currentHeadcount + terminatedCount + resignedCount;
        
        String retentionRate = "100%";
        if (totalHistory > 0) {
            double rate = ((double) currentHeadcount / totalHistory) * 100;
            retentionRate = String.format("%.1f%%", rate);
        }

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
