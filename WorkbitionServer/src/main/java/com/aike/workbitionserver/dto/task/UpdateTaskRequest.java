package com.aike.workbitionserver.dto.task;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateTaskRequest {

    @Size(max = 200, message = "任务标题最多200个字符")
    private String title;

    @Size(max = 5000, message = "任务描述最多5000个字符")
    private String description;

    private Long taskListId;

    private String status;

    private String priority;

    private Long assigneeId;

    private LocalDate startDate;

    private LocalDate dueDate;

    private Integer position;

    private Integer isMilestone;

    private BigDecimal estimatedHours;

    private BigDecimal actualHours;

    private String tags;
}