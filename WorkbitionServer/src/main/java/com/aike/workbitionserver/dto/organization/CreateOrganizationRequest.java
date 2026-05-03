package com.aike.workbitionserver.dto.organization;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "创建组织请求")
public class CreateOrganizationRequest {

    @NotBlank(message = "组织名称不能为空")
    @Size(max = 100, message = "组织名称最长100个字符")
    @Schema(description = "组织名称", example = "我的团队")
    private String name;

    @Schema(description = "组织描述")
    private String description;

    @Schema(description = "组织Logo URL")
    private String logoUrl;
}
