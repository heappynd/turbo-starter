# 登录/注册页面设计文档

> **日期:** 2026-07-08
> **项目:** apps/web-one (Vue 3 + Ant Design Vue Next + Tailwind CSS v4)
> **后端:** apps/backend (Express + Better Auth, SQLite, 仅邮箱密码)

## Context

为 `apps/web-one` 新增登录和注册页面。该项目是一个全新的 Vue 3 脚手架，没有任何认证基础设施。后端已通过 Better Auth 提供 `/api/auth/sign-in/email` 和 `/api/auth/sign-up/email` 等端点，但前端先使用 mock 数据完成页面开发，后续再对接后端。

## 整体架构

```
apps/web-one/src/
├── layouts/
│   └── AuthLayout.vue              # 认证页面共用布局（居中卡片）
├── views/
│   └── auth/
│       ├── LoginView.vue            # 登录页 /login
│       └── RegisterView.vue         # 注册页 /register
├── stores/
│   └── auth.ts                      # Pinia auth store（含 mock 登录/注册）
├── router/
│   └── index.ts                     # 添加 /login, /register 路由 + 路由守卫
└── App.vue                          # 保持不变
```

## 路由设计

- `/login` — 登录页 (lazy loaded)
- `/register` — 注册页 (lazy loaded)
- 路由守卫 `beforeEach`: 未登录访问受保护页面时跳转 `/login`
- 公开页面: `login`、`register`

## Auth Store (Pinia)

**State:** `user`, `token`
**Actions:** `login()`, `register()`, `logout()`, `checkAuth()`

Mock 逻辑:
- login: 800ms 模拟延迟, admin@example.com/admin123 成功, 其他失败
- register: 800ms 模拟延迟, 任何邮箱都成功
- token 持久化到 localStorage, 刷新时恢复

## 组件设计

### AuthLayout.vue
全屏居中卡片布局, 背景浅色, 卡片阴影, 响应式宽度 (max-w-md)

### LoginView.vue
使用 Ant Design Vue Form, Input, InputPassword, Checkbox, Button, Typography, Flex, Divider
- 字段: email (required, email), password (required, min:6), remember
- 提交 loading 状态, 成功跳转首页, 失败显示错误
- 链接到注册页

### RegisterView.vue
使用 Ant Design Vue Form, Input, InputPassword, Button, Typography, Divider
- 字段: name (required, min:2, max:20), email (required, email), password (required, min:6), confirmPassword (自定义校验: 与 password 一致)
- 密码修改时自动重校验确认密码
- 注册成功跳转登录页

## 数据流

```
用户填写表单 → @finish 触发
  → authStore.login/register() [mock: 800ms delay]
    → 成功: 更新 state + localStorage, 跳转
    → 失败: 错误提示

页面刷新 → authStore.checkAuth() → 从 localStorage 恢复

路由守卫 → 无 token 且访问受保护页面 → redirect /login
```

## 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/stores/auth.ts` | 新建 | Pinia auth store + mock |
| `src/layouts/AuthLayout.vue` | 新建 | 居中卡片布局 |
| `src/views/auth/LoginView.vue` | 新建 | 登录页面 |
| `src/views/auth/RegisterView.vue` | 新建 | 注册页面 |
| `src/router/index.ts` | 修改 | 添加路由和守卫 |
