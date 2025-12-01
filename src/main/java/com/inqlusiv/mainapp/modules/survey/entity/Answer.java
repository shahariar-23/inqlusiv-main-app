package com.inqlusiv.mainapp.modules.survey.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "answers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long questionId;

    @Column(length = 2000)
    private String textValue;

    private Integer intValue;

    @ManyToOne
    @JoinColumn(name = "response_id")
    private SurveyResponse response;
}
