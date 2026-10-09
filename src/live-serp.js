// Live SERP check via TinyFish Agent: a real browser runs the target query on
// a real search engine and reports what actually appears. This is the ground
// truth the Search API ranking is compared against — API indexes and live
// SERPs can disagree, and that disagreement is itself a finding.
import { tfAgent } from './tinyfish.js';

const SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          position: { type: 'integer' },
          title: { type: 'string' },
          domain: { type: 'string' },
        },
        required: ['position', 'title', 'domain'],
      },
    },
    target_found: { type: 'boolean' },
    target_position: { type: 'integer', nullable: true },
  },
  required: ['results', 'target_found'],
};

const ENGINES = [
  { url: 'https://duckduckgo.com', name: 'duckduckgo.com' },
  { url: 'https://www.bing.com', name: 'bing.com' },
];

export async function liveSerpCheck(key, query, targetHost) {
  const goal =
    `Search this site for "${query}". On the results page, scroll through the ENTIRE first page ` +
    `of results and record EVERY organic result — there are usually about 10; do not stop after ` +
    `the first few. Skip ads and "People also ask" boxes. For each organic result record its ` +
    `position (1, 2, 3, …), its title, and the domain of its link. ` +
    `Then check whether any recorded domain is "${targetHost}" or a subdomain of it; ` +
    `set target_found accordingly and target_position to the first matching position (or null).`;
  let last = null;
  for (const engine of ENGINES) {
    try {
      const result = await tfAgent(key, engine.url, goal, SCHEMA);
      if (result && Array.isArray(result.results)) {
        const run = { ok: true, engine: engine.name, ...result };
        if (result.results.length >= 3) return run; // solid read of the SERP
        last = run; // thin read — keep it, but try the next engine
      } else {
        last = { ok: false, engine: engine.name, error: 'Agent returned an unexpected shape', raw: result };
      }
    } catch (e) {
      last = { ok: false, engine: engine.name, error: String(e.message || e) };
    }
  }
  return last;
}
