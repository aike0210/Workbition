package com.aike.workbitionserver.dto.org;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "更新成员角色请求")
public class UpdateMemberRoleRequest {

    @NotBlank(message = "角色不能为空")
    @Schema(description = "角色", allowableValues = {"admin", "member"})
    private String role;
}
