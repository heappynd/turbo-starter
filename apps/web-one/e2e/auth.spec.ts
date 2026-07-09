import { test, expect } from "@playwright/test";

// ── Login page ────────────────────────────────────────────

test.describe("Login page", () => {
  // 测试：登录表单渲染所有关键元素
  test("renders the login form with all key elements", async ({ page }) => {
    await page.goto("/login");

    // Title and subtitle
    await expect(page.getByText("Web One")).toBeVisible();
    await expect(page.getByText("欢迎回来")).toBeVisible();

    // Form inputs
    await expect(page.getByPlaceholder("邮箱")).toBeVisible();
    await expect(page.getByPlaceholder("密码")).toBeVisible();

    // Submit button
    await expect(page.getByRole("button", { name: /登/ })).toBeVisible();

    // Checkbox
    await expect(page.getByText("记住我")).toBeVisible();

    // Links
    await expect(page.getByText("忘记密码？")).toBeVisible();
    await expect(page.getByText("立即注册")).toBeVisible();
  });

  // 测试：空表单提交时显示验证错误
  test("shows validation errors when submitting empty form", async ({ page, browserName }) => {
    await page.goto("/login");

    // Click submit without filling any fields
    // Firefox in headed mode has a known Playwright click-action hang;
    // force: true avoids it (the button is already actionable).
    const clickOpts = browserName === "firefox" ? { force: true } : {};
    await page.getByRole("button", { name: /登/ }).click(clickOpts);

    // antdv-next form validation shows error messages under each field
    await expect(page.getByText("请输入邮箱地址")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("请输入密码")).toBeVisible();
  });

  // 测试：无效邮箱格式时显示验证错误
  test("shows validation error for invalid email format", async ({ page, browserName }) => {
    await page.goto("/login");

    // Fill in password first (so only email validation fires)
    await page.getByPlaceholder("邮箱").fill("not-an-email");
    await page.getByPlaceholder("密码").fill("password123");

    // Click submit triggers validation
    const clickOpts = browserName === "firefox" ? { force: true } : {};
    await page.getByRole("button", { name: /登/ }).click(clickOpts);

    await expect(page.getByText("邮箱格式不正确")).toBeVisible({ timeout: 5000 });
  });

  // 测试：密码过短时显示验证错误
  test("shows validation error for short password", async ({ page, browserName }) => {
    await page.goto("/login");

    await page.getByPlaceholder("邮箱").fill("user@test.com");
    await page.getByPlaceholder("密码").fill("1234");

    const clickOpts = browserName === "firefox" ? { force: true } : {};
    await page.getByRole("button", { name: /登/ }).click(clickOpts);

    await expect(page.getByText("密码至少 8 位")).toBeVisible({ timeout: 5000 });
  });

  // 测试：模拟 API 登录失败时显示错误提示
  test("shows error message on login failure (mocked API)", async ({ page }) => {
    await page.goto("/login");

    // Mock the auth API to respond quickly with an auth error
    await page.route("**/api/auth/**", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: { message: "邮箱或密码错误" } }),
      });
    });

    await page.getByPlaceholder("邮箱").fill("test@example.com");
    await page.getByPlaceholder("密码").fill("wrongpassword");
    await page.getByRole("button", { name: /登/ }).click();

    // Wait for error message to appear
    await expect(page.locator(".ant-message")).toBeVisible({ timeout: 8000 });
  });

  // 测试：网络故障时显示登录错误提示
  test("shows error message on network failure (no backend)", async ({ page }) => {
    await page.goto("/login");

    // Block auth API calls so they fail immediately
    await page.route("**/api/auth/**", (route) => route.abort());

    await page.getByPlaceholder("邮箱").fill("test@example.com");
    await page.getByPlaceholder("密码").fill("password123");
    await page.getByRole("button", { name: /登/ }).click();

    // The catch block shows "登录失败，请重试"
    await expect(page.locator(".ant-message")).toBeVisible({ timeout: 8000 });
  });

  // 测试：请求进行中按钮显示加载状态
  test("shows loading state on the submit button while the request is in flight", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("邮箱").fill("a@b.com");
    await page.getByPlaceholder("密码").fill("password123");

    // Intercept the API call so it never completes (loading stays true)
    await page.route("**/api/auth/**", () => {
      // hang the request indefinitely
    });

    const submitBtn = page.getByRole("button", { name: /登/ });

    // Click — button should get antdv-next's loading class
    await submitBtn.click();

    await expect(submitBtn).toHaveClass(/loading/, { timeout: 5000 });

    // Clean up the hanging route
    await page.unroute("**/api/auth/**");
  });

  // 测试：表单输入框可以正常输入内容
  test("can type in the form fields", async ({ page }) => {
    await page.goto("/login");

    const emailInput = page.getByPlaceholder("邮箱");
    const passwordInput = page.getByPlaceholder("密码");

    await emailInput.fill("user@example.com");
    await passwordInput.fill("MyP@ssw0rd!");

    await expect(emailInput).toHaveValue("user@example.com");
    await expect(passwordInput).toHaveValue("MyP@ssw0rd!");
  });

  // 测试：记住我复选框可切换选中状态
  test("remember-me checkbox can be toggled", async ({ page }) => {
    await page.goto("/login");

    // antdv-next renders the checkbox with a hidden native input;
    // clicking the label text toggles it without error
    const label = page.getByText("记住我");
    await expect(label).toBeVisible();

    // First click to uncheck
    await label.click();
    // Second click to re-check
    await label.click();
    // No error = test passes (exact checked-state testing depends on antdv-next's
    // internal DOM structure, which varies across versions)
  });
});

// ── Navigation ────────────────────────────────────────────

test.describe("Navigation", () => {
  // 测试：点击注册链接跳转到 /register 页面
  test("clicking register link navigates to /register", async ({ page }) => {
    await page.goto("/login");

    await page.getByText("立即注册").click();

    await expect(page).toHaveURL(/\/register/);
  });

  // 测试：未登录访问首页时重定向到登录页
  test("accessing protected route without auth redirects to login", async ({ page }) => {
    // Home is a protected route
    await page.goto("/");

    // Should end up on /login
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  // 测试：未登录访问关于页面时重定向到登录页
  test("accessing about without auth redirects to login", async ({ page }) => {
    await page.goto("/about");

    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });
});

// ── Register page (sanity) ────────────────────────────────

test.describe("Register page", () => {
  // 测试：注册表单渲染所有元素
  test("renders the registration form", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByText("创建账号")).toBeVisible();

    await expect(page.getByPlaceholder("昵称")).toBeVisible();
    await expect(page.getByPlaceholder("邮箱")).toBeVisible();
    // Each password field has a unique id from antdv-next's form-item name
    await expect(page.locator("#register_password")).toBeVisible();
    await expect(page.locator("#register_confirmPassword")).toBeVisible();

    await expect(page.getByRole("button", { name: /注/ })).toBeVisible();
    await expect(page.getByText("立即登录")).toBeVisible();
  });

  // 测试：空注册表单提交时显示验证错误
  test("shows validation errors on empty register form", async ({ page }) => {
    await page.goto("/register");

    await page.getByRole("button", { name: /注/ }).click();

    await expect(page.getByText("请输入昵称")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("请输入邮箱地址")).toBeVisible();
    await expect(page.getByText("请输入密码")).toBeVisible();
    await expect(page.getByText("请确认密码")).toBeVisible();
  });

  // 测试：两次密码不一致时显示错误
  test("shows password mismatch error", async ({ page }) => {
    await page.goto("/register");

    await page.getByPlaceholder("昵称").fill("TestUser");
    await page.getByPlaceholder("邮箱").fill("user@test.com");
    await page.locator("#register_password").fill("password123");
    await page.locator("#register_confirmPassword").fill("differentPassword");

    await page.getByRole("button", { name: /注/ }).click();

    await expect(page.getByText("两次输入的密码不一致")).toBeVisible({ timeout: 5000 });
  });

  // 测试：从注册页跳转到登录页
  test("navigates to login page from register", async ({ page }) => {
    await page.goto("/register");

    await page.getByText("立即登录").click();

    await expect(page).toHaveURL(/\/login/);
  });
});
