package com.aike.workbitionserver.controller;

import com.aike.workbitionserver.common.result.Result;
import com.aike.workbitionserver.dto.user.ChangePasswordRequest;
import com.aike.workbitionserver.dto.user.UpdateUserRequest;
import com.aike.workbitionserver.dto.user.UserResponse;
import com.aike.workbitionserver.entity.User;
import com.aike.workbitionserver.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "用户信息管理接口")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "获取当前用户信息")
    public Result<UserResponse> getCurrentUser(@AuthenticationPrincipal User user) {
        UserResponse response = userService.getCurrentUser(user.getId());
        return Result.success(response);
    }

    @PutMapping("/me")
    @Operation(summary = "更新当前用户信息")
    public Result<UserResponse> updateUser(@AuthenticationPrincipal User user,
                                           @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(user.getId(), request);
        return Result.success("更新成功", response);
    }

    @PutMapping("/me/password")
    @Operation(summary = "修改密码")
    public Result<Void> changePassword(@AuthenticationPrincipal User user,
                                       @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(user.getId(), request);
        return Result.success("密码修改成功");
    }
}
