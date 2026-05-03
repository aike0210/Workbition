package com.aike.workbitionserver.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("task")
public class Task {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long projectId;

    private Long taskListId;

    private Long parentTaskId;

    private String title;

    private String description;

    private String status;

    private String priority;

    private Long assigneeId;

    private Long creatorId;

    private LocalDate startDate;

    private LocalDate dueDate;

    private LocalDateTime completedAt;

    private BigDecimal progress;

    private Integer position;

    private Integer isMilestone;

    private BigDecimal estimatedHours;

    private BigDecimal actualHours;

    private String tags;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}