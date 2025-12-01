package com.inqlusiv.mainapp.modules.survey.repository;

import com.inqlusiv.mainapp.modules.survey.entity.SurveyToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SurveyTokenRepository extends JpaRepository<SurveyToken, Long> {
    Optional<SurveyToken> findByToken(String token);
    boolean existsBySurveyIdAndEmployeeId(Long surveyId, Long employeeId);
    List<SurveyToken> findBySurveyIdAndUsedFalse(Long surveyId);
}
