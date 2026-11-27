---
name: financial-visualization
description: Transform annual/half-year/quarterly financial disclosures and normalized financial data into audited, source-traceable, Olah-inspired explanatory HTML/SVG reports. Use for 16 common financial charts, financial statements, waterfall/Sankey reconciliations, growth, cash flow, segments, ratios, valuation, peer comparisons, and offline browser QA.
---

# Financial Visualization · Evidence-first financial stories

**Correct accounting beats polished decoration.** Adapt the progressive-explanation technique of [Olah-style-posts](https://github.com/1998x-stack/Olah-style-posts) to financial statements: ask one financial question, show only the necessary chart, reveal drivers, reconcile to a table, cite the filing. Create original graphics and prose; the source repository is an inspiration, not a code or asset dependency.

## When to use / do not use

Use when a user provides or names a company's annual, interim or quarterly financial report and asks for visual analysis, HTML/SVG charts, financial tables, earnings comparison or reusable report pages. Also use for data-first exploration with traceable figures. Do not treat estimates, online quote pages, screenshots, or unsourced memory as authoritative filings. Do not invent missing sources or missing numbers.

## Inputs and outputs

Input: primary-source PDF/filing URL or disclosed tables; issuer, exchange/ticker if relevant, exact reporting date/period, accounting standards, consolidation scope, unit/currency, user focus, optional peers/valuation as-of date, expected publication format.

Output: `index.html` with responsive semantic structure, standalone `assets/*.svg` (when figures are included), `financials.json` with evidence/normalization, a directly readable HTML data table, optional CSV and QA report. Link source document and page/table next to factual figures. Explicitly mark data as **reported**, **derived**, **estimate**, **illustrative**, or **unverified**.

## Ordered workflow: eight gates

### Gate 0 · Acquire and version the primary evidence
1. Fetch the exact issuer filing and record `source_url`, announcement date, filing date, period start/end, `FY/HY/Q/TTM`, reporting standard, consolidation, restatement and source page/table.
2. Distinguish investor presentation / earnings release from statutory statement and third-party consensus or prices. If the latest filing cannot be confirmed, say so rather than fabricate.
3. Preserve raw reported values separately from calculations; never silently mix FY with H1, standalone with consolidated, reporting currency with trading currency, or HKD with CNY.

### Gate 1 · Normalize and audit
1. Build `financials.json` following [data-contract.md](references/data-contract.md); include exact period, unit, provenance and synthetic flag.
2. Verify revenue minus cost of revenue equals gross profit **only if line-item definitions support it**; segment totals, reported net profit bridges, cash reconciliation and balance sheet identities must follow the issuer's actual definitions.
3. Compute YoY from matching period lengths, QoQ from adjacent standalone quarters, margins using positive/relevant denominators and `percentage points (pp)` for margin changes. Never interpret unverified adjustments as taxes.
4. Run `python skills/financial-visualization/scripts/validate_financials.py financials.json`; failed reconciliation is a blocker, not a warning to hide.

### Gate 2 · Plan the causal explanation
Write a question per figure: `question → evidence → business driver → accounting caveat → linked table/source`. Start with the management question (growth or quality?), then show revenue, margin, driver mix, profit bridge, cash conversion, balance sheet, valuation (if sourced). Read [storytelling.md](references/storytelling.md).

### Gate 3 · Select from the 16-chart catalog
Use [chart-catalog.md](references/chart-catalog.md). Prefer a small purposeful selection, not 16 charts in every finished report. Good defaults: grouped revenue/gross/profit, multiline margins, dual-axis revenue & YoY, segment stacked bars, profit waterfall, cash-flow comparison and source table. Make every axis, period, denominator and currency explicit. Verify Sankey flow conservation before drawing; do not imply revenues are cash flows.

### Gate 4 · Choose renderer and build accessible HTML
Read [rendering-stack.md](references/rendering-stack.md):
- Offline/self-contained: native HTML + SVG; the bundled demo uses this approach, **not ECharts or D3**.
- Standard chart production: Apache ECharts with `renderer: 'svg'`, locally bundled and version-pinned; use Canvas only for justified large data.
- Custom financial flows/story diagrams: D3 + d3-sankey or hand-authored SVG with auditable coordinates.
- React only when app integration is needed (Recharts/ECharts wrapper); Playwright is a **QA tool**, not a chart engine.
- Use `<main><article>`, one H1, figure/title/desc/figcaption, a source table, keyboard controls, clear focus and responsive CSS. Use `viewBox`, stable element IDs and standalone SVG without linked CSS/fonts/images.

### Gate 5 · Implement real data interactions and exports
Hover/focus surfaces show exact values and source references; legends meaningfully toggle series if they are controls. Add period / metric controls only when they recompute data. Provide source view and CSV/raw table. For SVG export, inline computed styles and avoid `<foreignObject>`, remote assets and unresolved CSS variables. Ensure exported SVG opens alone. For PDF, prefer Chromium `page.pdf()` and print CSS; verify fonts and breaks.

### Gate 6 · Verify with calculations and browser
Run source reconciliation, unit tests, and actual Chromium QA at 1440, 768, 390, 360 px, print mode and network-disabled mode. Compare standalone SVG with in-browser rendering. Test at least one live hover/keyboard or export and CSV/table interaction. Inspect layout, labels, axes, negative data, zero denominators, typography, contrast and overprinting. Report not-run items as **not verified**, never as passed. See [qa-and-publishing.md](references/qa-and-publishing.md).

### Gate 7 · Deliver reproducibly, publish only verified artifacts
Deliver HTML, standalone SVG, normalized JSON, sources/locators, table/CSV, scripts and QA logs. Prefer topic branch + PR, check CI and repo contents, and only then report merged status. GitHub Pages deployment requires a separate verified publishing action.

## Invariants that must never be compromised

- No manufactured filings, citations, market quotes, peer metrics, accounting reconciliations, browser results or "latest" labels.
- No tax or profit-flow classifications inferred from convenience; `other_net_expense` is a simplified **net bucket**, never automatically "income tax".
- Financial source tables take precedence over visual annotations when rounding; tolerance and rounding rule must be written.
- A chart with percentage changes in **pp** must not be labeled `%`; a PE multiple must not share an unlabeled axis with a price.
- Forecasts (`E`) and third-party consensus need source, as-of date and obvious visual differentiation; never graph past estimates as actuals.
- If no underlying full filing is available, create a labeled educational illustration rather than claiming a real earnings analysis.
- Do not copy source repo article text, CSS, images or code wholesale; cite the pedagogical inspiration in project documentation.

## Minimum release command

```bash
python skills/financial-visualization/scripts/validate_financials.py examples/demo/financials.json
python -m unittest discover -s tests -v
python skills/financial-visualization/scripts/browser_check.py examples/demo/index.html --out reports/demo
```

Browser check requires the optional `playwright` package and Chromium installed. Static checks alone never establish successful browser QA.

## Reference routing

| Question | Reference |
|---|---|
| Which of 16 charts / what unit and failure mode? | [chart-catalog.md](references/chart-catalog.md) |
| What JSON/evidence fields and identities? | [data-contract.md](references/data-contract.md) |
| ECharts vs D3 vs native SVG vs Python | [rendering-stack.md](references/rendering-stack.md) |
| How to structure a financial argument visually? | [storytelling.md](references/storytelling.md) |
| How to validate, capture and publish? | [qa-and-publishing.md](references/qa-and-publishing.md) |

## Example invocation

```text
Use financial-visualization on this company's 2026 interim report. Build a Chinese HTML/SVG deep dive: revenue and margins, segment mix, profit waterfall, operating cash flow and a numerical source table. For every value, keep the filing page and exact accounting unit. Run reconciliation and responsive/offline browser QA; return links to the assets and clearly distinguish reported vs calculated values.
```
