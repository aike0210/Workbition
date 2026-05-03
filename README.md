# Workbition

AI 驱动的团队协作与项目管理平台，帮助团队高效管理项目、任务和协作。

## 功能特性

- **用户认证** — 注册、登录、JWT 双 Token 无感刷新
- **组织管理** — 创建组织、邀请成员、角色权限控制
- **项目管理** — 多项目管理，支持项目状态跟踪
- **任务系统** — 任务创建、分配、状态流转
- **文件存储** — 基于 MinIO 的文件上传与管理
- **实时通知** — WebSocket 实时消息推送
- **API 文档** — Knife4j 自动生成接口文档

## 技术栈

### 前端

| 技术 | 说明 |
|------|------|
| React 18 | UI 框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| Zustand | 状态管理 |
| Axios | HTTP 请求 |
| React Router | 路由管理 |

### 后端

| 技术 | 说明 |
|------|------|
| Spring Boot 3 | 应用框架 |
| MyBatis-Plus | ORM 框架 |
| Flyway | 数据库版本管理 |
| Spring Security + JWT | 认证授权 |
| Redis | 缓存 & Token 存储 |
| MinIO | 对象存储 |
| MySQL | 关系型数据库 |

## 项目结构

```
Workbition/
├── workbition-web/          # 前端项目
│   ├── src/
│   │   ├── api/             # 接口请求
│   │   ├── components/      # 公共组件
│   │   ├── hooks/           # 自定义 Hook
│   │   ├── pages/           # 页面
│   │   ├── stores/          # 状态管理
│   │   ├── styles/          # 全局样式
│   │   ├── types/           # 类型定义
│   │   └── utils/           # 工具函数
│   └── package.json
├── WorkbitionServer/        # 后端项目
│   ├── src/main/java/
│   │   └── com/aike/workbitionserver/
│   │       ├── common/      # 通用模块（结果封装、异常处理）
│   │       ├── controller/  # 控制器
│   │       ├── entity/      # 实体类
│   │       ├── mapper/      # 数据访问层
│   │       ├── security/    # 安全认证
│   │       └── service/     # 业务逻辑
│   └── pom.xml
└── docs/                    # 项目文档
```

## 快速开始

### 环境要求

- JDK 17+
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+
- MinIO

### 后端启动

```bash
cd WorkbitionServer

# 配置数据库连接
# 复制 application.yml.example 为 application.yml 并修改配置
cp src/main/resources/application.yml.example src/main/resources/application.yml

# 启动
./mvnw spring-boot:run
```

### 前端启动

```bash
cd workbition-web

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 即可。

## License

MIT
