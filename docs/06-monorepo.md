# 06 — Add this to a monorepo

Goal: run Playwright from one package inside a bigger repo without teaching CI the wrong root.

## Term

**A monorepo CI miss** is when the workflow checks out the whole tree, then runs `npm ci` in the root and cannot find the app, the lockfile, or `playwright.config.ts`.

## Why it matters

Lesson 04 assumed a single-package repo. Most real projects are `apps/web` plus other packages. The tests did not get worse. The working directory did.

## Copy this checklist

Do this on *your* monorepo. Paths below use `apps/web`. Change the folder name. Do not change the idea.

1. Put Playwright next to the app it tests.

```text
apps/web/
  package.json
  package-lock.json          # or pnpm-lock.yaml / yarn.lock
  playwright.config.ts
  tests/
```

2. Start *that* app from `webServer`, not the repo root.

```ts
// apps/web/playwright.config.ts
webServer: {
  command: 'npm run dev',
  url: 'http://127.0.0.1:3000',
  reuseExistingServer: !process.env.CI,
},
use: {
  baseURL: 'http://127.0.0.1:3000',
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
},
```

3. Tell GitHub Actions the folder. One `defaults.run.working-directory` is enough if every `run:` step belongs in `apps/web`. Checkout and setup-node stay at the repo root.

```yaml
name: Playwright Tests
on:
  push:
    branches: [main, master]
    paths:
      - 'apps/web/**'
      - '.github/workflows/playwright.yml'
  pull_request:
    branches: [main, master]
    paths:
      - 'apps/web/**'
      - '.github/workflows/playwright.yml'

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/web
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: lts/*
          cache: npm
          cache-dependency-path: apps/web/package-lock.json
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
          path: apps/web/playwright-report/
          retention-days: 14
```

`working-directory` does **not** apply to `actions/upload-artifact`. The `path:` is still from the repo root. That is the line people miss.

4. Commit the lockfile that lives in `apps/web`, not only the root lockfile.

## Package managers

| Tool | Install on CI | Cache hint |
| --- | --- | --- |
| npm | `npm ci` | `cache: npm` + `cache-dependency-path: apps/web/package-lock.json` |
| pnpm | `pnpm install --frozen-lockfile` | `cache: pnpm` + `cache-dependency-path: pnpm-lock.yaml` (often at the repo root) |
| yarn | `yarn install --frozen-lockfile` | `cache: yarn` + `cache-dependency-path: apps/web/yarn.lock` |

If the monorepo hoists dependencies at the root, install at the root and only *run* tests in `apps/web`:

```yaml
- run: npm ci
  working-directory: .
- run: npx playwright test
  working-directory: apps/web
```

Do not mix the two styles in the same job until you know where `node_modules` landed.

## What you should see

- The job starts when you change `apps/web`, and stays quiet when you only change `docs/` or another app.
- The log line for `npm ci` shows `apps/web/package.json`.
- The HTML report artifact unzips to an `index.html`, not an empty folder.

## When it breaks

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `npm ci` cannot find a lockfile | Lockfile is in another folder | Point `working-directory` and `cache-dependency-path` at the same package |
| Artifact downloads empty | `path:` used the package-relative folder | Prefix with `apps/web/` |
| Tests hit the wrong app | `webServer.command` was the root `dev` script | Start the frontend that owns `baseURL` |
| Workflow never runs | `paths:` filter is too tight | Include the workflow file itself in `paths` |
| pnpm says the lockfile is out of date | You ran `npm install` in a pnpm repo | Use one package manager. Commit *its* lockfile |

## What you just learned

CI has no opinion about monorepos. It has a current directory. Set that directory, set the artifact path from the repo root, and keep `baseURL` on localhost.

## Next

[07 — Azure DevOps twin](07-azure-devops.md)
