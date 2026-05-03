-- ============================================================
-- Workbition 数据库初始化脚本
-- 版本: V1 - 基础表结构
-- ============================================================

-- ==================== 用户表 ====================
CREATE TABLE `user` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    `phone` VARCHAR(20) UNIQUE COMMENT '手机号',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
    `nickname` VARCHAR(50) COMMENT '昵称',
    `avatar_url` VARCHAR(500) COMMENT '头像URL',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
    `last_login_at` DATETIME COMMENT '最后登录时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除 1-已删除',
    INDEX `idx_email` (`email`),
    INDEX `idx_phone` (`phone`),
    INDEX `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ==================== 组织表 ====================
CREATE TABLE `organization` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT '组织名称',
    `logo_url` VARCHAR(500) COMMENT '组织Logo',
    `description` TEXT COMMENT '组织描述',
    `owner_id` BIGINT NOT NULL COMMENT '组织所有者ID',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    INDEX `idx_owner` (`owner_id`),
    CONSTRAINT `fk_org_owner` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='组织表';

-- ==================== 组织成员表 ====================
CREATE TABLE `org_member` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `org_id` BIGINT NOT NULL COMMENT '组织ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role` VARCHAR(20) NOT NULL DEFAULT 'member' COMMENT '角色: owner/admin/member',
    `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_org_user` (`org_id`, `user_id`),
    INDEX `idx_user` (`user_id`),
    CONSTRAINT `fk_org_member_org` FOREIGN KEY (`org_id`) REFERENCES `organization`(`id`),
    CONSTRAINT `fk_org_member_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='组织成员表';

-- ==================== 团队表 ====================
CREATE TABLE `team` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `org_id` BIGINT NOT NULL COMMENT '组织ID',
    `name` VARCHAR(100) NOT NULL COMMENT '团队名称',
    `description` TEXT COMMENT '团队描述',
    `leader_id` BIGINT COMMENT '团队负责人ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    INDEX `idx_org` (`org_id`),
    CONSTRAINT `fk_team_org` FOREIGN KEY (`org_id`) REFERENCES `organization`(`id`),
    CONSTRAINT `fk_team_leader` FOREIGN KEY (`leader_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='团队表';

-- ==================== 团队成员表 ====================
CREATE TABLE `team_member` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `team_id` BIGINT NOT NULL COMMENT '团队ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role` VARCHAR(20) DEFAULT 'member' COMMENT '角色: leader/member',
    `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_team_user` (`team_id`, `user_id`),
    INDEX `idx_user` (`user_id`),
    CONSTRAINT `fk_team_member_team` FOREIGN KEY (`team_id`) REFERENCES `team`(`id`),
    CONSTRAINT `fk_team_member_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='团队成员表';

-- ==================== 角色表 ====================
CREATE TABLE `role` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `org_id` BIGINT COMMENT '组织ID，NULL表示系统角色',
    `name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `code` VARCHAR(50) NOT NULL COMMENT '角色编码',
    `description` VARCHAR(200) COMMENT '角色描述',
    `type` VARCHAR(20) NOT NULL COMMENT '类型: system/org/project',
    `is_default` TINYINT DEFAULT 0 COMMENT '是否默认角色',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_org_code` (`org_id`, `code`),
    CONSTRAINT `fk_role_org` FOREIGN KEY (`org_id`) REFERENCES `organization`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- ==================== 权限表 ====================
CREATE TABLE `permission` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL COMMENT '权限名称',
    `code` VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码',
    `type` VARCHAR(20) NOT NULL COMMENT '类型: function/data',
    `resource` VARCHAR(50) NOT NULL COMMENT '资源',
    `action` VARCHAR(50) NOT NULL COMMENT '操作',
    `description` VARCHAR(200) COMMENT '权限描述',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- ==================== 角色-权限关联表 ====================
CREATE TABLE `role_permission` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `role_id` BIGINT NOT NULL,
    `permission_id` BIGINT NOT NULL,
    UNIQUE KEY `uk_role_perm` (`role_id`, `permission_id`),
    CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`),
    CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permission`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- ==================== 用户-角色关联表 ====================
CREATE TABLE `user_role` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,
    `resource_type` VARCHAR(50) NOT NULL COMMENT '资源类型: org/project',
    `resource_id` BIGINT NOT NULL COMMENT '资源ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_role_resource` (`user_id`, `role_id`, `resource_type`, `resource_id`),
    INDEX `idx_role` (`role_id`),
    CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- ==================== 项目表 ====================
CREATE TABLE `project` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `org_id` BIGINT NOT NULL COMMENT '所属组织ID',
    `name` VARCHAR(100) NOT NULL COMMENT '项目名称',
    `description` TEXT COMMENT '项目描述',
    `icon` VARCHAR(50) COMMENT '项目图标',
    `color` VARCHAR(20) COMMENT '项目颜色',
    `visibility` VARCHAR(20) DEFAULT 'private' COMMENT '可见性: public/private',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态: active/archived/deleted',
    `start_date` DATE COMMENT '开始日期',
    `end_date` DATE COMMENT '结束日期',
    `template_id` BIGINT COMMENT '模板ID',
    `creator_id` BIGINT NOT NULL COMMENT '创建者ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    INDEX `idx_org` (`org_id`),
    INDEX `idx_creator` (`creator_id`),
    INDEX `idx_status` (`status`),
    CONSTRAINT `fk_project_org` FOREIGN KEY (`org_id`) REFERENCES `organization`(`id`),
    CONSTRAINT `fk_project_creator` FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';

-- ==================== 项目成员表 ====================
CREATE TABLE `project_member` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role` VARCHAR(20) NOT NULL DEFAULT 'member' COMMENT '角色: admin/member/guest',
    `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_proj_user` (`project_id`, `user_id`),
    INDEX `idx_user` (`user_id`),
    CONSTRAINT `fk_pm_project` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`),
    CONSTRAINT `fk_pm_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目成员表';

-- ==================== 任务列表(泳道)表 ====================
CREATE TABLE `task_list` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `name` VARCHAR(100) NOT NULL COMMENT '列表名称',
    `position` INT DEFAULT 0 COMMENT '排序位置',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_project` (`project_id`),
    CONSTRAINT `fk_tl_project` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务列表表';

-- ==================== 任务表 ====================
CREATE TABLE `task` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `task_list_id` BIGINT COMMENT '任务列表ID',
    `parent_task_id` BIGINT COMMENT '父任务ID，NULL表示顶级任务',
    `title` VARCHAR(255) NOT NULL COMMENT '任务标题',
    `description` LONGTEXT COMMENT '任务描述',
    `status` VARCHAR(50) NOT NULL DEFAULT 'TODO' COMMENT '状态',
    `priority` VARCHAR(20) DEFAULT 'medium' COMMENT '优先级: urgent/high/medium/low',
    `assignee_id` BIGINT COMMENT '负责人ID',
    `creator_id` BIGINT NOT NULL COMMENT '创建者ID',
    `start_date` DATETIME COMMENT '开始日期',
    `due_date` DATETIME COMMENT '截止日期',
    `completed_at` DATETIME COMMENT '完成时间',
    `progress` DECIMAL(5,2) DEFAULT 0 COMMENT '进度百分比',
    `position` INT DEFAULT 0 COMMENT '排序位置',
    `is_milestone` TINYINT DEFAULT 0 COMMENT '是否里程碑',
    `estimated_hours` DECIMAL(8,2) COMMENT '预估工时',
    `actual_hours` DECIMAL(8,2) COMMENT '实际工时',
    `tags` JSON COMMENT '标签列表',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    INDEX `idx_project` (`project_id`),
    INDEX `idx_task_list` (`task_list_id`),
    INDEX `idx_parent` (`parent_task_id`),
    INDEX `idx_assignee` (`assignee_id`),
    INDEX `idx_creator` (`creator_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_priority` (`priority`),
    INDEX `idx_due_date` (`due_date`),
    CONSTRAINT `fk_task_project` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`),
    CONSTRAINT `fk_task_list` FOREIGN KEY (`task_list_id`) REFERENCES `task_list`(`id`),
    CONSTRAINT `fk_task_parent` FOREIGN KEY (`parent_task_id`) REFERENCES `task`(`id`),
    CONSTRAINT `fk_task_assignee` FOREIGN KEY (`assignee_id`) REFERENCES `user`(`id`),
    CONSTRAINT `fk_task_creator` FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- ==================== 任务依赖表 ====================
CREATE TABLE `task_dependency` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `predecessor_id` BIGINT NOT NULL COMMENT '前置任务ID',
    `successor_id` BIGINT NOT NULL COMMENT '后续任务ID',
    `dependency_type` VARCHAR(5) NOT NULL DEFAULT 'FS' COMMENT '依赖类型: FS/FF/SS/SF',
    `lag_days` INT DEFAULT 0 COMMENT '延隔天数',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_dep` (`predecessor_id`, `successor_id`),
    INDEX `idx_successor` (`successor_id`),
    CONSTRAINT `fk_dep_predecessor` FOREIGN KEY (`predecessor_id`) REFERENCES `task`(`id`),
    CONSTRAINT `fk_dep_successor` FOREIGN KEY (`successor_id`) REFERENCES `task`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务依赖表';

-- ==================== 任务协作者表 ====================
CREATE TABLE `task_collaborator` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `task_id` BIGINT NOT NULL COMMENT '任务ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role` VARCHAR(20) NOT NULL DEFAULT 'collaborator' COMMENT '角色: collaborator/reviewer/follower',
    `added_by` BIGINT COMMENT '添加者ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_task_user` (`task_id`, `user_id`),
    INDEX `idx_user` (`user_id`),
    CONSTRAINT `fk_tc_task` FOREIGN KEY (`task_id`) REFERENCES `task`(`id`),
    CONSTRAINT `fk_tc_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    CONSTRAINT `fk_tc_added_by` FOREIGN KEY (`added_by`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务协作者表';

-- ==================== 任务转接记录表 ====================
CREATE TABLE `task_transfer` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `task_id` BIGINT NOT NULL COMMENT '任务ID',
    `transfer_type` VARCHAR(20) NOT NULL COMMENT '类型: transfer/delegate/reassign',
    `from_user_id` BIGINT NOT NULL COMMENT '转出人ID',
    `to_user_id` BIGINT NOT NULL COMMENT '接收人ID',
    `reason` TEXT COMMENT '转接原因',
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending/accepted/rejected/cancelled/expired',
    `approver_id` BIGINT COMMENT '审批人ID',
    `approved_at` DATETIME COMMENT '审批时间',
    `expired_at` DATETIME COMMENT '过期时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_task` (`task_id`),
    INDEX `idx_to_user_status` (`to_user_id`, `status`),
    CONSTRAINT `fk_tt_task` FOREIGN KEY (`task_id`) REFERENCES `task`(`id`),
    CONSTRAINT `fk_tt_from` FOREIGN KEY (`from_user_id`) REFERENCES `user`(`id`),
    CONSTRAINT `fk_tt_to` FOREIGN KEY (`to_user_id`) REFERENCES `user`(`id`),
    CONSTRAINT `fk_tt_approver` FOREIGN KEY (`approver_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务转接记录表';

-- ==================== 评论表 ====================
CREATE TABLE `comment` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `task_id` BIGINT NOT NULL COMMENT '任务ID',
    `user_id` BIGINT NOT NULL COMMENT '评论者ID',
    `content` LONGTEXT NOT NULL COMMENT '评论内容',
    `parent_id` BIGINT COMMENT '回复的评论ID',
    `mentions` JSON COMMENT '被@的用户ID列表',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    INDEX `idx_task` (`task_id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_parent` (`parent_id`),
    CONSTRAINT `fk_comment_task` FOREIGN KEY (`task_id`) REFERENCES `task`(`id`),
    CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parent_id`) REFERENCES `comment`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ==================== 附件表 ====================
CREATE TABLE `attachment` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `task_id` BIGINT COMMENT '关联任务ID',
    `project_id` BIGINT COMMENT '关联项目ID',
    `file_name` VARCHAR(255) NOT NULL COMMENT '文件名',
    `file_size` BIGINT NOT NULL COMMENT '文件大小(字节)',
    `file_type` VARCHAR(50) COMMENT '文件类型',
    `storage_path` VARCHAR(500) NOT NULL COMMENT '存储路径',
    `uploader_id` BIGINT NOT NULL COMMENT '上传者ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    INDEX `idx_task` (`task_id`),
    INDEX `idx_project` (`project_id`),
    CONSTRAINT `fk_att_task` FOREIGN KEY (`task_id`) REFERENCES `task`(`id`),
    CONSTRAINT `fk_att_project` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`),
    CONSTRAINT `fk_att_uploader` FOREIGN KEY (`uploader_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='附件表';

-- ==================== 操作日志表 ====================
CREATE TABLE `activity_log` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT COMMENT '项目ID',
    `task_id` BIGINT COMMENT '任务ID',
    `user_id` BIGINT NOT NULL COMMENT '操作者ID',
    `action` VARCHAR(50) NOT NULL COMMENT '操作类型',
    `detail` JSON COMMENT '变更详情',
    `ip_address` VARCHAR(50) COMMENT 'IP地址',
    `user_agent` VARCHAR(500) COMMENT '用户代理',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_task` (`task_id`),
    INDEX `idx_project` (`project_id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_created` (`created_at`),
    CONSTRAINT `fk_al_project` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`),
    CONSTRAINT `fk_al_task` FOREIGN KEY (`task_id`) REFERENCES `task`(`id`),
    CONSTRAINT `fk_al_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- ==================== 工作流定义表 ====================
CREATE TABLE `workflow` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `name` VARCHAR(100) NOT NULL COMMENT '工作流名称',
    `description` TEXT COMMENT '工作流描述',
    `is_default` TINYINT DEFAULT 0 COMMENT '是否默认工作流',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_project` (`project_id`),
    CONSTRAINT `fk_wf_project` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流定义表';

-- ==================== 工作流状态表 ====================
CREATE TABLE `workflow_state` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `workflow_id` BIGINT NOT NULL COMMENT '工作流ID',
    `name` VARCHAR(50) NOT NULL COMMENT '状态名称',
    `color` VARCHAR(20) COMMENT '状态颜色',
    `icon` VARCHAR(50) COMMENT '状态图标',
    `type` VARCHAR(20) NOT NULL COMMENT '类型: start/intermediate/end',
    `position` INT DEFAULT 0 COMMENT '排序位置',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_workflow` (`workflow_id`),
    CONSTRAINT `fk_ws_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflow`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流状态表';

-- ==================== 工作流转换规则表 ====================
CREATE TABLE `workflow_transition` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `workflow_id` BIGINT NOT NULL COMMENT '工作流ID',
    `from_state_id` BIGINT NOT NULL COMMENT '源状态ID',
    `to_state_id` BIGINT NOT NULL COMMENT '目标状态ID',
    `name` VARCHAR(100) COMMENT '转换名称',
    `conditions` JSON COMMENT '流转条件',
    `required_fields` JSON COMMENT '必填字段',
    `allowed_roles` JSON COMMENT '允许执行的角色',
    `auto_actions` JSON COMMENT '自动执行动作',
    `requires_approval` TINYINT DEFAULT 0 COMMENT '是否需要审批',
    `approval_config` JSON COMMENT '审批配置',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_workflow` (`workflow_id`),
    INDEX `idx_from_state` (`from_state_id`),
    INDEX `idx_to_state` (`to_state_id`),
    CONSTRAINT `fk_wt_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflow`(`id`),
    CONSTRAINT `fk_wt_from` FOREIGN KEY (`from_state_id`) REFERENCES `workflow_state`(`id`),
    CONSTRAINT `fk_wt_to` FOREIGN KEY (`to_state_id`) REFERENCES `workflow_state`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流转换规则表';

-- ==================== 自动化规则表 ====================
CREATE TABLE `automation_rule` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `name` VARCHAR(100) NOT NULL COMMENT '规则名称',
    `description` TEXT COMMENT '规则描述',
    `trigger_type` VARCHAR(50) NOT NULL COMMENT '触发器类型',
    `trigger_config` JSON COMMENT '触发器配置',
    `conditions` JSON COMMENT '条件配置',
    `actions` JSON COMMENT '动作配置',
    `is_enabled` TINYINT DEFAULT 1 COMMENT '是否启用',
    `execution_count` INT DEFAULT 0 COMMENT '执行次数',
    `last_executed_at` DATETIME COMMENT '最后执行时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_project` (`project_id`),
    CONSTRAINT `fk_ar_project` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自动化规则表';

-- ==================== 审批单表 ====================
CREATE TABLE `approval` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `task_id` BIGINT NOT NULL COMMENT '任务ID',
    `workflow_transition_id` BIGINT COMMENT '工作流转换规则ID',
    `type` VARCHAR(20) NOT NULL COMMENT '审批类型: or_sign/and_sign/sequential',
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending/approved/rejected/cancelled',
    `creator_id` BIGINT NOT NULL COMMENT '发起人ID',
    `reason` TEXT COMMENT '审批原因',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `completed_at` DATETIME COMMENT '完成时间',
    INDEX `idx_task` (`task_id`),
    INDEX `idx_status` (`status`),
    CONSTRAINT `fk_appr_task` FOREIGN KEY (`task_id`) REFERENCES `task`(`id`),
    CONSTRAINT `fk_appr_creator` FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审批单表';

-- ==================== 审批详情表 ====================
CREATE TABLE `approval_detail` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `approval_id` BIGINT NOT NULL COMMENT '审批单ID',
    `approver_id` BIGINT NOT NULL COMMENT '审批人ID',
    `sequence` INT DEFAULT 0 COMMENT '审批顺序',
    `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending/approved/rejected',
    `opinion` TEXT COMMENT '审批意见',
    `operated_at` DATETIME COMMENT '操作时间',
    INDEX `idx_approval` (`approval_id`),
    INDEX `idx_approver` (`approver_id`),
    CONSTRAINT `fk_ad_approval` FOREIGN KEY (`approval_id`) REFERENCES `approval`(`id`),
    CONSTRAINT `fk_ad_approver` FOREIGN KEY (`approver_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审批详情表';

-- ==================== 自定义字段定义表 ====================
CREATE TABLE `custom_field` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `name` VARCHAR(100) NOT NULL COMMENT '字段名称',
    `type` VARCHAR(30) NOT NULL COMMENT '字段类型: text/number/date/select/multiselect/person/...',
    `config` JSON COMMENT '字段配置(选项列表、范围等)',
    `is_required` TINYINT DEFAULT 0 COMMENT '是否必填',
    `position` INT DEFAULT 0 COMMENT '排序位置',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_project` (`project_id`),
    CONSTRAINT `fk_cf_project` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自定义字段定义表';

-- ==================== 自定义字段值表 ====================
CREATE TABLE `custom_field_value` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `field_id` BIGINT NOT NULL COMMENT '字段ID',
    `task_id` BIGINT NOT NULL COMMENT '任务ID',
    `value` TEXT COMMENT '字段值(JSON格式存储)',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_field_task` (`field_id`, `task_id`),
    INDEX `idx_task` (`task_id`),
    CONSTRAINT `fk_cfv_field` FOREIGN KEY (`field_id`) REFERENCES `custom_field`(`id`),
    CONSTRAINT `fk_cfv_task` FOREIGN KEY (`task_id`) REFERENCES `task`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自定义字段值表';

-- ==================== 通知表 ====================
CREATE TABLE `notification` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL COMMENT '接收人ID',
    `type` VARCHAR(50) NOT NULL COMMENT '通知类型',
    `category` VARCHAR(20) NOT NULL COMMENT '分类: task/project/org/approval/system',
    `title` VARCHAR(255) NOT NULL COMMENT '通知标题',
    `content` TEXT COMMENT '通知内容',
    `related_type` VARCHAR(50) COMMENT '关联资源类型',
    `related_id` BIGINT COMMENT '关联资源ID',
    `sender_id` BIGINT COMMENT '发送人ID',
    `is_read` TINYINT DEFAULT 0 COMMENT '是否已读: 0-未读 1-已读',
    `read_at` DATETIME COMMENT '已读时间',
    `channel` VARCHAR(20) DEFAULT 'in_app' COMMENT '渠道: in_app/email/push/webhook',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user_read` (`user_id`, `is_read`),
    INDEX `idx_user_category` (`user_id`, `category`),
    INDEX `idx_created` (`created_at`),
    CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    CONSTRAINT `fk_notif_sender` FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- ==================== 通知偏好设置表 ====================
CREATE TABLE `notification_preference` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `notification_type` VARCHAR(50) NOT NULL COMMENT '通知类型',
    `channel` VARCHAR(20) NOT NULL COMMENT '渠道: in_app/email/push',
    `is_enabled` TINYINT DEFAULT 1 COMMENT '是否启用',
    `project_id` BIGINT COMMENT '项目级偏好，NULL表示全局',
    UNIQUE KEY `uk_user_type_channel_proj` (`user_id`, `notification_type`, `channel`, `project_id`),
    CONSTRAINT `fk_np_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知偏好设置表';

-- ==================== Webhook配置表 ====================
CREATE TABLE `webhook` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `name` VARCHAR(100) NOT NULL COMMENT 'Webhook名称',
    `url` VARCHAR(500) NOT NULL COMMENT '回调URL',
    `secret` VARCHAR(100) COMMENT '签名密钥',
    `events` JSON COMMENT '订阅的事件类型',
    `is_enabled` TINYINT DEFAULT 1 COMMENT '是否启用',
    `last_triggered_at` DATETIME COMMENT '最后触发时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_project` (`project_id`),
    CONSTRAINT `fk_wh_project` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Webhook配置表';
