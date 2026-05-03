package com.aike.workbitionserver.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateTaskRequest {

    @NotBlank(message = "任务标题不能为空")
    @Size(max = 200, message = "任务标题最多200个字符")
    private String title;

    @Size(max = 5000, message = "任务描述最多5000个字符")
    private String description;

    private Long taskListId;

    private Long parentTaskId;

    private String status = "todo";

    private String priority = "medium";

    private Long assigneeId;

    private LocalDate startDate;

    private LocalDate dueDate;

    private Integer position;

    private Integer isMilestone = 0;

    private BigDecimal estimatedHours;

    private String tags;
}