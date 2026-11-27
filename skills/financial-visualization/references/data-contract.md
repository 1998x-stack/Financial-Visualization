# Financial data contract and evidence ledger (v1)

## Minimal normalized JSON

```json
{
  "meta": {
    "issuer": "Example Co. (synthetic)",
    "currency": "CNY",
    "unit": "CNY_100M",
    "period_type": "FY",
    "accounting_standard": "illustrative",
    "consolidation": "consolidated",
    "is_synthetic": true
  },
  "periods": ["2024", "2025"],
  "series": {
    "revenue": [88, 104],
    "cost_of_revenue": [46, 50],
    "gross_profit": [42, 54],
    "net_profit": [15, 20]
  },
  "segments": [],
  "cost_bridge": [],
  "evidence": []
}
```

Use the repository's `examples/demo/financials.json` for a fuller reconciled sample. Period arrays must be chronological and all series must match in length. `null` means unavailable; **never silently turn missing into zero**. All values inside one file follow the declared currency and unit unless explicitly represented as separate unit-specific datasets.

For real company data, each `(metric, period)` must have an `evidence` entry with `metric`, `period`, `status` and, for verified values, `source_url` plus `locator` (e.g. 'PDF p.16, Consolidated Income Statement, row Revenue'). `status` is `verified`, `derived`, `estimate`, `illustrative` or `unverified`; `derived` additionally requires an explicit `formula` and enough cited input values to reproduce it. Estimates need source and as-of date. Empty `evidence` is permitted **only** when `meta.is_synthetic=true`; those numbers must remain visibly illustrative.

## Metric semantics

```text
revenue - cost_of_revenue = gross_profit
gross_profit - sum(cost_bridge excluding cost_of_revenue) = net_profit
revenue - sum(cost_bridge including cost_of_revenue) = net_profit
sum(series[name] for name in segments) = revenue
```

The last three identities apply **only when** the supplied `cost_bridge` and `segments` arrays are present and represent an exhaustive disjoint breakdown. In real statements, include taxes, financing, associates, non-controlling interests, discontinued operations and eliminations *only according to the issuer's actual statement*. If an exhaustive bridge is impossible, omit the `cost_bridge` declaration and explain, do not invent a balancing item.

Suggested `meta` additions for real disclosures: `filing_date`, `period_start`, `period_end`, `publication_date`, `restated`, `ticker`, `source_url`, `comparison_basis`, `exchange`, `fiscal_year_end`. Maintain source-specific data where presentation and audited statement disagree, and record reconciliation decisions.

## Calculated measures

```python
yoy_percent = (this / last - 1) * 100        # only comparable spans, last != 0
gross_margin_percent = gross_profit / revenue * 100
net_margin_percent = net_profit / revenue * 100
margin_change_pp = margin_current - margin_previous
index_100 = value / base_period_value * 100  # base != 0
```

All division requires denominator checks. Explain sign and percentage growth for negative/zero base values; an economically misleading percent growth should be labeled N/M rather than a numeric rate.

## Reconciliation and rounding

- Work with original precision, use decimal-safe calculation where necessary.
- Rounding: display to chosen decimal precision, but compare using `abs(actual - expected) <= tolerance`, including source rounding information.
- The bundled validator accepts a default tolerance of **0.02 units** (override `--tolerance`), aimed at synthetic numbers. A real filing needs its own tolerance based on published precision.
- Cash flow is *not* equal to net profit; instead compare and investigate timing, working capital and noncash items.
- `price`, `PE`, `PB`, `market_cap`, consensus EPS and FX require independent dated market-data sources, calculation conventions and scope. Do not infer an as-of price from the filing.

## Evidence example

```json
{
  "metric": "revenue",
  "period": "2025",
  "status": "verified",
  "source_url": "https://issuer.example/2025-report.pdf",
  "locator": "p.42, consolidated income statement, revenue row"
}
```

The above is a **shape example**: `issuer.example` is intentionally fictitious and must never be cited as an actual source.