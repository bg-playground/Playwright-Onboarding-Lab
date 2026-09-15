import { test, expect } from '@playwright/test';

test('valid credentials open the tasks page', async ({ page }) => {
  await page.goto('/login.html');
  await page.getByLabel('Email').fill('demo@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/tasks\.html/);
  await expect(page.getByRole('heading', { name: "Today's tasks" })).toBeVisible();
});

test('invalid credentials show an error', async ({ page }) => {
  await page.goto('/login.html');
  await page.getByLabel('Email').fill('wrong@example.com');
  await page.getByLabel('Password').fill('nope');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toHaveText('Invalid email or password');
  await expect(page).toHaveURL(/login\.html/);
});
