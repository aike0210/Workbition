package com.aike.workbitionserver.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "更新用户信息请求")
public class UpdateUserRequest {

    @Schema(description = "昵称")
    private String nickname;

    @Schema(description = "头像URL")
    private String avatarUrl;

    @Schema(description = "手机号")
    private String phone;
}
