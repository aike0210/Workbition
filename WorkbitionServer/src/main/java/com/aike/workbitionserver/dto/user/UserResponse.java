package com.aike.workbitionserver.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@Schema(description = "用户信息响应")
public class UserResponse {

    @Schema(description = "用户ID")
    private Long id;

    @Schema(description = "用户名")
    private String username;

    @Schema(description = "邮箱")
    private String email;

    @Schema(description = "手机号")
    private String phone;

    @Schema(description = "昵称")
    private String nickname;

    @Schema(description = "头像URL")
    private String avatarUrl;

    @Schema(description = "状态")
    private Integer status;

    @Schema(description = "最后登录时间")
    private LocalDateTime lastLoginAt;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
