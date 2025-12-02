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

    public GoalController() {
        System.out.println("GoalController initialized");
    }

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
            String roleStr = parts.length >= 5 ? parts[4] : "EMPLOYEE";
            Long userId = Long.parseLong(parts[5]);

            User user = null;
            String role = roleStr;

            if (userId != 0) {
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isEmpty()) {
                    return ResponseEntity.notFound().build();
                }
                user = userOpt.get();
                role = user.getRole().name();
            } else if (!"COMPANY_ADMIN".equals(roleStr)) {
                 return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token for non-admin user");
            }

            // Fetch Goals based on Role
            List<Goal> goals;

            if ("COMPANY_ADMIN".equals(role) || "HR_MANAGER".equals(role)) {
                // Admin/HR see ALL goals for the company
                goals = goalRepository.findByCompanyId(companyId);
            } else {
                // Managers/Employees see Company-wide goals + Their Department goals
                Long deptId = (user != null) ? user.getDepartmentId() : null;
                if (deptId != null) {
                    goals = goalRepository.findByCompanyIdAndDepartmentIdOrGlobal(companyId, deptId);
                } else {
                    // Fallback if user has no department: show only company-wide goals
                    goals = goalRepository.findByCompanyIdAndDepartmentIdOrGlobal(companyId, -1L); // -1 won't match any dept
                }
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
            String roleStr = parts.length >= 5 ? parts[4] : "EMPLOYEE";
            Long userId = Long.parseLong(parts[5]);

            if (!"COMPANY_ADMIN".equals(roleStr) && !"DEPT_MANAGER".equals(roleStr)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Admins and Managers can create goals");
            }

            User user = null;
            if (userId != 0) {
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
                user = userOpt.get();
            } else if (!"COMPANY_ADMIN".equals(roleStr)) {
                 return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            goal.setCompanyId(companyId);
            
            if ("DEPT_MANAGER".equals(roleStr)) {
                // Manager: Force assign to their department
                if (user == null || user.getDepartmentId() == null) {
                    return ResponseEntity.badRequest().body("Manager has no department assigned");
                }
                goal.setDepartmentId(user.getDepartmentId());
            } else if ("COMPANY_ADMIN".equals(roleStr) || "HR_MANAGER".equals(roleStr)) {
                // Admin/HR: Can specify departmentId or leave null (Company-wide)
                // The goal object already has the departmentId from the request body
                // We just ensure they don't try to assign to another company (though companyId is forced above)
            } else {
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Employees cannot create goals");
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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        try {
            String cleanToken = token.replace("Bearer ", "");
            String[] parts = cleanToken.split("-");
            Long companyId = Long.parseLong(parts[3]);
            String roleStr = parts.length >= 5 ? parts[4] : "EMPLOYEE";
            Long userId = Long.parseLong(parts[5]);

            Optional<Goal> goalOpt = goalRepository.findById(id);
            if (goalOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Goal goal = goalOpt.get();

            // Ensure goal belongs to the same company
            if (!goal.getCompanyId().equals(companyId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cannot delete goal from another company");
            }

            // Permission Check
            if ("COMPANY_ADMIN".equals(roleStr) || "HR_MANAGER".equals(roleStr)) {
                // Admin/HR can delete any goal
                goalRepository.delete(goal);
                return ResponseEntity.ok().build();
            } else if ("DEPT_MANAGER".equals(roleStr)) {
                // Manager can only delete goals in their department
                
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
                User user = userOpt.get();

                if (goal.getDepartmentId() != null && goal.getDepartmentId().equals(user.getDepartmentId())) {
                    goalRepository.delete(goal);
                    return ResponseEntity.ok().build();
                } else {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Managers can only delete goals within their department");
                }
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Employees cannot delete goals");
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting goal");
        }
    }
}
