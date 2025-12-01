package com.inqlusiv.mainapp.modules.survey.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "survey_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String token;

    private Long surveyId;

    private Long employeeId;

    private boolean used;

    private LocalDateTime expiresAt;
}
