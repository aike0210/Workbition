package com.aike.workbitionserver.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("project")
public class Project {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orgId;

    private String name;

    private String description;

    private String icon;

    private String color;

    private String visibility;

    private String status;

    private LocalDate startDate;

    private LocalDate endDate;

    private Long templateId;

    private Long creatorId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
