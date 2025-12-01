package com.inqlusiv.mainapp.modules.survey.repository;

import com.inqlusiv.mainapp.modules.survey.entity.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, Long> {
    List<SurveyResponse> findBySurveyId(Long surveyId);
    long countBySurveyId(Long surveyId);
}
