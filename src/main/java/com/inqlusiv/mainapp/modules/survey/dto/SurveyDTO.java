package com.inqlusiv.mainapp.modules.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDate deadline;
    private String status;
    private List<QuestionDTO> questions;
}
