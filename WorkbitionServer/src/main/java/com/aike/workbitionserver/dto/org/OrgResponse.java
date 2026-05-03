package com.aike.workbitionserver.dto.org;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@Schema(description = "组织信息响应")
public class OrgResponse {

    @Schema(description = "组织ID")
    private Long id;

    @Schema(description = "组织名称")
    private String name;

    @Schema(description = "组织描述")
    private String description;

    @Schema(description = "组织Logo URL")
    private String logoUrl;

    @Schema(description = "所有者ID")
    private Long ownerId;

    @Schema(description = "状态")
    private Integer status;

    @Schema(description = "成员数量")
    private Integer memberCount;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
