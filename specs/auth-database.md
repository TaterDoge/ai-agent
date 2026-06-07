# 认证数据库设计规格约束

> 来源：153 认证数据库设计（AI电子伴侣企业级项目实战）

## 1. D1 / SQLite 字段类型约定

| 语义类型 | 存储类型 | 约束 |
|----------|----------|------|
| 主键 | `TEXT` | 应用层生成，推荐 `uuidv7` |
| 时间 | `INTEGER` | 毫秒时间戳，字段名以 `_at_ms` 结尾 |
| 布尔 | `INTEGER` | 加 `CHECK (field IN (0,1))` |
| 枚举 | `TEXT` | 加 `CHECK (field IN (...))` |
| JSON | `TEXT` | 应用层序列化/反序列化 |

**禁止**在 D1 中使用非上述约定的类型表达。

## 2. 表结构与拆分原则

### 2.1 核心原则

- **用户主体独立** — `users` 不绑定登录方式，只回答"用户是谁"
- **登录方式独立** — 密码与 OAuth 各自建表，扩展新 provider 只加记录不改结构
- **子站策略独立** — 登录方式由 `application_auth_methods` 控制，不属于用户属性
- **角色权限独立** — 用户角色由 `user_role_bindings` 控制，与登录方式无关
- **会话与 refresh token 独立** — access token 不落库，session 和 refresh token 必须落库

### 2.2 禁止事项

- **禁止**拆分为 `admin_users` / `web_users` 双表（见 auth-architecture.md §4）
- **禁止**用第三方邮箱作为唯一身份标识，稳定标识是 `(provider, provider_subject)`
- **禁止**邮箱唯一性判断基于原始输入，必须基于 `normalized_email`
- **禁止** `users` 表直接存储密码 hash 或 OAuth 信息

## 3. 核心表定义

### 3.1 users — 用户主体

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'deleted')),
  display_name TEXT,
  avatar_url TEXT,
  primary_email_id TEXT,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  last_login_at_ms INTEGER
);
```

- `primary_email_id` 关联 `user_emails.id`，但用应用层维护，不建外键（避免循环依赖）

### 3.2 user_emails — 邮箱

```sql
CREATE TABLE user_emails (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  normalized_email TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  is_verified INTEGER NOT NULL DEFAULT 0 CHECK (is_verified IN (0, 1)),
  verified_at_ms INTEGER,
  source TEXT NOT NULL CHECK (source IN ('password', 'github', 'google', 'manual')),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_user_emails_normalized_email_unique
ON user_emails(normalized_email);
CREATE UNIQUE INDEX idx_user_emails_user_normalized_unique
ON user_emails(user_id, normalized_email);
CREATE UNIQUE INDEX idx_user_emails_one_primary_per_user
ON user_emails(user_id) WHERE is_primary = 1;
```

- `normalized_email` 必须有唯一索引
- 每个用户只能有一个 `is_primary = 1` 的邮箱（partial unique index 保证）

### 3.3 password_credentials — 本地密码凭证

```sql
CREATE TABLE password_credentials (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email_id TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_algo TEXT NOT NULL CHECK (password_algo IN ('argon2id', 'bcrypt')),
  password_updated_at_ms INTEGER NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until_ms INTEGER,
  must_reset_password INTEGER NOT NULL DEFAULT 0 CHECK (must_reset_password IN (0, 1)),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (email_id) REFERENCES user_emails(id) ON DELETE CASCADE
);
```

- 必须保留 `failed_attempts`、`locked_until_ms`、`must_reset_password` 字段用于安全策略
- `password_algo` 必须显式记录，为算法迁移预留

### 3.4 oauth_identities — 第三方身份绑定

```sql
CREATE TABLE oauth_identities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('github', 'google')),
  provider_subject TEXT NOT NULL,
  email_id TEXT,
  provider_username TEXT,
  provider_email TEXT,
  profile_snapshot TEXT,
  linked_at_ms INTEGER NOT NULL,
  last_used_at_ms INTEGER,
  unlinked_at_ms INTEGER,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (email_id) REFERENCES user_emails(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_oauth_identities_provider_subject_unique
ON oauth_identities(provider, provider_subject);
```

- 唯一标识是 `(provider, provider_subject)`，不是邮箱
- `email_id` 外键 `ON DELETE SET NULL`（邮箱删除不应级联删除 OAuth 绑定）

### 3.5 applications — 子站定义

```sql
CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'disabled')),
  created_at_ms INTEGER NOT NULL
);
```

### 3.6 application_auth_methods — 子站登录方式

```sql
CREATE TABLE application_auth_methods (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('password', 'github', 'google')),
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
```

- 新增 OAuth provider 只需往此表插入记录，不重做架构

### 3.7 roles — 角色

```sql
CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at_ms INTEGER NOT NULL,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
```

### 3.8 user_role_bindings — 用户角色绑定

```sql
CREATE TABLE user_role_bindings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked')),
  granted_at_ms INTEGER NOT NULL,
  revoked_at_ms INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

### 3.9 auth_sessions — 认证会话

```sql
CREATE TABLE auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  application_id TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('web', 'admin')),
  device_name TEXT,
  user_agent TEXT,
  ip TEXT,
  last_seen_at_ms INTEGER,
  created_at_ms INTEGER NOT NULL,
  expires_at_ms INTEGER NOT NULL,
  revoked_at_ms INTEGER,
  revoke_reason TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
```

- 必须落库，否则无法实现注销、单设备下线、replay 检测

### 3.10 refresh_tokens — 刷新令牌

```sql
CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  jti_hash TEXT NOT NULL,
  parent_token_id TEXT,
  issued_at_ms INTEGER NOT NULL,
  expires_at_ms INTEGER NOT NULL,
  used_at_ms INTEGER,
  revoked_at_ms INTEGER,
  replaced_by_token_id TEXT,
  FOREIGN KEY (session_id) REFERENCES auth_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_token_id) REFERENCES refresh_tokens(id) ON DELETE SET NULL,
  FOREIGN KEY (replaced_by_token_id) REFERENCES refresh_tokens(id) ON DELETE SET NULL
);
```

- `parent_token_id` + `replaced_by_token_id` 支持 token rotation 链追踪
- `jti_hash` 存哈希值而非明文，用于 replay 检测

## 4. 迁移顺序

### 第一批（核心表）

按以下顺序执行迁移，满足外键依赖：

1. `users`
2. `user_emails`
3. `password_credentials`
4. `oauth_identities`
5. `applications`
6. `application_auth_methods`
7. `roles`
8. `user_role_bindings`
9. `auth_sessions`
10. `refresh_tokens`

### 第二批（辅助表）

1. `email_verification_tokens`
2. `password_reset_tokens`
3. `oauth_tokens`

## 5. 初始化种子数据

### applications

| code | name | status |
|------|------|--------|
| `web` | Web 应用 | `active` |
| `admin` | 管理后台 | `active` |

### application_auth_methods

| application | provider | enabled |
|-------------|----------|---------|
| admin | password | 1 |
| admin | github | 0 |
| admin | google | 0 |
| web | password | 1 |
| web | github | 1 |
| web | google | 0 |

### roles

| application | code | name |
|-------------|------|------|
| admin | `admin_owner` | 管理员-所有者 |
| admin | `admin_operator` | 管理员-运营者 |
| web | `web_user` | Web 用户 |

## 6. 与 auth-architecture.md 的关系

本规格是 auth-architecture.md 的数据库层细化，遵循其所有原则：

- 用户主体与登录方式分离 → §3.1–3.4 的表拆分
- 子站策略与用户权限分离 → §3.5–3.8 的表拆分
- JWT 短期 + refresh 落库 → §3.9–3.10 的表设计
- D1 作为认证真相源 → 所有核心表均在 D1
