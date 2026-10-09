# Findable audit — https://excalidraw.com

*Audited live on 2026-10-09 07:03 UTC · powered by TinyFish Search, Fetch and Agent*

## Scores

| Overall | AI readability | AI access | Search visibility |
|---|---|---|---|
| **80/100 (B)** | 82 | 95 | 67 |

## What AI tools see on this page

- Raw HTML (plain crawler view): **3 words**
- TinyFish Fetch extraction (AI view): **73 words** (parity ratio 24.33)
- Title seen by AI: "Excalidraw — Collaborative whiteboarding made easy"
- h1: "Excalidraw" · structured data: *(none)*
- AI crawler access: all major AI bots allowed
- robots.txt: present · sitemap.xml: present · llms.txt: absent

<details><summary>Extraction excerpt (first 1,200 chars of what an AI reads)</summary>

```
Excalidraw
Your drawings are saved in your browser's storage.
Browser storage can be cleared unexpectedly.
Save your work to a file regularly to avoid losing it.
Open
Ctrl+O
Help
?
Live collaboration...
Sign up
Export, preferences, languages, ...
Pick a tool & Start drawing!
To move canvas, hold
Scroll wheel
or
Space
while dragging, or use the hand tool
Shapes
V
R
D
O
A
L
P
T
N
E
Upgrade
Drawing canvas
```
</details>

## Where it surfaces in search


### target query: "free online whiteboard tool" — **not in results**

| # | Result | Domain |
|---|---|---|
| 1 | Free Online Whiteboard for Real-Time Collaboration - Canva | canva.com |
| 2 | Web Whiteboard: Whiteboard for Online Collaboration | webwhiteboard.com |
| 3 | Online Whiteboard for Realtime Collaboration | Miro Lite | miro.com |
| 4 | tldraw • very good free whiteboard | tldraw.com |
| 5 | What online whiteboards do you use (ideally free)? - Reddit | reddit.com |

### page topic: "Excalidraw Whiteboard" — **position 1**

| # | Result | Domain |
|---|---|---|
| 1 | Excalidraw Whiteboard | excalidraw.com **← you** |
| 2 | Excalidraw | Online whiteboard collaboration made easy | plus.excalidraw.com |
| 3 | Online Whiteboard for Education - Excalidraw | plus.excalidraw.com |
| 4 | Unleash Your Creativity with Excalidraw: A Powerful ... - YouTube | youtube.com |
| 5 | Excalidraw App - Whiteboard - Apps on Google Play | play.google.com |

Your snippet: *"Excalidraw is a virtual collaborative whiteboard tool that lets you easily sketch diagrams that have a hand-drawn feel to them."*

### brand: "excalidraw" — **position 1**

| # | Result | Domain |
|---|---|---|
| 1 | Excalidraw Whiteboard | excalidraw.com **← you** |
| 2 | Virtual whiteboard for sketching hand-drawn like ... - GitHub | github.com |
| 3 | Excalidraw+ | app.excalidraw.com |
| 4 | Excalidraw, my favorite whiteboard / tech diagram app - YouTube | youtube.com |
| 5 | How to start drawing in Excalidraw | Online whiteboard | plus.excalidraw.com |

Your snippet: *"Excalidraw is a virtual collaborative whiteboard tool that lets you easily sketch diagrams that have a hand-drawn feel to them."*

### Live SERP cross-check (TinyFish Agent on duckduckgo.com)

A real browser search confirms **excalidraw.com is absent from the first 10 live results**.

| # | Result | Domain |
|---|---|---|
| 1 | Online Whiteboard : Free Online Whiteboard | onlinewhiteboard.org |
| 2 | Free Whiteboard Online — No Signup, Infinite Canvas | FreeWhiteboard by ... | freewhiteboard.app |
| 3 | Free Online Whiteboard | Collaborative &amp; Shared Whiteboard App | woowhiteboard.com |
| 4 | Online Whiteboard for Realtime Collaboration | Miro Lite | miro.com |
| 5 | Digital Online Whiteboard App | Microsoft Whiteboard | www.microsoft.com |
| 6 | Free Online Whiteboard Tool — Quick Whiteboard Online | quickwhiteboardonline.com |
| 7 | Online Whiteboard for Drawing, Notes, and Collaboration | Draw.Chat | draw.chat |
| 8 | Free Online Whiteboard | www.tutorialspoint.com |
| 9 | Free Online Whiteboard Tool | Collaborative Drawing Online | Creately | creately.com |

## Findings & fixes (5)


### 🔴 HIGH · AI readability — Raw HTML contains almost no content (3 words) — the page is JS-rendered

A rendering fetcher (like TinyFish Fetch) extracts ~73 words, but plain HTTP fetchers — which is what many AI assistants and crawlers still use — receive an empty shell. To those tools this page has nothing to read, quote, or rank.

**Fix:**

```
Server-side render or prerender the page (Next.js/Nuxt SSR/SSG, or a prerender service) so the main content is present in the initial HTML response.
```

### 🟠 MEDIUM · Metadata — No structured data (JSON-LD)

Schema.org markup is machine-readable ground truth. AI search features and rich results consume it directly; pages without it depend entirely on text inference.

**Fix:**

```
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"Excalidraw Whiteboard","url":"https://excalidraw.com"}</script>

Use a more specific @type (Article, Product, FAQPage, SoftwareApplication…) where it fits.
```

### 🟠 MEDIUM · Search visibility — Not in the top 5 for target query: "free online whiteboard tool"

AI search returns canva.com, webwhiteboard.com, miro.com for this query instead of excalidraw.com. Assistants answering from these results will cite competitors, not you.

**Fix:**

```
Make the page the best answer for this exact query: align h1/title with the query phrasing, answer it directly in the first paragraph, add supporting structured data, and earn a few topical links. Readability fixes above compound here — tools can only rank what they can read.
```

### 🟠 MEDIUM · Search visibility — Live duckduckgo.com SERP check: excalidraw.com absent from the first 10 results

A real browser session on a real search engine confirms the gap found by the Search API — this is what a human (or an AI with browsing) actually sees.

**Fix:**

```
Same remediation as above; re-run this audit after shipping fixes to watch the live position move.
```

### 🟡 LOW · AI access — No llms.txt

llms.txt is an emerging convention that hands AI tools a curated map of your most important content — cheap to add, and early adopters are over-represented in AI answers.

**Fix:**

```
Serve /llms.txt — a short markdown file:

# excalidraw.com
> One-line description of the site.

## Key pages
- [Page name](https://excalidraw.com): what it covers
```

---
*Generated by [Findable](https://github.com/johnnycool1000/findable). Queries audited: "free online whiteboard tool", "Excalidraw Whiteboard", "excalidraw".*