package com.aike.workbitionserver.dto.project;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ProjectResponse {

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

    private Long creatorId;

    private String creatorUsername;

    private Integer memberCount;

    private String currentUserRole;

    private LocalDateTime createdAt;
}
