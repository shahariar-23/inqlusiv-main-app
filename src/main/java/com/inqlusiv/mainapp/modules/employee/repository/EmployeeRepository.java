package com.inqlusiv.mainapp.modules.employee.repository;

import com.inqlusiv.mainapp.modules.employee.entity.Employee;
import com.inqlusiv.mainapp.modules.employee.entity.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    long countByCompanyId(Long companyId);

    long countByCompanyIdAndStatus(Long companyId, EmployeeStatus status);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.company.id = :companyId AND (e.status = :status OR e.status IS NULL)")
    long countByCompanyIdAndStatusOrNull(@Param("companyId") Long companyId, @Param("status") EmployeeStatus status);
    
    long countByDepartmentId(Long departmentId);

    boolean existsByEmail(String email);

    Page<Employee> findByCompanyId(Long companyId, Pageable pageable);

    Page<Employee> findByCompanyIdAndDepartmentId(Long companyId, Long departmentId, Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE e.company.id = :companyId AND (LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Employee> searchByCompanyId(@Param("companyId") Long companyId, @Param("search") String search, Pageable pageable);

    @Query("SELECT e FROM Employee e LEFT JOIN e.department d WHERE e.company.id = :companyId AND (LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Employee> searchByCompanyIdGlobal(@Param("companyId") Long companyId, @Param("search") String search, Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE e.company.id = :companyId AND e.department.id = :departmentId AND (LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Employee> searchByCompanyIdAndDepartmentId(@Param("companyId") Long companyId, @Param("departmentId") Long departmentId, @Param("search") String search, Pageable pageable);

    @Query("SELECT e.gender, COUNT(e) FROM Employee e WHERE e.company.id = :companyId GROUP BY e.gender")
    List<Object[]> countEmployeesByGender(@Param("companyId") Long companyId);

    @Query("SELECT d.name, COUNT(e) FROM Employee e JOIN e.department d WHERE e.company.id = :companyId GROUP BY d.name")
    List<Object[]> countEmployeesByDepartment(@Param("companyId") Long companyId);

    List<Employee> findByCompanyId(Long companyId);
    List<Employee> findByCompanyIdAndDepartmentId(Long companyId, Long departmentId);

    // New methods for Department filtering
    long countByDepartmentIdAndStatus(Long departmentId, EmployeeStatus status);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.department.id = :departmentId AND (e.status = :status OR e.status IS NULL)")
    long countByDepartmentIdAndStatusOrNull(@Param("departmentId") Long departmentId, @Param("status") EmployeeStatus status);

    @Query("SELECT e.gender, COUNT(e) FROM Employee e WHERE e.department.id = :departmentId GROUP BY e.gender")
    List<Object[]> countEmployeesByGenderAndDepartment(@Param("departmentId") Long departmentId);
}
