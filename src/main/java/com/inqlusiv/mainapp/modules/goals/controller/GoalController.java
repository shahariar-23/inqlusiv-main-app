package com.inqlusiv.mainapp.modules.goals.controller;

import com.inqlusiv.mainapp.modules.auth.entity.User;
import com.inqlusiv.mainapp.modules.auth.repository.UserRepository;
import com.inqlusiv.mainapp.modules.goals.entity.Goal;
import com.inqlusiv.mainapp.modules.goals.entity.GoalTask;
import com.inqlusiv.mainapp.modules.goals.repository.GoalRepository;
import com.inqlusiv.mainapp.modules.goals.repository.GoalTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private GoalTaskRepository goalTaskRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getGoals(@RequestHeader("Authorization") String token) {
        try {
            // Validate Token
            String cleanToken = token.replace("Bearer ", "");
            if (!cleanToken.startsWith("mock-jwt-token-")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            String[] parts = cleanToken.split("-");
            Long companyId = Long.parseLong(parts[3]);
            Long userId = Long.parseLong(parts[5]);

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            User user = userOpt.get();

            // Fetch Company Goals (deptId is null) AND My Department Goals
            List<Goal> goals;
            if (user.getDepartmentId() != null) {
                goals = goalRepository.findByCompanyIdAndDepartmentIdOrGlobal(companyId, user.getDepartmentId());
            } else {
                // If no department (e.g. Company Admin), show all
                goals = goalRepository.findByCompanyId(companyId);
            }
            
            return ResponseEntity.ok(goals);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching goals");
        }
    }

    @PostMapping
    public ResponseEntity<?> createGoal(@RequestHeader("Authorization") String token, @RequestBody Goal goal) {
        try {
            String cleanToken = token.replace("Bearer ", "");
            String[] parts = cleanToken.split("-");
            Long companyId = Long.parseLong(parts[3]);
            Long userId = Long.parseLong(parts[5]);
            String roleStr = parts.length >= 5 ? parts[4] : "EMPLOYEE";

            if (!"COMPANY_ADMIN".equals(roleStr) && !"DEPT_MANAGER".equals(roleStr)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Admins and Managers can create goals");
            }

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
            User user = userOpt.get();

            goal.setCompanyId(companyId);
            
            if ("DEPT_MANAGER".equals(roleStr)) {
                if (user.getDepartmentId() == null) {
                    return ResponseEntity.badRequest().body("Manager has no department assigned");
                }
                goal.setDepartmentId(user.getDepartmentId());
            } else if ("COMPANY_ADMIN".equals(roleStr)) {
                // Admin can optionally set departmentId in body, or leave null for company-wide
                // If not provided in body, it remains null (Company Goal)
            }

            Goal savedGoal = goalRepository.save(goal);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedGoal);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating goal");
        }
    }

    @PostMapping("/{id}/tasks")
    public ResponseEntity<?> addTask(@PathVariable Long id, @RequestBody GoalTask task) {
        Optional<Goal> goalOpt = goalRepository.findById(id);
        if (goalOpt.isEmpty()) return ResponseEntity.notFound().build();

        Goal goal = goalOpt.get();
        task.setGoal(goal);
        task.setCompleted(false);
        
        GoalTask savedTask = goalTaskRepository.save(task);
        return ResponseEntity.ok(savedTask);
    }
    
    @PutMapping("/tasks/{taskId}/toggle")
    public ResponseEntity<?> toggleTask(@PathVariable Long taskId) {
        Optional<GoalTask> taskOpt = goalTaskRepository.findById(taskId);
        if (taskOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        GoalTask task = taskOpt.get();
        task.setCompleted(!task.isCompleted());
        goalTaskRepository.save(task);
        
        return ResponseEntity.ok(task);
    }
}
