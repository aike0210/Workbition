package com.aike.workbitionserver.controller;

import com.aike.workbitionserver.common.result.Result;
import com.aike.workbitionserver.dto.auth.LoginRequest;
import com.aike.workbitionserver.dto.auth.RefreshTokenRequest;
import com.aike.workbitionserver.dto.auth.RegisterRequest;
import com.aike.workbitionserver.dto.auth.TokenResponse;
import com.aike.workbitionserver.dto.user.UserResponse;
import com.aike.workbitionserver.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "认证管理", description = "用户认证相关接口")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "用户注册")
    public Result<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = authService.register(request);
        return Result.success("注册成功", user);
    }

    @PostMapping("/login")
    @Operation(summary = "用户登录")
    public Result<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse token = authService.login(request);
        return Result.success("登录成功", token);
    }

    @PostMapping("/refresh")
    @Operation(summary = "刷新Token")
    public Result<TokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse token = authService.refreshToken(request.getRefreshToken());
        return Result.success("刷新成功", token);
    }

    @PostMapping("/logout")
    @Operation(summary = "用户登出")
    public Result<Void> logout(HttpServletRequest request) {
        String token = extractToken(request);
        if (StringUtils.hasText(token)) {
            authService.logout(token);
        }
        return Result.success();
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
