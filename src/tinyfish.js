// Thin clients for the three TinyFish endpoints used by Findable:
//   Search — https://api.search.tinyfish.ai        (GET, ranked web results)
//   Fetch  — https://api.fetch.tinyfish.ai         (POST, AI-grade content extraction)
//   Agent  — https://agent.tinyfish.ai/v1/automation/run (POST, goal-based browsing)

const SEARCH_URL = 'https://api.search.tinyfish.ai';
const FETCH_URL = 'https://api.fetch.tinyfish.ai';
const AGENT_URL = 'https://agent.tinyfish.ai/v1/automation/run';

function headers(key, json = false) {
  const h = { 'X-API-Key': key };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

async function httpJson(url, opts, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    const body = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
    return JSON.parse(body);
  } finally {
    clearTimeout(t);
  }
}

/** TinyFish Search: ranked results for a query. */
export async function tfSearch(key, query, { purpose } = {}) {
  const u = new URL(SEARCH_URL);
  u.searchParams.set('query', query);
  if (purpose) u.searchParams.set('purpose', purpose);
  return httpJson(u, { headers: headers(key) }, 45_000);
}

/** TinyFish Fetch: what an AI tool extracts from live URLs. ttl 0 forces a fresh read. */
export async function tfFetch(key, urls, { format = 'markdown', purpose } = {}) {
  return httpJson(
    FETCH_URL,
    {
      method: 'POST',
      headers: headers(key, true),
      body: JSON.stringify({
        urls,
        format,
        ttl: 0,
        include_etag_and_last_modified: true,
        ...(purpose ? { purpose } : {}),
      }),
    },
    90_000,
  );
}

/** TinyFish Agent: run a browsing goal on a live site, returns structured result. */
export async function tfAgent(key, url, goal, outputSchema) {
  const body = { url, goal };
  if (outputSchema) body.output_schema = outputSchema;
  const data = await httpJson(
    AGENT_URL,
    { method: 'POST', headers: headers(key, true), body: JSON.stringify(body) },
    300_000,
  );
  // Sync endpoint returns the final run document; normalize a few shapes.
  const result = data.result ?? data.resultJson ?? data.result_json ?? data;
  if (typeof result === 'string') {
    try { return JSON.parse(result); } catch { return { raw: result }; }
  }
  return result;
}
