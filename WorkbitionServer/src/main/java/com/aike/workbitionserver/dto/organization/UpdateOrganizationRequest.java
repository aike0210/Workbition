package com.aike.workbitionserver.dto.organization;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "更新组织请求")
public class UpdateOrganizationRequest {

    @Schema(description = "组织名称")
    private String name;

    @Schema(description = "组织描述")
    private String description;

    @Schema(description = "组织Logo URL")
    private String logoUrl;
}
