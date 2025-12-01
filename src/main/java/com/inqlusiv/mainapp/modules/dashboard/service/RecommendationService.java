package com.inqlusiv.mainapp.modules.dashboard.service;

import com.inqlusiv.mainapp.modules.dashboard.dto.DashboardStatsDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RecommendationService {

    private static final List<String> GENERAL_TIPS = List.of(
            "Regular 1:1 meetings increase employee retention by up to 30%.",
            "Diverse teams are 35% more likely to outperform their competitors.",
            "Use the 'Departments' tab to balance headcount across teams.",
            "Schedule quarterly reviews to keep alignment with company goals.",
            "Check the 'Analytics' page for deep dives into tenure trends.",
            "Recognize employee achievements publicly to boost morale.",
            "Ensure job descriptions use inclusive language to attract diverse talent.",
            "Promote internal mobility to keep high performers engaged."
    );

    public List<String> generateSmartTips(DashboardStatsDTO stats) {
        List<String> tips = new ArrayList<>();

        if (stats == null) {
            return new ArrayList<>(GENERAL_TIPS);
        }

        analyzeStructuralBalance(stats, tips);
        analyzeHrSupportRatio(stats, tips);
        analyzeDiversityMetrics(stats, tips);
        analyzeRetention(stats, tips);
        analyzeGrowthStage(stats, tips);
        analyzeSentiment(stats, tips);

        // Fill with general tips if we don't have enough specific ones
        if (tips.size() < 5) {
            for (String generalTip : GENERAL_TIPS) {
                if (!tips.contains(generalTip)) {
                    tips.add(generalTip);
                }
                if (tips.size() >= 8) break; // Cap at 8 total tips
            }
        }

        return tips;
    }

    private void analyzeStructuralBalance(DashboardStatsDTO stats, List<String> tips) {
        long totalEmployees = stats.getTotalEmployees();
        long totalDepartments = stats.getTotalDepartments();

        if (totalDepartments == 0) return;

        long avgTeamSize = totalEmployees / totalDepartments;

        if (avgTeamSize > 12) {
            tips.add(String.format("Management Alert: Average team size is **%d**. Consider splitting departments to maintain agility.", avgTeamSize));
        } else if (avgTeamSize > 0 && avgTeamSize < 3) {
            tips.add(String.format("Structure Alert: You have many micro-teams (Avg size: **%d**). Ensure this isn't creating silos.", avgTeamSize));
        }
    }

    private void analyzeHrSupportRatio(DashboardStatsDTO stats, List<String> tips) {
        Map<String, Long> deptHeadcount = stats.getDepartmentHeadcount();
        if (deptHeadcount == null) return;

        long hrCount = 0;
        for (Map.Entry<String, Long> entry : deptHeadcount.entrySet()) {
            String deptName = entry.getKey().toLowerCase();
            if (deptName.contains("hr") || deptName.contains("people") || deptName.contains("human resources")) {
                hrCount += entry.getValue();
            }
        }

        long totalEmployees = stats.getTotalEmployees();
        if (hrCount > 0) {
            long ratio = totalEmployees / hrCount;
            if (ratio > 50) {
                tips.add(String.format("Burnout Risk: You have 1 HR pro for every **%d** employees. Industry standard is 1:40.", ratio));
            }
        }
    }

    private void analyzeDiversityMetrics(DashboardStatsDTO stats, List<String> tips) {
        Map<String, Long> genderDist = stats.getGenderDistribution();
        if (genderDist == null) return;

        long totalEmployees = stats.getTotalEmployees();
        if (totalEmployees == 0) return;

        long femaleCount = genderDist.getOrDefault("Female", 0L);
        long nonBinaryCount = genderDist.getOrDefault("Non-binary", 0L) + genderDist.getOrDefault("Prefer not to say", 0L);

        double femalePercentage = (double) femaleCount / totalEmployees;

        if (femaleCount > 0 && femalePercentage < 0.3) {
            tips.add(String.format("Diversity Gap: Women make up only **%.1f%%** of your workforce. Review your hiring pipeline.", femalePercentage * 100));
        }

        if (nonBinaryCount == 0) {
            tips.add("Inclusion Check: 0% Non-binary representation. Ensure your application forms are gender-inclusive.");
        }
    }

    private void analyzeRetention(DashboardStatsDTO stats, List<String> tips) {
        String retentionStr = stats.getRetentionRate();
        if (retentionStr == null) return;

        try {
            // Remove % and parse
            double retention = Double.parseDouble(retentionStr.replace("%", "").trim());

            if (retention < 85.0) {
                tips.add(String.format("Critical: Retention is at **%.1f%%**. It is cheaper to retain than to hire. Schedule 'Stay Interviews' immediately.", retention));
            }
        } catch (NumberFormatException e) {
            // Ignore parsing errors
        }
    }

    private void analyzeGrowthStage(DashboardStatsDTO stats, List<String> tips) {
        long count = stats.getTotalEmployees();

        if (count > 0 && count < 15) {
            tips.add("Startup Phase: Focus on 'Culture Add' over 'Culture Fit' to build a diverse foundation.");
        } else if (count > 50 && count < 100) {
            tips.add("Dunbar's Number Alert: You are crossing 50 people. It is time to document your unwritten culture values.");
        }
    }

    private void analyzeSentiment(DashboardStatsDTO stats, List<String> tips) {
        Double sentiment = stats.getAverageSurveySentiment();

        if (sentiment == null) {
            tips.add("Data Gap: No recent survey data found. Launch a 'Pulse Survey' to gauge morale.");
            return;
        }

        if (sentiment < 3.0) {
            tips.add(String.format("Crisis Alert: Employee sentiment is low (**%.1f/5**). Host an All-Hands meeting to address concerns.", sentiment));
        } else if (sentiment > 4.5) {
            tips.add(String.format("High Morale: Sentiment is excellent (**%.1f/5**). Analyze what's working and standardize it.", sentiment));
        }
    }
}
