# First Green Playwright

A beginner on-ramp for **Playwright + GitHub Actions**.

Not another encyclopedia. A path you can finish: terms → one local test → one green CI run → a workflow you can paste into your own repo.

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
docs/
  00-glossary.md              # words, in one sentence each
  01-first-local-test.md
  02-first-green-ci.md
  03-read-a-failure.md
  04-steal-this-workflow.md   # drop this onto your project
  05-common-breaks.md
```

## Lesson order

Each lesson uses the same shape: **Term → Why it matters → Copy this → What you should see → When it breaks**.

1. [Glossary](docs/00-glossary.md)
2. [First local test](docs/01-first-local-test.md)
3. [First green CI](docs/02-first-green-ci.md)
4. [Read a failure](docs/03-read-a-failure.md)
5. [Steal this workflow](docs/04-steal-this-workflow.md)
6. [Common breaks](docs/05-common-breaks.md)

## Demo login

- Email: `demo@example.com`
- Password: `password123`

Anything else on the sign-in form should show `Invalid email or password`.

## What "done" looks like

- `npx playwright test` is green on your laptop.
- The Actions tab is green on `main`.
- You can download `playwright-report` from a run.
- You can point `baseURL` and `webServer.command` at *your* app and keep the same workflow.

## License

MIT. Use the tests, the YAML, and the wording.
