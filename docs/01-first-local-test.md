# 01 — First local test

Goal: run the tests on your machine and know what "green" looks like.

Start here after the [glossary](00-glossary.md).

## Term

**Local test run** means Playwright starts the demo site, opens Chromium, runs every file in `tests/`, and prints a result in your terminal.

## Why it matters

If it cannot pass on your laptop, CI will not save you. Local is where you learn the loop: change → run → read.

## Copy this

You need Node.js 20 or newer.

```bash
git clone https://github.com/bg-playground/Playwright-Onboarding-Lab.git
cd Playwright-Onboarding-Lab
npm install
npx playwright install chromium
npx playwright test
```

Watch one test in a visible browser:

```bash
npx playwright test tests/login.spec.ts --headed
```

Open Playwright's inspector UI:

```bash
npm run test:ui
```

## What you should see

- The demo server prints `demo-app ready at http://127.0.0.1:4173`.
- The terminal lists tests from `home`, `login`, `tasks`, and `locators`.
- The last line is all passed.
- A folder named `playwright-report/` appears. Open it with `npm run report`.

The sign-in shortcut baked into the demo site:

- Email: `demo@example.com`
- Password: `password123`

## When it breaks

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `Executable doesn't exist` | Browsers were not downloaded | `npx playwright install chromium` |
| `Error: http://127.0.0.1:4173` never became ready | Something else is using 4173, or `scripts/serve.mjs` failed | Stop the other process; run `npm run demo` by itself |
| Tests open a blank page | You pointed `baseURL` at the wrong port | Match `playwright.config.ts` and the server port |
| TypeScript editor red squiggles | IDE has not picked up `@playwright/test` types | Restart the TS server after `npm install` |

## What you just learned

Playwright does three jobs: start the app (`webServer`), drive the browser (`page`), and prove results (`expect`). CI will do the exact same three jobs on a rented Ubuntu machine.

## Next

[02 — First green CI](02-first-green-ci.md)
