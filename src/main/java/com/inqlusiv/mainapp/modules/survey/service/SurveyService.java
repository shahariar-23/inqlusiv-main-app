package com.inqlusiv.mainapp.modules.survey.service;

import com.inqlusiv.mainapp.modules.employee.entity.Employee;
import com.inqlusiv.mainapp.modules.employee.repository.EmployeeRepository;
import com.inqlusiv.mainapp.modules.survey.dto.AnswerDTO;
import com.inqlusiv.mainapp.modules.survey.dto.QuestionDTO;
import com.inqlusiv.mainapp.modules.survey.dto.QuestionResultDTO;
import com.inqlusiv.mainapp.modules.survey.dto.SurveyDTO;
import com.inqlusiv.mainapp.modules.survey.dto.SurveyResultDTO;
import com.inqlusiv.mainapp.modules.survey.entity.*;
import com.inqlusiv.mainapp.modules.survey.enums.QuestionType;
import com.inqlusiv.mainapp.modules.survey.enums.SurveyStatus;
import com.inqlusiv.mainapp.modules.survey.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SurveyService {

    @Autowired
    private SurveyRepository surveyRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private SurveyTokenRepository surveyTokenRepository;

    @Autowired
    private SurveyResponseRepository surveyResponseRepository;

    @Autowired
    private AnswerRepository answerRepository;

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
        
        // 1. Fetch all employees for the company
        List<Employee> employees = employeeRepository.findByCompanyId(survey.getCompanyId());
        
        // 2. Generate tokens for each employee
        List<SurveyToken> tokens = new ArrayList<>();
        for (Employee employee : employees) {
            // Check if token already exists to avoid duplicates
            if (!surveyTokenRepository.existsBySurveyIdAndEmployeeId(surveyId, employee.getId())) {
                SurveyToken token = SurveyToken.builder()
                        .token(UUID.randomUUID().toString())
                        .surveyId(surveyId)
                        .employeeId(employee.getId())
                        .used(false)
                        .expiresAt(LocalDateTime.now().plusDays(14)) // 2 weeks expiry
                        .build();
                tokens.add(token);
                
                // 3. Mock Email Sending
                System.out.println("Sending email to " + employee.getEmail() + " with link: /s/" + token.getToken());
            }
        }
        
        if (!tokens.isEmpty()) {
            surveyTokenRepository.saveAll(tokens);
        }
        
        survey.setStatus(SurveyStatus.ACTIVE);
        Survey updatedSurvey = surveyRepository.save(survey);
        
        return mapToDTO(updatedSurvey);
    }

    public SurveyDTO getSurveyByToken(String tokenString) {
        SurveyToken token = surveyTokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (token.isUsed()) {
            throw new RuntimeException("This survey link has already been used.");
        }

        if (token.getExpiresAt() != null && token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This survey link has expired.");
        }

        return getSurveyById(token.getSurveyId());
    }

    @Transactional
    public void submitSurvey(String tokenString, List<AnswerDTO> answers) {
        SurveyToken token = surveyTokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (token.isUsed()) {
            throw new RuntimeException("This survey link has already been used.");
        }

        // 1. Mark token as used
        token.setUsed(true);
        surveyTokenRepository.save(token);

        // 2. Create Response (Anonymous - NO employee ID linked)
        SurveyResponse response = SurveyResponse.builder()
                .surveyId(token.getSurveyId())
                .build();
        
        SurveyResponse savedResponse = surveyResponseRepository.save(response);

        // 3. Save Answers
        List<Answer> answerEntities = answers.stream().map(dto -> Answer.builder()
                .questionId(dto.getQuestionId())
                .textValue(dto.getTextValue())
                .intValue(dto.getIntValue())
                .response(savedResponse)
                .build()).collect(Collectors.toList());

        answerRepository.saveAll(answerEntities);
    }

    @Transactional
    public int simulateResponses(Long surveyId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        List<SurveyToken> unusedTokens = surveyTokenRepository.findBySurveyIdAndUsedFalse(surveyId);
        Random random = new Random();
        int count = 0;

        for (SurveyToken token : unusedTokens) {
            List<AnswerDTO> answers = new ArrayList<>();
            
            for (Question question : survey.getQuestions()) {
                AnswerDTO answer = new AnswerDTO();
                answer.setQuestionId(question.getId());
                
                if (question.getType() == QuestionType.RATING_SCALE) {
                    // Random rating 1-5, weighted towards 3-5 for realism
                    int rating = random.nextInt(10) < 2 ? random.nextInt(2) + 1 : random.nextInt(3) + 3;
                    answer.setIntValue(rating);
                } else if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
                    if (question.getOptions() != null && !question.getOptions().isEmpty()) {
                        String randomOption = question.getOptions().get(random.nextInt(question.getOptions().size()));
                        answer.setTextValue(randomOption);
                    }
                } else if (question.getType() == QuestionType.OPEN_TEXT) {
                    String[] sampleResponses = {
                        "I feel supported in my role.",
                        "Communication could be better.",
                        "Great team atmosphere!",
                        "Need more resources for the project.",
                        "Satisfied with the current direction.",
                        "Work-life balance is good.",
                        "More training opportunities would be nice."
                    };
                    answer.setTextValue(sampleResponses[random.nextInt(sampleResponses.length)]);
                }
                
                answers.add(answer);
            }
            
            submitSurvey(token.getToken(), answers);
            count++;
        }
        
        return count;
    }

    public Double getCompanySentimentScore(Long companyId) {
        // 1. Get all surveys for the company
        List<Survey> surveys = surveyRepository.findByCompanyId(companyId);
        
        if (surveys.isEmpty()) {
            return null;
        }

        // 2. Find the most recent active or closed survey
        Survey latestSurvey = surveys.stream()
                .filter(s -> s.getStatus() == SurveyStatus.ACTIVE || s.getStatus() == SurveyStatus.CLOSED)
                .max((s1, s2) -> s1.getId().compareTo(s2.getId())) // Assuming higher ID is newer
                .orElse(null);

        if (latestSurvey == null) {
            return null;
        }

        // 3. Calculate average rating for all RATING_SCALE questions in this survey
        List<SurveyResponse> responses = surveyResponseRepository.findBySurveyId(latestSurvey.getId());
        
        if (responses.isEmpty()) {
            return null;
        }

        double totalScore = 0;
        int count = 0;

        for (SurveyResponse response : responses) {
            for (Answer answer : response.getAnswers()) {
                // We need to check if the question type is RATING_SCALE.
                // Since Answer doesn't link directly to Question type easily without fetching,
                // we can iterate questions of the survey and match IDs.
                Question question = latestSurvey.getQuestions().stream()
                        .filter(q -> q.getId().equals(answer.getQuestionId()))
                        .findFirst()
                        .orElse(null);

                if (question != null && question.getType() == QuestionType.RATING_SCALE && answer.getIntValue() != null) {
                    totalScore += answer.getIntValue();
                    count++;
                }
            }
        }

        return count > 0 ? totalScore / count : null;
    }

    public SurveyResultDTO getSurveyResults(Long surveyId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        List<SurveyResponse> responses = surveyResponseRepository.findBySurveyId(surveyId);
        
        List<QuestionResultDTO> questionResults = survey.getQuestions().stream().map(question -> {
            List<Answer> answersForQuestion = responses.stream()
                    .flatMap(r -> r.getAnswers().stream())
                    .filter(a -> a.getQuestionId().equals(question.getId()))
                    .collect(Collectors.toList());

            QuestionResultDTO result = QuestionResultDTO.builder()
                    .questionId(question.getId())
                    .text(question.getText())
                    .type(question.getType().name())
                    .build();

            if (question.getType() == QuestionType.RATING_SCALE) {
                double average = answersForQuestion.stream()
                        .filter(a -> a.getIntValue() != null)
                        .mapToInt(Answer::getIntValue)
                        .average()
                        .orElse(0.0);
                result.setAverageRating(average);
                
                Map<String, Integer> distribution = new HashMap<>();
                for (int i = 1; i <= 5; i++) {
                    distribution.put(String.valueOf(i), 0);
                }
                answersForQuestion.forEach(a -> {
                    if (a.getIntValue() != null) {
                        String key = String.valueOf(a.getIntValue());
                        distribution.put(key, distribution.getOrDefault(key, 0) + 1);
                    }
                });
                result.setAnswerDistribution(distribution);
            } else if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
                Map<String, Integer> distribution = new HashMap<>();
                // Initialize with 0 for all options
                if (question.getOptions() != null) {
                    question.getOptions().forEach(opt -> distribution.put(opt, 0));
                }
                
                answersForQuestion.forEach(a -> {
                    if (a.getTextValue() != null) {
                        distribution.put(a.getTextValue(), distribution.getOrDefault(a.getTextValue(), 0) + 1);
                    }
                });
                result.setAnswerDistribution(distribution);
            } else if (question.getType() == QuestionType.OPEN_TEXT) {
                List<String> textAnswers = answersForQuestion.stream()
                        .map(Answer::getTextValue)
                        .filter(s -> s != null && !s.isEmpty())
                        .collect(Collectors.toList());
                result.setTextAnswers(textAnswers);
            }

            return result;
        }).collect(Collectors.toList());

        return SurveyResultDTO.builder()
                .surveyId(survey.getId())
                .title(survey.getTitle())
                .description(survey.getDescription())
                .totalResponses(responses.size())
                .questions(questionResults)
                .build();
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
