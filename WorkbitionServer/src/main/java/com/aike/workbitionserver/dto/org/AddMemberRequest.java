package com.aike.workbitionserver.dto.org;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "添加组织成员请求")
public class AddMemberRequest {

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    @Schema(description = "成员邮箱", example = "member@example.com")
    private String email;

    @Schema(description = "角色", example = "member", allowableValues = {"admin", "member"})
    private String role = "member";
}
