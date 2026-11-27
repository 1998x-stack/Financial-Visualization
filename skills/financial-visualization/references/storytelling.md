# Financial explanatory narrative (Olah-inspired, independent implementation)

The source inspiration uses a sequence of misconception → minimal diagram → localized mechanism → computation → evidence. For finance, translate it to:

```text
investor question
→ surprising numeric contrast
→ baseline chart (time / scale)
→ reveal operating driver or accounting bridge
→ table/source of truth
→ counterargument and boundary
```

## Article storyboard

| Stage | Reader question | Visual | Source challenge |
|---|---|---|---|
| 1 | Are earnings growing? | 01 grouped bars and 03 growth combo | Match FY vs FY or H1 vs H1 |
| 2 | Is growth profitable? | 02 margin line and cash conversion bar | Gross/net basis, impairment and one-offs |
| 3 | Which business drives it? | 05 stacked bars → 07 area → 08 treemap | Segment mapping, eliminations and classification |
| 4 | Why was profit different? | 04 waterfall → 06 Sankey | Exact bridge conservation and residual explanation |
| 5 | Does the business generate cash? | Cash flow comparison + table | Profit-to-CFO reconciliation, changes in working capital |
| 6 | What is the price of the claim? | 15 valuation bands + 10 peer scatter | Current as-of market data and metric basis |
| 7 | Can the reader check every claim? | 16 table with audit trail | Source page, raw units, restatements, formulas |

## Figure copy pattern

1. Headline states a specific question, not "Financial Dashboard".
2. Caption provides the numerical result, period, currency and whether reported/derived.
3. An annotation explains one meaningful causal *hypothesis*, not unsupported causation.
4. Footnote describes precision, denominators, adjustments and missing periods.
5. Source link points to the exact filing page/table or named and dated market series.
6. Reader can verify the chart by comparing a visible table; interaction is optional enhancement.

## Visual grammar

- Warm neutral background and generous whitespace are welcome, but not mandatory. Use comfortable contrast and one stable visual grammar.
- Primary actual results: strong solid stroke/solid bar. Estimates: distinct dashes or outlines plus explicit E label.
- Profit increases/decreases: direction label and numeric sign, not red/green alone.
- Keep independent SVG vector assets with readable labels at 360px; use a mobile alternative view when one 900px-wide diagram cannot work legibly.
- Avoid false precision, 3D pies, chartjunk, truncating column-chart baselines without annotation, and hidden axis changes.

## What this skill is not

Not an investment recommendation engine, nor an oracle of "latest" filings or current prices. It is a reproducible visualization workflow where financial claims are auditable and missing evidence remains missing.