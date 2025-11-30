package com.inqlusiv.mainapp.modules.company.repository;

import com.inqlusiv.mainapp.modules.company.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
}
