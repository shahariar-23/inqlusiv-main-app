package com.inqlusiv.mainapp.modules.company.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "company_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "notifications_enabled")
    private boolean notificationsEnabled;

    @Column(name = "analytics_enabled")
    private boolean analyticsEnabled;

    @Column(name = "auto_invite_enabled")
    private boolean autoInviteEnabled;

    @OneToOne(mappedBy = "settings")
    private Company company;

    @ElementCollection
    @CollectionTable(name = "company_settings_metrics", joinColumns = @JoinColumn(name = "company_settings_id"))
    @Column(name = "metric")
    @Builder.Default
    private List<String> selectedMetrics = new ArrayList<>();
}
