package com.inqlusiv.mainapp.modules.survey.service;

import com.inqlusiv.mainapp.modules.survey.dto.QuestionDTO;
import com.inqlusiv.mainapp.modules.survey.dto.SurveyDTO;
import com.inqlusiv.mainapp.modules.survey.entity.Question;
import com.inqlusiv.mainapp.modules.survey.entity.Survey;
import com.inqlusiv.mainapp.modules.survey.enums.QuestionType;
import com.inqlusiv.mainapp.modules.survey.enums.SurveyStatus;
import com.inqlusiv.mainapp.modules.survey.repository.QuestionRepository;
import com.inqlusiv.mainapp.modules.survey.repository.SurveyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SurveyService {

    @Autowired
    private SurveyRepository surveyRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Transactional
    public SurveyDTO createSurvey(SurveyDTO dto, Long companyId) {
        Survey survey = Survey.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .deadline(dto.getDeadline())
                .status(SurveyStatus.DRAFT)
                .companyId(companyId)
                .questions(new ArrayList<>())
                .build();

        // Save survey first to generate ID
        Survey savedSurvey = surveyRepository.save(survey);

        if (dto.getQuestions() != null) {
            List<Question> questions = dto.getQuestions().stream().map(qDto -> {
                return Question.builder()
                        .text(qDto.getText())
                        .type(QuestionType.valueOf(qDto.getType()))
                        .options(qDto.getOptions())
                        .orderIndex(qDto.getOrderIndex())
                        .isRequired(qDto.isRequired())
                        .survey(savedSurvey)
                        .build();
            }).collect(Collectors.toList());

            questionRepository.saveAll(questions);
            savedSurvey.setQuestions(questions);
        }

        return mapToDTO(savedSurvey);
    }

    public List<SurveyDTO> getAllSurveys(Long companyId) {
        List<Survey> surveys = surveyRepository.findByCompanyId(companyId);
        return surveys.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public SurveyDTO getSurveyById(Long id) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Survey not found"));
        return mapToDTO(survey);
    }

    @Transactional
    public SurveyDTO launchSurvey(Long surveyId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));
        
        survey.setStatus(SurveyStatus.ACTIVE);
        Survey updatedSurvey = surveyRepository.save(survey);
        
        // TODO: Add Token Generation logic here later
        
        return mapToDTO(updatedSurvey);
    }

    private SurveyDTO mapToDTO(Survey survey) {
        List<QuestionDTO> questionDTOs = new ArrayList<>();
        if (survey.getQuestions() != null) {
            questionDTOs = survey.getQuestions().stream().map(q -> QuestionDTO.builder()
                    .id(q.getId())
                    .text(q.getText())
                    .type(q.getType().name())
                    .options(q.getOptions())
                    .orderIndex(q.getOrderIndex())
                    .isRequired(q.isRequired())
                    .build()).collect(Collectors.toList());
        }

        return SurveyDTO.builder()
                .id(survey.getId())
                .title(survey.getTitle())
                .description(survey.getDescription())
                .deadline(survey.getDeadline())
                .status(survey.getStatus().name())
                .questions(questionDTOs)
                .build();
    }
}
