package com.aike.workbitionserver.dto.organization;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OrganizationResponse {

    private Long id;

    private String name;

    private String logoUrl;

    private String description;

    private Long ownerId;

    private String ownerUsername;

    private Integer status;

    private Integer memberCount;

    private String currentUserRole;

    private LocalDateTime createdAt;
}
