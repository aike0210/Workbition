package com.aike.workbitionserver.service;

import com.aike.workbitionserver.common.exception.BusinessException;
import com.aike.workbitionserver.common.result.ResultCode;
import com.aike.workbitionserver.dto.user.ChangePasswordRequest;
import com.aike.workbitionserver.dto.user.UpdateUserRequest;
import com.aike.workbitionserver.dto.user.UserResponse;
import com.aike.workbitionserver.entity.User;
import com.aike.workbitionserver.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getCurrentUser(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        return toUserResponse(user);
    }

    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getPhone() != null) {
            // 检查手机号是否已被其他用户使用
            boolean exists = userMapper.exists(
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<User>()
                            .eq(User::getPhone, request.getPhone())
                            .ne(User::getId, userId)
            );
            if (exists) {
                throw new BusinessException(ResultCode.PHONE_ALREADY_EXISTS);
            }
            user.setPhone(request.getPhone());
        }

        userMapper.updateById(user);
        log.info("用户信息更新成功: {}", user.getUsername());
        return toUserResponse(user);
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 验证旧密码
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new BusinessException(ResultCode.PASSWORD_ERROR);
        }

        // 更新密码
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userMapper.updateById(user);
        log.info("用户密码修改成功: {}", user.getUsername());
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
