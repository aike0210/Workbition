package com.aike.workbitionserver.dto.task;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class TaskResponse {

    private Long id;

    private Long projectId;

    private Long taskListId;

    private Long parentTaskId;

    private String title;

    private String description;

    private String status;

    private String priority;

    private Long assigneeId;

    private String assigneeName;

    private String assigneeAvatar;

    private Long creatorId;

    private String creatorName;

    private LocalDate startDate;

    private LocalDate dueDate;

    private LocalDateTime completedAt;

    private BigDecimal progress;

    private Integer position;

    private Integer isMilestone;

    private BigDecimal estimatedHours;

    private BigDecimal actualHours;

    private String tags;

    private Integer subtaskCount;

    private Integer completedSubtaskCount;

    private Integer commentCount;

    private Integer attachmentCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}