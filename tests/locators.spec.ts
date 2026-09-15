import { test, expect } from '@playwright/test';

/**
 * Locators are how Playwright finds things on the page.
 * Prefer roles, labels, and text over CSS classes.
 */
test('find page pieces the way a person would', async ({ page }) => {
  await page.goto('/login.html');

  await expect(page.getByRole('link', { name: 'TaskBoard' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
});
