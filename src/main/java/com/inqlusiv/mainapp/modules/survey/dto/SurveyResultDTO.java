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
public class SurveyResultDTO {
    private Long surveyId;
    private String title;
    private String description;
    private int totalResponses;
    private List<QuestionResultDTO> questions;
}
