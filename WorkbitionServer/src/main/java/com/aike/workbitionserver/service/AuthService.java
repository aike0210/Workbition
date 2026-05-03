package com.aike.workbitionserver.service;

import com.aike.workbitionserver.common.exception.BusinessException;
import com.aike.workbitionserver.common.result.ResultCode;
import com.aike.workbitionserver.common.util.JwtUtil;
import com.aike.workbitionserver.dto.auth.LoginRequest;
import com.aike.workbitionserver.dto.auth.RegisterRequest;
import com.aike.workbitionserver.dto.auth.TokenResponse;
import com.aike.workbitionserver.dto.user.UserResponse;
import com.aike.workbitionserver.entity.User;
import com.aike.workbitionserver.mapper.UserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;

    private static final String TOKEN_BLACKLIST_PREFIX = "token:blacklist:";

    @Transactional
    public UserResponse register(RegisterRequest request) {
        // 检查用户名是否已存在
        if (userMapper.exists(new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()))) {
            throw new BusinessException(ResultCode.USER_ALREADY_EXISTS);
        }

        // 检查邮箱是否已存在
        if (userMapper.exists(new LambdaQueryWrapper<User>().eq(User::getEmail, request.getEmail()))) {
            throw new BusinessException(ResultCode.EMAIL_ALREADY_EXISTS);
        }

        // 检查手机号是否已存在
        if (request.getPhone() != null && userMapper.exists(
                new LambdaQueryWrapper<User>().eq(User::getPhone, request.getPhone()))) {
            throw new BusinessException(ResultCode.PHONE_ALREADY_EXISTS);
        }

        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setNickname(request.getUsername());
        user.setStatus(1);
        userMapper.insert(user);

        log.info("用户注册成功: {}", user.getUsername());
        return toUserResponse(user);
    }

    public TokenResponse login(LoginRequest request) {
        // 查找用户（支持邮箱或用户名登录）
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>()
                        .eq(User::getEmail, request.getEmailOrUsername())
                        .or()
                        .eq(User::getUsername, request.getEmailOrUsername())
        );

        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        if (user.getStatus() != 1) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }

        // 校验密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ResultCode.PASSWORD_ERROR);
        }

        // 更新最后登录时间
        user.setLastLoginAt(LocalDateTime.now());
        userMapper.updateById(user);

        // 生成Token
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getUsername());

        log.info("用户登录成功: {}", user.getUsername());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpiration() / 1000)
                .build();
    }

    public TokenResponse refreshToken(String refreshToken) {
        // 验证Token
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new BusinessException(ResultCode.TOKEN_INVALID);
        }

        // 检查是否是RefreshToken
        String tokenType = jwtUtil.getTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            throw new BusinessException(ResultCode.TOKEN_INVALID);
        }

        // 检查是否在黑名单中
        String blacklistKey = TOKEN_BLACKLIST_PREFIX + refreshToken;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(blacklistKey))) {
            throw new BusinessException(ResultCode.TOKEN_EXPIRED);
        }

        // 获取用户信息
        Long userId = jwtUtil.getUserId(refreshToken);
        User user = userMapper.selectById(userId);

        if (user == null || user.getStatus() != 1) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 生成新的Token对
        String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getUsername());

        // 将旧的RefreshToken加入黑名单
        redisTemplate.opsForValue().set(blacklistKey, "1",
                jwtUtil.getRefreshTokenExpiration(), TimeUnit.MILLISECONDS);

        log.info("Token刷新成功: {}", user.getUsername());

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpiration() / 1000)
                .build();
    }

    public void logout(String accessToken) {
        if (jwtUtil.validateToken(accessToken)) {
            String blacklistKey = TOKEN_BLACKLIST_PREFIX + accessToken;
            redisTemplate.opsForValue().set(blacklistKey, "1",
                    jwtUtil.getAccessTokenExpiration(), TimeUnit.MILLISECONDS);
            log.info("用户登出成功");
        }
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
