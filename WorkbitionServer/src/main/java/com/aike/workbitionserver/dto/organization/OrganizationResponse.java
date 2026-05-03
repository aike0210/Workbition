package com.aike.workbitionserver.dto.organization;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@Schema(description = "组织信息响应")
public class OrganizationResponse {

    @Schema(description = "组织ID")
    private Long id;

    @Schema(description = "组织名称")
    private String name;

    @Schema(description = "组织Logo URL")
    private String logoUrl;

    @Schema(description = "组织描述")
    private String description;

    @Schema(description = "所有者ID")
    private Long ownerId;

    @Schema(description = "所有者用户名")
    private String ownerUsername;

    @Schema(description = "状态")
    private Integer status;

    @Schema(description = "成员数量")
    private Integer memberCount;

    @Schema(description = "当前用户在组织中的角色")
    private String currentUserRole;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
