# 09 — Use this template

Goal: start a new repo from this one without inheriting demo-app forever.

## Term

**A GitHub template repository** is a repo with the template flag on. The green **Use this template** button copies the default branch into a new repo you own. It is not a fork. The new repo has its own Actions, issues, and history starting from that copy.

This repository is marked as a template.

## Why it matters

A fork keeps a link back here and is the wrong shape when you want *your* product under test. A template copy is a clean start with the workflow and lessons already in the tree.

## Copy this — create the repo

1. Open [Use this template](https://github.com/bg-playground/first-green-playwright/generate).
2. Choose an owner and a name.
3. Leave it public or private. Pages only works on private repos if your plan allows it.
4. Create the repository. Do not check "Include all branches" unless you have a reason.

Or from the GitHub CLI:

```bash
gh repo create my-first-green --template bg-playground/first-green-playwright --public --clone
cd my-first-green
```

## Copy this — first hour in the new repo

Do these in order. Stop when CI is green against *your* app.

1. Run the demo once so you know the copy works:

```bash
npm install
npx playwright install chromium
npx playwright test
```

2. Point Playwright at your app in `playwright.config.ts`:

```ts
use: {
  baseURL: 'http://127.0.0.1:3000',
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
},
webServer: {
  command: 'npm run start',
  url: 'http://127.0.0.1:3000',
  reuseExistingServer: !process.env.CI,
},
```

3. Replace `tests/*.spec.ts` with one test that loads your home page. Delete the TaskBoard specs when that test is green.
4. Delete `demo-app/` and `scripts/serve.mjs` when nothing points at them.
5. If you want a lesson site of your own, change `PAGES_BASE_PATH` in `.github/workflows/pages.yml` to `/your-repo-name`, then Settings → Pages → Source → GitHub Actions.

Keep `.github/workflows/playwright.yml` until you have a reason to edit it. The first change is almost always `baseURL` and `webServer.command`, not YAML.

## What you should see

- A new repo that is not a fork of this one.
- Actions runs on the first push to `main`.
- The same six demo tests passing until you replace them.

## When it breaks

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| You have a fork instead of a template copy | You used Fork | Use the generate URL above. A fork is fine for PRs back here, not for your product |
| Actions tab empty | Actions disabled on the new repo | Enable Actions under Settings |
| Pages 404 after you copied the workflow | Pages source not set on the new repo | Lesson 08, one settings click |
| Tests still hit TaskBoard | `webServer` still runs `npm run demo` | Change the config, then delete `demo-app/` |
| Lockfile fights `npm ci` | You edited `package.json` and did not refresh the lockfile | Run `npm install` and commit `package-lock.json` |

## What you should not copy blindly

- `demo-app/` is a teaching site. It is not a product scaffold.
- Azure YAML in `examples/` is only for teams that already live in Azure DevOps.
- The lesson site builder is optional. Your product repo does not need Pages to have green CI.

When the suite outgrows "one green path," switch to [playwright-field-guide](https://github.com/bg-playground/playwright-field-guide).

## Next

Back to the [README](../README.md).
