import { test, expect } from '@playwright/test';

test('home page shows the demo heading', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/TaskBoard Demo/);
  await expect(page.getByRole('heading', { name: 'Ship one green test today' })).toBeVisible();
});

test('home page links to sign in', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Open the sign-in page' }).click();
  await expect(page).toHaveURL(/login\.html/);
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});
