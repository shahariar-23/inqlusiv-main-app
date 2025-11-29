package com.inqlusiv.mainapp.modules.company.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "companyName", nullable = false)
    private String companyName;

    @Column(name = "contactName", nullable = false)
    private String contactName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password")
    private String password;

    @Column(name = "employeeCount")
    private String employeeCount;

    @Column(name = "region")
    private String region;

    @Column(columnDefinition = "TEXT")
    private String objectives;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
