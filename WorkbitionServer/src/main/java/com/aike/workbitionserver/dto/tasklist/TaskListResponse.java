package com.aike.workbitionserver.dto.tasklist;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TaskListResponse {

    private Long id;

    private Long projectId;

    private String name;

    private Integer position;

    private Integer taskCount;

    private LocalDateTime createdAt;
}
