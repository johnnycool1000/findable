#!/usr/bin/env node
// Findable — can AI search and fetch tools actually read your page?
//
//   node src/cli.js <url> [--query "target search query"] [--no-agent] [--json] [--out DIR]
//
// Pipeline: TinyFish Fetch (AI view of the live page) + raw HTTP (plain-crawler
// view) + TinyFish Search (where it surfaces) + TinyFish Agent (live SERP
// cross-check) → scored report with concrete fixes.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnv } from './env.js';
import { tfFetch } from './tinyfish.js';
import { probeSite } from './rawfetch.js';
import { analyzePage } from './analyze.js';
import { buildQueries, checkVisibility } from './visibility.js';
import { liveSerpCheck } from './live-serp.js';
import { buildFindings, buildScores } from './score.js';
import { consoleSummary, markdownReport, htmlReport } from './report.js';

function parseArgs(argv) {
  const args = { url: null, query: null, agent: true, json: false, out: 'reports' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--query' || a === '-q') args.query = argv[++i];
    else if (a === '--no-agent') args.agent = false;
    else if (a === '--json') args.json = true;
    else if (a === '--out' || a === '-o') args.out = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
    else if (!a.startsWith('-') && !args.url) args.url = a;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (args.help || !args.url) {
  console.log('Usage: findable <url> [--query "target search query"] [--no-agent] [--json] [--out DIR]');
  process.exit(args.help ? 0 : 1);
}
if (!/^https?:\/\//i.test(args.url)) args.url = 'https://' + args.url;
const key = loadEnv();
const step = (msg) => !args.json && console.error(`▸ ${msg}`);

try {
  step(`Fetching live page two ways: TinyFish Fetch (AI view) + raw HTTP (crawler view)…`);
  const [tfRes, probe] = await Promise.all([
    tfFetch(key, [args.url], { purpose: 'SEO/AI-visibility audit of this page' }),
    probeSite(args.url),
  ]);
  const tfResult = tfRes.results?.[0];
  if (!tfResult && tfRes.errors?.length) step(`TinyFish Fetch warning: ${tfRes.errors[0].error}`);
  if (!probe.page.ok && probe.page.status !== 0) step(`Raw fetch returned HTTP ${probe.page.status}`);

  step('Analyzing content parity, metadata, structured data, and AI-crawler access…');
  const a = analyzePage({ rawHtml: probe.page.text, tfResult, probe });

  const queries = buildQueries({
    userQuery: args.query,
    meta: a.meta,
    h1: a.headings.h1,
    host: new URL(args.url).host.replace(/^www\./, ''),
  });
  step(`Checking search visibility via TinyFish Search: ${queries.map((q) => `"${q.q}"`).join(', ')}…`);
  const vis = await checkVisibility(key, args.url, queries);

  let serp = null;
  if (args.agent && queries.length) {
    const primary = queries[0].q;
    step(`Live SERP cross-check via TinyFish Agent (real browser on bing.com) for "${primary}" — takes 1-3 min…`);
    serp = await liveSerpCheck(key, primary, vis.host);
    if (!serp.ok) step(`Agent check unavailable: ${serp.error} (report proceeds without it)`);
  }

  const findings = buildFindings(a, vis, serp, args.url);
  const scores = buildScores(a, vis, findings);
  const when = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const ctx = { url: args.url, when, scores, findings, a, vis, serp, queries };

  const host = new URL(args.url).host.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, '_');
  const stamp = new Date().toISOString().slice(0, 10);
  mkdirSync(resolve(args.out), { recursive: true });
  const mdPath = resolve(args.out, `${host}-${stamp}.md`);
  const htmlPath = resolve(args.out, `${host}-${stamp}.html`);
  writeFileSync(mdPath, markdownReport(ctx));
  writeFileSync(htmlPath, htmlReport(ctx));

  if (args.json) {
    console.log(JSON.stringify({ url: args.url, scores, findings, visibility: vis, liveSerp: serp, analysis: a }, null, 2));
  } else {
    console.log(consoleSummary(ctx));
    console.log(`\n  Reports: ${mdPath}\n           ${htmlPath}\n`);
  }
} catch (e) {
  console.error(`Audit failed: ${e.message || e}`);
  process.exit(1);
}
