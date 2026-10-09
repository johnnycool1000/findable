// Page analysis: compares the raw-HTML view (plain crawler) with the
// TinyFish Fetch view (AI-grade extraction with rendering) and inspects the
// metadata that AI search and fetch tools rely on.
import { parse } from 'node-html-parser';

const strip = (s) => (s || '').replace(/\s+/g, ' ').trim();
const words = (s) => (strip(s) ? strip(s).split(' ').length : 0);

export function analyzePage({ rawHtml, tfResult, probe }) {
  // Keep script text (needed to read JSON-LD); script/style nodes are removed
  // before the visible-text extraction below.
  const root = parse(rawHtml || '', { blockTextElements: { script: true, style: true, noscript: true, pre: true } });
  const pick = (sel, attr) => {
    const el = root.querySelector(sel);
    return el ? strip(attr ? el.getAttribute(attr) : el.text) : null;
  };

  // --- metadata the AI/search stack reads -------------------------------
  const meta = {
    title: pick('title'),
    metaDescription: pick('meta[name="description"]', 'content'),
    canonical: pick('link[rel="canonical"]', 'href'),
    ogTitle: pick('meta[property="og:title"]', 'content'),
    ogDescription: pick('meta[property="og:description"]', 'content'),
    ogImage: pick('meta[property="og:image"]', 'content'),
    metaRobots: pick('meta[name="robots"]', 'content'),
    lang: root.querySelector('html')?.getAttribute('lang') || null,
    viewport: pick('meta[name="viewport"]', 'content'),
  };

  // --- structured data ---------------------------------------------------
  const jsonLdTypes = [];
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(s.text);
      const collect = (node) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) return node.forEach(collect);
        if (node['@type']) jsonLdTypes.push(...[].concat(node['@type']));
        if (node['@graph']) collect(node['@graph']);
      };
      collect(data);
    } catch { /* invalid JSON-LD is itself a finding */ jsonLdTypes.push('(unparseable JSON-LD)'); }
  }

  // --- heading structure ---------------------------------------------------
  const headings = [];
  for (const h of root.querySelectorAll('h1,h2,h3,h4')) {
    headings.push({ level: Number(h.tagName[1]), text: strip(h.text).slice(0, 140) });
  }
  const h1s = headings.filter((h) => h.level === 1);

  // --- raw vs AI-extracted content parity ----------------------------------
  for (const kill of ['script', 'style', 'noscript', 'svg', 'template']) {
    root.querySelectorAll(kill).forEach((el) => el.remove());
  }
  const rawText = strip(root.text);
  const rawWords = words(rawText);
  const tf = tfResult || {};
  const tfText = typeof tf.text === 'string' ? tf.text : JSON.stringify(tf.text || '');
  const tfWords = words(tfText.replace(/[#*>`|\[\]()-]/g, ' '));
  const parityRatio = rawWords > 0 ? tfWords / rawWords : (tfWords > 0 ? Infinity : 1);

  // Which raw headings survive into the AI extraction?
  const tfLower = tfText.toLowerCase();
  const missingHeadings = headings
    .filter((h) => h.text.length > 8 && !tfLower.includes(h.text.toLowerCase().slice(0, 60)))
    .slice(0, 10);

  return {
    meta,
    jsonLdTypes: [...new Set(jsonLdTypes)],
    headings: { all: headings.slice(0, 60), h1Count: h1s.length, h1: h1s[0]?.text || null },
    content: {
      rawWords,
      tfWords,
      parityRatio: Number(parityRatio.toFixed(2)),
      tfTitle: tf.title || null,
      tfDescription: tf.description || null,
      lastModified: tf.last_modified || null,
      etag: tf.etag || null,
      missingHeadings,
      tfExcerpt: tfText.slice(0, 1_200),
    },
    access: {
      robotsPresent: probe.robots.present,
      llmsTxt: probe.llmsTxt.present,
      sitemap: probe.sitemap.present,
      xRobotsTag: probe.xRobotsTag,
      blockedBots: probe.botAccess.filter((b) => b.access === 'blocked'),
      allowedBots: probe.botAccess.filter((b) => b.access === 'allowed'),
      httpStatus: probe.page.status,
    },
  };
}
