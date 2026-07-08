import { test, expect } from '@playwright/test';
import {
  mockSignUpSuccess,
  mockSignUpError,
} from './auth-helpers';

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should render the register page correctly', async ({ page }) => {
    // 标题和描述
    await expect(page.getByRole('heading', { name: '创建账号' })).toBeVisible();
    await expect(page.getByText('注册后即可开始使用')).toBeVisible();

    // 表单字段
    await expect(page.getByLabel('昵称')).toBeVisible();
    await expect(page.getByLabel('邮箱')).toBeVisible();
    await expect(page.getByLabel('密码')).toBeVisible();

    // 提交按钮
    await expect(page.getByRole('button', { name: '注册' })).toBeVisible();

    // 登录链接
    await expect(page.getByRole('link', { name: '立即登录' })).toBeVisible();
    await expect(page.getByText('已有账号？')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // 点击提交但不填写任何内容
    await page.getByRole('button', { name: '注册' }).click();

    // 验证错误提示
    await expect(page.getByText('请输入昵称')).toBeVisible();
    await expect(page.getByText('请输入邮箱地址')).toBeVisible();
    await expect(page.getByText('请输入密码')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.getByLabel('昵称').fill('TestUser');
    await page.getByLabel('邮箱').fill('test@test'); // 绕过 HTML5 type="email" 验证
    await page.getByLabel('密码').fill('password123');
    await page.getByRole('button', { name: '注册' }).click();

    await expect(page.getByText('请输入有效的邮箱地址')).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.getByLabel('昵称').fill('TestUser');
    await page.getByLabel('邮箱').fill('user@example.com');
    await page.getByLabel('密码').fill('1234567'); // 7 characters, minimum is 8
    await page.getByRole('button', { name: '注册' }).click();

    await expect(page.getByText('密码长度不能少于 8 个字符')).toBeVisible();
  });

  test('should show validation error for empty name', async ({ page }) => {
    await page.getByLabel('邮箱').fill('user@example.com');
    await page.getByLabel('密码').fill('password123');
    await page.getByRole('button', { name: '注册' }).click();

    await expect(page.getByText('请输入昵称')).toBeVisible();
  });

  test('should show only name and password errors when only email is provided', async ({ page }) => {
    await page.getByLabel('邮箱').fill('user@example.com');
    await page.getByRole('button', { name: '注册' }).click();

    await expect(page.getByText('请输入昵称')).toBeVisible();
    await expect(page.getByText('请输入密码')).toBeVisible();
    // 邮箱不应有错误
    await expect(page.getByText('请输入邮箱地址')).not.toBeVisible();
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

  test('should show server error on duplicate email registration', async ({ page }) => {
    await mockSignUpError(page, '此邮箱已被注册');

    await page.getByLabel('昵称').fill('TestUser');
    await page.getByLabel('邮箱').fill('existing@example.com');
    await page.getByLabel('密码').fill('password123');
    await page.getByRole('button', { name: '注册' }).click();

    // 等待服务器错误显示
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText('此邮箱已被注册');
  });

  test('should navigate to dashboard on successful registration', async ({ page }) => {
    await mockSignUpSuccess(page);

    await page.getByLabel('昵称').fill('NewUser');
    await page.getByLabel('邮箱').fill('newuser@example.com');
    await page.getByLabel('密码').fill('password123');
    await page.getByRole('button', { name: '注册' }).click();

    // 成功后应跳转到 /dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show loading state during registration', async ({ page }) => {
    // 使用永不完成的请求来保持 loading 状态
    await page.route('**/api/auth/sign-up/email', async () => {
      // 保持请求挂起
    });

    await page.getByLabel('昵称').fill('NewUser');
    await page.getByLabel('邮箱').fill('newuser@example.com');
    await page.getByLabel('密码').fill('password123');
    await page.getByRole('button', { name: '注册' }).click();

    // 按钮应被禁用
    // 注意：loading 时按钮文本变为 Spinner 的 "Loading"，不再显示 "注册"
    // 使用 type="submit" 定位按钮，不受文本变化影响
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // 输入框也应被禁用
    await expect(page.getByLabel('昵称')).toBeDisabled();
    await expect(page.getByLabel('邮箱')).toBeDisabled();
    await expect(page.getByLabel('密码')).toBeDisabled();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.getByRole('link', { name: '立即登录' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should disable inputs during registration', async ({ page }) => {
    await page.route('**/api/auth/sign-up/email', async () => {
      // 保持挂起
    });

    await page.getByLabel('昵称').fill('NewUser');
    await page.getByLabel('邮箱').fill('newuser@example.com');
    await page.getByLabel('密码').fill('password123');
    await page.getByRole('button', { name: '注册' }).click();

    await expect(page.getByLabel('昵称')).toBeDisabled();
    await expect(page.getByLabel('邮箱')).toBeDisabled();
    await expect(page.getByLabel('密码')).toBeDisabled();

    // 密码切换按钮也应禁用
    await expect(page.locator('button[tabindex="-1"]')).toBeDisabled();
  });
});
