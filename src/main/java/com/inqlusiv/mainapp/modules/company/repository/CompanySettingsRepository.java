package com.inqlusiv.mainapp.modules.company.repository;

import com.inqlusiv.mainapp.modules.company.entity.CompanySettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanySettingsRepository extends JpaRepository<CompanySettings, Long> {
}
