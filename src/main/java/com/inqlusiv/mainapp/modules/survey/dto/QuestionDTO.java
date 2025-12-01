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
public class QuestionDTO {
    private Long id;
    private String text;
    private String type;
    private List<String> options;
    private int orderIndex;
    private boolean isRequired;
}
