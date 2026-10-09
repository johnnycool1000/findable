# Findable 🔎

**Can AI search and fetch tools actually read your page — and does that show up in where you rank?**

AI assistants are becoming the front door to the web. They *fetch* pages to read them and *search* to decide which pages to cite. If an AI tool can't read your page (JS-only content, blocked crawlers, missing metadata), you silently disappear from AI answers — and increasingly from search itself.

Findable audits any live URL from both sides of that pipeline and tells you exactly what to fix, with copy-paste snippets.

```
findable https://yoursite.com/pricing --query "best invoicing software"
```

```
  Findable audit — https://stripe.com/payments
  Overall 89/100 (B) · AI readability 80 · AI access 88 · Search visibility 100

  #1  target query: "online payment processing platform"
  #1  page topic: "Stripe Payments"
  #1  brand: "stripe"
  live duckduckgo.com: not in top 10

  🟠 [AI access] No sitemap.xml found
  🟠 [AI readability] AI extraction captures only ~35% of the page's text
  🟠 [Metadata] No structured data (JSON-LD)
```

Every audit also writes a full **Markdown + HTML report** with ranked findings, severity, the *why it costs you AI visibility*, and the exact fix. See real reports in [`examples/`](examples/).

## How it works — three TinyFish endpoints, three perspectives

Findable is built on [TinyFish](https://www.tinyfish.ai), and each endpoint answers a different question about the same live page:

| Step | TinyFish endpoint | Question it answers |
|---|---|---|
| 1 | **Fetch** (`api.fetch.tinyfish.ai`) | *What does an AI tool actually extract from this page?* — title, description, and the rendered text an assistant reads (ttl=0, always the live page) |
| 2 | *(local HTTP GET)* | *What does a plain, non-rendering crawler get?* — raw HTML, robots.txt, llms.txt, sitemap.xml, X-Robots-Tag |
| 3 | **Search** (`api.search.tinyfish.ai`) | *Where does this page surface for its target query, its topic, and its own brand — and who wins instead?* |
| 4 | **Agent** (`agent.tinyfish.ai`) | *What does a real browser on a real search engine see right now?* — a live SERP run on DuckDuckGo/Bing, cross-checking the API view against ground truth |

The interesting findings come from the *differences* between these views:

- **Fetch ≫ raw HTML** → your content only exists after JavaScript runs. Rendering fetchers see it; the many plain-HTTP AI fetchers see an empty shell.
- **Raw HTML ≫ Fetch** → your markup buries the content; extraction loses headings and sections, so they can never be cited.
- **Search API says #1, live SERP says absent** → ranking data and the page humans/AI-browsers actually see disagree; listicles or ads own the real estate.
- **robots.txt blocks GPTBot/ClaudeBot/PerplexityBot** → you're invisible to those assistants no matter how good the page is.

That last column is the core idea: **readability and visibility are the same problem**. Tools can only rank what they can read, and the report ties every readability gap to its visibility cost.

## Quickstart

```bash
git clone https://github.com/johnnycool1000/findable.git
cd findable
npm install

# .env in the project root:
# TINYFISH_API_KEY=sk-tinyfish-...        ← get one free at agent.tinyfish.ai/api-keys
echo "TINYFISH_API_KEY=sk-tinyfish-..." > .env

node src/cli.js https://example.com --query "your target search query"
```

### Usage

```
findable <url> [options]

  --query, -q   Target search query you want the page to win (recommended).
                Without it, Findable derives queries from the page's title/h1.
  --no-agent    Skip the live-SERP Agent check (Search + Fetch only; these are
                free-tier TinyFish calls).
  --json        Machine-readable output on stdout.
  --out, -o     Report directory (default: ./reports)
```

Each run audits the **live** page (Fetch is called with `ttl: 0` — no caches) and writes `reports/<host>-<date>.md` and `.html`.

## What gets checked

- **AI access** — robots.txt rules for 16 AI crawlers (GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, CCBot, Bytespider, Amazonbot, meta-externalagent, …), X-Robots-Tag, meta robots, sitemap.xml, llms.txt
- **AI readability** — raw-vs-extracted content parity, headings lost in extraction, JS-only content detection, h1 structure, content-to-boilerplate signal
- **Metadata** — title/description quality, canonical, Open Graph, `<html lang>`, JSON-LD structured data (presence *and* validity)
- **Search visibility** — position for target query / page topic / brand, who owns the top results instead, snippet quality
- **Live SERP cross-check** — TinyFish Agent drives a real browser on a real engine and reports the organic top 10 as it exists right now

Scores: **AI readability**, **AI access**, **Search visibility**, rolled into an overall grade. Findings are sorted by severity, and every one ships with a concrete fix (the actual meta tag, robots.txt stanza, or llms.txt skeleton to paste).

## Example reports

Generated live by this tool (see [`examples/`](examples/)):

| Page | Why it's interesting |
|---|---|
| `stripe.com/payments` | Polished SaaS: wins every search query, yet extraction captures only ~35% of the page and there's no JSON-LD |
| `danluu.com` | Legendary minimal blog: near-perfect content parity, near-zero metadata |
| `excalidraw.com` | Client-rendered SPA: what AI tools see vs. what the raw HTML contains |
| `anoptimtomorrow.com/board-room` | A small product page: the long-tail case most site owners are actually in |

## Notes

- **No key, no secrets in the repo.** The API key lives in `.env` (gitignored). Reports contain only public web data.
- Search and Fetch run on TinyFish's free daily tier; the Agent SERP check uses wallet credits (skip it with `--no-agent`).
- Built for **TinyFish Student Bounty Drop 001 — SEO Page Auditor** by John Featherstone, pair-programmed with Claude (AI-assisted build, disclosed per fair-play rules).

## License

MIT
