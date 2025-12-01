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
        analyzeMinorityRepresentation(stats, tips);
        analyzeHrSupportRatio(stats, tips);
        analyzeRetention(stats, tips);
        analyzeGrowthStage(stats, tips);

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
            tips.add(String.format("Your average team size is **%d**, which is high. Consider splitting large departments to maintain agility.", avgTeamSize));
        } else if (avgTeamSize > 0 && avgTeamSize < 3) {
            tips.add(String.format("You have many micro-teams (Avg size: **%d**). Ensure this isn't creating silos.", avgTeamSize));
        }
    }

    private void analyzeMinorityRepresentation(DashboardStatsDTO stats, List<String> tips) {
        Map<String, Long> genderDist = stats.getGenderDistribution();
        if (genderDist == null) return;

        long nonBinary = genderDist.getOrDefault("Non-binary", 0L) + genderDist.getOrDefault("Prefer not to say", 0L);
        if (nonBinary == 0) {
            tips.add("Your data shows 0% Non-binary representation. Review your survey forms—are gender options inclusive enough?");
        }

        long maleCount = genderDist.getOrDefault("Male", 0L);
        long totalEmployees = stats.getTotalEmployees();

        if (totalEmployees > 0) {
            double malePercentage = (double) maleCount / totalEmployees * 100;
            if (malePercentage > 70) {
                tips.add(String.format("The company is **%.1f%%** Male. Consider setting a specific OKR to increase gender diversity in Q3.", malePercentage));
            }
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
                tips.add(String.format("Ratio Alert: You have 1 HR pro for every **%d** employees. Industry standard is 1:40. Burnout risk is high.", ratio));
            }
        }
    }

    private void analyzeRetention(DashboardStatsDTO stats, List<String> tips) {
        String retentionStr = stats.getRetentionRate();
        if (retentionStr == null) return;

        try {
            // Remove % and parse
            double retention = Double.parseDouble(retentionStr.replace("%", "").trim());
            long totalEmployees = stats.getTotalEmployees();

            if (retention >= 99.9 && totalEmployees > 20) {
                tips.add("Perfect 100% retention! Interview your longest-tenured staff to document your 'Secret Sauce' for recruiting.");
            } else if (retention < 75.0) {
                tips.add("Critical Alert: 1 in 4 hires are leaving. Pause hiring and focus strictly on fixing the 'Leaky Bucket'.");
            }
        } catch (NumberFormatException e) {
            // Ignore parsing errors
        }
    }

    private void analyzeGrowthStage(DashboardStatsDTO stats, List<String> tips) {
        long count = stats.getTotalEmployees();

        if (count > 0 && count < 10) {
            tips.add("Startup Mode: Focus on 'Culture Add' rather than 'Culture Fit' to build a diverse foundation early.");
        } else if (count > 50 && count < 100) {
            tips.add("The 'Dunbar's Number' Phase: You are crossing 50 people. Documenting your unwritten culture values is now critical.");
        }
    }
}
