# 08 — Publish a Pages site

Goal: put the lessons on a public URL, using GitHub Actions, without a separate docs product.

## Term

**GitHub Pages** is a static website GitHub hosts for a repository. This repo publishes `https://bg-playground.github.io/first-green-playwright/` from `_site/` after a workflow builds it.

It is not the HTML report from Playwright. That report is still an artifact on the **Playwright Tests** workflow. Pages is for humans reading lessons.

## Why it matters

A beginner who will not clone the repo can still walk the path. The same workflow is the pattern you steal when you want a public report or a public lesson set later.

## Copy this — one-time settings click

GitHub will not publish until Pages is pointed at Actions.

1. Repo **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Save. The next run of **GitHub Pages** can deploy.

If you generated this repo from the template, do that click in *your* copy. Template copies do not inherit the Pages source setting.

## Copy this — the workflow already in this repo

`.github/workflows/pages.yml` does four things:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: lts/*
      - run: node scripts/build-site.mjs
        env:
          PAGES_BASE_PATH: /first-green-playwright
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

`scripts/build-site.mjs` turns `docs/*.md` into HTML. No extra npm package. Project pages live under `/first-green-playwright/`, so the script prefixes every in-site link with that base path.

If you steal this for `your-org/your-repo`, change `PAGES_BASE_PATH` to `/your-repo`. User-site repos (`your-name.github.io`) use an empty base path.

## Copy this — build it locally

```bash
node scripts/build-site.mjs
npx --yes serve _site
```

Open the printed URL. You should see the lesson list.

## What you should see

- A workflow named **GitHub Pages** in the Actions tab.
- After the first green deploy: `https://bg-playground.github.io/first-green-playwright/`.
- Lesson 00 through 09 as HTML, with next/previous links.

## When it breaks

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Deploy job waits, then fails on Pages | Source is still "Deploy from a branch" | Settings → Pages → Source → GitHub Actions |
| Site 404s at the root | Project site needs the repo name in the path | Keep `PAGES_BASE_PATH=/first-green-playwright` |
| CSS/links look like they ignore the folder | Base path empty on a project site | Set `PAGES_BASE_PATH` to `/repo-name` |
| Workflow runs on every test change | Path filters missing | Limit `on.push.paths` to `docs/**`, the builder, and this workflow |
| You expected the Playwright HTML report here | Different artifact | Download `playwright-report` from **Playwright Tests**, or add a second folder later |

Do not merge the test job and the Pages job on day one. Tests need browsers. Pages needs `pages: write`. Keep the permissions on the smallest job that deploys.

## What you just learned

Pages is another artifact with a URL. The builder is a script. The host is GitHub. None of that changes how Playwright runs.

## Next

[09 — Use this template](09-use-this-template.md)
