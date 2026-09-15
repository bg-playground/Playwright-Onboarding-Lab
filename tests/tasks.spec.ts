import { test, expect } from '@playwright/test';

test('signed-in user sees the starter task list', async ({ page }) => {
  await page.goto('/login.html');
  await page.getByLabel('Email').fill('demo@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  const tasks = page.getByRole('listitem');
  await expect(tasks).toHaveCount(3);
  await expect(page.getByText('Push and get a green CI run')).toBeVisible();
});
