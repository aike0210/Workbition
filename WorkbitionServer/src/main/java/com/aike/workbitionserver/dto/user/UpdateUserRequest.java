package com.aike.workbitionserver.dto.user;

import lombok.Data;

@Data
public class UpdateUserRequest {

    private String nickname;

    private String avatarUrl;

    private String phone;
}
