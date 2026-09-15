# 03 — Read a failure

Goal: break a test on purpose, then use the report and trace instead of guessing.

## Term

**A useful failure** is one that tells you what the page was doing when the check failed.

## Why it matters

Beginners stare at the red X. Working testers open the recording.

## Copy this

Change one line in `tests/home.spec.ts` so the heading is wrong:

```ts
await expect(page.getByRole('heading', { name: 'This heading does not exist' })).toBeVisible();
```

Run it locally:

```bash
npx playwright test tests/home.spec.ts
npx playwright show-report
```

On CI, after a failed run:

1. Open the Actions run.
2. Download the `playwright-report` artifact.
3. Unzip it and open `index.html` in a browser.
4. If a retry happened, download `test-results` and open a trace:

```bash
npx playwright show-trace path/to/trace.zip
```

This repo only records a trace on the first retry (`trace: 'on-first-retry'`). Locally, retries are off, so force a trace when you need one:

```bash
npx playwright test tests/home.spec.ts --trace on
npx playwright show-trace test-results/*/*.zip
```

## What you should see

In the HTML report:

- The failed test name.
- The exact assertion.
- A screenshot if the test reached the page.

In the trace viewer:

- Each action: `goto`, `getByRole`, `expect`.
- The DOM at that moment.
- Network calls (this demo has almost none).
- A timeline you can scrub.

That is enough to answer: did we open the wrong page, use the wrong locator, or assert the wrong text?

## When it breaks

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| No screenshot | The test failed before the page loaded | Read the error string first, then add `screenshot: 'only-on-failure'` |
| No trace.zip | Retries did not run, or trace is still `off` | Use `--trace on` locally |
| Report looks empty | You opened the folder instead of `index.html` | Open `playwright-report/index.html` |
| Trace will not open | Zip path is wrong | Run `npx playwright show-trace` on the zip, not the folder |

## Put the test back

Undo the bad heading before you commit. A teaching repo with a red main branch teaches the wrong lesson.

## Next

[04 — Steal this workflow](04-steal-this-workflow.md)
