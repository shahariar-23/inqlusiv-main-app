package com.inqlusiv.mainapp.modules.company.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CompanySetupRequest {
    private String companyName;
    private String industry;
    private String region;
    
    private String adminName;
    private String adminTitle;
    private String adminEmail;
    
    private List<String> departments;
    
    private PreferencesDTO preferences;
    private List<String> selectedMetrics;
    
    @Data
    public static class PreferencesDTO {
        private boolean notifications;
        private boolean analytics;
        private boolean autoInvite;
    }
}
