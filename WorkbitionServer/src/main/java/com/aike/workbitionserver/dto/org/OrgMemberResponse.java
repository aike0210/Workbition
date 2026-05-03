package com.aike.workbitionserver.dto.org;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OrgMemberResponse {

    private Long id;

    private Long userId;

    private String username;

    private String nickname;

    private String avatarUrl;

    private String email;

    private String role;

    private LocalDateTime joinedAt;
}
