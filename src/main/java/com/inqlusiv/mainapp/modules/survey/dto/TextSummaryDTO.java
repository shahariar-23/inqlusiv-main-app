package com.inqlusiv.mainapp.modules.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TextSummaryDTO {
    private String summary;
    private List<String> topThemes;
    private String sentimentLabel;
    private String actionableSuggestion;
}
