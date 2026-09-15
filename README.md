# First Green Playwright

[![Playwright Tests](https://github.com/bg-playground/first-green-playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/bg-playground/first-green-playwright/actions/workflows/playwright.yml)
[![GitHub Pages](https://github.com/bg-playground/first-green-playwright/actions/workflows/pages.yml/badge.svg)](https://github.com/bg-playground/first-green-playwright/actions/workflows/pages.yml)

A beginner on-ramp for **Playwright + GitHub Actions**.

Not another encyclopedia. A path you can finish: terms → one local test → one green CI run → a workflow you can paste into your own repo.

This repository is a **GitHub template**. Use [Use this template](https://github.com/bg-playground/first-green-playwright/generate) when you want a copy that is not a fork. Lessons are also on Pages: [bg-playground.github.io/first-green-playwright](https://bg-playground.github.io/first-green-playwright/).

This is intentionally smaller than [playwright-field-guide](https://github.com/bg-playground/playwright-field-guide). Use that after this.

## 15-minute path

```bash
git clone https://github.com/bg-playground/first-green-playwright.git
cd first-green-playwright
npm install
npx playwright install chromium
npx playwright test
```

You should see every test pass. Then open the report:

```bash
npm run report
```

The tests hit `demo-app/`, a static TaskBoard site that lives in this repository. No third-party website required.

## How this repo is laid out

```text
demo-app/                     # the site under test
tests/                        # copy-paste TypeScript specs
playwright.config.ts          # how tests run locally and on CI
.github/workflows/playwright.yml
.github/workflows/pages.yml
examples/azure-pipelines-playwright.yml
scripts/build-site.mjs
docs/
  00-glossary.md              # words, in one sentence each
  01-first-local-test.md
  02-first-green-ci.md
  03-read-a-failure.md
  04-steal-this-workflow.md   # drop this onto your project
  05-common-breaks.md
  06-monorepo.md              # same loop inside apps/web
  07-azure-devops.md          # Azure Pipelines twin
  08-github-pages.md          # lesson site on Pages
  09-use-this-template.md     # Use this template button
```

## Lesson order

Each lesson uses the same shape: **Term → Why it matters → Copy this → What you should see → When it breaks**.

1. [Glossary](docs/00-glossary.md)
2. [First local test](docs/01-first-local-test.md)
3. [First green CI](docs/02-first-green-ci.md)
4. [Read a failure](docs/03-read-a-failure.md)
5. [Steal this workflow](docs/04-steal-this-workflow.md)
6. [Common breaks](docs/05-common-breaks.md)
7. [Add this to a monorepo](docs/06-monorepo.md)
8. [Azure DevOps twin](docs/07-azure-devops.md)
9. [Publish a Pages site](docs/08-github-pages.md)
10. [Use this template](docs/09-use-this-template.md)

## Demo login

- Email: `demo@example.com`
- Password: `password123`

Anything else on the sign-in form should show `Invalid email or password`.

## What "done" looks like

- `npx playwright test` is green on your laptop.
- The Actions tab is green on `main`.
- You can download `playwright-report` from a run.
- You can point `baseURL` and `webServer.command` at *your* app and keep the same workflow.
- Optional: lessons load at [bg-playground.github.io/first-green-playwright](https://bg-playground.github.io/first-green-playwright/) after Pages is pointed at GitHub Actions.

## GitHub topics

If the About box on this repo is empty, add these under the gear next to **About**:

`playwright` · `github-actions` · `azure-devops` · `ci` · `e2e-testing` · `beginner`

## License

MIT. Use the tests, the YAML, and the wording.
