package com.inqlusiv.mainapp.modules.survey.controller;

import com.inqlusiv.mainapp.modules.survey.dto.SurveyDTO;
import com.inqlusiv.mainapp.modules.survey.service.SurveyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/surveys")
public class SurveyController {

    @Autowired
    private SurveyService surveyService;

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
