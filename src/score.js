// Turns raw analysis into scores and prioritized, concrete findings.
// Every finding says what is wrong, why it costs AI visibility, and the exact fix.

export function buildFindings(a, vis, serp, targetUrl) {
  const f = [];
  const add = (severity, area, title, why, fix) => f.push({ severity, area, title, why, fix });
  const host = vis.host;

  // ---- AI access --------------------------------------------------------
  for (const b of a.access.blockedBots) {
    add('high', 'AI access', `robots.txt blocks ${b.bot} (${b.rule})`,
      `${b.bot} cannot read this page at all. Pages invisible to an AI crawler can never be cited, summarized, or recommended by that assistant — ranking is irrelevant if the reader is locked out.`,
      `If the block is unintentional, remove the rule or add:\n\nUser-agent: ${b.bot}\nAllow: /`);
  }
  if (a.access.xRobotsTag && /noindex|none/i.test(a.access.xRobotsTag)) {
    add('high', 'AI access', `X-Robots-Tag header is "${a.access.xRobotsTag}"`,
      'A noindex response header removes the page from search indexes entirely — both classic SEO and AI search tools that respect it.',
      'Remove the X-Robots-Tag: noindex header from the server/CDN config for pages that should be discoverable.');
  }
  if (a.meta.metaRobots && /noindex|none/i.test(a.meta.metaRobots)) {
    add('high', 'AI access', `<meta name="robots" content="${a.meta.metaRobots}">`,
      'This meta tag tells every crawler to drop the page from its index.',
      'Delete the tag or change it to content="index,follow" on pages meant to be found.');
  }
  if (!a.access.robotsPresent) {
    add('low', 'AI access', 'No robots.txt',
      'Not fatal (absence means "allow all"), but you lose the one file where AI-crawler policy and the sitemap are declared.',
      `Serve /robots.txt with at least:\n\nUser-agent: *\nAllow: /\nSitemap: ${new URL(targetUrl).origin}/sitemap.xml`);
  }
  if (!a.access.sitemap) {
    add('medium', 'AI access', 'No sitemap.xml found',
      'AI search indexes and crawlers use the sitemap to discover and refresh pages. Without it, deep pages are found late or not at all.',
      'Generate a sitemap (most frameworks have a plugin) and reference it from robots.txt.');
  }
  if (!a.access.llmsTxt) {
    add('low', 'AI access', 'No llms.txt',
      'llms.txt is an emerging convention that hands AI tools a curated map of your most important content — cheap to add, and early adopters are over-represented in AI answers.',
      `Serve /llms.txt — a short markdown file:\n\n# ${host}\n> One-line description of the site.\n\n## Key pages\n- [Page name](${targetUrl}): what it covers`);
  }

  // ---- AI readability -----------------------------------------------------
  const { parityRatio, rawWords, tfWords, missingHeadings } = a.content;
  if (rawWords < 80 && tfWords >= rawWords * 3) {
    add('high', 'AI readability', `Raw HTML contains almost no content (${rawWords} words) — the page is JS-rendered`,
      `A rendering fetcher (like TinyFish Fetch) extracts ~${tfWords} words, but plain HTTP fetchers — which is what many AI assistants and crawlers still use — receive an empty shell. To those tools this page has nothing to read, quote, or rank.`,
      'Server-side render or prerender the page (Next.js/Nuxt SSR/SSG, or a prerender service) so the main content is present in the initial HTML response.');
  } else if (parityRatio < 0.45 && rawWords > 150) {
    add('medium', 'AI readability', `AI extraction captures only ~${Math.round(parityRatio * 100)}% of the page's text`,
      'A large share of the visible text never makes it into the extracted content AI tools work from — usually boilerplate-heavy markup, content inside complex widgets, or text rendered as images/canvas.',
      'Move primary content into semantic elements (<main>, <article>, <h1>–<h3>, <p>, <table>) and out of deeply nested div/widget structures.');
  }
  if (missingHeadings.length > 0) {
    add('medium', 'AI readability', `${missingHeadings.length} heading(s) missing from the AI-extracted view`,
      `Sections invisible to extraction can't be cited in AI answers. Missing: ${missingHeadings.slice(0, 4).map((h) => `"${h.text.slice(0, 50)}"`).join(', ')}${missingHeadings.length > 4 ? '…' : ''}.`,
      'Check that these sections are real text in the DOM (not images or late-loading embeds) and sit inside the main content area, not in collapsed/hidden containers.');
  }
  if (a.headings.h1Count === 0) {
    add('medium', 'AI readability', 'Page has no <h1>',
      'The h1 is the strongest topical signal extractors and rankers read; without it, tools fall back to guessing the topic from the title tag alone.',
      `Add one h1 that states the page's subject, e.g. <h1>${(a.meta.title || 'Page topic').split(/[|–—]/)[0].trim()}</h1>`);
  } else if (a.headings.h1Count > 1) {
    add('low', 'AI readability', `Page has ${a.headings.h1Count} <h1> elements`,
      'Multiple h1s dilute the topic signal that extraction and ranking rely on.',
      'Keep one h1; demote the rest to h2.');
  }

  // ---- metadata -----------------------------------------------------------
  if (!a.meta.title) {
    add('high', 'Metadata', 'Missing <title>',
      'The title is the primary label in every search result and AI citation. Without it, tools display the URL.',
      '<title>Primary topic — brand</title> (50–60 characters).');
  } else if (a.meta.title.length > 70) {
    add('low', 'Metadata', `Title is ${a.meta.title.length} chars (truncates around 60)`,
      'Truncated titles lose the keywords that convince a user — or an AI assistant ranking sources — to pick this result.',
      'Front-load the topic and keep it under ~60 characters.');
  }
  if (!a.meta.metaDescription) {
    add('medium', 'Metadata', 'Missing meta description',
      'Search engines and AI tools synthesize their own summary when this is absent — usually worse than one you write, and it becomes the snippet users and assistants judge the page by.',
      `<meta name="description" content="One concrete sentence on what this page offers and for whom (under 160 chars).">`);
  }
  if (!a.meta.canonical) {
    add('low', 'Metadata', 'Missing canonical link',
      'Without rel=canonical, URL variants (utm params, trailing slashes) split ranking signal across duplicates.',
      `<link rel="canonical" href="${targetUrl.split('?')[0]}">`);
  }
  if (!a.meta.ogTitle && !a.meta.ogDescription) {
    add('low', 'Metadata', 'No Open Graph tags',
      'OG tags control how the page appears when shared — including in AI chat interfaces that unfurl links.',
      '<meta property="og:title" …>, <meta property="og:description" …>, <meta property="og:image" …>');
  }
  if (a.jsonLdTypes.length === 0) {
    add('medium', 'Metadata', 'No structured data (JSON-LD)',
      'Schema.org markup is machine-readable ground truth. AI search features and rich results consume it directly; pages without it depend entirely on text inference.',
      `<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"${(a.meta.title || '').replace(/"/g, '')}","url":"${targetUrl}"}</script>\n\nUse a more specific @type (Article, Product, FAQPage, SoftwareApplication…) where it fits.`);
  } else if (a.jsonLdTypes.includes('(unparseable JSON-LD)')) {
    add('medium', 'Metadata', 'JSON-LD present but invalid JSON',
      'Broken structured data is ignored by every consumer — same as not having it.',
      'Validate the block at validator.schema.org and fix the syntax error.');
  }
  if (!a.meta.lang) {
    add('low', 'Metadata', 'Missing <html lang>',
      'Language detection affects which market/locale indexes include the page.',
      '<html lang="en">');
  }

  // ---- search visibility ---------------------------------------------------
  for (const c of vis.checks) {
    if (c.error) continue;
    if (!c.found) {
      const leaders = (c.topResults || []).map((r) => r.host).filter(Boolean).slice(0, 3).join(', ');
      add(c.label === 'brand' ? 'high' : 'medium', 'Search visibility',
        `Not in the top ${c.topResults?.length || 10} for ${c.label}: "${c.query}"`,
        `AI search returns ${leaders || 'other domains'} for this query instead of ${host}. Assistants answering from these results will cite competitors, not you.${c.label === 'brand' ? ' Losing your own brand query is the most urgent variant of this.' : ''}`,
        'Make the page the best answer for this exact query: align h1/title with the query phrasing, answer it directly in the first paragraph, add supporting structured data, and earn a few topical links. Readability fixes above compound here — tools can only rank what they can read.');
    } else if (c.position > 3) {
      add('low', 'Search visibility', `Position ${c.position} for ${c.label}: "${c.query}"`,
        'AI assistants typically synthesize answers from the first handful of results; positions past #3 are cited far less.',
        'Strengthen the on-page answer for this query and check the snippet below reflects your actual value proposition.');
    }
  }

  // ---- live SERP cross-check -------------------------------------------
  if (serp && serp.ok) {
    if (!serp.target_found) {
      add('medium', 'Search visibility', `Live ${serp.engine} SERP check: ${host} absent from the first 10 results`,
        'A real browser session on a real search engine confirms the gap found by the Search API — this is what a human (or an AI with browsing) actually sees.',
        'Same remediation as above; re-run this audit after shipping fixes to watch the live position move.');
    } else {
      add('info', 'Search visibility', `Live ${serp.engine} SERP check: found at position ${serp.target_position}`,
        'The live engine agrees with the Search API view.',
        'No action needed — keep monitoring.');
    }
  }

  const order = { high: 0, medium: 1, low: 2, info: 3 };
  f.sort((x, y) => order[x.severity] - order[y.severity]);
  return f;
}

export function buildScores(a, vis, findings) {
  const penalty = { high: 25, medium: 12, low: 5, info: 0 };
  const scoreArea = (area) => Math.max(0,
    100 - findings.filter((x) => x.area === area).reduce((s, x) => s + penalty[x.severity], 0));
  const readability = Math.max(0, Math.round(
    (scoreArea('AI readability') + scoreArea('Metadata')) / 2));
  const access = scoreArea('AI access');
  const checked = vis.checks.filter((c) => !c.error);
  const visScore = checked.length === 0 ? 0 : Math.round(
    (checked.reduce((s, c) => s + (c.found ? (c.position <= 3 ? 1 : 0.6) : 0), 0) / checked.length) * 100);
  const overall = Math.round(readability * 0.4 + access * 0.25 + visScore * 0.35);
  const grade = overall >= 90 ? 'A' : overall >= 75 ? 'B' : overall >= 60 ? 'C' : overall >= 40 ? 'D' : 'F';
  return { readability, access, visibility: visScore, overall, grade };
}
