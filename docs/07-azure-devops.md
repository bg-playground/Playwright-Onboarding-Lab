# 07 — Azure DevOps twin

Goal: keep the same first-green Playwright loop on Azure Pipelines.

## Term

**The Azure twin** is the same checklist as [04 — Steal this workflow](04-steal-this-workflow.md), written in `azure-pipelines.yml`.

GitHub Actions and Azure DevOps are different products. The *jobs* are the same: checkout → Node → lockfile install → browsers → start the app → test → keep the report.

## Why it matters

Plenty of teams already live in Azure DevOps. Translating YAML by memory is how `--with-deps` disappears and Chromium cannot start.

This repo does not run Azure Pipelines. The file is a template you paste into *your* Azure project.

## Copy this checklist

1. Keep the Playwright setup from lesson 04. Do not create a second config "for Azure."
2. Add a JUnit reporter so Azure can draw a test tab. Leave the HTML reporter.

```ts
reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ['junit', { outputFile: 'test-results/e2e-junit-results.xml' }],
],
```

3. Put this file at the repo root as `azure-pipelines.yml`, or copy [examples/azure-pipelines-playwright.yml](../examples/azure-pipelines-playwright.yml).
4. In Azure DevOps: **Pipelines → New pipeline → Azure Repos Git or GitHub →** select the repo → use the existing YAML.
5. Run it once on `main`. Download `playwright-report`.

## Copy this pipeline

```yaml
# Same jobs as .github/workflows/playwright.yml, Azure spelling.
trigger:
  branches:
    include:
      - main
      - master

pr:
  branches:
    include:
      - main
      - master

pool:
  vmImage: ubuntu-latest

steps:
  - task: UseNode@1
    inputs:
      version: '22'
    displayName: Install Node.js

  - script: npm ci
    displayName: Install npm packages

  - script: npx playwright install --with-deps chromium
    displayName: Install Playwright browsers

  - script: npx playwright test
    displayName: Run Playwright tests
    env:
      CI: 'true'

  - task: PublishTestResults@2
    displayName: Publish JUnit results
    condition: succeededOrFailed()
    inputs:
      testResultsFormat: JUnit
      testResultsFiles: test-results/e2e-junit-results.xml
      searchFolder: $(System.DefaultWorkingDirectory)
      mergeTestResults: true
      failTaskOnFailedTests: true
      testRunTitle: Playwright Tests

  - task: PublishPipelineArtifact@1
    displayName: Publish HTML report
    condition: succeededOrFailed()
    inputs:
      targetPath: playwright-report
      artifact: playwright-report
      publishLocation: pipeline

  - task: PublishPipelineArtifact@1
    displayName: Publish traces
    condition: succeededOrFailed()
    inputs:
      targetPath: test-results
      artifact: test-results
      publishLocation: pipeline
```

Playwright already sets `CI` on most hosted agents. Setting `CI: 'true'` makes it obvious, and turns on the retries in this repo's config.

### Monorepo on Azure

Add a working directory to every script, and point artifacts at the package folder:

```yaml
- script: npm ci
  workingDirectory: apps/web
  displayName: Install npm packages

- script: npx playwright install --with-deps chromium
  workingDirectory: apps/web
  displayName: Install Playwright browsers

- script: npx playwright test
  workingDirectory: apps/web
  displayName: Run Playwright tests
  env:
    CI: 'true'

- task: PublishPipelineArtifact@1
  condition: succeededOrFailed()
  inputs:
    targetPath: apps/web/playwright-report
    artifact: playwright-report
    publishLocation: pipeline
```

### Side-by-side

| Job | GitHub Actions | Azure Pipelines |
| --- | --- | --- |
| Machine | `runs-on: ubuntu-latest` | `pool: vmImage: ubuntu-latest` |
| Node | `actions/setup-node@v5` | `UseNode@1` |
| Browsers | `npx playwright install --with-deps chromium` | same command |
| HTML report | `actions/upload-artifact@v4` | `PublishPipelineArtifact@1` |
| Test tab | not required for first green | `PublishTestResults@2` + JUnit reporter |
| Start the app | `webServer` in Playwright config | same `webServer` |

Do not start the app in a separate Azure task unless `webServer` cannot see it. One process, one port, one `baseURL`.

## What you should see

- A pipeline run on the next push to `main`.
- A **Tests** tab if you added the JUnit reporter.
- A downloadable `playwright-report` artifact. Unzip it, then `npx playwright show-report path/to/folder`.

## When it breaks

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `Executable doesn't exist` | You dropped `--with-deps` | Put it back on Linux agents |
| Tests tab is empty | No JUnit file | Add the `junit` reporter and the `PublishTestResults@2` task |
| Artifact path not found | Report landed under `apps/web` | Point `targetPath` at that folder |
| Pipeline has no YAML | File is not at the path Azure was told | Root `azure-pipelines.yml`, or pick the example path when you create the pipeline |
| Microsoft-hosted macOS/Windows works, Linux fails | Missing OS libraries | Keep `--with-deps` or use the official Playwright container image |

Official reference: [Playwright CI — Azure Pipelines](https://playwright.dev/docs/ci#azure-pipelines).

## What you just learned

Azure is not a different Playwright. It is a different upload button. Steal the checklist, change the YAML dialect, keep localhost tests.

## Next

Back to the [README](../README.md), or the production catalog: [playwright-field-guide](https://github.com/bg-playground/playwright-field-guide).
