package com.aike.workbitionserver.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("org_member")
public class OrgMember {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orgId;

    private Long userId;

    private String role;

    private LocalDateTime joinedAt;
}
