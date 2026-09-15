# 05 — Common breaks

Goal: recognize the failures that eat a first weekend, before you rewrite the framework.

## Term

**A common break** is a setup mistake that looks like a Playwright bug.

## Why it matters

Most first-week pain is environment, not locators.

## Copy this debug order

1. Did the app start? Read the `webServer` log.
2. Did Chromium install? Search the log for `playwright install`.
3. Did the test open the page you think it opened? Check the screenshot.
4. Did the locator wait? Prefer `getByRole` / `getByLabel`.
5. Only then change the framework.

## Breaks you will actually hit

### Missing browsers

**What you see:** `Executable doesn't exist at ... chrome-headless-shell`

**Why:** `@playwright/test` is an npm package. The browser binaries are a separate download.

**Fix:**

```bash
npx playwright install --with-deps chromium
```

Locally you can skip `--with-deps`. On Ubuntu CI, keep it.

### Testing the live internet

**What you see:** Tests fail when `example.com` changes, or when the runner has no outbound access.

**Why:** CI should prove *your* commit, not a public website's uptime.

**Fix:** Keep `baseURL` on localhost. This repo's `demo-app/` exists so you never need `https://example.com`.

### Wrong working directory

**What you see:** `npm ci` cannot find `package.json`, or tests cannot find `playwright.config.ts`.

**Why:** Monorepos checkout the whole tree. The workflow starts at the root.

**Fix:** follow [06 — Add this to a monorepo](06-monorepo.md). The short version:

```yaml
defaults:
  run:
    working-directory: apps/web
```

Also set `path` on the artifact upload from the repo root (`apps/web/playwright-report/`).

### `npm ci` without a lockfile

**What you see:** `npm ci can only install packages when your package.json and package-lock.json are in sync`

**Why:** `npm ci` is strict on purpose. That strictness is what makes CI repeatable.

**Fix:** Commit `package-lock.json`. When dependencies change, commit the new lockfile in the same PR.

### Waiting on the network instead of the UI

**What you see:** `page.waitForTimeout(5000)` everywhere, still flake.

**Why:** Timeouts guess. Locators wait for the element.

**Fix:**

```ts
await expect(page.getByRole('heading', { name: "Today's tasks" })).toBeVisible();
```

Delete `waitForTimeout`.

### `test.only` left behind

**What you see:** CI fails with "focused tests" or locally only one file runs.

**Why:** `forbidOnly: !!process.env.CI` is a seatbelt.

**Fix:** Remove `.only`. Keep the seatbelt.

### Headed works, CI fails

**What you see:** Fine on your laptop, red on Ubuntu.

**Why:** Different viewport, missing env vars, app not started, or a dependency that exists only globally on your machine.

**Fix:** Run the same command CI runs:

```bash
CI=true npx playwright test
```

If that passes locally, the remaining gap is environment variables or secrets.

### Report uploaded but you cannot open it

**What you see:** Artifact downloads as a zip of files. Double-clicking the zip does nothing useful.

**Why:** The report is a static site.

**Fix:** Unzip, then:

```bash
npx playwright show-report path/to/unzipped-report
```

## What you should see when you are done

You can name the failure class in one sentence: install, server, locator, assertion, or environment. That is enough to stop flailing.

## Next

[06 — Add this to a monorepo](06-monorepo.md) if the app is not at the repo root.

[07 — Azure DevOps twin](07-azure-devops.md) if CI is Azure Pipelines.

[08 — Publish a Pages site](08-github-pages.md) if you want the lessons on a public URL.

[09 — Use this template](09-use-this-template.md) if you are starting a new repo from this one.

Otherwise back to the [README](../README.md), or the production catalog: [playwright-field-guide](https://github.com/bg-playground/playwright-field-guide).
