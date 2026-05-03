package com.aike.workbitionserver.dto.org;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OrgResponse {

    private Long id;

    private String name;

    private String description;

    private String logoUrl;

    private Long ownerId;

    private Integer status;

    private Integer memberCount;

    private LocalDateTime createdAt;
}
