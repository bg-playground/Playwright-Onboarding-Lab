#!/usr/bin/env node
/**
 * Build a static lesson site from docs/*.md.
 * No extra npm packages. Run from the repo root: node scripts/build-site.mjs
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DOCS = join(ROOT, 'docs');
const OUT = join(ROOT, '_site');
const BASE = process.env.PAGES_BASE_PATH || '/Playwright-Onboarding-Lab';

const LESSONS = [
  ['00-glossary.md', 'Glossary'],
  ['01-first-local-test.md', 'First local test'],
  ['02-first-green-ci.md', 'First green CI'],
  ['03-read-a-failure.md', 'Read a failure'],
  ['04-steal-this-workflow.md', 'Steal this workflow'],
  ['05-common-breaks.md', 'Common breaks'],
  ['06-monorepo.md', 'Add this to a monorepo'],
  ['07-azure-devops.md', 'Azure DevOps twin'],
  ['08-github-pages.md', 'Publish a Pages site'],
  ['09-use-this-template.md', 'Use this template'],
];

const STYLE = `
:root {
  --bg: #0f1419;
  --panel: #1a222c;
  --ink: #e8eef4;
  --muted: #9aa8b5;
  --line: #2a3542;
  --green: #3dd68c;
  --link: #7ec8ff;
  --code-bg: #0b1015;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--bg); color: var(--ink); font: 16px/1.55 ui-sans-serif, system-ui, sans-serif; }
a { color: var(--link); }
header, main, footer { max-width: 860px; margin: 0 auto; padding: 1.25rem 1.25rem; }
header { display: flex; gap: 1rem; justify-content: space-between; align-items: baseline; border-bottom: 1px solid var(--line); }
header a { color: var(--ink); text-decoration: none; }
header .brand { font-weight: 700; }
header .brand span { color: var(--green); }
.card { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 1rem 1.1rem; margin: 0.75rem 0; }
code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.92em; }
code { background: var(--code-bg); padding: 0.1em 0.35em; border-radius: 4px; }
pre { background: var(--code-bg); border: 1px solid var(--line); border-radius: 8px; padding: 0.9rem 1rem; overflow: auto; }
pre code { padding: 0; background: none; }
table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.95em; }
th, td { border: 1px solid var(--line); padding: 0.45rem 0.6rem; text-align: left; vertical-align: top; }
th { background: #222c37; }
hr { border: 0; border-top: 1px solid var(--line); margin: 1.5rem 0; }
.muted { color: var(--muted); }
footer { border-top: 1px solid var(--line); color: var(--muted); font-size: 0.9em; }
.pager { display: flex; justify-content: space-between; gap: 1rem; margin-top: 2rem; }
`.trim();

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s) {
  let out = escapeHtml(s);
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    const mapped = mapHref(href);
    return `<a href="${mapped}">${text}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  return out;
}

function mapHref(href) {
  if (/^https?:\/\//.test(href) || href.startsWith('#') || href.startsWith('mailto:')) return href;
  if (href.startsWith('../README')) return `${BASE}/`;
  const file = href.split('/').pop();
  if (file && file.endsWith('.md')) return `${BASE}/${file.replace(/\.md$/, '.html')}`;
  if (href.startsWith('../')) return `https://github.com/bg-playground/Playwright-Onboarding-Lab/blob/main/${href.replace(/^\.\.\//, '')}`;
  return href;
}

function renderMarkdown(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let i = 0;
  let inList = null;
  let inTable = false;

  const closeList = () => {
    if (inList) {
      html.push(inList === 'ol' ? '</ol>' : '</ul>');
      inList = null;
    }
  };
  const closeTable = () => {
    if (inTable) {
      html.push('</tbody></table>');
      inTable = false;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      closeList();
      closeTable();
      const fence = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        fence.push(lines[i]);
        i += 1;
      }
      html.push(`<pre><code>${escapeHtml(fence.join('\n'))}</code></pre>`);
      i += 1;
      continue;
    }

    if (/^\s*\|.+\|\s*$/.test(line)) {
      closeList();
      const cells = line.trim().slice(1, -1).split('|').map((c) => c.trim());
      const isSep = cells.every((c) => /^:?-+:?$/.test(c));
      if (!inTable && isSep) {
        i += 1;
        continue;
      }
      if (!inTable) {
        html.push('<table><thead><tr>' + cells.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>');
        inTable = true;
        i += 1;
        continue;
      }
      if (isSep) {
        i += 1;
        continue;
      }
      html.push('<tr>' + cells.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>');
      i += 1;
      continue;
    } else {
      closeTable();
    }

    if (/^---+$/.test(line.trim())) {
      closeList();
      html.push('<hr>');
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    const ul = line.match(/^[-*]\s+(.*)$/);
    if (ul) {
      closeTable();
      if (inList !== 'ul') {
        closeList();
        html.push('<ul>');
        inList = 'ul';
      }
      html.push(`<li>${inline(ul[1])}</li>`);
      i += 1;
      continue;
    }

    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ol) {
      closeTable();
      if (inList !== 'ol') {
        closeList();
        html.push('<ol>');
        inList = 'ol';
      }
      html.push(`<li>${inline(ol[1])}</li>`);
      i += 1;
      continue;
    }

    if (line.trim() === '') {
      closeList();
      i += 1;
      continue;
    }

    closeList();
    html.push(`<p>${inline(line)}</p>`);
    i += 1;
  }
  closeList();
  closeTable();
  return html.join('\n');
}

function page({ title, body, prev, next }) {
  const prevLink = prev ? `<a href="${BASE}/${prev[0].replace(/\.md$/, '.html')}">← ${prev[1]}</a>` : '<span></span>';
  const nextLink = next ? `<a href="${BASE}/${next[0].replace(/\.md$/, '.html')}">${next[1]} →</a>` : '<span></span>';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} · Playwright Onboarding Lab</title>
  <style>${STYLE}</style>
</head>
<body>
  <header>
    <a class="brand" href="${BASE}/">Playwright <span>Onboarding</span> Lab</a>
    <a class="muted" href="https://github.com/bg-playground/Playwright-Onboarding-Lab">GitHub</a>
  </header>
  <main>
    ${body}
    <div class="pager">${prevLink}${nextLink}</div>
  </main>
  <footer>MIT. Lessons live in <code>docs/</code>. Site built from those files.</footer>
</body>
</html>
`;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, '.nojekyll'), '');

  const lessonCards = LESSONS.map(([file, label], idx) => {
    const href = `${BASE}/${file.replace(/\.md$/, '.html')}`;
    return `<div class="card"><a href="${href}">${String(idx).padStart(2, '0')} — ${label}</a></div>`;
  }).join('\n');

  const indexBody = `
    <h1>Playwright Onboarding Lab</h1>
    <p>A beginner on-ramp for Playwright + GitHub Actions. Terms, copy-paste demos, and a first green CI run.</p>
    <p class="muted">This site is the lesson set. The tests and workflow live in the <a href="https://github.com/bg-playground/Playwright-Onboarding-Lab">GitHub template</a>.</p>
    <p>
      <a href="https://github.com/bg-playground/Playwright-Onboarding-Lab/generate">Use this template</a>
      ·
      <a href="https://github.com/bg-playground/Playwright-Onboarding-Lab/actions/workflows/playwright.yml">CI badge target</a>
    </p>
    <h2>Lesson order</h2>
    ${lessonCards}
    <h2>15-minute path</h2>
    <pre><code>git clone https://github.com/bg-playground/Playwright-Onboarding-Lab.git
cd Playwright-Onboarding-Lab
npm install
npx playwright install chromium
npx playwright test</code></pre>
  `;

  await writeFile(join(OUT, 'index.html'), page({ title: 'Lessons', body: indexBody }));

  for (let i = 0; i < LESSONS.length; i += 1) {
    const [file, label] = LESSONS[i];
    const md = await readFile(join(DOCS, file), 'utf8');
    const prev = i > 0 ? LESSONS[i - 1] : null;
    const next = i < LESSONS.length - 1 ? LESSONS.length - 1 && LESSONS[i + 1] : null;
    const html = page({
      title: label,
      body: renderMarkdown(md),
      prev,
      next,
    });
    await writeFile(join(OUT, file.replace(/\.md$/, '.html')), html);
  }

  const extras = await readdir(DOCS);
  for (const name of extras) {
    if (!name.endsWith('.md')) continue;
    if (LESSONS.some(([file]) => file === name)) continue;
    const md = await readFile(join(DOCS, name), 'utf8');
    await writeFile(
      join(OUT, name.replace(/\.md$/, '.html')),
      page({ title: basename(name, '.md'), body: renderMarkdown(md) }),
    );
  }

  process.stdout.write(`built ${OUT}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
