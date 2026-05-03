package com.aike.workbitionserver.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "邮箱或用户名不能为空")
    private String emailOrUsername;

    @NotBlank(message = "密码不能为空")
    private String password;
}
