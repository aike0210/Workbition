package com.aike.workbitionserver.dto.org;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "创建组织请求")
public class CreateOrgRequest {

    @NotBlank(message = "组织名称不能为空")
    @Size(max = 100, message = "组织名称不能超过100个字符")
    @Schema(description = "组织名称", example = "Workbition团队")
    private String name;

    @Schema(description = "组织描述")
    private String description;

    @Schema(description = "组织Logo URL")
    private String logoUrl;
}
