package com.aike.workbitionserver.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Token响应")
public class TokenResponse {

    @Schema(description = "访问Token")
    private String accessToken;

    @Schema(description = "刷新Token")
    private String refreshToken;

    @Schema(description = "Token类型", example = "Bearer")
    private String tokenType;

    @Schema(description = "过期时间(秒)")
    private long expiresIn;
}
