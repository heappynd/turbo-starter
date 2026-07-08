import { test, expect } from '@playwright/test';
import {
  mockSignInSuccess,
  mockSignInError,
} from './auth-helpers';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should render the login page correctly', async ({ page }) => {
    // 标题和描述
    await expect(page.getByRole('heading', { name: '登录' })).toBeVisible();
    await expect(page.getByText('欢迎回来，请登录你的账号')).toBeVisible();

    // 表单字段
    await expect(page.getByLabel('邮箱')).toBeVisible();
    await expect(page.getByLabel('密码')).toBeVisible();

    // 提交按钮
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible();

    // 注册链接
    await expect(page.getByRole('link', { name: '立即注册' })).toBeVisible();
    await expect(page.getByText('还没有账号？')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // 点击提交但不填写任何内容
    await page.getByRole('button', { name: '登录' }).click();

    // 验证错误提示
    await expect(page.getByText('请输入邮箱地址')).toBeVisible();
    await expect(page.getByText('请输入密码')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    // 填写无效邮箱（使用 test@test 绕过 HTML5 type="email" 验证）
    await page.getByLabel('邮箱').fill('test@test');
    await page.getByLabel('密码').fill('password123');

    // 提交
    await page.getByRole('button', { name: '登录' }).click();

    // 验证错误提示
    await expect(page.getByText('请输入有效的邮箱地址')).toBeVisible();
  });

  test('should show validation error for empty password', async ({ page }) => {
    // 填写邮箱但不填密码
    await page.getByLabel('邮箱').fill('test@example.com');

    // 提交
    await page.getByRole('button', { name: '登录' }).click();

    // 验证密码错误
    await expect(page.getByText('请输入密码')).toBeVisible();
    // 邮箱不应有错误
    await expect(page.getByText('请输入邮箱地址')).not.toBeVisible();
  });

  test('should clear validation errors after successful input', async ({ page }) => {
    // 触发验证错误
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.getByText('请输入邮箱地址')).toBeVisible();

    // 填写邮箱后错误应消失（Vue 的验证在提交时触发，重新提交才清除）
    await page.getByLabel('邮箱').fill('test@example.com');
    await page.getByLabel('密码').fill('password123');
    await page.getByRole('button', { name: '登录' }).click();

    // 不应再显示验证错误
    await expect(page.getByText('请输入邮箱地址')).not.toBeVisible();
    await expect(page.getByText('请输入密码')).not.toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel('密码');

    // 初始应为 password 类型
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // 点击显示密码按钮
    const toggleButton = page.locator('button[tabindex="-1"]');
    await toggleButton.click();

    // 切换为 text 类型
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // 再次点击隐藏密码
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should show server error on failed login', async ({ page }) => {
    await mockSignInError(page, '邮箱或密码错误');

    await page.getByLabel('邮箱').fill('wrong@example.com');
    await page.getByLabel('密码').fill('wrongpassword');
    await page.getByRole('button', { name: '登录' }).click();

    // 等待服务器错误显示
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText('邮箱或密码错误');
  });

  test('should navigate to dashboard on successful login', async ({ page }) => {
    await mockSignInSuccess(page);

    await page.getByLabel('邮箱').fill('test@example.com');
    await page.getByLabel('密码').fill('password123');
    await page.getByRole('button', { name: '登录' }).click();

    // 成功后应跳转到 /dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show loading state during submission', async ({ page }) => {
    // 使用永不完成的请求来保持 loading 状态
    await page.route('**/api/auth/sign-in/email', async () => {
      // 故意不调用 route.fulfill 或 route.continue
      // 保持请求挂起
    });

    await page.getByLabel('邮箱').fill('test@example.com');
    await page.getByLabel('密码').fill('password123');
    await page.getByRole('button', { name: '登录' }).click();

    // 按钮应显示 loading spinner 并禁用
    // 注意：loading 时按钮文本变为 Spinner 的 "Loading"，不再显示 "登录"
    // 使用 type="submit" 定位按钮，不受文本变化影响
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();

    // 输入框也应被禁用
    await expect(page.getByLabel('邮箱')).toBeDisabled();
    await expect(page.getByLabel('密码')).toBeDisabled();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: '立即注册' }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('should disable inputs during loading', async ({ page }) => {
    await page.route('**/api/auth/sign-in/email', async () => {
      // 保持挂起
    });

    await page.getByLabel('邮箱').fill('test@example.com');
    await page.getByLabel('密码').fill('password123');
    await page.getByRole('button', { name: '登录' }).click();

    await expect(page.getByLabel('邮箱')).toBeDisabled();
    await expect(page.getByLabel('密码')).toBeDisabled();

    // 密码切换按钮也应禁用
    await expect(page.locator('button[tabindex="-1"]')).toBeDisabled();
  });
});
