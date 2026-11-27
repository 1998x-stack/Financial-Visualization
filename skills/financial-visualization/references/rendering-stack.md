# HTML/SVG rendering architecture and packages

## Selection matrix

| Use case | Tool(s) | Rationale |
|---|---|---|
| Standard time-series, bars, combo, heatmaps, treemap, radar | `echarts` SVG renderer | Wide financial chart coverage; interactive legend/tooltip |
| Highly tailored profit bridge, diagram and flow | `d3`, `d3-sankey`, native SVG | Total control over labels, flows, accessibility and business semantics |
| Lightweight statistical small multiples | `@observablehq/plot`, `vega-lite` | Declarative analytics |
| Python-first output | `pyecharts`, `plotly`, `altair` | Easy integration with pandas pipelines |
| React dashboards | `recharts` or ECharts wrapper | Use only when React application already exists |
| Source financial statement | semantic HTML `table`; optionally `tabulator-tables` / `ag-grid-community` | Human and machine readable exact data |
| QA and print | `playwright` Chromium | Automated screenshots, console checks, responsive QA, PDF |

Use local bundled, version-pinned scripts for production; no CDN for offline HTML. The self-contained demo implements **native SVG**, so it can be opened without npm; this is a compatible fallback, not a claim that the demos run ECharts/D3.

## Example: production ECharts with SVG renderer

```js
import * as echarts from "echarts";
const chart = echarts.init(document.querySelector("#revenue-chart"), null, {
  renderer: "svg"
});
chart.setOption({
  tooltip: { trigger: "axis" },
  legend: {},
  xAxis: { type: "category", data: ["2024", "2025"], name: "FY" },
  yAxis: { type: "value", name: "CNY 100m" },
  series: [
    { name: "Revenue", type: "bar", data: [88, 104] },
    { name: "Net profit", type: "line", data: [15, 20] }
  ]
});
new ResizeObserver(() => chart.resize()).observe(chart.getDom());
```

Install a pinned version in your own lockfile: `npm install --save-exact echarts`. Use `npm ci` in CI. Chart data must come from validated JSON, not inline demo constants.

## Example: Sankey with D3

```js
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
const layout = sankey().nodeWidth(16).nodePadding(12).extent([[20,20],[840,400]]);
const graph = layout({
  nodes: nodes.map(d => ({...d})),
  links: links.map(d => ({...d}))
});
// Render SVG nodes/paths using d3-selection, sanitize labels.
// Verify all links conserve quantities at each non-source/sink node first.
// sankeyLinkHorizontal() describes the link shape but does not establish accounting truth.
```

## Offline and export rules

1. Local `index.html` must remain readable with JS disabled: show headings, captions, key table and fallback figure/labels.
2. Source data and source URLs stay in JSON; charts are a view, not a source of truth.
3. Give every standalone SVG `xmlns`, `viewBox`, `<title>`, `<desc>`, unique IDs. Inline or materialize font/style attributes before exporting; validate XML and manually open exported file.
4. SVG is usually superior for modest datasets and print; Canvas can be better for many thousands of marks. WebGL is rarely needed for ordinary earnings charts.
5. Chart `getDataURL({type:'svg'})` depends on renderer and library; test the actual output. A screen-capture PNG is not SVG.
6. Use `page.pdf({printBackground:true})` after loading local assets and applying print CSS. Do not equate HTML screenshot pass with clean vector PDF.
7. Theme colors carry stable financial semantics (actual, estimate, positive, negative), but never encode sign/period **only** by color.

## Security and licensing

Sanitize textual labels and file paths; never inject untrusted PDF text through `innerHTML` without escaping. Restrict external network, do not load remote fonts, and respect chart-library licenses and any vendor terms (especially commercial charting libraries). No copy-pasting of CSS, graphics or code from Olah-style-posts without checked rights.