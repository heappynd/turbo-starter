import { Page } from '@playwright/test';

/**
 * Mock better-auth sign-in API endpoint for successful login
 * Actual format: { redirect, token, user: { id, name, email, emailVerified, image, createdAt, updatedAt } }
 */
export async function mockSignInSuccess(page: Page) {
  await page.route('**/api/auth/sign-in/email', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        redirect: false,
        token: 'mock-token-123',
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          emailVerified: false,
          image: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    });
  });
}

/**
 * Mock better-auth sign-in API endpoint for failed login
 * Actual format: { message: string, code: string }, status 401
 */
export async function mockSignInError(page: Page, message: string) {
  await page.route('**/api/auth/sign-in/email', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        message,
        code: 'INVALID_EMAIL_OR_PASSWORD',
      }),
    });
  });
}

/**
 * Mock better-auth sign-up API endpoint for successful registration
 * Actual format: { token, user: { id, name, email, emailVerified, image, createdAt, updatedAt } }
 */
export async function mockSignUpSuccess(page: Page) {
  await page.route('**/api/auth/sign-up/email', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-token-456',
        user: {
          id: '2',
          name: 'New User',
          email: 'newuser@example.com',
          emailVerified: false,
          image: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    });
  });
}

/**
 * Mock better-auth sign-up API endpoint for failed registration (e.g. duplicate email)
 * Actual format: { message: string, code: string }, status 422
 */
export async function mockSignUpError(page: Page, message: string) {
  await page.route('**/api/auth/sign-up/email', async (route) => {
    await route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({
        message,
        code: 'USER_ALREADY_EXISTS',
      }),
    });
  });
}
