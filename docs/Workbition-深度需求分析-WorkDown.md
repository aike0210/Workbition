# Workbition 深度需求分析文档（WorkDown 格式）

> **项目名称**: Workbition — 团队协作与项目管理平台
> **技术栈**: SpringBoot 3.x + React 18 + TypeScript + MySQL 8.0 + Redis
> **文档版本**: v2.0
> **创建日期**: 2026-05-03
> **参考产品**: 阿里云 Teambition

---

## 目录

- [1. 工作流引擎模块](#1-工作流引擎模块)
- [2. 权限管理模块](#2-权限管理模块)
- [3. 任务转接与协作模块](#3-任务转接与协作模块)
- [4. 消息与通知模块](#4-消息与通知模块)
- [5. 甘特图与任务依赖模块](#5-甘特图与任务依赖模块)
- [6. 自定义字段模块](#6-自定义字段模块)
- [7. 搜索与筛选模块](#7-搜索与筛选模块)
- [8. 数据库完整设计](#8-数据库完整设计)
- [9. API 接口完整设计](#9-api-接口完整设计)
- [10. 非功能性需求](#10-非功能性需求)
- [11. 开发里程碑与排期](#11-开发里程碑与排期)

---

## 1. 工作流引擎模块

### 1.1 功能概述

工作流引擎是 Workbition 的核心模块之一，负责管理任务的状态流转、自动化规则触发和审批流程。采用 **状态机 + 事件驱动** 的架构设计，既支持简单的状态流转，也支持复杂的条件分支和自动化。

### 1.2 状态机设计

#### 1.2.1 状态定义

```
┌─────────────────────────────────────────────────────────┐
│                    任务状态机                            │
│                                                         │
│   ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐        │
│   │ 待办  │───→│ 进行中│───→│ 待审核│───→│ 已完成│        │
│   │ TODO │    │ DOING│    │REVIEW│    │ DONE │        │
│   └──────┘    └──────┘    └──────┘    └──────┘        │
│      │            │            │                       │
│      │            ▼            ▼                       │
│      │        ┌──────┐    ┌──────┐                    │
│      └───────→│ 已关闭│    │ 已驳回│──→ 进行中          │
│               │CLOSED│    │REJECT│                    │
│               └──────┘    └──────┘                    │
└─────────────────────────────────────────────────────────┘
```

#### 1.2.2 状态流转规则

| 当前状态 | 可流转到 | 触发条件 | 权限要求 |
|---------|---------|---------|---------|
| 待办(TODO) | 进行中(DOING) | 手动触发 | 负责人/协作者 |
| 待办(TODO) | 已关闭(CLOSED) | 手动触发 | 管理员/负责人 |
| 进行中(DOING) | 待审核(REVIEW) | 手动触发 | 负责人 |
| 进行中(DOING) | 已完成(DONE) | 手动触发 | 负责人 |
| 进行中(DOING) | 已关闭(CLOSED) | 手动触发 | 管理员/负责人 |
| 待审核(REVIEW) | 已完成(DONE) | 审核通过 | 审核人 |
| 待审核(REVIEW) | 已驳回(REJECT) | 审核驳回 | 审核人 |
| 已驳回(REJECT) | 进行中(DOING) | 手动触发 | 负责人 |
| 已完成(DONE) | 进行中(DOING) | 重新打开 | 管理员/负责人 |
| 已关闭(CLOSED) | 进行中(DOING) | 重新打开 | 管理员 |

#### 1.2.3 自定义工作流

支持项目管理员自定义工作流状态和流转规则：

```
项目级工作流配置:
├── 状态列表（可增删改排序）
│   ├── 状态名称
│   ├── 状态颜色
│   ├── 状态类型（开始/中间/结束）
│   └── 状态图标
├── 流转规则
│   ├── 源状态 → 目标状态
│   ├── 流转条件（字段值匹配）
│   ├── 必填字段校验
│   ├── 流转权限控制
│   └── 流转后动作（触发器）
└── 审批配置
    ├── 审批人设置（指定人/角色/上级）
    ├── 审批方式（或签/会签）
    └── 超时处理
```

### 1.3 自动化规则引擎

#### 1.3.1 规则结构

```
自动化规则 = 触发器(Trigger) + 条件(Condition) + 动作(Action)

触发器类型:
├── 状态变更触发
├── 字段值变更触发
├── 任务创建触发
├── 截止日期触发（定时）
├── 成员变更触发
└── 评论触发（关键词匹配）

条件类型:
├── 字段值匹配（等于/不等于/包含/正则）
├── 成员匹配（负责人/创建人/协作者）
├── 时间条件（创建时间/截止时间）
└── 组合条件（AND/OR/NOT）

动作类型:
├── 更新字段值
├── 发送通知
├── 添加/移除协作者
├── 添加评论
├── 移动任务（跨列表/跨项目）
├── 创建子任务
├── 调用 Webhook
└── 延迟执行（等待N分钟后）
```

#### 1.3.2 规则示例

```
规则名称: Bug自动分配QA
触发器: 任务状态 从"进行中" 变为 "待审核"
条件: AND
  ├── 任务标签 包含 "bug"
  └── 项目字段 "严重程度" 等于 "严重"
动作:
  1. 将"审核人"字段设为 QA团队负责人
  2. 发送站内通知给QA团队
  3. 发送邮件通知给审核人
  4. 添加评论"已自动分配给QA团队审核"

规则名称: 截止日期提醒
触发器: 定时任务 每天 09:00 执行
条件: AND
  ├── 任务状态 不等于 "已完成"
  ├── 任务状态 不等于 "已关闭"
  └── 截止日期 在 未来24小时内
动作:
  1. 发送通知给负责人
  2. 标记任务为"紧急"
```

### 1.4 审批流程

#### 1.4.1 审批类型

| 审批类型 | 说明 | 场景 |
|---------|------|------|
| 或签 | 任一审批人通过即通过 | 普通任务审核 |
| 会签 | 所有审批人通过才通过 | 重要决策审批 |
| 依次审批 | 按顺序逐级审批 | 多级审批流程 |

#### 1.4.2 审批流程

```
发起审批 → 创建审批单 → 通知审批人
                            ↓
                    审批人处理（通过/驳回/转审）
                            ↓
                    ┌───────┴───────┐
                    ↓               ↓
                全部通过         有人驳回
                    ↓               ↓
            触发流转动作      通知发起人
            更新任务状态      任务回退状态
```

### 1.5 技术实现方案

#### 1.5.1 后端架构

```
┌─────────────────────────────────────────┐
│           WorkflowEngine                 │
│  ┌───────────┐  ┌───────────┐          │
│  │ StateMachine│  │ RuleEngine │          │
│  │  状态机引擎  │  │  规则引擎   │          │
│  └─────┬─────┘  └─────┬─────┘          │
│        └──────┬───────┘                 │
│               ▼                          │
│  ┌───────────────────────────┐          │
│  │     EventPublisher         │          │
│  │     (Spring Event)         │          │
│  └─────────────┬─────────────┘          │
│                ▼                         │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │通知监听器 │ │日志监听器 │ │触发器监听│ │
│  └──────────┘ └──────────┘ └─────────┘ │
└─────────────────────────────────────────┘
```

推荐技术选型:
- **轻量级方案**: Spring StateMachine + 自定义规则引擎
- **重量级方案**: Flowable 7.x（BPMN + CMMN）
- **建议**: MVP阶段使用轻量级方案，后续根据需求升级

---

## 2. 权限管理模块

### 2.1 权限模型设计

采用 **RBAC（基于角色的访问控制）+ 数据权限** 的混合模型。

#### 2.1.1 权限层级

```
系统层面
├── 超级管理员 (Super Admin)
│   └── 拥有系统所有权限
│
├── 组织层面
│   ├── 组织所有者 (Org Owner)
│   │   └── 组织全部权限 + 转让所有权
│   ├── 组织管理员 (Org Admin)
│   │   └── 组织管理 + 项目管理 + 成员管理
│   └── 组织成员 (Org Member)
│       └── 基础操作权限
│
├── 项目层面
│   ├── 项目管理员 (Project Admin)
│   │   └── 项目全部权限
│   ├── 项目成员 (Project Member)
│   │   └── 项目内任务操作权限
│   ├── 项目访客 (Project Guest)
│   │   └── 只读权限
│   └── 自定义角色 (Custom Role)
│       └── 自定义权限组合
│
└── 任务层面
    ├── 负责人 (Assignee)
    │   └── 任务全部操作权限
    ├── 协作者 (Collaborator)
    │   └── 任务编辑 + 评论权限
    ├── 审核人 (Reviewer)
    │   └── 审核 + 评论权限
    └── 关注者 (Follower)
        └── 查看 + 评论权限
```

#### 2.1.2 权限点定义

```
权限编码格式: {资源}:{操作}

系统权限:
├── system:manage          # 系统管理
├── org:create             # 创建组织
└── org:list               # 查看组织列表

组织权限:
├── org:manage             # 组织管理（设置、删除）
├── org:member:invite      # 邀请成员
├── org:member:remove      # 移除成员
├── org:member:role        # 管理成员角色
├── org:project:create     # 创建项目
└── org:billing:manage     # 管理计费

项目权限:
├── project:manage         # 项目管理（设置、删除、归档）
├── project:member:manage  # 项目成员管理
├── project:view           # 查看项目
├── project:export         # 导出项目数据
│
├── task:create            # 创建任务
├── task:edit              # 编辑任务（标题、描述等）
├── task:delete            # 删除任务
├── task:assign            # 分配任务
├── task:transfer          # 转接任务
├── task:comment           # 添加评论
├── task:attachment:upload  # 上传附件
├── task:attachment:delete  # 删除附件
├── task:status:change     # 变更任务状态
│
├── workflow:manage        # 管理工作流
├── customfield:manage     # 管理自定义字段
├── view:manage            # 管理视图
│
├── file:upload            # 上传文件
├── file:delete            # 删除文件
├── file:share             # 分享文件
│
└── report:view            # 查看报表
    report:export          # 导出报表
```

### 2.2 数据权限设计

#### 2.2.1 数据可见性规则

```
数据权限范围:
├── 全部数据 (ALL)
│   └── 可查看/操作组织下所有数据
├── 所在项目数据 (PROJECT)
│   └── 仅可查看/操作自己参与的项目数据
├── 所在团队数据 (TEAM)
│   └── 仅可查看/操作自己所在团队的数据
├── 个人数据 (SELF)
│   └── 仅可查看/操作自己创建/负责的数据
└── 自定义范围 (CUSTOM)
    └── 按指定条件过滤
```

#### 2.2.2 数据权限校验流程

```
用户请求 → 获取用户角色 → 获取角色权限
                              ↓
                    检查功能权限 (Permission Check)
                              ↓
                        ┌─────┴─────┐
                        ↓           ↓
                    有权限        无权限
                        ↓           ↓
                检查数据权限     返回403
                (Data Scope)
                        ↓
                构建数据查询条件
                (添加 WHERE 过滤)
                        ↓
                    返回数据
```

### 2.3 权限校验实现

#### 2.3.1 注解式权限校验

```java
// 自定义权限注解
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    String value();           // 权限编码
    String resourceType();    // 资源类型
    String resourceIdParam(); // 资源ID参数名
}

// 使用示例
@RequirePermission(value = "task:edit", resourceType = "task", resourceIdParam = "taskId")
@PutMapping("/tasks/{taskId}")
public Result updateTask(@PathVariable Long taskId, @RequestBody TaskUpdateDTO dto) {
    // 业务逻辑
}
```

#### 2.3.2 数据权限拦截器

```java
@Component
public class DataScopeInterceptor implements MethodInterceptor {
    
    @Override
    public Object invoke(MethodInvocation invocation) {
        // 1. 获取当前用户
        User currentUser = SecurityUtils.getCurrentUser();
        
        // 2. 获取用户数据权限范围
        DataScope dataScope = getDataScope(currentUser);
        
        // 3. 注入数据权限上下文
        DataScopeContextHolder.set(dataScope);
        
        try {
            return invocation.proceed();
        } finally {
            DataScopeContextHolder.clear();
        }
    }
}
```

### 2.4 自定义角色系统

#### 2.4.1 角色配置

```
自定义角色配置:
├── 角色名称（如"测试负责人"）
├── 角色描述
├── 权限列表（勾选权限点）
├── 数据范围（全部/项目/团队/个人）
├── 适用范围（组织级/项目级）
└── 状态（启用/禁用）
```

#### 2.4.2 预置角色模板

| 角色 | 权限范围 | 适用场景 |
|------|---------|---------|
| 项目负责人 | 项目全部权限 | 项目经理 |
| 开发人员 | 任务创建/编辑/状态变更 | 开发团队 |
| 测试人员 | 任务创建/评论/状态变更(受限) | 测试团队 |
| 观察者 | 只读 + 评论 | 外部协作者 |
| 访客 | 只读 | 客户/外部人员 |

---

## 3. 任务转接与协作模块

### 3.1 任务转接设计

#### 3.1.1 转接类型

```
任务转接类型:
├── 转接(Transfer)
│   ├── 说明: 责任完全转移给他人
│   ├── 发起人: 当前负责人
│   ├── 审批: 可选（接收人确认）
│   ├── 结果: 负责人变更，原负责人变为协作者
│   └── 场景: 负责人离职/请假/工作调整
│
├── 委托(Delegate)
│   ├── 说明: 临时代理，可随时收回
│   ├── 发起人: 当前负责人
│   ├── 审批: 无
│   ├── 结果: 双方都有操作权限，原负责人保持
│   └── 场景: 负责人短期请假，委托他人临时处理
│
└── 重新分配(Reassign)
    ├── 说明: 由管理员强制分配
    ├── 发起人: 项目管理员
    ├── 审批: 无
    ├── 结果: 直接更换负责人
    └── 场景: 管理层调整任务分配
```

#### 3.1.2 转接流程

```
转接流程（以"转接"类型为例）:

发起人 → 选择任务 → 点击"转接"
                        ↓
                选择接收人 → 填写转接原因
                        ↓
                ┌───────┴───────┐
                ↓               ↓
           需要审批          无需审批
                ↓               ↓
        创建审批单         直接执行转接
        通知审批人         更新任务负责人
                ↓           记录操作日志
        审批通过/驳回       通知相关人员
                ↓
        执行转接/取消
```

#### 3.1.3 转接规则

```
转接约束规则:
├── 转接人必须是任务当前负责人
├── 接收人必须是项目成员
├── 已完成/已关闭的任务不可转接（需先重新打开）
├── 转接申请有效期: 24小时（超时自动取消）
├── 委托有效期: 默认7天，可自定义
├── 转接后自动通知:
│   ├── 接收人: 收到待办通知
│   ├── 原负责人: 收到转接确认通知
│   ├── 项目管理员: 收到转接记录通知
│   └── 任务协作者: 收到状态变更通知
└── 防止循环转接: A→B→A 需间隔24小时
```

#### 3.1.4 转接记录与追溯

```
转接记录:
├── 转接ID
├── 关联任务ID
├── 转接类型（转接/委托/重新分配）
├── 转出人
├── 接收人
├── 转接原因
├── 转接状态（待确认/已接受/已拒绝/已取消/已收回）
├── 发起时间
├── 确认时间
├── 审批人（如有）
├── 审批意见（如有）
└── 操作日志（完整流转记录）
```

### 3.2 任务协作设计

#### 3.2.1 协作角色

| 角色 | 权限 | 说明 |
|------|------|------|
| 负责人(Assignee) | 全部操作 | 任务的主要执行者，每个任务有且仅有一个 |
| 协作者(Collaborator) | 编辑+评论+附件 | 参与任务执行的成员，可多个 |
| 审核人(Reviewer) | 审核+评论 | 负责审核任务成果 |
| 关注者(Follower) | 查看+评论 | 关注任务进展，接收通知 |

#### 3.2.2 协作操作

```
协作操作清单:
├── 添加协作者
│   ├── 操作人: 负责人/项目管理员
│   ├── 通知: 被添加人收到通知
│   └── 权限: 自动获得协作者权限
│
├── 移除协作者
│   ├── 操作人: 负责人/项目管理员
│   ├── 通知: 被移除人收到通知
│   └── 权限: 自动失去协作者权限
│
├── 关注/取消关注
│   ├── 操作人: 任何项目成员
│   └── 效果: 接收/停止接收任务通知
│
├── @提及
│   ├── 操作人: 任何有评论权限的人
│   ├── 位置: 任务描述/评论
│   └── 效果: 被@人收到通知，自动成为关注者
│
└── 任务评论
    ├── 操作人: 有评论权限的成员
    ├── 内容: 富文本 + @提及 + 附件
    └── 通知: 任务负责人 + 关注者
```

#### 3.2.3 协作权限矩阵

| 操作 | 负责人 | 协作者 | 审核人 | 关注者 |
|------|--------|--------|--------|--------|
| 编辑任务信息 | ✅ | ✅ | ❌ | ❌ |
| 变更任务状态 | ✅ | ✅ | ✅(审核相关) | ❌ |
| 转接/委托任务 | ✅ | ❌ | ❌ | ❌ |
| 添加/移除协作者 | ✅ | ❌ | ❌ | ❌ |
| 添加评论 | ✅ | ✅ | ✅ | ✅ |
| 上传附件 | ✅ | ✅ | ❌ | ❌ |
| 删除附件 | ✅ | ✅(自己上传的) | ❌ | ❌ |
| 查看任务 | ✅ | ✅ | ✅ | ✅ |
| 查看操作日志 | ✅ | ✅ | ✅ | ✅ |
| 删除任务 | ✅ | ❌ | ❌ | ❌ |

### 3.3 任务操作日志

```
操作日志记录:
├── 日志ID
├── 任务ID
├── 操作人
├── 操作类型:
│   ├── TASK_CREATED          # 任务创建
│   ├── TASK_UPDATED          # 任务更新
│   ├── TASK_DELETED          # 任务删除
│   ├── STATUS_CHANGED        # 状态变更
│   ├── ASSIGNEE_CHANGED      # 负责人变更
│   ├── COLLABORATOR_ADDED    # 协作者添加
│   ├── COLLABORATOR_REMOVED  # 协作者移除
│   ├── TASK_TRANSFERRED      # 任务转接
│   ├── TASK_DELEGATED        # 任务委托
│   ├── COMMENT_ADDED         # 评论添加
│   ├── ATTACHMENT_UPLOADED   # 附件上传
│   ├── ATTACHMENT_DELETED    # 附件删除
│   ├── DUE_DATE_CHANGED      # 截止日期变更
│   ├── PRIORITY_CHANGED      # 优先级变更
│   └── CUSTOM_FIELD_CHANGED  # 自定义字段变更
├── 操作详情（JSON格式，记录变更前后值）
├── 操作时间
├── 操作IP
└── 操作设备信息
```

---

## 4. 消息与通知模块

### 4.1 通知类型定义

#### 4.1.1 通知分类

```
通知类型分类:
├── 任务相关通知
│   ├── TASK_ASSIGNED          # 任务分配给我
│   ├── TASK_TRANSFERRED       # 任务转接给我
│   ├── TASK_TRANSFER_ACCEPTED # 我发起的转接被接受
│   ├── TASK_TRANSFER_REJECTED # 我发起的转接被拒绝
│   ├── TASK_COMPLETED         # 我关注的任务已完成
│   ├── TASK_OVERDUE           # 我的任务已逾期
│   ├── TASK_DUE_SOON          # 我的任务即将到期
│   ├── TASK_COMMENTED         # 我的任务有新评论
│   ├── TASK_MENTIONED         # 我被@提及
│   ├── TASK_STATUS_CHANGED    # 我关注的任务状态变更
│   └── SUBTASK_COMPLETED      # 子任务完成
│
├── 项目相关通知
│   ├── PROJECT_INVITED        # 被邀请加入项目
│   ├── PROJECT_ROLE_CHANGED   # 项目角色变更
│   ├── PROJECT_ANNOUNCEMENT   # 项目公告
│   └── PROJECT_ARCHIVED       # 项目归档
│
├── 组织相关通知
│   ├── ORG_INVITED            # 被邀请加入组织
│   ├── ORG_ROLE_CHANGED       # 组织角色变更
│   └── ORG_ANNOUNCEMENT       # 组织公告
│
├── 审批相关通知
│   ├── APPROVAL_PENDING       # 待我审批
│   ├── APPROVAL_APPROVED      # 审批通过
│   ├── APPROVAL_REJECTED      # 审批驳回
│   └── APPROVAL_TIMEOUT       # 审批超时
│
└── 系统通知
    ├── SYSTEM_MAINTENANCE     # 系统维护
    ├── SYSTEM_UPDATE          # 系统更新
    └── SECURITY_ALERT         # 安全提醒
```

### 4.2 通知渠道设计

#### 4.2.1 渠道类型

| 渠道 | 实时性 | 适用场景 | 实现方式 |
|------|--------|---------|---------|
| 站内通知 | 实时 | 日常工作通知 | WebSocket + 数据库 |
| 邮件通知 | 准实时 | 重要通知、摘要 | SMTP + 邮件队列 |
| 浏览器推送 | 实时 | 紧急通知 | Web Push API |
| Webhook | 实时 | 第三方集成 | HTTP回调 |
| 短信 | 准实时 | 紧急通知 | 短信网关 |

#### 4.2.2 通知偏好设置

```
用户通知偏好配置:
├── 全局设置
│   ├── 免打扰时段（如 22:00-08:00）
│   ├── 通知聚合（合并同类通知）
│   └── 通知声音开关
│
├── 按通知类型配置:
│   ├── 任务分配 → 站内 ✅ | 邮件 ✅ | 推送 ✅
│   ├── 任务转接 → 站内 ✅ | 邮件 ✅ | 推送 ✅
│   ├── 任务评论 → 站内 ✅ | 邮件 ❌ | 推送 ❌
│   ├── @提及   → 站内 ✅ | 邮件 ✅ | 推送 ✅
│   ├── 截止提醒 → 站内 ✅ | 邮件 ✅ | 推送 ✅
│   └── 项目公告 → 站内 ✅ | 邮件 ✅ | 推送 ❌
│
└── 按项目配置:
    └── 可为每个项目单独设置通知偏好
```

### 4.3 实时通知架构

#### 4.3.1 WebSocket 设计

```
WebSocket 连接管理:
├── 连接建立
│   ├── 用户登录后建立 WebSocket 连接
│   ├── 使用 JWT Token 进行身份验证
│   └── 连接成功后订阅个人通知频道
│
├── 频道订阅
│   ├── user:{userId}           # 个人通知频道
│   ├── project:{projectId}     # 项目通知频道
│   └── org:{orgId}             # 组织通知频道
│
├── 消息推送
│   ├── 服务端主动推送通知
│   ├── 支持消息确认机制（ACK）
│   └── 支持消息重发（超时未确认）
│
└── 连接维护
    ├── 心跳检测（30秒间隔）
    ├── 断线重连（指数退避）
    └── 多设备同时在线支持
```

#### 4.3.2 通知消息格式

```json
{
  "type": "notification",
  "data": {
    "id": "notif_123456",
    "category": "task",
    "eventType": "TASK_TRANSFERRED",
    "title": "任务转接",
    "content": "张三 将任务「修复登录Bug」转交给您",
    "relatedResource": {
      "type": "task",
      "id": "task_789",
      "name": "修复登录Bug",
      "projectId": "proj_456",
      "projectName": "Workbition开发"
    },
    "sender": {
      "id": "user_111",
      "name": "张三",
      "avatar": "https://..."
    },
    "actions": [
      {
        "type": "accept_transfer",
        "label": "接受",
        "url": "/api/v1/transfers/123/accept"
      },
      {
        "type": "reject_transfer",
        "label": "拒绝",
        "url": "/api/v1/transfers/123/reject"
      }
    ],
    "createdAt": "2026-05-03T10:30:00Z",
    "isRead": false
  }
}
```

### 4.4 通知聚合策略

```
聚合规则:
├── 时间窗口: 5分钟内同类通知合并
├── 聚合维度:
│   ├── 同一任务的多条评论 → 合并为"任务有N条新评论"
│   ├── 同一项目的多个通知 → 合并为"项目有N条新动态"
│   └── 同一操作的多个通知 → 合并为"批量操作通知"
├── 聚合展示:
│   ├── 标题: "张三 等3人评论了任务「修复Bug」"
│   └── 内容: 展示最新一条，其余折叠
└── 特殊规则:
    ├── 转接通知不聚合（每条都重要）
    ├── 审批通知不聚合
    └── @提及通知不聚合
```

### 4.5 邮件通知设计

```
邮件通知策略:
├── 即时邮件:
│   ├── 任务转接 → 立即发送
│   ├── 审批待办 → 立即发送
│   └── @提及 → 立即发送
│
├── 摘要邮件:
│   ├── 每日摘要 → 每天 09:00 发送
│   │   └── 包含: 今日待办、逾期任务、昨日动态
│   └── 每周摘要 → 每周一 09:00 发送
│       └── 包含: 本周计划、上周完成、统计数据
│
└── 邮件模板:
    ├── 任务分配通知模板
    ├── 任务转接通知模板
    ├── 审批通知模板
    ├── 截止提醒模板
    ├── 每日摘要模板
    └── 每周摘要模板
```

---

## 5. 甘特图与任务依赖模块

### 5.1 甘特图功能设计

#### 5.1.1 视图功能

```
甘特图视图:
├── 时间轴展示
│   ├── 日视图（按天展示）
│   ├── 周视图（按周展示）
│   ├── 月视图（按月展示）
│   └── 季度视图（按季度展示）
│
├── 任务条展示
│   ├── 任务名称
│   ├── 开始/结束日期
│   ├── 进度百分比（填充色）
│   ├── 负责人头像
│   ├── 优先级标识
│   └── 里程碑标记
│
├── 交互操作
│   ├── 拖拽调整开始/结束日期
│   ├── 拖拽调整任务时长
│   ├── 拖拽创建依赖关系
│   ├── 点击展开子任务
│   ├── 双击编辑任务
│   └── 右键菜单操作
│
├── 辅助功能
│   ├── 今日线标记
│   ├── 关键路径高亮
│   ├── 基线对比
│   ├── 资源负载视图
│   └── 缩放（放大/缩小/适应）
│
└── 筛选与分组
    ├── 按负责人分组
    ├── 按状态分组
    ├── 按优先级分组
    ├── 按标签分组
    └── 自定义筛选条件
```

### 5.2 任务依赖设计

#### 5.2.1 依赖类型

```
任务依赖类型:
├── FS (Finish-to-Start) 完成-开始
│   ├── 说明: 前置任务完成后，后续任务才能开始
│   ├── 示例: "需求评审" 完成后 → "开发" 才能开始
│   └── 最常用，占80%以上场景
│
├── FF (Finish-to-Finish) 完成-完成
│   ├── 说明: 前置任务完成后，后续任务才能完成
│   ├── 示例: "测试" 完成后 → "Bug修复" 才能完成
│   └── 两个任务可以同时进行
│
├── SS (Start-to-Start) 开始-开始
│   ├── 说明: 前置任务开始后，后续任务才能开始
│   ├── 示例: "UI设计" 开始后 → "前端开发" 才能开始
│   └── 两个任务同时开始，但可以不同步完成
│
└── SF (Start-to-Finish) 开始-完成
    ├── 说明: 前置任务开始后，后续任务才能完成
    ├── 示例: "新系统上线" 开始后 → "旧系统维护" 才能完成
    └── 最少用的依赖类型
```

#### 5.2.2 延隔时间(Lag)

```
延隔时间设计:
├── 正延隔: 前置任务完成后，等待N天，后续任务才开始
│   └── 示例: "代码提交" 后等待1天 → "代码审查"
│
├── 负延隔: 前置任务完成前N天，后续任务就可以开始
│   └── 示例: "设计" 完成前2天 → "开发" 就可以开始
│
└── 默认值: 0（无延隔）
```

#### 5.2.3 关键路径算法

```
关键路径计算步骤:

1. 正推法 (Forward Pass)
   - 计算每个任务的最早开始时间 (ES)
   - 计算每个任务的最早完成时间 (EF)
   - ES = 所有前置任务EF的最大值 + Lag
   - EF = ES + 任务工期

2. 逆推法 (Backward Pass)
   - 计算每个任务的最晚完成时间 (LF)
   - 计算每个任务的最晚开始时间 (LS)
   - LF = 所有后续任务LS的最小值 - Lag
   - LS = LF - 任务工期

3. 计算浮动时间
   - 总浮动 = LS - ES = LF - EF
   - 自由浮动 = 后续任务ES最小值 - EF

4. 确定关键路径
   - 总浮动为0的任务 → 关键任务
   - 关键任务组成的路径 → 关键路径
   - 关键路径决定项目最短工期
```

### 5.3 里程碑设计

```
里程碑功能:
├── 创建里程碑
│   ├── 名称
│   ├── 目标日期
│   ├── 关联任务
│   └── 描述
│
├── 里程碑状态
│   ├── 未到达 (Upcoming)
│   ├── 已到达 (Reached) - 所有关联任务完成
│   └── 已逾期 (Overdue) - 超过目标日期
│
└── 里程碑视图
    ├── 甘特图中的菱形标记
    ├── 里程碑列表视图
    └── 里程碑完成报告
```

---

## 6. 自定义字段模块

### 6.1 字段类型

| 字段类型 | 说明 | 配置项 |
|---------|------|--------|
| 单行文本 | 短文本输入 | 最大长度、正则校验 |
| 多行文本 | 长文本输入 | 最大长度 |
| 数字 | 数值输入 | 最小值、最大值、小数位 |
| 单选 | 下拉单选 | 选项列表、默认值 |
| 多选 | 下拉多选 | 选项列表、默认值 |
| 日期 | 日期选择 | 日期格式、默认值 |
| 时间 | 时间选择 | 时间格式 |
| 人员 | 选择成员 | 可选范围（项目/组织） |
| 团队 | 选择团队 | 可选范围 |
| 关联 | 关联任务 | 关联范围、关联类型 |
| 复选框 | 布尔值 | 默认值 |
| 评分 | 星级评分 | 最大星数 |
| 公式 | 自动计算 | 公式表达式 |
| 进度 | 百分比 | 范围0-100 |
| 链接 | URL链接 | 链接文本 |

### 6.2 公式字段

```
公式字段支持:
├── 算术运算: +, -, *, /
├── 比较运算: >, <, >=, <=, ==
├── 逻辑运算: AND, OR, NOT
├── 函数:
│   ├── SUM(字段1, 字段2, ...)     # 求和
│   ├── AVG(字段1, 字段2, ...)     # 平均值
│   ├── MIN(字段1, 字段2, ...)     # 最小值
│   ├── MAX(字段1, 字段2, ...)     # 最大值
│   ├── IF(条件, 真值, 假值)        # 条件判断
│   ├── CONCAT(字段1, 字段2, ...)  # 文本拼接
│   ├── DAYS(日期1, 日期2)         # 日期差
│   └── ROUND(数值, 小数位)        # 四舍五入
└── 示例:
    ├── 剩余天数 = DAYS(截止日期, TODAY())
    ├── 完成率 = IF(总任务数>0, 已完成数/总任务数*100, 0)
    └── 加权分数 = 重要度*0.4 + 紧急度*0.3 + 价值*0.3
```

---

## 7. 搜索与筛选模块

### 7.1 全局搜索

```
全局搜索功能:
├── 搜索范围
│   ├── 项目名称/描述
│   ├── 任务标题/描述/评论
│   ├── 文件名称
│   ├── 成员名称
│   └── 自定义字段值
│
├── 搜索语法
│   ├── 关键词搜索: 修复Bug
│   ├── 精确匹配: "修复登录Bug"
│   ├── 字段搜索: assignee:张三 status:进行中
│   ├── 范围搜索: due:2026-05-01..2026-05-31
│   ├── 排除搜索: -标签:测试
│   └── 组合搜索: assignee:张三 status:进行中 priority:高
│
├── 搜索结果
│   ├── 按相关度排序
│   ├── 按类型分组（项目/任务/文件/成员）
│   ├── 高亮匹配关键词
│   └── 快速预览
│
└── 搜索历史
    ├── 保存最近20条搜索记录
    └── 支持清除搜索历史
```

### 7.2 高级筛选

```
筛选器功能:
├── 预设筛选器
│   ├── 我负责的
│   ├── 我创建的
│   ├── 分配给我的
│   ├── 今日到期
│   ├── 已逾期
│   ├── 高优先级
│   └── 最近更新
│
├── 自定义筛选器
│   ├── 筛选条件组合（AND/OR）
│   ├── 支持所有字段筛选
│   ├── 保存筛选条件
│   ├── 分享筛选条件（团队共享）
│   └── 设为默认视图
│
└── 筛选条件类型:
    ├── 等于 / 不等于
    ├── 包含 / 不包含
    ├── 大于 / 小于
    ├── 在范围内 / 不在范围内
    ├── 为空 / 不为空
    ├── 是 / 不是（布尔字段）
    └── 日期相关（今天/本周/本月/自定义范围）
```

---

## 8. 数据库完整设计

### 8.1 用户与组织模块

```sql
-- 用户表
CREATE TABLE `user` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `phone` VARCHAR(20) UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `nickname` VARCHAR(50),
    `avatar_url` VARCHAR(500),
    `status` TINYINT DEFAULT 1 COMMENT '0:禁用 1:正常',
    `last_login_at` DATETIME,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_email` (`email`),
    INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 组织表
CREATE TABLE `organization` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `logo_url` VARCHAR(500),
    `description` TEXT,
    `owner_id` BIGINT NOT NULL,
    `status` TINYINT DEFAULT 1 COMMENT '0:禁用 1:正常',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 组织成员表
CREATE TABLE `org_member` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `org_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'member' COMMENT 'owner/admin/member',
    `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_org_user` (`org_id`, `user_id`),
    FOREIGN KEY (`org_id`) REFERENCES `organization`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 团队表
CREATE TABLE `team` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `org_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `leader_id` BIGINT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`org_id`) REFERENCES `organization`(`id`),
    FOREIGN KEY (`leader_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 团队成员表
CREATE TABLE `team_member` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `team_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `role` VARCHAR(20) DEFAULT 'member',
    `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_team_user` (`team_id`, `user_id`),
    FOREIGN KEY (`team_id`) REFERENCES `team`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 8.2 权限模块

```sql
-- 角色表
CREATE TABLE `role` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `org_id` BIGINT COMMENT 'NULL表示系统角色',
    `name` VARCHAR(50) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `description` VARCHAR(200),
    `type` VARCHAR(20) NOT NULL COMMENT 'system/org/project',
    `is_default` TINYINT DEFAULT 0,
    `status` TINYINT DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_org_code` (`org_id`, `code`),
    FOREIGN KEY (`org_id`) REFERENCES `organization`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 权限表
CREATE TABLE `permission` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `code` VARCHAR(100) NOT NULL UNIQUE,
    `type` VARCHAR(20) NOT NULL COMMENT 'function/data',
    `resource` VARCHAR(50) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `description` VARCHAR(200),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 角色-权限关联表
CREATE TABLE `role_permission` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `role_id` BIGINT NOT NULL,
    `permission_id` BIGINT NOT NULL,
    UNIQUE KEY `uk_role_perm` (`role_id`, `permission_id`),
    FOREIGN KEY (`role_id`) REFERENCES `role`(`id`),
    FOREIGN KEY (`permission_id`) REFERENCES `permission`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户-角色关联表
CREATE TABLE `user_role` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,
    `resource_type` VARCHAR(50) NOT NULL COMMENT 'org/project',
    `resource_id` BIGINT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_role_resource` (`user_id`, `role_id`, `resource_type`, `resource_id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`role_id`) REFERENCES `role`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 数据权限规则表
CREATE TABLE `data_scope_rule` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `role_id` BIGINT NOT NULL,
    `resource_type` VARCHAR(50) NOT NULL,
    `scope_type` VARCHAR(20) NOT NULL COMMENT 'all/project/team/self/custom',
    `scope_config` JSON COMMENT '自定义范围配置',
    FOREIGN KEY (`role_id`) REFERENCES `role`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 8.3 项目与任务模块

```sql
-- 项目表
CREATE TABLE `project` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `org_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `icon` VARCHAR(50),
    `color` VARCHAR(20),
    `visibility` VARCHAR(20) DEFAULT 'private' COMMENT 'public/private',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT 'active/archived/deleted',
    `start_date` DATE,
    `end_date` DATE,
    `template_id` BIGINT,
    `creator_id` BIGINT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`org_id`) REFERENCES `organization`(`id`),
    FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 项目成员表
CREATE TABLE `project_member` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'member' COMMENT 'admin/member/guest',
    `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_proj_user` (`project_id`, `user_id`),
    FOREIGN KEY (`project_id`) REFERENCES `project`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 任务列表(泳道)表
CREATE TABLE `task_list` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `position` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `project`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 任务表
CREATE TABLE `task` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `task_list_id` BIGINT,
    `parent_task_id` BIGINT COMMENT '父任务ID，NULL表示顶级任务',
    `title` VARCHAR(255) NOT NULL,
    `description` LONGTEXT,
    `status` VARCHAR(50) NOT NULL DEFAULT 'TODO',
    `priority` VARCHAR(20) DEFAULT 'medium' COMMENT 'urgent/high/medium/low',
    `assignee_id` BIGINT COMMENT '负责人',
    `creator_id` BIGINT NOT NULL,
    `start_date` DATETIME,
    `due_date` DATETIME,
    `completed_at` DATETIME,
    `progress` DECIMAL(5,2) DEFAULT 0 COMMENT '进度百分比',
    `position` INT DEFAULT 0,
    `is_milestone` TINYINT DEFAULT 0,
    `estimated_hours` DECIMAL(8,2) COMMENT '预估工时',
    `actual_hours` DECIMAL(8,2) COMMENT '实际工时',
    `tags` JSON COMMENT '标签列表',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `project`(`id`),
    FOREIGN KEY (`task_list_id`) REFERENCES `task_list`(`id`),
    FOREIGN KEY (`parent_task_id`) REFERENCES `task`(`id`),
    FOREIGN KEY (`assignee_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`),
    INDEX `idx_project` (`project_id`),
    INDEX `idx_assignee` (`assignee_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 任务依赖表
CREATE TABLE `task_dependency` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `predecessor_id` BIGINT NOT NULL COMMENT '前置任务',
    `successor_id` BIGINT NOT NULL COMMENT '后续任务',
    `dependency_type` VARCHAR(5) NOT NULL DEFAULT 'FS' COMMENT 'FS/FF/SS/SF',
    `lag_days` INT DEFAULT 0 COMMENT '延隔天数',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_dep` (`predecessor_id`, `successor_id`),
    FOREIGN KEY (`predecessor_id`) REFERENCES `task`(`id`),
    FOREIGN KEY (`successor_id`) REFERENCES `task`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 任务协作者表
CREATE TABLE `task_collaborator` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `task_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'collaborator' COMMENT 'collaborator/reviewer/follower',
    `added_by` BIGINT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_task_user` (`task_id`, `user_id`),
    FOREIGN KEY (`task_id`) REFERENCES `task`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`added_by`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 任务转接记录表
CREATE TABLE `task_transfer` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `task_id` BIGINT NOT NULL,
    `transfer_type` VARCHAR(20) NOT NULL COMMENT 'transfer/delegate/reassign',
    `from_user_id` BIGINT NOT NULL,
    `to_user_id` BIGINT NOT NULL,
    `reason` TEXT,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/accepted/rejected/cancelled/expired',
    `approver_id` BIGINT COMMENT '审批人',
    `approved_at` DATETIME,
    `expired_at` DATETIME COMMENT '过期时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`task_id`) REFERENCES `task`(`id`),
    FOREIGN KEY (`from_user_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`to_user_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`approver_id`) REFERENCES `user`(`id`),
    INDEX `idx_to_user_status` (`to_user_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 评论表
CREATE TABLE `comment` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `task_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `parent_id` BIGINT COMMENT '回复的评论ID',
    `mentions` JSON COMMENT '被@的用户ID列表',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`task_id`) REFERENCES `task`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`parent_id`) REFERENCES `comment`(`id`),
    INDEX `idx_task` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 附件表
CREATE TABLE `attachment` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `task_id` BIGINT COMMENT '关联任务',
    `project_id` BIGINT COMMENT '关联项目',
    `file_name` VARCHAR(255) NOT NULL,
    `file_size` BIGINT NOT NULL,
    `file_type` VARCHAR(50),
    `storage_path` VARCHAR(500) NOT NULL,
    `uploader_id` BIGINT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`task_id`) REFERENCES `task`(`id`),
    FOREIGN KEY (`project_id`) REFERENCES `project`(`id`),
    FOREIGN KEY (`uploader_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 操作日志表
CREATE TABLE `activity_log` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT,
    `task_id` BIGINT,
    `user_id` BIGINT NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `detail` JSON COMMENT '变更详情',
    `ip_address` VARCHAR(50),
    `user_agent` VARCHAR(500),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `project`(`id`),
    FOREIGN KEY (`task_id`) REFERENCES `task`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    INDEX `idx_task` (`task_id`),
    INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 8.4 工作流模块

```sql
-- 工作流定义表
CREATE TABLE `workflow` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `is_default` TINYINT DEFAULT 0,
    `status` TINYINT DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `project`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 工作流状态表
CREATE TABLE `workflow_state` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `workflow_id` BIGINT NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `color` VARCHAR(20),
    `icon` VARCHAR(50),
    `type` VARCHAR(20) NOT NULL COMMENT 'start/intermediate/end',
    `position` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`workflow_id`) REFERENCES `workflow`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 工作流转换规则表
CREATE TABLE `workflow_transition` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `workflow_id` BIGINT NOT NULL,
    `from_state_id` BIGINT NOT NULL,
    `to_state_id` BIGINT NOT NULL,
    `name` VARCHAR(100),
    `conditions` JSON COMMENT '流转条件',
    `required_fields` JSON COMMENT '必填字段',
    `allowed_roles` JSON COMMENT '允许执行的角色',
    `auto_actions` JSON COMMENT '自动执行动作',
    `requires_approval` TINYINT DEFAULT 0,
    `approval_config` JSON COMMENT '审批配置',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`workflow_id`) REFERENCES `workflow`(`id`),
    FOREIGN KEY (`from_state_id`) REFERENCES `workflow_state`(`id`),
    FOREIGN KEY (`to_state_id`) REFERENCES `workflow_state`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 自动化规则表
CREATE TABLE `automation_rule` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `trigger_type` VARCHAR(50) NOT NULL,
    `trigger_config` JSON,
    `conditions` JSON,
    `actions` JSON,
    `is_enabled` TINYINT DEFAULT 1,
    `execution_count` INT DEFAULT 0,
    `last_executed_at` DATETIME,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `project`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 审批单表
CREATE TABLE `approval` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `task_id` BIGINT NOT NULL,
    `workflow_transition_id` BIGINT,
    `type` VARCHAR(20) NOT NULL COMMENT 'or_sign/and_sign/sequential',
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/approved/rejected/cancelled',
    `creator_id` BIGINT NOT NULL,
    `reason` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `completed_at` DATETIME,
    FOREIGN KEY (`task_id`) REFERENCES `task`(`id`),
    FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 审批详情表
CREATE TABLE `approval_detail` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `approval_id` BIGINT NOT NULL,
    `approver_id` BIGINT NOT NULL,
    `sequence` INT DEFAULT 0 COMMENT '审批顺序',
    `status` VARCHAR(20) DEFAULT 'pending' COMMENT 'pending/approved/rejected',
    `opinion` TEXT,
    `operated_at` DATETIME,
    FOREIGN KEY (`approval_id`) REFERENCES `approval`(`id`),
    FOREIGN KEY (`approver_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 8.5 自定义字段模块

```sql
-- 自定义字段定义表
CREATE TABLE `custom_field` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(30) NOT NULL COMMENT 'text/number/date/select/multiselect/person/...',
    `config` JSON COMMENT '字段配置(选项列表、范围等)',
    `is_required` TINYINT DEFAULT 0,
    `position` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `project`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 自定义字段值表
CREATE TABLE `custom_field_value` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `field_id` BIGINT NOT NULL,
    `task_id` BIGINT NOT NULL,
    `value` TEXT COMMENT '字段值(JSON格式存储)',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_field_task` (`field_id`, `task_id`),
    FOREIGN KEY (`field_id`) REFERENCES `custom_field`(`id`),
    FOREIGN KEY (`task_id`) REFERENCES `task`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 8.6 通知模块

```sql
-- 通知表
CREATE TABLE `notification` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL COMMENT '接收人',
    `type` VARCHAR(50) NOT NULL,
    `category` VARCHAR(20) NOT NULL COMMENT 'task/project/org/approval/system',
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT,
    `related_type` VARCHAR(50) COMMENT '关联资源类型',
    `related_id` BIGINT COMMENT '关联资源ID',
    `sender_id` BIGINT COMMENT '发送人',
    `is_read` TINYINT DEFAULT 0,
    `read_at` DATETIME,
    `channel` VARCHAR(20) DEFAULT 'in_app',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`),
    INDEX `idx_user_read` (`user_id`, `is_read`),
    INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 通知偏好设置表
CREATE TABLE `notification_preference` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `notification_type` VARCHAR(50) NOT NULL,
    `channel` VARCHAR(20) NOT NULL,
    `is_enabled` TINYINT DEFAULT 1,
    `project_id` BIGINT COMMENT '项目级偏好',
    UNIQUE KEY `uk_user_type_channel_proj` (`user_id`, `notification_type`, `channel`, `project_id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Webhook配置表
CREATE TABLE `webhook` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `project_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `secret` VARCHAR(100),
    `events` JSON COMMENT '订阅的事件类型',
    `is_enabled` TINYINT DEFAULT 1,
    `last_triggered_at` DATETIME,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `project`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 9. API 接口完整设计

### 9.1 认证模块

```
认证相关 API:

POST /api/v1/auth/register
  Body: { username, email, password, captcha }
  Response: { user, token }

POST /api/v1/auth/login
  Body: { email, password }
  Response: { user, accessToken, refreshToken }

POST /api/v1/auth/refresh
  Body: { refreshToken }
  Response: { accessToken, refreshToken }

POST /api/v1/auth/logout
  Header: Authorization: Bearer {token}
  Response: { success }

POST /api/v1/auth/forgot-password
  Body: { email }
  Response: { success }

POST /api/v1/auth/reset-password
  Body: { token, newPassword }
  Response: { success }

POST /api/v1/auth/oauth/{provider}
  Body: { code, redirectUri }
  Response: { user, token }
```

### 9.2 用户模块

```
用户相关 API:

GET /api/v1/users/me
  Response: { user profile }

PUT /api/v1/users/me
  Body: { nickname, avatar, ... }
  Response: { updated user }

PUT /api/v1/users/me/password
  Body: { oldPassword, newPassword }
  Response: { success }

GET /api/v1/users/me/notification-preferences
  Response: { preferences }

PUT /api/v1/users/me/notification-preferences
  Body: { preferences }
  Response: { success }
```

### 9.3 组织模块

```
组织相关 API:

POST /api/v1/organizations
  Body: { name, description }
  Response: { organization }

GET /api/v1/organizations
  Response: { organizations[] }

GET /api/v1/organizations/{orgId}
  Response: { organization }

PUT /api/v1/organizations/{orgId}
  Body: { name, description, logo }
  Response: { organization }

DELETE /api/v1/organizations/{orgId}
  Response: { success }

POST /api/v1/organizations/{orgId}/members
  Body: { email, role }
  Response: { member }

GET /api/v1/organizations/{orgId}/members
  Query: { page, size, keyword }
  Response: { members[], total }

PUT /api/v1/organizations/{orgId}/members/{userId}
  Body: { role }
  Response: { member }

DELETE /api/v1/organizations/{orgId}/members/{userId}
  Response: { success }
```

### 9.4 项目模块

```
项目相关 API:

POST /api/v1/projects
  Body: { name, description, orgId, visibility, templateId }
  Response: { project }

GET /api/v1/projects
  Query: { orgId, status, page, size }
  Response: { projects[], total }

GET /api/v1/projects/{projectId}
  Response: { project, members, stats }

PUT /api/v1/projects/{projectId}
  Body: { name, description, visibility, ... }
  Response: { project }

DELETE /api/v1/projects/{projectId}
  Response: { success }

POST /api/v1/projects/{projectId}/archive
  Response: { success }

POST /api/v1/projects/{projectId}/members
  Body: { userIds, role }
  Response: { members[] }

GET /api/v1/projects/{projectId}/members
  Response: { members[] }

PUT /api/v1/projects/{projectId}/members/{userId}
  Body: { role }
  Response: { member }
```

### 9.5 任务模块

```
任务相关 API:

POST /api/v1/tasks
  Body: { projectId, taskListId, title, description, assigneeId, priority, dueDate, ... }
  Response: { task }

GET /api/v1/tasks
  Query: { projectId, status, assigneeId, priority, page, size, sort }
  Response: { tasks[], total }

GET /api/v1/tasks/{taskId}
  Response: { task, subtasks, comments, attachments, activities }

PUT /api/v1/tasks/{taskId}
  Body: { title, description, priority, dueDate, ... }
  Response: { task }

DELETE /api/v1/tasks/{taskId}
  Response: { success }

PATCH /api/v1/tasks/{taskId}/status
  Body: { status, comment? }
  Response: { task }

PATCH /api/v1/tasks/{taskId}/assignee
  Body: { assigneeId }
  Response: { task }

PATCH /api/v1/tasks/{taskId}/position
  Body: { taskListId, position }
  Response: { task }

POST /api/v1/tasks/{taskId}/subtasks
  Body: { title, assigneeId }
  Response: { subtask }

GET /api/v1/tasks/{taskId}/activities
  Query: { page, size }
  Response: { activities[], total }

POST /api/v1/tasks/batch
  Body: { taskIds, action, params }
  Response: { success }
```

### 9.6 任务转接模块

```
任务转接 API:

POST /api/v1/tasks/{taskId}/transfer
  Body: { toUserId, type, reason }
  Response: { transfer }

GET /api/v1/tasks/{taskId}/transfers
  Response: { transfers[] }

POST /api/v1/transfers/{transferId}/accept
  Response: { transfer }

POST /api/v1/transfers/{transferId}/reject
  Body: { reason? }
  Response: { transfer }

POST /api/v1/transfers/{transferId}/cancel
  Response: { transfer }

POST /api/v1/tasks/{taskId}/collaborators
  Body: { userId, role }
  Response: { collaborator }

DELETE /api/v1/tasks/{taskId}/collaborators/{userId}
  Response: { success }

GET /api/v1/tasks/{taskId}/collaborators
  Response: { collaborators[] }
```

### 9.7 评论模块

```
评论相关 API:

POST /api/v1/tasks/{taskId}/comments
  Body: { content, mentions[], parentId? }
  Response: { comment }

GET /api/v1/tasks/{taskId}/comments
  Query: { page, size }
  Response: { comments[], total }

PUT /api/v1/comments/{commentId}
  Body: { content }
  Response: { comment }

DELETE /api/v1/comments/{commentId}
  Response: { success }
```

### 9.8 工作流模块

```
工作流相关 API:

POST /api/v1/projects/{projectId}/workflows
  Body: { name, states[], transitions[] }
  Response: { workflow }

GET /api/v1/projects/{projectId}/workflows
  Response: { workflows[] }

GET /api/v1/workflows/{workflowId}
  Response: { workflow, states, transitions }

PUT /api/v1/workflows/{workflowId}
  Body: { name, states[], transitions[] }
  Response: { workflow }

POST /api/v1/projects/{projectId}/automation-rules
  Body: { name, trigger, conditions, actions }
  Response: { rule }

GET /api/v1/projects/{projectId}/automation-rules
  Response: { rules[] }

PUT /api/v1/automation-rules/{ruleId}
  Body: { name, trigger, conditions, actions, isEnabled }
  Response: { rule }

POST /api/v1/approvals/{approvalId}/approve
  Body: { opinion }
  Response: { approval }

POST /api/v1/approvals/{approvalId}/reject
  Body: { opinion }
  Response: { approval }
```

### 9.9 通知模块

```
通知相关 API:

GET /api/v1/notifications
  Query: { category, isRead, page, size }
  Response: { notifications[], total, unreadCount }

GET /api/v1/notifications/unread-count
  Response: { count }

PATCH /api/v1/notifications/{notificationId}/read
  Response: { success }

POST /api/v1/notifications/read-all
  Body: { category? }
  Response: { success }

DELETE /api/v1/notifications/{notificationId}
  Response: { success }

WebSocket: ws://api.example.com/ws
  订阅: { type: "subscribe", channel: "user:{userId}" }
  推送: { type: "notification", data: { ... } }
  心跳: { type: "ping" } / { type: "pong" }
```

### 9.10 搜索模块

```
搜索相关 API:

GET /api/v1/search
  Query: { q, type, projectId, page, size }
  Response: { results[], total, took }

GET /api/v1/search/suggestions
  Query: { q }
  Response: { suggestions[] }

GET /api/v1/search/history
  Response: { history[] }

DELETE /api/v1/search/history
  Response: { success }
```

---

## 10. 非功能性需求

### 10.1 性能要求

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 页面加载时间 | < 2秒 | 首屏加载 |
| API 响应时间 | < 200ms | 95%请求 |
| WebSocket 延迟 | < 500ms | 实时通知 |
| 并发用户数 | 1000+ | 单实例支持 |
| 数据库查询 | < 100ms | 常规查询 |
| 搜索响应 | < 500ms | 全文搜索 |

### 10.2 安全要求

```
安全策略:
├── 传输安全
│   ├── HTTPS 全站加密
│   ├── WebSocket 使用 WSS
│   └── API 请求签名（可选）
│
├── 认证安全
│   ├── JWT Token 认证
│   ├── Token 过期机制（AccessToken 2小时，RefreshToken 7天）
│   ├── 登录失败锁定（5次失败锁定30分钟）
│   └── 密码强度要求（8位以上，包含大小写字母和数字）
│
├── 数据安全
│   ├── 密码 BCrypt 加密存储
│   ├── 敏感数据 AES 加密
│   ├── SQL 注入防护（参数化查询）
│   ├── XSS 防护（输入过滤+输出编码）
│   └── CSRF 防护（Token 验证）
│
├── 访问控制
│   ├── RBAC 权限模型
│   ├── API 级别权限校验
│   ├── 数据级别权限过滤
│   └── 接口限流（令牌桶算法）
│
└── 审计安全
    ├── 操作日志记录
    ├── 登录日志记录
    ├── 敏感操作二次验证
    └── 异常行为检测
```

### 10.3 可用性要求

```
可用性保障:
├── 系统可用性 > 99.9%
├── 数据备份
│   ├── MySQL 每日全量备份
│   ├── MySQL 实时增量备份（binlog）
│   ├── Redis AOF 持久化
│   └── 文件存储多副本
├── 故障恢复
│   ├── RTO（恢复时间目标）< 30分钟
│   └── RPO（恢复点目标）< 5分钟
└── 监控告警
    ├── 服务健康检查
    ├── 性能指标监控
    ├── 错误日志告警
    └── 资源使用告警
```

---

## 11. 开发里程碑与排期

### Phase 1 — 基础架构与核心功能（6周）

```
Week 1-2: 项目搭建
├── 后端 SpringBoot 项目骨架
├── 前端 React + TypeScript 项目骨架
├── 数据库设计与初始化
├── 用户认证（注册/登录/JWT）
└── 基础 API 框架

Week 3-4: 组织与项目
├── 组织管理（CRUD + 成员管理）
├── 项目管理（CRUD + 成员管理）
├── 权限系统（RBAC 基础实现）
└── 前端布局与路由

Week 5-6: 任务管理基础
├── 任务 CRUD
├── 任务列表管理
├── 看板视图
├── 任务状态流转
└── 基础筛选与搜索
```

### Phase 2 — 协作与工作流（6周）

```
Week 7-8: 任务协作
├── 子任务管理
├── 任务评论与 @提及
├── 任务附件上传
├── 任务转接/委托
└── 操作日志

Week 9-10: 工作流引擎
├── 自定义工作流
├── 状态机实现
├── 流转规则配置
├── 自动化规则引擎
└── 审批流程

Week 11-12: 通知系统
├── 站内通知（WebSocket）
├── 通知偏好设置
├── 邮件通知
├── 通知聚合
└── Webhook 集成
```

### Phase 3 — 高级功能（6周）

```
Week 13-14: 视图增强
├── 甘特图视图
├── 任务依赖管理
├── 关键路径计算
├── 日历视图
└── 表格视图

Week 15-16: 自定义与报表
├── 自定义字段
├── 项目模板
├── 数据统计报表
├── 数据导出
└── 高级搜索

Week 17-18: 优化与完善
├── 性能优化
├── 响应式适配
├── 安全加固
├── 文档完善
└── 集成测试
```

---

## 附录

### A. 技术选型清单

#### 后端（SpringBoot 3.x + Java 17）

| 类别 | 库 | 版本 | 用途 |
|------|------|------|------|
| 核心框架 | spring-boot-starter-web | 3.2+ | Web框架 |
| 核心框架 | spring-boot-starter-websocket | 3.2+ | WebSocket支持 |
| 核心框架 | spring-boot-starter-security | 3.2+ | 安全框架 |
| 核心框架 | spring-boot-starter-validation | 3.2+ | 参数校验（JSR 380） |
| 核心框架 | spring-boot-starter-mail | 3.2+ | 邮件发送 |
| 核心框架 | spring-boot-starter-data-redis | 3.2+ | Redis集成 |
| 核心框架 | spring-boot-starter-aop | 3.2+ | AOP切面（权限拦截） |
| 核心框架 | spring-boot-starter-actuator | 3.2+ | 健康检查/监控 |
| ORM | mybatis-plus-spring-boot3-starter | 3.5+ | ORM框架 |
| ORM | mybatis-plus-extension | 3.5+ | 分页插件等 |
| 数据库 | mysql-connector-j | 8.0+ | MySQL驱动 |
| 数据库 | flyway-core | 10.x | 数据库迁移 |
| 缓存 | redisson-spring-boot-starter | 3.25+ | 分布式锁/高级Redis功能 |
| 安全 | jjwt-api | 0.12+ | JWT Token生成 |
| 安全 | jjwt-impl | 0.12+ | JWT Token解析 |
| 安全 | jjwt-jackson | 0.12+ | JWT JSON序列化 |
| 安全 | spring-security-oauth2-client | 6.1+ | 第三方登录 |
| 文件存储 | minio | 8.5+ | MinIO Java SDK |
| 搜索 | elasticsearch-java | 8.x | ES客户端（Phase 3可选） |
| 消息队列 | rocketmq-spring-boot-starter | 2.3+ | 异步消息（Phase 2引入） |
| API文档 | knife4j-openapi3-jakarta-spring-boot-starter | 4.3+ | Swagger/Knife4j |
| 工具 | hutool-all | 5.8+ | 通用工具库 |
| 工具 | lombok | 最新 | 代码简化 |
| 工具 | mapstruct | 1.5+ | 对象映射（DTO转换） |
| 工具 | guava | 32+ | 集合/缓存/限流 |
| 工具 | commons-lang3 | 3.14+ | 字符串/对象工具 |
| 工具 | easyexcel | 3.3+ | Excel导入导出 |
| 工具 | jsoup | 1.17+ | HTML清理（XSS防护） |
| 测试 | spring-boot-starter-test | 3.2+ | 测试框架 |
| 测试 | junit-jupiter | 5.10+ | 单元测试 |
| 测试 | mockito-core | 5.x | Mock框架 |

#### 前端（React 18 + TypeScript）

| 类别 | 库 | 版本 | 用途 |
|------|------|------|------|
| 核心框架 | react + react-dom | 18.x | UI框架 |
| 核心框架 | react-router-dom | 6.x | 路由管理 |
| UI组件库 | antd | 5.x | Ant Design组件库 |
| UI组件库 | @ant-design/icons | 5.x | 图标库 |
| 状态管理 | zustand | 4.x | 轻量状态管理 |
| HTTP客户端 | axios | 1.x | HTTP请求 |
| 图表 | echarts | 5.x | 数据可视化图表 |
| 图表 | echarts-for-react | 3.x | ECharts React封装 |
| 甘特图 | dhtmlx-gantt | 8.x | 甘特图组件 |
| 拖拽 | @dnd-kit/core | 6.x | 拖拽核心 |
| 拖拽 | @dnd-kit/sortable | 8.x | 拖拽排序 |
| 拖拽 | @dnd-kit/utilities | 3.x | 拖拽工具函数 |
| 日历 | react-big-calendar | 1.x | 日历视图组件 |
| 富文本 | @tiptap/react | 2.x | 富文本编辑器 |
| 富文本 | @tiptap/starter-kit | 2.x | 富文本基础扩展 |
| 富文本 | @tiptap/extension-mention | 2.x | @提及扩展 |
| 日期 | dayjs | 1.x | 日期处理（替代moment.js） |
| WebSocket | @stomp/stompjs | 7.x | STOMP协议客户端 |
| WebSocket | sockjs-client | 1.x | SockJS降级兼容 |
| 工具 | lodash-es | 4.x | 工具函数（ES Module） |
| 工具 | nanoid | 5.x | 唯一ID生成 |
| 构建 | vite | 5.x | 构建工具 |
| 类型 | typescript | 5.x | 类型系统 |
| 代码规范 | eslint | 8.x | 代码检查 |
| 代码规范 | prettier | 3.x | 代码格式化 |
| 测试 | vitest | 1.x | 单元测试框架 |
| 测试 | @testing-library/react | 14.x | React测试工具 |
| 测试 | playwright | 最新 | E2E测试 |

### B. 参考资源

- [Teambition 官网](https://www.teambition.com)
- [Teambition 开放平台](https://open.teambition.com)
- [Flowable 工作流引擎](https://www.flowable.com)
- [Spring StateMachine](https://spring.io/projects/spring-statemachine)
- [Ant Design React](https://ant.design)
- [DHTMLX Gantt](https://dhtmlx.com/docs/products/dhtmlxGantt/)

---

*文档版本: v2.0*
*创建日期: 2026-05-03*
*作者: Workbition Team*
