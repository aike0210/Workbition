package com.aike.workbitionserver.dto.project;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProjectMemberResponse {

    private Long id;

    private Long userId;

    private String username;

    private String email;

    private String nickname;

    private String avatarUrl;

    private String role;

    private LocalDateTime joinedAt;
}
