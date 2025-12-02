package com.inqlusiv.mainapp.modules.goals.repository;

import com.inqlusiv.mainapp.modules.goals.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByCompanyId(Long companyId);
    
    @Query("SELECT g FROM Goal g WHERE g.companyId = :companyId AND (g.departmentId IS NULL OR g.departmentId = :departmentId)")
    List<Goal> findByCompanyIdAndDepartmentIdOrGlobal(Long companyId, Long departmentId);
}
