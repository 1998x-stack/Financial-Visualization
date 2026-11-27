# The 16-chart financial-analysis catalog

These are **visual grammars**, not a requirement to put all 16 in every real report. Use a common time axis (actual fiscal-year or half-year labels), explicit currency/unit and a visible table for exact values. Avoid pie-chart domination and dual-axis tricks that hide scale changes.

| # | Chart / chart ID | Typical financial question | Recommended renderer | Minimum accounting checks / limits |
|---|---|---|---|---|
| 01 | Grouped bar `grouped-bar` | How did revenue, gross profit, net profit compare? | ECharts SVG `bar` | Same reporting span and unit; profitability series may need separate pane when scale differs |
| 02 | Multi-line `multi-line` | Are gross/net margins and ROE improving? | ECharts SVG `line` | Margin = numerator/denominator; ROE basis and pp movements disclosed |
| 03 | Bar+line combo `combo` | Is revenue scale growth accompanied by YoY? | ECharts SVG with two named yAxes | Right axis in %; YoY from comparable periods only |
| 04 | Waterfall `waterfall` | What drove the profit bridge? | ECharts stacked helpers or D3 SVG | Start + signed changes = end; distinguish reported and simplifying aggregates |
| 05 | Stacked bar `stacked-bar` | Which segments produce revenue? | ECharts SVG `bar` + `stack` | Segment sum vs consolidated, intersegment elimination visible |
| 06 | Sankey `sankey` | How are earnings or reported resources allocated? | D3 `d3-sankey` / ECharts `sankey` | Every node conserves flow; no double count of gross/net; revenue is **not cash** |
| 07 | Stacked area `stacked-area` | How did the business mix evolve? | ECharts SVG `line` + `stack` + areaStyle | Check segment taxonomy changes and periods |
| 08 | Treemap `treemap` | What share does each business represent? | ECharts SVG `treemap` | Same denominator, all values nonnegative, "other" defined |
| 09 | Donut `donut` | What does the current mix look like? | ECharts SVG `pie` + radius | One period; precise percentages in adjacent table; avoid too many slices |
| 10 | Bubble scatter `bubble-scatter` | How do peers compare by growth, ROE and size? | ECharts SVG `scatter` / Plotly | All peers share metric definition, timestamp, reporting period and consistent size encoding |
| 11 | Heatmap `heatmap` | Where did YoY growth accelerate or collapse? | ECharts SVG `heatmap` / Observable Plot | Missing is not 0; choose diverging color range; show numeric labels |
| 12 | Radar `radar` | How does a multi-factor quality profile compare? | ECharts SVG `radar` | Normalize all axes and publish formula; do not treat polygon area as scientific score |
| 13 | Bullet `bullet` | Did actual performance beat guidance/plan? | Native SVG or ECharts custom | Identify target source/date, ranges & units; distinguish guidance from analyst consensus |
| 14 | Indexed trend `indexed-trend` | Which metric grew fastest since base period? | ECharts SVG `line` | Base period = 100; nonzero denominator; index does not show absolute size |
| 15 | Price/valuation band `valuation-band` | Is PE/PB near its historical range? | ECharts custom/line + markArea; D3 | Dated price & multiple, corporate-action adjustment, `TTM` basis, lookback and percentile; separate units |
| 16 | Financial table `financial-table` | What are the exact values behind the charts? | Native `<table>` / Tabulator | Every number has period, unit, source, sign, rounding/NaN policy; keyboard sortable |

## Required field conventions

- `revenue`, `gross_profit`, `net_profit`, `cost_of_revenue`, `operating_cash_flow` should use the same scale/unit within a dataset (e.g. CNY 100 million).
- `gross_margin` and `net_margin` are **calculated**, not independent fact if computed from the stored numerator/denominator.
- Difference of margins is **percentage points**, e.g. 25% → 28% is +3 pp, not "+3%".
- For Q4 from cumulative FY minus nine-month YTD, explicitly label **derived quarter**, not directly reported quarter.
- A bubble point or radar input without reproducible comparison methodology should be omitted from real-company analysis.
- Unsupported graph requirements: require separate source retrieval or explain why the chart cannot be built reliably.

## Suggested article order

Question → KPI summary → 01/03 growth → 02 margins → 05/07 segment drivers → 04/06 profit decomposition → operating cash flow and debt → 15 valuation (only sourced) → 16 table + source locator.

One chart should answer one question; multiple small charts can be better than a dense composite.