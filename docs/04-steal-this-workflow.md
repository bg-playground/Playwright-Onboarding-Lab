# 04 — Steal this workflow

Goal: drop Playwright + GitHub Actions onto an existing project without rereading the internet.

## Term

**A steal-able workflow** is a YAML file plus a short checklist. If a line only helps *this* demo, it does not belong here.

## Why it matters

Tutorials that only work inside the tutorial repo are souvenirs. This page is the product.

## Copy this checklist

Do these in order on *your* repo.

1. From your project root:

```bash
npm init playwright@latest
```

Choose TypeScript, a `tests` folder, GitHub Actions: yes, install browsers: yes.

2. Point tests at *your* app, not TaskBoard.

In `playwright.config.ts`:

```ts
use: {
  baseURL: 'http://127.0.0.1:3000', // whatever port your app uses
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
},
webServer: {
  command: 'npm run start',         // whatever starts your app
  url: 'http://127.0.0.1:3000',
  reuseExistingServer: !process.env.CI,
},
```

3. Write one test that proves the home page loads. Do not start with login + payments + admin.

4. Commit `playwright.config.ts`, `tests/`, `package-lock.json`, and `.github/workflows/playwright.yml`.

5. Push to `main` or open a pull request.

## Copy this workflow

Use this if `npm init playwright` did not add one, or you want the commented version from this repo.

```yaml
name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: lts/*
          cache: npm
      - name: Install npm packages
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: Run Playwright tests
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

Change only three things at first:

- The branch names, if yours are not `main` / `master`.
- The package manager (`npm ci` vs `pnpm install --frozen-lockfile` vs `yarn install --frozen-lockfile`).
- Chromium-only vs every browser. Start with Chromium.

## What you should see

- Actions tab runs on the next push.
- One job named `test`.
- An HTML report artifact whether tests pass or fail (`if: ${{ !cancelled() }}`).

## When it breaks

Your app is not this demo. The usual misses:

- Workflow runs in the repo root, but the app lives in `apps/web`. Set `defaults.run.working-directory` or `cd` in each step.
- `webServer.command` starts the API and never prints the frontend URL.
- Tests hit production because `baseURL` is a live site. Keep first CI against localhost on the runner.
- You used `npm install` in CI instead of `npm ci`, so the lockfile stopped meaning anything.

More failure patterns: [05 — Common breaks](05-common-breaks.md).

## After it is green

Add one real user path. Then stop. A single trusted test beats a folder of locators nobody maintains.

When you want production patterns instead of first-hour patterns, use [playwright-field-guide](https://github.com/bg-playground/playwright-field-guide).
