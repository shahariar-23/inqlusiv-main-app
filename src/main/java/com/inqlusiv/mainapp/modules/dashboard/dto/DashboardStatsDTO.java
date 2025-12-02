package com.inqlusiv.mainapp.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalEmployees;
    private long totalDepartments;
    private Map<String, Long> genderDistribution;
    private Map<String, Long> departmentHeadcount;
    private long openRoles;
    private String retentionRate;
    private Double averageSurveySentiment;
    private List<String> recentActivities;
    private List<String> tips;
    private List<String> smartTips;
    private List<Map<String, Object>> headcountTrend;
}
