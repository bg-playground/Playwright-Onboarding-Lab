# 00 — Glossary

Goal: know the words before they show up in a red log.

Each entry is the same shape used in the rest of this repo: **Term → Why it matters → Copy this → What you should see → When it breaks**.

Read this once. Come back when a log uses a word you skipped.

---

## Playwright

**Term.** Playwright is a library that opens a real browser, drives it like a user, and checks what the page did.

**Why it matters.** It is the tool. CI is just a machine that runs the tool.

**Copy this.**

```ts
import { test, expect } from '@playwright/test';

test('home page shows the demo heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Ship one green test today' })).toBeVisible();
});
```

**What you should see.** Chromium starts, the demo heading appears, the test name prints with a green check.

**When it breaks.** You installed the npm package but not the browser. Run `npx playwright install chromium`.

---

## CI (continuous integration)

**Term.** CI is a rented computer that runs your tests on every push, so you do not have to remember to.

**Why it matters.** A test that only passes on your laptop is a local habit, not a team guarantee.

**Copy this.** Push to `main`. Open the Actions tab. That tab *is* CI for this repo.

**What you should see.** A yellow dot on the commit, then a green check.

**When it breaks.** Actions is disabled, or the workflow file is not under `.github/workflows/`.

**Bad analogy to drop.** "CI is the cloud." The cloud is a building. CI is a checklist that building runs.

---

## Runner

**Term.** A runner is the machine that executes the workflow. Here it is `ubuntu-latest`.

**Why it matters.** The runner has none of your global tools, none of your cookies, and none of your `~/.bashrc` aliases.

**Copy this.**

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
```

**What you should see.** Logs that start with "Runner Image" and a Linux path.

**When it breaks.** You assumed a tool installed on your Mac exists on Ubuntu. It does not.

---

## Workflow

**Term.** A workflow is the YAML file that lists when to run and what to run.

**Why it matters.** GitHub does not guess that you use Playwright. The file is the contract.

**Copy this.** `.github/workflows/playwright.yml` in this repo.

**What you should see.** A workflow named **Playwright Tests** in the Actions tab.

**When it breaks.** Wrong folder (`github/workflows` without the leading dot), or invalid YAML indentation.

---

## Job

**Term.** A job is one block of work on one runner. This repo has a single job named `test`.

**Why it matters.** Jobs can run in parallel. If you add a second job later, it does not share files with the first unless you pass an artifact.

**Copy this.**

```yaml
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
```

**What you should see.** One column on the Actions graph labeled `test`.

**When it breaks.** You look for files created by job A inside job B. They are different machines.

---

## Step

**Term.** A step is one line in the job: checkout, install Node, `npm ci`, install browsers, run tests, upload the report.

**Why it matters.** The first red step is the one to read. Everything after it did not run, or ran under `if: ${{ !cancelled() }}`.

**Copy this.** Read the workflow from top to bottom. That is the order the runner uses.

**What you should see.** Green checks next to each step name.

**When it breaks.** You debug the test step when `npm ci` already failed.

---

## Artifact

**Term.** An artifact is a zip GitHub keeps after the job: here, the HTML report and any traces.

**Why it matters.** The runner is deleted when the job ends. If you do not upload evidence, the evidence is gone.

**Copy this.** After a run, click **playwright-report** → Download.

**What you should see.** A zip. Unzip it. Open it with `npx playwright show-report path/to/folder`.

**When it breaks.** You double-click the zip and expect a live website. It is static files. Use `show-report`.

---

## Cache

**Term.** Cache stores npm packages between runs so `npm ci` is faster.

**Why it matters.** Playwright's npm packages are small. The *browsers* are not in the npm cache. You still run `npx playwright install`.

**Copy this.**

```yaml
- uses: actions/setup-node@v5
  with:
    node-version: lts/*
    cache: npm
```

**What you should see.** A "Cache restored" or "Cache saved" line in the setup-node step.

**When it breaks.** You think cache replaced `playwright install`. It did not. Browsers are a separate download.

---

## Flake

**Term.** A flake is a test that fails, then passes, with no code change.

**Why it matters.** Teams start ignoring red CI. That is how broken tests become wallpaper.

**Copy this.** Do not start with `page.waitForTimeout(5000)`. Start with a locator assertion. This repo retries twice on CI (`retries: 2`) as a seatbelt, not a strategy.

**What you should see.** The same test, same commit, same result.

**When it breaks.** You "fix" flakes by raising timeouts. The flake is still there; it is slower.

---

## Locator

**Term.** A locator is Playwright's handle on an element. It is lazy: it looks again when you use it.

**Why it matters.** CSS classes change when a designer refactors. Roles and labels change when the product changes. Prefer the second.

**Copy this.**

```ts
await page.getByLabel('Email').fill('demo@example.com');
await page.getByRole('button', { name: 'Sign in' }).click();
```

**What you should see.** The email box fills. The button clicks. No `page.$('#email')`.

**When it breaks.** Two buttons named "Sign in" exist. Playwright refuses to guess. Narrow the locator.

See `tests/locators.spec.ts`.

---

## Assertion

**Term.** An assertion is the line that can fail the test on purpose: `expect(...).toBeVisible()`.

**Why it matters.** A script that clicks around and never checks is a tour, not a test.

**Copy this.**

```ts
await expect(page.getByRole('alert')).toHaveText('Invalid email or password');
```

**What you should see.** On a bad password, the alert text matches. On a good password, that line never runs.

**When it breaks.** You assert too early. Playwright assertions retry until timeout. Bare `expect(value).toBe(true)` on a snapshot does not.

---

## Trace

**Term.** A trace is a recording of the test: actions, DOM snapshots, screenshots, network.

**Why it matters.** The error string says *what* failed. The trace shows *what the page looked like*.

**Copy this.**

```bash
npx playwright test tests/home.spec.ts --trace on
npx playwright show-trace test-results/*/*.zip
```

This repo records a trace automatically on the first CI retry (`trace: 'on-first-retry'`).

**What you should see.** A timeline you can scrub. Each `goto`, `fill`, `click`, `expect`.

**When it breaks.** You look for a trace after a local run with retries off. Use `--trace on`.

---

## Headed and headless

**Term.** Headed means you see the browser window. Headless means the browser runs with no window, which is what CI does.

**Why it matters.** The page is the same. Your eyes are not part of the test.

**Copy this.**

```bash
npx playwright test tests/login.spec.ts --headed
```

**What you should see.** A Chromium window click through sign-in.

**When it breaks.** "It works headed, fails on CI." Run `CI=true npx playwright test` locally. You just copied the CI seatbelts.

---

## `webServer`

**Term.** `webServer` is the Playwright config block that starts your app before tests and stops it after.

**Why it matters.** Tests need a URL. CI has no human to run `npm start` in another terminal.

**Copy this.** From `playwright.config.ts`:

```ts
webServer: {
  command: 'npm run demo',
  url: 'http://127.0.0.1:4173',
  reuseExistingServer: !process.env.CI,
  timeout: 30_000,
}
```

**What you should see.** `demo-app ready at http://127.0.0.1:4173` in the test log.

**When it breaks.** The command never prints a listening URL, or `baseURL` points at a different port.

---

## Retry

**Term.** A retry is Playwright running the same failed test again.

**Why it matters.** On CI this repo retries twice. That hides a single network blip. It also hides a real flake if you never open the first failure.

**Copy this.** `retries: process.env.CI ? 2 : 0` in `playwright.config.ts`.

**What you should see.** Locally: one attempt. On CI: `received` then `retry #1` if it failed.

**When it breaks.** A test that only passes on retry. That is a flake. Fix the wait; do not raise retries to 5.

---

## `baseURL`

**Term.** `baseURL` is the prefix Playwright adds to paths like `/login.html`.

**Why it matters.** Tests stay portable. Change one config line when you steal this for your app.

**Copy this.**

```ts
use: { baseURL: 'http://127.0.0.1:4173' }
await page.goto('/login.html'); // becomes http://127.0.0.1:4173/login.html
```

**What you should see.** The address bar (headed) starts with that host.

**When it breaks.** You set `baseURL` to production. Now CI tests someone else's uptime.

---

## GitHub Pages

**Term.** GitHub Pages is a static website GitHub hosts for a repository. This repo's lessons publish to `https://bg-playground.github.io/Playwright-Onboarding-Lab/`.

**Why it matters.** People can read the path without cloning. It is not the Playwright HTML report.

**Copy this.** Settings → Pages → Source → **GitHub Actions**. The workflow is `.github/workflows/pages.yml`.

**What you should see.** A live lesson list at the Pages URL after the **GitHub Pages** workflow is green.

**When it breaks.** Source is still "Deploy from a branch," or `PAGES_BASE_PATH` does not match the repo name.

See [08 — Publish a Pages site](08-github-pages.md).

---

## Template repository

**Term.** A template repository is a repo with the template flag on. **Use this template** copies the default branch into a new repo that is not a fork.

**Why it matters.** A fork is for contributing back. A template copy is for starting *your* project with the workflow already in the tree.

**Copy this.** [Use this template](https://github.com/bg-playground/Playwright-Onboarding-Lab/generate)

**What you should see.** A new repo you own, with Actions of its own, and no "forked from" line.

**When it breaks.** You clicked Fork instead. Fine for PRs to this repo. Wrong for your product.

See [09 — Use this template](09-use-this-template.md).

---

## How to use this page

You do not need to memorize it. When a later lesson says "artifact" or "trace," jump here, read that one block, go back.

## Next

[01 — First local test](01-first-local-test.md)
