# Findable audit — https://danluu.com

*Audited live on 2026-10-09 07:02 UTC · powered by TinyFish Search, Fetch and Agent*

## Scores

| Overall | AI readability | AI access | Search visibility |
|---|---|---|---|
| **82/100 (B)** | 62 | 90 | 100 |

## What AI tools see on this page

- Raw HTML (plain crawler view): **1022 words**
- TinyFish Fetch extraction (AI view): **1239 words** (parity ratio 1.21)
- Title seen by AI: *(none)*
- h1: *(missing)* · structured data: *(none)*
- AI crawler access: all major AI bots allowed
- robots.txt: absent · sitemap.xml: present · llms.txt: absent

<details><summary>Extraction excerpt (first 1,200 chars of what an AI reads)</summary>

```
- xx/xxPatreon posts
- 09/26There's no point at which turning your brain off will work
- 09/26How well do agents use test and verification techniques?
- 09/26Ed Zitron's AI prediction track record
- 08/26Bug blindness
- 08/26There's no reason for software to be slow anymore
- 08/26The benchmarkpocalypse
- 08/26How does programming language affect token efficiency and correctness?
- 07/26Bad benchmarks and evals: Senior SWE-Bench, napkin math, and winter tires
- 07/26Agentic test processes, LLM benchmarks, and other notes on agentic coding from Galapagos Island
- 10/24Steve Ballmer was an underrated CEO
- 08/24How good can you be at Codenames without knowing any words?
- 06/24A discussion of discussions on AI bias
- 05/24What the FTC got wrong in the Google antitrust investigation
- 03/24How web bloat impacts users with slow devices
- 02/24Diseconomies of scale in fraud, spam, support, and moderation
- 02/24Why it's impossible to agree on what's allowed
- 01/24Notes on Cruise's pedestrian accident
- 01/24Why do people post on [bad platform] instead of [good platform]?
- 12/23How bad are search results? Let's compare Google, Bing, Marginalia, Kagi, Mwmbl, and ChatGPT
- 09/22Futurist 
```
</details>

## Where it surfaces in search


### target query: "dan luu programming blog" — **position 1**

| # | Result | Domain |
|---|---|---|
| 1 | Dan Luu | danluu.com **← you** |
| 2 | Some programming blogs to consider reading | danluu.com **← you** |
| 3 | About danluu.com | danluu.com **← you** |
| 4 | Dan Luu (@danluu) / X | x.com |
| 5 | Programming book recommendations and anti- ... | danluu.com **← you** |

Your snippet: *"How does programming language affect token efficiency and correctness? Agentic test processes, LLM benchmarks, and other notes on agentic coding. Programming ..."*

### brand: "danluu" — **position 1**

| # | Result | Domain |
|---|---|---|
| 1 | Dan Luu | danluu.com **← you** |
| 2 | Dan Luu (@danluu) / X | x.com |
| 3 | Dan Luu (@danluu@mastodon.social) | mastodon.social |
| 4 | Can I ask a stupid question? Who is Dan Luu and why does he ... | news.ycombinator.com |
| 5 | About danluu.com | danluu.com **← you** |

Your snippet: *"Agentic test processes, LLM benchmarks, and other notes on agentic coding. A discussion of discussions on AI bias"*

### Live SERP cross-check (TinyFish Agent on duckduckgo.com)

A real browser search confirms **danluu.com appears at position 1**.

| # | Result | Domain |
|---|---|---|
| 1 | danluu.com | danluu.com |
| 2 | How I learned to program - danluu.com | danluu.com |
| 3 | Dan Luu | creating programming blog posts | Patreon | patreon.com |
| 4 | Dan Luu - alldevblogs.com | alldevblogs.com |
| 5 | Dan Luu - Blog Dice | blogdice.com |
| 6 | How do programming languages impact token efficiency and correctness ... | danluu.spicytakes.org |
| 7 | Agentic test processes, LLM benchmarks, and other notes on agentic ... | danluu.spicytakes.org |
| 8 | Dan Luu — creating programming blog posts | Patreon | patreon.com |
| 9 | Dan Luu - webworthreading.com | webworthreading.com |
| 10 | Dan Luu has a list of programming blogs you might like: https://danluu ... | news.ycombinator.com |

## Findings & fixes (9)


### 🔴 HIGH · Metadata — Missing <title>

The title is the primary label in every search result and AI citation. Without it, tools display the URL.

**Fix:**

```
<title>Primary topic — brand</title> (50–60 characters).
```

### 🟠 MEDIUM · AI readability — Page has no <h1>

The h1 is the strongest topical signal extractors and rankers read; without it, tools fall back to guessing the topic from the title tag alone.

**Fix:**

```
Add one h1 that states the page's subject, e.g. <h1>Page topic</h1>
```

### 🟠 MEDIUM · Metadata — Missing meta description

Search engines and AI tools synthesize their own summary when this is absent — usually worse than one you write, and it becomes the snippet users and assistants judge the page by.

**Fix:**

```
<meta name="description" content="One concrete sentence on what this page offers and for whom (under 160 chars).">
```

### 🟠 MEDIUM · Metadata — No structured data (JSON-LD)

Schema.org markup is machine-readable ground truth. AI search features and rich results consume it directly; pages without it depend entirely on text inference.

**Fix:**

```
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"","url":"https://danluu.com"}</script>

Use a more specific @type (Article, Product, FAQPage, SoftwareApplication…) where it fits.
```

### 🟡 LOW · AI access — No robots.txt

Not fatal (absence means "allow all"), but you lose the one file where AI-crawler policy and the sitemap are declared.

**Fix:**

```
Serve /robots.txt with at least:

User-agent: *
Allow: /
Sitemap: https://danluu.com/sitemap.xml
```

### 🟡 LOW · AI access — No llms.txt

llms.txt is an emerging convention that hands AI tools a curated map of your most important content — cheap to add, and early adopters are over-represented in AI answers.

**Fix:**

```
Serve /llms.txt — a short markdown file:

# danluu.com
> One-line description of the site.

## Key pages
- [Page name](https://danluu.com): what it covers
```

### 🟡 LOW · Metadata — Missing canonical link

Without rel=canonical, URL variants (utm params, trailing slashes) split ranking signal across duplicates.

**Fix:**

```
<link rel="canonical" href="https://danluu.com">
```

### 🟡 LOW · Metadata — No Open Graph tags

OG tags control how the page appears when shared — including in AI chat interfaces that unfurl links.

**Fix:**

```
<meta property="og:title" …>, <meta property="og:description" …>, <meta property="og:image" …>
```

### 🟡 LOW · Metadata — Missing <html lang>

Language detection affects which market/locale indexes include the page.

**Fix:**

```
<html lang="en">
```

### ℹ️ INFO · Search visibility — Live duckduckgo.com SERP check: found at position 1

The live engine agrees with the Search API view.

**Fix:**

```
No action needed — keep monitoring.
```

---
*Generated by [Findable](https://github.com/johnnycool1000/findable). Queries audited: "dan luu programming blog", "danluu".*