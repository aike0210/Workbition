package com.aike.workbitionserver.common.result;

import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未登录或Token已过期"),
    FORBIDDEN(403, "无权限访问"),
    NOT_FOUND(404, "资源不存在"),
    CONFLICT(409, "数据冲突"),
    INTERNAL_ERROR(500, "服务器内部错误"),

    // 认证相关 1xxx
    USER_NOT_FOUND(1001, "用户不存在"),
    PASSWORD_ERROR(1002, "密码错误"),
    USER_DISABLED(1003, "用户已被禁用"),
    USER_ALREADY_EXISTS(1004, "用户已存在"),
    EMAIL_ALREADY_EXISTS(1005, "邮箱已被注册"),
    PHONE_ALREADY_EXISTS(1006, "手机号已被注册"),
    TOKEN_EXPIRED(1007, "Token已过期"),
    TOKEN_INVALID(1008, "Token无效"),
    CAPTCHA_ERROR(1009, "验证码错误"),

    // 组织相关 2xxx
    ORG_NOT_FOUND(2001, "组织不存在"),
    ORG_MEMBER_ALREADY_EXISTS(2002, "成员已存在"),
    ORG_MEMBER_NOT_FOUND(2003, "成员不存在"),

    // 项目相关 3xxx
    PROJECT_NOT_FOUND(3001, "项目不存在"),
    PROJECT_MEMBER_ALREADY_EXISTS(3002, "项目成员已存在"),

    // 任务相关 4xxx
    TASK_NOT_FOUND(4001, "任务不存在"),
    TASK_STATUS_INVALID(4002, "任务状态流转不合法"),
    TASK_TRANSFER_INVALID(4003, "任务转接不合法");

    private final int code;
    private final String message;

    ResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
