package com.aike.workbitionserver.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("task_list")
public class TaskList {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long projectId;

    private String name;

    private Integer position;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
