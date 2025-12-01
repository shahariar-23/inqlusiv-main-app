package com.inqlusiv.mainapp.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponseDTO {
    private List<HeadcountTrendDTO> headcountTrends;
    private Map<String, Long> tenureDistribution;
    private Map<String, Long> genderDistribution;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HeadcountTrendDTO {
        private String month;
        private Long count;
    }
}
