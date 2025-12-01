package com.inqlusiv.mainapp.modules.survey.repository;

import com.inqlusiv.mainapp.modules.survey.entity.Survey;
import com.inqlusiv.mainapp.modules.survey.enums.SurveyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, Long> {
    List<Survey> findByCompanyId(Long companyId);
    List<Survey> findByCompanyIdAndStatus(Long companyId, SurveyStatus status);
}
