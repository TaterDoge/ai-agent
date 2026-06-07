# 认证架构设计规格约束

> 来源：152 认证架构设计（AI电子伴侣企业级项目实战）

## 1. 技术栈与组件职责

| 组件 | 职责 | 不允许 |
|------|------|--------|
| **D1** | 认证主数据持久化（用户、凭证、OAuth 绑定、会话、角色） | — |
| **Worker Secrets / Vars** | 密钥与部署配置（JWT secret、OAuth client id/secret、APP_URL） | 不放业务数据 |
| **JWT** | 短期 access token，无状态 | 不做长期身份凭证 |
| **Refresh Token** | 有状态，落库，支持轮换与撤销 | 不做无状态设计 |
| **Durable Objects** | 高并发下的串行控制层（refresh token rotation、单 session 撤销、replay 检测） | 不做数据存储 |
| **KV** | 仅缓存 | 不做认证真相源 |
| **R2** | 对象存储（头像、导出文件） | 不存认证结构化数据 |

## 2. 三个核心原则

### 2.1 用户主体与登录方式分离

- `users` 表只存用户主体，不绑定登录方式
- 登录方式拆分为 `password_credentials` 和 `oauth_identities`
- 扩展新 OAuth provider 只加记录，不改用户表结构

### 2.2 子站登录规则与用户权限分离

- 子站允许的登录方式由 `application_auth_methods` 控制，不属于用户属性
- 用户角色绑定由 `user_role_bindings` 控制，与登录方式无关

### 2.3 JWT 只做短期 access，refresh 必须落库

- access token：无状态、短时有效
- refresh token：有状态、必须落库、支持轮换/撤销/replay 检测
- 需要落库的能力：注销、单设备下线、refresh token 轮换、replay 检测

## 3. 子站登录策略

| 子站 | 允许的登录方式 | 未来可扩展 |
|------|----------------|-----------|
| **admin** | 邮箱 + 密码 | — |
| **web** | 邮箱 + 密码、GitHub OAuth | Google OAuth |

- admin 登录时须同时校验：子站允许 password + 用户有 admin 角色 + 用户状态可用
- web 新增 provider 只需给 `application_auth_methods` 加记录，不重做架构

## 4. 数据模型拆分边界

**禁止**拆分为 `admin_users` / `web_users` 双表，因为：

- 同一用户可能同时出现在 web 和 admin
- OAuth 绑定围绕用户主体，双表无法同步
- 同一邮箱双表无法去重

**正确拆分**：

| 实体 | 职责 |
|------|------|
| `users` | 用户是谁 |
| `password_credentials` | 用户有哪些密码登录方式 |
| `oauth_identities` | 用户有哪些第三方登录绑定 |
| `application_auth_methods` | 哪个子站允许什么方式登录 |
| `user_role_bindings` | 用户在各子站的角色权限 |

## 5. Durable Objects 使用判断标准

- **默认方案**：D1 + 事务（用户量不大、并发不高时）
- **升级到 DO 的信号**：
  - 同一 session 高频刷新
  - 并发刷新概率高
  - 对 replay 检测要求严格
  - 需要严格串行的 token rotation

DO 不是"另一个数据库"，而是"同一对象的关键操作排队执行"的控制层。
