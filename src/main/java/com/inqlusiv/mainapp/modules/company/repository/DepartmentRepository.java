package com.inqlusiv.mainapp.modules.company.repository;

import com.inqlusiv.mainapp.modules.company.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    long countByCompanyId(Long companyId);
    
    @org.springframework.data.jpa.repository.Query("SELECT d FROM Department d WHERE d.company.id = :companyId")
    List<Department> findByCompanyId(@org.springframework.data.repository.query.Param("companyId") Long companyId);
}
