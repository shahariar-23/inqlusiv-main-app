package com.inqlusiv.mainapp.modules.company.repository;

import com.inqlusiv.mainapp.modules.company.entity.CompanyUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyUserRepository extends JpaRepository<CompanyUser, Long> {
    List<CompanyUser> findByCompanyId(Long companyId);
    Optional<CompanyUser> findByEmail(String email);
}
