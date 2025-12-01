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
            return new ArrayList<>(GENERAL_TIPS.subList(0, 3));
        }

        analyzeStructuralBalance(stats, tips);
        analyzeHrSupportRatio(stats, tips);
        analyzeDiversityMetrics(stats, tips);
        analyzeRetention(stats, tips);
        analyzeGrowthStage(stats, tips);
        // analyzeSentiment(stats, tips); // Removed as per new requirements, or keep if user didn't explicitly ask to remove. User didn't mention it in the new list, but didn't say remove. I'll keep it if it doesn't conflict, but the user gave a specific list of 5 rules. I will stick to the 5 rules requested + fallback.

        // Fallback: If no rules match, return 3 generic best-practice tips.
        if (tips.isEmpty()) {
            for (int i = 0; i < 3 && i < GENERAL_TIPS.size(); i++) {
                tips.add(GENERAL_TIPS.get(i));
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
            tips.add(String.format("Management Alert: Average team size is **%d**. Consider splitting departments.", avgTeamSize));
        } else if (avgTeamSize < 3) {
            tips.add(String.format("Structure Alert: You have many micro-teams (Avg size: **%d**).", avgTeamSize));
        }
    }

    private void analyzeHrSupportRatio(DashboardStatsDTO stats, List<String> tips) {
        long totalEmployees = stats.getTotalEmployees();
        
        if (totalEmployees > 50) {
            tips.add(String.format("HR Check: You have **%d** employees. Ensure you have at least 1 HR pro per 50 staff.", totalEmployees));
        }
    }

    private void analyzeDiversityMetrics(DashboardStatsDTO stats, List<String> tips) {
        Map<String, Long> genderDist = stats.getGenderDistribution();
        if (genderDist == null) return;

        long totalEmployees = stats.getTotalEmployees();
        if (totalEmployees == 0) return;

        long femaleCount = genderDist.getOrDefault("Female", 0L);
        long nonBinaryCount = genderDist.getOrDefault("Non-binary", 0L); // Removed "Prefer not to say" to match "nonBinaryCount == 0" strictly? Or keep it? User said "nonBinaryCount == 0". I will assume strict.

        double femalePercentage = (double) femaleCount / totalEmployees;

        if (femalePercentage < 0.3) {
            tips.add(String.format("Diversity Gap: Women make up only **%.1f%%** of your workforce.", femalePercentage * 100));
        }

        if (nonBinaryCount == 0) {
            tips.add("Inclusion Check: 0% Non-binary representation.");
        }
    }

    private void analyzeRetention(DashboardStatsDTO stats, List<String> tips) {
        String retentionStr = stats.getRetentionRate();
        if (retentionStr == null) return;

        try {
            // Remove % and parse
            double retention = Double.parseDouble(retentionStr.replace("%", "").trim());

            if (retention < 85.0) {
                tips.add(String.format("Critical: Retention is at **%.1f%%**. Schedule 'Stay Interviews' immediately.", retention));
            }
        } catch (NumberFormatException e) {
            // Ignore parsing errors
        }
    }

    private void analyzeGrowthStage(DashboardStatsDTO stats, List<String> tips) {
        long count = stats.getTotalEmployees();

        if (count < 15) {
            tips.add("Startup Phase: Focus on 'Culture Add' over 'Culture Fit'.");
        } else if (count > 50) {
            tips.add("Dunbar's Number Alert: You are crossing 50 people. Document your culture values now.");
        }
    }
    
    // Removed analyzeSentiment to strictly follow the 5 rules requested.
}

