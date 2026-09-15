# 02 — First green CI

Goal: push this repo (or a fork) and watch GitHub Actions run the same tests.

## Term

**A green CI run** means a workflow job finished with every step successful, including `npx playwright test`.

## Why it matters

CI is the first time the tests run on a machine that is not yours. That is the whole point.

## Copy this

The workflow already lives at `.github/workflows/playwright.yml`. You do not write it from scratch for this lesson.

1. Fork or push the repo to GitHub.
2. Open the **Actions** tab.
3. Open the run named **Playwright Tests**.
4. Wait for the `test` job to finish.

If you are adding this to *your* project instead, skip to [04 — Steal this workflow](04-steal-this-workflow.md).

The important part of the workflow, with the beginner translation next to each step:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest          # rent a clean Linux machine
    steps:
      - uses: actions/checkout@v5   # download your code onto that machine
      - uses: actions/setup-node@v5 # install Node.js
        with:
          node-version: lts/*
          cache: npm
      - run: npm ci                 # install exact packages from package-lock.json
      - run: npx playwright install --with-deps chromium
                                    # download Chromium + OS libraries
      - run: npx playwright test    # run the same command you ran locally
```

`--with-deps` matters. Ubuntu does not ship the system libraries Chromium needs. That flag installs them.

## What you should see

- A yellow dot, then a green check, on the commit.
- In the log: `demo-app ready at http://127.0.0.1:4173`.
- In the log: the same test names you saw locally.
- Two downloadable artifacts: `playwright-report` and (on failure) `test-results`.

GitHub sets `CI=true` automatically. That turns on retries and forbids leftover `test.only` calls. See `playwright.config.ts`.

## When it breaks

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Workflow file is ignored | File is not under `.github/workflows/` or Actions is disabled | Check the path; enable Actions in repo settings |
| `npm ci` fails | No `package-lock.json`, or it is out of date | Commit the lockfile; run `npm install` locally first |
| Browser install fails | Network blip, or you omitted `--with-deps` | Re-run the job; keep `--with-deps` on Ubuntu |
| Tests cannot reach the app | `webServer` did not start, or `baseURL` is wrong | Read the `webServer` log above the first test |
| Job is cancelled at 6 hours | Not this repo. This job should finish in minutes | Check you did not add a hang or a huge browser matrix |

## What you just learned

CI is not magic. It is a checklist: checkout → Node → npm → browsers → start app → test → upload evidence.

## Next

[03 — Read a failure](03-read-a-failure.md)
