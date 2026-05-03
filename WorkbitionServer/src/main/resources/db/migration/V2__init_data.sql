-- ============================================================
-- Workbition 种子数据初始化脚本
-- 版本: V2 - 预置角色和权限
-- ============================================================

-- ==================== 预置权限 ====================
INSERT INTO `permission` (`name`, `code`, `type`, `resource`, `action`, `description`) VALUES
-- 组织权限
('组织管理', 'org:manage', 'function', 'organization', 'manage', '组织设置、删除'),
('邀请组织成员', 'org:member:invite', 'function', 'organization', 'invite', '邀请成员加入组织'),
('移除组织成员', 'org:member:remove', 'function', 'organization', 'remove', '移除组织成员'),
('管理成员角色', 'org:member:role', 'function', 'organization', 'role', '变更组织成员角色'),
('创建项目', 'org:project:create', 'function', 'organization', 'create_project', '在组织下创建项目'),

-- 项目权限
('项目管理', 'project:manage', 'function', 'project', 'manage', '项目设置、删除、归档'),
('管理项目成员', 'project:member:manage', 'function', 'project', 'manage_member', '添加/移除项目成员'),
('查看项目', 'project:view', 'function', 'project', 'view', '查看项目信息'),
('导出项目数据', 'project:export', 'function', 'project', 'export', '导出项目数据'),

-- 任务权限
('创建任务', 'task:create', 'function', 'task', 'create', '创建新任务'),
('编辑任务', 'task:edit', 'function', 'task', 'edit', '编辑任务信息'),
('删除任务', 'task:delete', 'function', 'task', 'delete', '删除任务'),
('分配任务', 'task:assign', 'function', 'task', 'assign', '分配任务负责人'),
('转接任务', 'task:transfer', 'function', 'task', 'transfer', '转接/委托任务'),
('添加评论', 'task:comment', 'function', 'task', 'comment', '在任务下添加评论'),
('上传附件', 'task:attachment:upload', 'function', 'task', 'upload', '上传任务附件'),
('删除附件', 'task:attachment:delete', 'function', 'task', 'delete_attachment', '删除任务附件'),
('变更任务状态', 'task:status:change', 'function', 'task', 'change_status', '变更任务状态'),

-- 工作流权限
('管理工作流', 'workflow:manage', 'function', 'workflow', 'manage', '配置工作流和自动化规则'),

-- 自定义字段权限
('管理自定义字段', 'customfield:manage', 'function', 'custom_field', 'manage', '配置自定义字段'),

-- 文件权限
('上传文件', 'file:upload', 'function', 'file', 'upload', '上传文件'),
('删除文件', 'file:delete', 'function', 'file', 'delete', '删除文件'),
('分享文件', 'file:share', 'function', 'file', 'share', '分享文件'),

-- 报表权限
('查看报表', 'report:view', 'function', 'report', 'view', '查看数据统计报表'),
('导出报表', 'report:export', 'function', 'report', 'export', '导出报表数据');

-- ==================== 预置系统角色 ====================
INSERT INTO `role` (`org_id`, `name`, `code`, `description`, `type`, `is_default`) VALUES
(NULL, '超级管理员', 'super_admin', '系统超级管理员，拥有所有权限', 'system', 0);

-- ==================== 预置组织角色 ====================
INSERT INTO `role` (`org_id`, `name`, `code`, `description`, `type`, `is_default`) VALUES
(NULL, '组织所有者', 'org_owner', '组织所有者，拥有组织全部权限', 'org', 0),
(NULL, '组织管理员', 'org_admin', '组织管理员，可管理组织和项目', 'org', 0),
(NULL, '组织成员', 'org_member', '组织普通成员', 'org', 1);

-- ==================== 预置项目角色 ====================
INSERT INTO `role` (`org_id`, `name`, `code`, `description`, `type`, `is_default`) VALUES
(NULL, '项目管理员', 'project_admin', '项目管理员，拥有项目全部权限', 'project', 0),
(NULL, '项目成员', 'project_member', '项目成员，可创建和编辑任务', 'project', 1),
(NULL, '项目访客', 'project_guest', '项目访客，只读权限', 'project', 0);

-- ==================== 超级管理员角色权限（全部权限） ====================
INSERT INTO `role_permission` (`role_id`, `permission_id`)
SELECT
    (SELECT `id` FROM `role` WHERE `code` = 'super_admin' LIMIT 1),
    `id`
FROM `permission`;

-- ==================== 组织所有者角色权限 ====================
INSERT INTO `role_permission` (`role_id`, `permission_id`)
SELECT
    (SELECT `id` FROM `role` WHERE `code` = 'org_owner' LIMIT 1),
    `id`
FROM `permission`
WHERE `code` IN (
    'org:manage', 'org:member:invite', 'org:member:remove', 'org:member:role', 'org:project:create',
    'project:manage', 'project:member:manage', 'project:view', 'project:export',
    'task:create', 'task:edit', 'task:delete', 'task:assign', 'task:transfer', 'task:comment',
    'task:attachment:upload', 'task:attachment:delete', 'task:status:change',
    'workflow:manage', 'customfield:manage',
    'file:upload', 'file:delete', 'file:share',
    'report:view', 'report:export'
);

-- ==================== 组织管理员角色权限 ====================
INSERT INTO `role_permission` (`role_id`, `permission_id`)
SELECT
    (SELECT `id` FROM `role` WHERE `code` = 'org_admin' LIMIT 1),
    `id`
FROM `permission`
WHERE `code` IN (
    'org:member:invite', 'org:member:remove', 'org:project:create',
    'project:manage', 'project:member:manage', 'project:view', 'project:export',
    'task:create', 'task:edit', 'task:delete', 'task:assign', 'task:transfer', 'task:comment',
    'task:attachment:upload', 'task:attachment:delete', 'task:status:change',
    'workflow:manage', 'customfield:manage',
    'file:upload', 'file:delete', 'file:share',
    'report:view', 'report:export'
);

-- ==================== 组织成员角色权限 ====================
INSERT INTO `role_permission` (`role_id`, `permission_id`)
SELECT
    (SELECT `id` FROM `role` WHERE `code` = 'org_member' LIMIT 1),
    `id`
FROM `permission`
WHERE `code` IN (
    'org:project:create',
    'project:view',
    'task:create', 'task:edit', 'task:comment', 'task:attachment:upload', 'task:status:change',
    'file:upload',
    'report:view'
);

-- ==================== 项目管理员角色权限 ====================
INSERT INTO `role_permission` (`role_id`, `permission_id`)
SELECT
    (SELECT `id` FROM `role` WHERE `code` = 'project_admin' LIMIT 1),
    `id`
FROM `permission`
WHERE `code` IN (
    'project:manage', 'project:member:manage', 'project:view', 'project:export',
    'task:create', 'task:edit', 'task:delete', 'task:assign', 'task:transfer', 'task:comment',
    'task:attachment:upload', 'task:attachment:delete', 'task:status:change',
    'workflow:manage', 'customfield:manage',
    'file:upload', 'file:delete', 'file:share',
    'report:view', 'report:export'
);

-- ==================== 项目成员角色权限 ====================
INSERT INTO `role_permission` (`role_id`, `permission_id`)
SELECT
    (SELECT `id` FROM `role` WHERE `code` = 'project_member' LIMIT 1),
    `id`
FROM `permission`
WHERE `code` IN (
    'project:view',
    'task:create', 'task:edit', 'task:assign', 'task:comment',
    'task:attachment:upload', 'task:status:change',
    'file:upload',
    'report:view'
);

-- ==================== 项目访客角色权限 ====================
INSERT INTO `role_permission` (`role_id`, `permission_id`)
SELECT
    (SELECT `id` FROM `role` WHERE `code` = 'project_guest' LIMIT 1),
    `id`
FROM `permission`
WHERE `code` IN (
    'project:view',
    'task:comment',
    'report:view'
);
