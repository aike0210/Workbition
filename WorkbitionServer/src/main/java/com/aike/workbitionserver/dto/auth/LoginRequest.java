package com.aike.workbitionserver.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "登录请求")
public class LoginRequest {

    @NotBlank(message = "邮箱或用户名不能为空")
    @Schema(description = "邮箱或用户名", example = "zhangsan@example.com")
    private String emailOrUsername;

    @NotBlank(message = "密码不能为空")
    @Schema(description = "密码", example = "Password123")
    private String password;
}
