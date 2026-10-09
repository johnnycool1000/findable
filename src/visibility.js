// Search visibility: where does this page/domain actually surface in
// AI-grade search results, and who owns the queries it should be winning?
import { tfSearch } from './tinyfish.js';

/** Unwrap search-engine redirect links ("/url?q=https://real.site/…") to the real URL. */
const realUrl = (u) => {
  if (!u) return '';
  try {
    const parsed = new URL(u, 'https://www.google.com');
    if (parsed.pathname === '/url') return parsed.searchParams.get('q') || parsed.searchParams.get('url') || u;
    return parsed.href;
  } catch { return u; }
};

const hostOf = (u) => { try { return new URL(realUrl(u)).host.replace(/^www\./, ''); } catch { return ''; } };

/** Build the query set: the user's target query plus derived variants. */
export function buildQueries({ userQuery, meta, h1, host }) {
  const qs = [];
  if (userQuery) qs.push({ label: 'target query', q: userQuery });
  const topic = meta.title || h1;
  if (topic) {
    // Strip brand suffixes (" | Acme", " – Acme") and trailing sentences, then
    // cap length so it reads like a query a person would actually type.
    let t = topic.split(/\s*[|–—·:]\s*/)[0].split(/\.\s/)[0].trim();
    t = t.split(/\s+/).slice(0, 8).join(' ');
    if (t && t.toLowerCase() !== (userQuery || '').toLowerCase()) qs.push({ label: 'page topic', q: t });
  }
  const brand = host.split('.')[0];
  if (brand && brand.length > 2) qs.push({ label: 'brand', q: brand });
  return qs.slice(0, 3);
}

export async function checkVisibility(key, targetUrl, queries) {
  const host = hostOf(targetUrl);
  const out = [];
  for (const { label, q } of queries) {
    try {
      const res = await tfSearch(key, q, { purpose: 'SEO visibility audit: checking where a page ranks for its target query' });
      const results = (res.results || []).map((r) => ({
        position: r.position,
        title: r.title,
        url: realUrl(r.url),
        host: hostOf(r.url),
        snippet: (r.snippet || '').slice(0, 220),
      }));
      const mine = results.find((r) => r.host === host || r.host.endsWith('.' + host));
      out.push({
        label,
        query: q,
        found: Boolean(mine),
        position: mine?.position ?? null,
        myResult: mine || null,
        topResults: results.slice(0, 5),
        totalResults: res.total_results ?? results.length,
      });
    } catch (e) {
      out.push({ label, query: q, error: String(e.message || e) });
    }
  }
  return { host, checks: out };
}
