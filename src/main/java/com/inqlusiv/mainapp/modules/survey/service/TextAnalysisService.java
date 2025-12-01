package com.inqlusiv.mainapp.modules.survey.service;

import com.inqlusiv.mainapp.modules.survey.dto.TextSummaryDTO;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TextAnalysisService {

    private static final Map<String, List<String>> CATEGORIES = Map.of(
            "Compensation", List.of("pay", "salary", "money", "raise", "bonus", "underpaid"),
            "Burnout", List.of("tired", "stress", "burnout", "overtime", "exhausted", "work-life"),
            "Management", List.of("manager", "boss", "leadership", "micromanage", "support"),
            "Culture", List.of("fun", "team", "people", "environment", "friendly")
    );

    private static final List<String> POSITIVE_WORDS = List.of("good", "great", "love", "happy", "best", "excellent");
    private static final List<String> NEGATIVE_WORDS = List.of("bad", "hate", "poor", "worst", "terrible", "toxic");

    public TextSummaryDTO analyzeTextResponses(List<String> answers) {
        if (answers == null || answers.isEmpty()) {
            return TextSummaryDTO.builder()
                    .summary("No text responses available for analysis.")
                    .topThemes(Collections.emptyList())
                    .sentimentLabel("Neutral")
                    .build();
        }

        Map<String, Integer> categoryCounts = new HashMap<>();
        CATEGORIES.keySet().forEach(key -> categoryCounts.put(key, 0));

        int positiveScore = 0;
        int negativeScore = 0;

        for (String answer : answers) {
            if (answer == null) continue;
            String lowerAnswer = answer.toLowerCase();

            // Count Categories
            for (Map.Entry<String, List<String>> entry : CATEGORIES.entrySet()) {
                for (String keyword : entry.getValue()) {
                    if (lowerAnswer.contains(keyword)) {
                        categoryCounts.put(entry.getKey(), categoryCounts.get(entry.getKey()) + 1);
                    }
                }
            }

            // Sentiment Scoring
            for (String word : POSITIVE_WORDS) {
                if (lowerAnswer.contains(word)) positiveScore++;
            }
            for (String word : NEGATIVE_WORDS) {
                if (lowerAnswer.contains(word)) negativeScore++;
            }
        }

        // Identify Top 2 Themes
        List<String> topThemes = categoryCounts.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(2)
                .filter(e -> e.getValue() > 0)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // Determine Sentiment Label
        int totalScore = positiveScore - negativeScore;
        String sentimentLabel = "Neutral";
        if (totalScore > 0) sentimentLabel = "Positive";
        else if (totalScore < 0) sentimentLabel = "Negative";

        // Generate Summary
        String summary;
        if (topThemes.isEmpty()) {
            summary = String.format("Based on %d comments, no specific themes were strongly identified. The overall sentiment appears **%s**.", answers.size(), sentimentLabel);
        } else if (topThemes.size() == 1) {
            summary = String.format("Based on %d comments, the top theme is **%s**. The overall sentiment appears **%s**.", answers.size(), topThemes.get(0), sentimentLabel);
        } else {
            summary = String.format("Based on %d comments, the top themes are **%s** and **%s**. The overall sentiment appears **%s**.", answers.size(), topThemes.get(0), topThemes.get(1), sentimentLabel);
        }

        return TextSummaryDTO.builder()
                .summary(summary)
                .topThemes(topThemes)
                .sentimentLabel(sentimentLabel)
                .build();
    }
}
