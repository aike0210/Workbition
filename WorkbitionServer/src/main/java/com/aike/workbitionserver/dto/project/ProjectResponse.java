package com.aike.workbitionserver.dto.project;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@Schema(description = "项目信息响应")
public class ProjectResponse {

    @Schema(description = "项目ID")
    private Long id;

    @Schema(description = "所属组织ID")
    private Long orgId;

    @Schema(description = "项目名称")
    private String name;

    @Schema(description = "项目描述")
    private String description;

    @Schema(description = "项目图标")
    private String icon;

    @Schema(description = "项目颜色")
    private String color;

    @Schema(description = "可见性")
    private String visibility;

    @Schema(description = "状态")
    private String status;

    @Schema(description = "开始日期")
    private LocalDate startDate;

    @Schema(description = "结束日期")
    private LocalDate endDate;

    @Schema(description = "创建者ID")
    private Long creatorId;

    @Schema(description = "创建者用户名")
    private String creatorUsername;

    @Schema(description = "成员数量")
    private Integer memberCount;

    @Schema(description = "当前用户在项目中的角色")
    private String currentUserRole;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
