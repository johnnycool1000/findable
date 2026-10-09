// Offline smoke tests for the pure logic — no network, no API key needed.
//   node test/smoke.test.js
import assert from 'node:assert/strict';
import { evaluateRobots, AI_BOTS } from '../src/rawfetch.js';
import { buildQueries } from '../src/visibility.js';
import { analyzePage } from '../src/analyze.js';
import { buildFindings, buildScores } from '../src/score.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };

test('robots: GPTBot specifically blocked, others allowed', () => {
  const txt = 'User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /';
  const res = evaluateRobots(txt, '/pricing');
  assert.equal(res.find((r) => r.bot === 'GPTBot').access, 'blocked');
  assert.equal(res.find((r) => r.bot === 'ClaudeBot').access, 'allowed');
});

test('robots: wildcard disallow blocks every AI bot', () => {
  const res = evaluateRobots('User-agent: *\nDisallow: /', '/');
  assert.ok(res.every((r) => r.access === 'blocked'));
  assert.equal(res.length, AI_BOTS.length);
});

test('robots: longer Allow overrides shorter Disallow', () => {
  const txt = 'User-agent: *\nDisallow: /private\nAllow: /private/public-page';
  const res = evaluateRobots(txt, '/private/public-page');
  assert.ok(res.every((r) => r.access === 'allowed'));
});

test('queries: derives trimmed topic + brand, dedupes target', () => {
  const qs = buildQueries({
    userQuery: 'best crm for startups',
    meta: { title: 'Acme CRM — The CRM startups love. Try it free today, no card needed.' },
    h1: null,
    host: 'acme.com',
  });
  assert.equal(qs[0].q, 'best crm for startups');
  assert.ok(qs[1].q.length < 60, 'topic query is trimmed');
  assert.equal(qs[2].q, 'acme');
});

const probeStub = {
  robots: { present: true, text: '' },
  llmsTxt: { present: false },
  sitemap: { present: false },
  botAccess: AI_BOTS.map((bot) => ({ bot, access: 'allowed', rule: '' })),
  xRobotsTag: null,
  page: { status: 200 },
};

test('analyze: detects JS-shell page (raw empty, AI view full)', () => {
  const a = analyzePage({
    rawHtml: '<html><head><title>App</title></head><body><div id="root"></div></body></html>',
    tfResult: { title: 'App', text: 'word '.repeat(500) },
    probe: probeStub,
  });
  assert.ok(a.content.rawWords < 10);
  assert.ok(a.content.tfWords > 400);
  const findings = buildFindings(a, { host: 'x.com', checks: [] }, null, 'https://x.com');
  assert.ok(findings.some((f) => f.title.includes('JS-rendered')), 'flags JS-rendered shell');
  assert.ok(findings.some((f) => f.title.includes('meta description')), 'flags missing description');
});

test('analyze: counts h1s and extracts JSON-LD types', () => {
  const a = analyzePage({
    rawHtml: `<html lang="en"><head><title>T</title>
      <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article"}</script>
      </head><body><h1>One</h1><h1>Two</h1><p>${'content '.repeat(100)}</p></body></html>`,
    tfResult: { title: 'T', text: 'content '.repeat(100) },
    probe: probeStub,
  });
  assert.equal(a.headings.h1Count, 2);
  assert.deepEqual(a.jsonLdTypes, ['Article']);
});

test('scores: perfect page beats broken page', () => {
  const goodA = analyzePage({
    rawHtml: `<html lang="en"><head><title>Good page about widgets</title>
      <meta name="description" content="d"><link rel="canonical" href="https://g.com/">
      <meta property="og:title" content="t"><meta property="og:description" content="d">
      <script type="application/ld+json">{"@type":"WebPage"}</script>
      </head><body><h1>Widgets</h1><p>${'word '.repeat(300)}</p></body></html>`,
    tfResult: { title: 'Good page', text: 'Widgets ' + 'word '.repeat(290) },
    probe: { ...probeStub, llmsTxt: { present: true }, sitemap: { present: true } },
  });
  const vis = { host: 'g.com', checks: [{ label: 'brand', query: 'g', found: true, position: 1, topResults: [] }] };
  const gf = buildFindings(goodA, vis, null, 'https://g.com/');
  const gs = buildScores(goodA, vis, gf);
  const badVis = { host: 'b.com', checks: [{ label: 'brand', query: 'b', found: false, position: null, topResults: [] }] };
  const badA = analyzePage({ rawHtml: '<html><body></body></html>', tfResult: { text: '' }, probe: probeStub });
  const bf = buildFindings(badA, badVis, null, 'https://b.com/');
  const bs = buildScores(badA, badVis, bf);
  assert.ok(gs.overall > bs.overall, `good ${gs.overall} > bad ${bs.overall}`);
  assert.ok(gs.overall >= 85, `good page scores high (got ${gs.overall})`);
});

console.log(`\n${passed} tests passed.`);
