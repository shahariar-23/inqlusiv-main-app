package com.inqlusiv.mainapp.modules.survey.dto;

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
public class QuestionResultDTO {
    private Long questionId;
    private String text;
    private String type;
    private Double averageRating;
    private Map<String, Integer> answerDistribution;
    private List<String> textAnswers;
}
