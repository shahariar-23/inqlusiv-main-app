package com.inqlusiv.mainapp.modules.goals.repository;

import com.inqlusiv.mainapp.modules.goals.entity.GoalTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoalTaskRepository extends JpaRepository<GoalTask, Long> {
}
