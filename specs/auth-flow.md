# 认证流程设计规格约束

> 来源：154 认证流程设计 — AI电子伴侣企业级项目实战

## 1. 接口分层原则

- `/auth/admin/*` 和 `/auth/web/*` 只管登录链路
- `/account/*` 只管登录后的账号管理
- admin 和 web 的登录入口必须分开，不得合并为统一入口

### 必须存在的接口

**admin：**
- `POST /auth/admin/password/login`
- `POST /auth/admin/token/refresh`
- `POST /auth/admin/logout`

**web：**
- `POST /auth/web/password/login`
- `GET /auth/web/github/start`
- `GET /auth/web/github/callback`
- `POST /auth/web/token/refresh`
- `POST /auth/web/logout`

**account（会话管理）：**
- `GET /account/sessions`
- `POST /account/sessions/:sessionId/revoke`
- `POST /account/sessions/revoke-others`
- `GET /account/oauth/github/start`
- `GET /account/oauth/github/callback`
- `GET /account/oauth-identities`
- `POST /account/oauth-identities/:id/unlink`

## 2. admin 与 web 登录隔离

- admin 只认邮箱密码 + 后台角色校验
- web 支持密码 + OAuth（GitHub/Google），无后台角色校验
- 外层路径分开，内部 service 可复用

### admin 密码登录响应体

```json
{
  "accessToken": "at_xxxxx",
  "accessTokenExpiresAt": 1710000900000,
  "user": { "id": "user_1", "displayName": "keepzml" },
  "session": { "id": "session_1", "application": "admin" }
}
```

同时服务端在响应头写 refresh token cookie。

**关键：** 密码正确仅代表知道密码，必须继续校验角色才能进入 admin。

## 3. Refresh Token 约束

### 3.1 前端不得手动传递 refresh token

- refresh token 在 `httpOnly cookie` 中，浏览器自动携带
- 前端只需 `credentials: 'include'`，不碰 token 本身

### 3.2 Refresh 成功只回新 access token

```json
{
  "accessToken": "at_new_xxxxx",
  "accessTokenExpiresAt": 1710001900000
}
```

同时刷新响应头里的 refresh token cookie。**不得**在 refresh 接口塞用户资料、角色列表等额外信息。

### 3.3 服务端 refresh 链路（按事务顺序）

1. 从 cookie 拿 token
2. 查 refresh token 记录
3. 查所属 session 是否仍活跃
4. 检查 refresh token 是否过期 / 已用 / 已撤销
5. 旧 token 标记已使用 + 补新 refresh token + 回填 `replaced_by_token_id`
6. 更新 session 的 `last_seen_at_ms`
7. 签新 access token + 写新 cookie

### 3.4 refresh 失败错误码必须分清

| 状态码 | ERROR CODE | 含义 |
|--------|-----------|------|
| 401 | AUTH_REFRESH_MISSING | 没带 refresh token |
| 401 | AUTH_REFRESH_EXPIRED | refresh token 过期 |
| 401 | AUTH_SESSION_REVOKED | session 已撤销 |
| 401 | AUTH_REFRESH_REUSED | 旧 token 被重复使用 |
| 403 | AUTH_APP_MISMATCH | token 不属于当前子站 |

## 4. Cookie 收口约束

- refresh token cookie 必须统一收口于 `cookie.service.ts`，不得散落在各路由
- cookie path 必须按子站收窄：
  - web：`/auth/web/token/refresh`
  - admin：`/auth/admin/token/refresh`
- cookie 属性：`HttpOnly; Secure; SameSite=Lax`

## 5. Logout 与 Session 管理

### 5.1 Logout 必须幂等

- session 已失效再调不报错
- cookie 已清再清不报错

服务端动作：写 `revoked_at_ms` → 撤该 session 下所有 refresh token → 清 cookie

### 5.2 会话管理围绕 session，不围绕 refresh token

- 撤销接口围绕 `sessionId` 设计，不围绕 `refreshTokenId`
- 用户理解"设备登录态"，不理解"refresh token 记录"

### 5.3 撤销其他会话

- `POST /account/sessions/revoke-others`
- 适用场景：改密码、异地登录、安全加固

## 6. OAuth 登录与绑定必须分家

### 6.1 路径隔离

- OAuth **登录**：`/auth/web/github/*`（面向未登录用户）
- OAuth **绑定**：`/account/oauth/github/*`（面向已登录用户）

### 6.2 state 参数必须包含

```json
{
  "intent": "login" | "bind",
  "app": "web",
  "returnTo": "/settings/connections",
  "nonce": "random_xxx",
  "currentUserId": "user_1"  // 绑定场景必带
}
```

### 6.3 callback 分支逻辑

**登录场景：**
1. 查 `(provider, provider_subject)` 是否存在
2. 存在 → 找用户、建 session、签 token
3. 不存在 + 同邮箱 → **不得自动合并账号**，需先定规则
4. 完全未匹配 → 创建新用户 + 补邮箱 + 插 `oauth_identities` + 建 session

**绑定场景：**
1. 确认已登录
2. 检查第三方身份未被占用
3. 插入 `oauth_identities`，必要时补邮箱

### 6.4 解绑保护

解绑 OAuth 身份前，必须检查账号是否还剩至少一种可用登录方式。不得让账号失去所有登录入口。

## 7. 代码目录结构约束

```
routes/
  auth/admin.route.ts, web.route.ts, oauth.route.ts
  account/sessions.route.ts, oauth-identities.route.ts
modules/auth/
  auth.service.ts, session.service.ts, oauth.service.ts
  token.service.ts, cookie.service.ts, auth.contracts.ts
repositories/
  auth-session.repository.ts, refresh-token.repository.ts
  oauth-identity.repository.ts, user.repository.ts
middleware/
  require-auth.ts, require-role.ts
```

每层职责：
- **route**：收参数、回响应
- **service**：串流程
- **repository**：查库写库
- **middleware**：恢复身份、检查角色
- **contracts**：请求体、响应体、错误码定义

## 8. 鉴权与权限分层

- `requireAuth`：只做身份恢复（验签、查 exp、解析 sub/sid/roles）
- `requireRole`：在 requireAuth 之上做权限检查
- 业务 handler 不得内联鉴权逻辑

## 9. 请求体 / 响应体 / 错误码统一管理

- 请求体用 zod schema 定义
- 响应体用 zod schema 定义
- 错误码收为固定常量集合：

```
AUTH_INVALID_CREDENTIALS, AUTH_METHOD_DISABLED, AUTH_USER_SUSPENDED,
AUTH_FORBIDDEN_APP, AUTH_REFRESH_EXPIRED, AUTH_REFRESH_REUSED,
AUTH_SESSION_REVOKED, AUTH_OAUTH_IDENTITY_OCCUPIED
```

前端依赖状态码 + 错误码，中文文案留在展示层。

## 10. 前端调用约定

- 业务接口统一 `Authorization: Bearer <access_token>`
- refresh 接口统一 `credentials: 'include'`
- 收到 401 后只在可续期场景触发一次 refresh
- refresh 成功 → 重试原请求
- refresh 失败 → 清空本地 access token → 回登录页

## 11. 实现顺序

1. admin 密码登录
2. web 密码登录
3. refresh
4. logout
5. session 列表 + revoke
6. GitHub 登录
7. GitHub 绑定 / 解绑
8. 后续补 Google
