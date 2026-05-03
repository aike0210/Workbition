package com.aike.workbitionserver.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "注册请求")
public class RegisterRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度为3-50个字符")
    @Schema(description = "用户名", example = "zhangsan")
    private String username;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    @Schema(description = "邮箱", example = "zhangsan@example.com")
    private String email;

    @NotBlank(message = "密码不能为空")
    @Size(min = 8, max = 100, message = "密码长度为8-100个字符")
    @Schema(description = "密码", example = "Password123")
    private String password;

    @Schema(description = "手机号", example = "13800138000")
    private String phone;
}
