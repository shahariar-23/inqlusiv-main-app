package com.inqlusiv.mainapp.modules.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String jobTitle;
    private String gender;
    private java.time.LocalDate startDate;
    private String location;
    private String status;
    private java.time.LocalDate exitDate;
    private Long departmentId;
    private String departmentName;
}
