package com.inqlusiv.mainapp.modules.survey.controller;

import com.inqlusiv.mainapp.modules.survey.dto.AnswerDTO;
import com.inqlusiv.mainapp.modules.survey.dto.SurveyDTO;
import com.inqlusiv.mainapp.modules.survey.dto.SurveyResultDTO;
import com.inqlusiv.mainapp.modules.survey.dto.TextSummaryDTO;
import com.inqlusiv.mainapp.modules.survey.service.SurveyService;
import com.inqlusiv.mainapp.modules.survey.service.TextAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/surveys")
public class SurveyController {

    @Autowired
    private SurveyService surveyService;

    @Autowired
    private TextAnalysisService textAnalysisService;

    @PostMapping
    public ResponseEntity<?> createSurvey(@RequestBody SurveyDTO dto, @RequestHeader("Authorization") String token) {
        try {
            Long companyId = extractCompanyId(token);
            SurveyDTO createdSurvey = surveyService.createSurvey(dto, companyId);
            return ResponseEntity.ok(createdSurvey);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating survey: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllSurveys(@RequestHeader("Authorization") String token) {
        try {
            Long companyId = extractCompanyId(token);
            List<SurveyDTO> surveys = surveyService.getAllSurveys(companyId);
            return ResponseEntity.ok(surveys);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching surveys: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSurveyById(@PathVariable Long id) {
        try {
            SurveyDTO survey = surveyService.getSurveyById(id);
            return ResponseEntity.ok(survey);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching survey: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/launch")
    public ResponseEntity<?> launchSurvey(@PathVariable Long id) {
        try {
            SurveyDTO launchedSurvey = surveyService.launchSurvey(id);
            return ResponseEntity.ok(launchedSurvey);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error launching survey: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/simulate")
    public ResponseEntity<?> simulateResponses(@PathVariable Long id) {
        try {
            int count = surveyService.simulateResponses(id);
            return ResponseEntity.ok("Simulated " + count + " responses successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error simulating responses: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<?> getSurveyResults(@PathVariable Long id) {
        try {
            SurveyResultDTO results = surveyService.getSurveyResults(id);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching survey results: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<?> analyzeSurvey(@PathVariable Long id) {
        try {
            SurveyResultDTO results = surveyService.getSurveyResults(id);
            TextSummaryDTO summary = textAnalysisService.analyzeSurveyResults(results);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error analyzing survey: " + e.getMessage());
        }
    }

    // --- Public Endpoints for Survey Takers ---

    @GetMapping("/public/{token}")
    public ResponseEntity<?> getSurveyByToken(@PathVariable String token) {
        try {
            SurveyDTO survey = surveyService.getSurveyByToken(token);
            return ResponseEntity.ok(survey);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error accessing survey: " + e.getMessage());
        }
    }

    @PostMapping("/public/{token}/submit")
    public ResponseEntity<?> submitSurvey(@PathVariable String token, @RequestBody List<AnswerDTO> answers) {
        try {
            surveyService.submitSurvey(token, answers);
            return ResponseEntity.ok("Survey submitted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error submitting survey: " + e.getMessage());
        }
    }

    private Long extractCompanyId(String token) {
        // Extract ID from mock token "mock-jwt-token-{id}"
        String cleanToken = token.replace("Bearer ", "");
        if (!cleanToken.startsWith("mock-jwt-token-")) {
             throw new RuntimeException("Invalid token");
        }
        
        String tokenIdPart = cleanToken.replace("mock-jwt-token-", "");
        return Long.parseLong(tokenIdPart);
    }
}
