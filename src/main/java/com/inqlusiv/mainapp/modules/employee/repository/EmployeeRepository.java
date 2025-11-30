package com.inqlusiv.mainapp.modules.employee.repository;

import com.inqlusiv.mainapp.modules.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    long countByCompanyId(Long companyId);
    
    boolean existsByEmail(String email);

    @Query("SELECT e.gender, COUNT(e) FROM Employee e WHERE e.company.id = :companyId GROUP BY e.gender")
    List<Object[]> countEmployeesByGender(@Param("companyId") Long companyId);

    @Query("SELECT d.name, COUNT(e) FROM Employee e JOIN e.department d WHERE e.company.id = :companyId GROUP BY d.name")
    List<Object[]> countEmployeesByDepartment(@Param("companyId") Long companyId);
}
