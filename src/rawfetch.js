// Plain HTTP views of the target site — what a non-rendering crawler receives.
// Used to compare against TinyFish Fetch (which renders) and to probe the
// crawl-control files that decide whether AI tools may read the site at all.

const UA = 'Mozilla/5.0 (compatible; FindableAudit/1.0; +https://github.com/johnnycool1000/findable)';

async function get(url, timeoutMs = 25_000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,*/*' },
      redirect: 'follow',
      signal: ctrl.signal,
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, finalUrl: res.url, headers: Object.fromEntries(res.headers), text };
  } catch (e) {
    return { ok: false, status: 0, finalUrl: url, headers: {}, text: '', error: String(e.message || e) };
  } finally {
    clearTimeout(t);
  }
}

/** The AI crawlers site owners most often need to think about. */
export const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-Web', 'Claude-SearchBot', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended',
  'CCBot', 'Bytespider', 'Amazonbot', 'meta-externalagent',
];

/** Parse robots.txt into per-agent rule groups and evaluate access for each AI bot. */
export function evaluateRobots(robotsTxt, path = '/') {
  const groups = [];
  let current = null;
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const field = m[1].toLowerCase();
    const value = m[2].trim();
    if (field === 'user-agent') {
      if (!current || current.rulesClosed) {
        current = { agents: [], allow: [], disallow: [], rulesClosed: false };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if (current && (field === 'allow' || field === 'disallow')) {
      current[field].push(value);
      current.rulesClosed = true;
    }
  }
  const matchGroup = (bot) => {
    const b = bot.toLowerCase();
    let specific = groups.find((g) => g.agents.some((a) => a !== '*' && (b.includes(a) || a.includes(b))));
    return specific || groups.find((g) => g.agents.includes('*')) || null;
  };
  const longestMatch = (rules, p) => {
    let best = '';
    for (const r of rules) {
      if (!r) continue;
      const rx = new RegExp('^' + r.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*'));
      if (rx.test(p) && r.length > best.length) best = r;
    }
    return best;
  };
  return AI_BOTS.map((bot) => {
    const g = matchGroup(bot);
    if (!g) return { bot, access: 'allowed', rule: '(no matching group)' };
    const a = longestMatch(g.allow, path);
    const d = longestMatch(g.disallow, path);
    if (d && d.length > a.length) return { bot, access: 'blocked', rule: `Disallow: ${d}` };
    return { bot, access: 'allowed', rule: a ? `Allow: ${a}` : '(no disallow matched)' };
  });
}

/** Raw page + crawl-control probes for the audited URL's origin. */
export async function probeSite(targetUrl) {
  const u = new URL(targetUrl);
  const origin = `${u.protocol}//${u.host}`;
  const [page, robots, llms, sitemap] = await Promise.all([
    get(targetUrl),
    get(`${origin}/robots.txt`, 15_000),
    get(`${origin}/llms.txt`, 15_000),
    get(`${origin}/sitemap.xml`, 15_000),
  ]);
  const robotsOk = robots.ok && /user-agent\s*:/i.test(robots.text);
  return {
    origin,
    path: u.pathname || '/',
    page,
    robots: { present: robotsOk, text: robotsOk ? robots.text.slice(0, 40_000) : '' },
    llmsTxt: { present: llms.ok && llms.text.trim().length > 0 && !/<html/i.test(llms.text.slice(0, 500)) },
    sitemap: { present: sitemap.ok && /<(urlset|sitemapindex)/i.test(sitemap.text.slice(0, 2_000)) },
    botAccess: robotsOk ? evaluateRobots(robots.text, u.pathname || '/') : AI_BOTS.map((bot) => ({ bot, access: 'allowed', rule: '(no robots.txt)' })),
    xRobotsTag: page.headers['x-robots-tag'] || null,
  };
}
