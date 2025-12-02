package com.inqlusiv.mainapp.modules.survey.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.inqlusiv.mainapp.config.OpenRouterConfig;
import com.inqlusiv.mainapp.modules.survey.dto.QuestionResultDTO;
import com.inqlusiv.mainapp.modules.survey.dto.SurveyResultDTO;
import com.inqlusiv.mainapp.modules.survey.dto.TextSummaryDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TextAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(TextAnalysisService.class);
    private static final String NEUTRAL_SENTIMENT = "Neutral";
    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    private final OpenRouterConfig openRouterConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public TextAnalysisService(OpenRouterConfig openRouterConfig) {
        this.openRouterConfig = openRouterConfig;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public TextSummaryDTO analyzeSurveyResults(SurveyResultDTO surveyResult) {
        if (surveyResult == null || surveyResult.getQuestions() == null || surveyResult.getQuestions().isEmpty()) {
            return TextSummaryDTO.builder()
                    .summary("No survey data available for analysis.")
                    .topThemes(Collections.emptyList())
                    .sentimentLabel(NEUTRAL_SENTIMENT)
                    .actionableSuggestion("Collect more feedback to generate insights.")
                    .build();
        }

        try {
            // 1. Construct Prompt
            String prompt = constructPrompt(surveyResult);

            // 2. Call OpenRouter API
            String jsonResponse = callOpenRouter(prompt);

            // 3. Parse Response
            return parseOpenRouterResponse(jsonResponse);

        } catch (HttpClientErrorException e) {
            logger.error("OpenRouter API Error: {}", e.getResponseBodyAsString());
            return TextSummaryDTO.builder()
                    .summary("AI Analysis failed. API Error: " + e.getStatusCode() + "\nDetails: " + e.getResponseBodyAsString())
                    .topThemes(Collections.emptyList())
                    .sentimentLabel(NEUTRAL_SENTIMENT)
                    .actionableSuggestion("Check logs for API response.")
                    .build();
        } catch (Exception e) {
            logger.error("Error during AI Analysis", e);
            return TextSummaryDTO.builder()
                    .summary("AI Analysis unavailable. Error: " + e.getMessage())
                    .topThemes(Collections.emptyList())
                    .sentimentLabel(NEUTRAL_SENTIMENT)
                    .actionableSuggestion("Check system logs for details.")
                    .build();
        }
    }

    private String constructPrompt(SurveyResultDTO surveyResult) {
        StringBuilder sb = new StringBuilder();
        sb.append("Survey Title: ").append(surveyResult.getTitle()).append("\n");
        sb.append("Total Responses: ").append(surveyResult.getTotalResponses()).append("\n\n");

        for (QuestionResultDTO q : surveyResult.getQuestions()) {
            sb.append("Question: ").append(q.getText()).append("\n");
            sb.append("Type: ").append(q.getType()).append("\n");

            if ("RATING_SCALE".equals(q.getType())) {
                sb.append("Average Rating: ").append(q.getAverageRating()).append("\n");
            } else if ("MULTIPLE_CHOICE".equals(q.getType())) {
                sb.append("Distribution: ").append(q.getAnswerDistribution()).append("\n");
            } else if ("OPEN_TEXT".equals(q.getType())) {
                List<String> answers = q.getTextAnswers();
                if (answers != null && !answers.isEmpty()) {
                    String joined = answers.stream().limit(20).collect(Collectors.joining("; "));
                    sb.append("Sample Responses: ").append(joined).append("\n");
                } else {
                    sb.append("No text responses.\n");
                }
            }
            sb.append("\n");
        }

        // Truncate if extremely long
        if (sb.length() > 6000) {
            sb.setLength(6000);
            sb.append("\n...(truncated)");
        }

        sb.append("\n\nPlease analyze this survey data and return a raw JSON object (no markdown) with the following fields:\n");
        sb.append("- 'shortDescription': A concise summary of the overall sentiment and key findings.\n");
        sb.append("- 'problemExplanation': An explanation of the main issues or problems identified.\n");
        sb.append("- 'solutions': A list of strings, each being a concrete suggestion or solution.\n");
        sb.append("- 'sentiment': 'Positive', 'Neutral', or 'Negative'.\n");
        sb.append("- 'topThemes': A list of 3 main topics (strings).\n");

        return sb.toString();
    }

    private String callOpenRouter(String prompt) {
        String apiKey = openRouterConfig.getApiKey();
        String model = openRouterConfig.getModel();
        
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("OpenRouter API Key is missing in configuration");
        }

        // Trim key to avoid whitespace issues
        apiKey = apiKey.trim();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("HTTP-Referer", "http://localhost:8080"); 
        headers.set("X-Title", "Inqlusiv App");

        Map<String, String> message = Map.of("role", "user", "content", prompt);
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", List.of(message));
        requestBody.put("stream", false);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(OPENROUTER_URL, entity, String.class);
        return response.getBody();
    }

    private TextSummaryDTO parseOpenRouterResponse(String jsonResponse) throws com.fasterxml.jackson.core.JsonProcessingException {
        JsonNode root = objectMapper.readTree(jsonResponse);
        String content = root.path("choices").get(0).path("message").path("content").asText();
        content = content.replace("```json", "").replace("```", "").trim();

        JsonNode contentNode = objectMapper.readTree(content);

        String shortDescription = contentNode.path("shortDescription").asText();
        String problemExplanation = contentNode.path("problemExplanation").asText();
        String sentiment = contentNode.path("sentiment").asText();
        
        List<String> solutions = new ArrayList<>();
        contentNode.path("solutions").forEach(node -> solutions.add(node.asText()));
        String actionableSuggestion = String.join("\n- ", solutions);
        if (!solutions.isEmpty()) {
            actionableSuggestion = "- " + actionableSuggestion;
        }

        List<String> themes = new ArrayList<>();
        contentNode.path("topThemes").forEach(node -> themes.add(node.asText()));

        return TextSummaryDTO.builder()
                .summary(shortDescription)
                .problemExplanation(problemExplanation)
                .sentimentLabel(sentiment)
                .topThemes(themes)
                .actionableSuggestion(actionableSuggestion)
                .build();
    }
}
