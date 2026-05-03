package com.aike.workbitionserver.controller;

import com.aike.workbitionserver.common.result.Result;
import com.aike.workbitionserver.dto.user.ChangePasswordRequest;
import com.aike.workbitionserver.dto.user.UpdateUserRequest;
import com.aike.workbitionserver.dto.user.UserResponse;
import com.aike.workbitionserver.entity.User;
import com.aike.workbitionserver.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")

    public Result<UserResponse> getCurrentUser(@AuthenticationPrincipal User user) {
        UserResponse response = userService.getCurrentUser(user.getId());
        return Result.success(response);
    }

    @PutMapping("/me")

    public Result<UserResponse> updateUser(@AuthenticationPrincipal User user,
                                           @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(user.getId(), request);
        return Result.success("更新成功", response);
    }

    @PutMapping("/me/password")

    public Result<Void> changePassword(@AuthenticationPrincipal User user,
                                       @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(user.getId(), request);
        return Result.success("密码修改成功");
    }
}
