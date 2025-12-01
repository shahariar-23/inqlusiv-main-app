package com.inqlusiv.mainapp.modules.company.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "company_users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    private String fullName;

    private java.time.LocalDateTime lastActive;

    @Column(nullable = false)
    private String role; // ADMIN, VIEWER, etc.

    @Column(nullable = false)
    private String status; // ACTIVE, PENDING

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
}
