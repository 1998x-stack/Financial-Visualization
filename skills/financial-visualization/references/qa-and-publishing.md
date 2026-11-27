# QA, traceability and publishing gates

## Numerical gate

- `python skills/financial-visualization/scripts/validate_financials.py path/to/financials.json` must return exit code 0 before chart publication.
- Check all identities **only when exhaustively applicable**. For financial data with different tax, loss, minority-interest or business-combination definitions, don't force a bridge.
- Manually verify 3 randomly selected values against the original filing page, plus every unusually large ratio/negative value.
- Never infer data from the plotted pixel coordinate or screenshots.

## Browser gate

Run `browser_check.py` after installing Playwright and Chromium. Minimum viewports: 1440×900, 768×1024, 390×844, 360×800. Inspect page error/console errors, body overflow, SVG size/title, source table and nav, keyboard focus, tooltip hover and export/download. Include print-emulation and offline/no-network test. Capture screenshots and `report.json`. If Playwright or Chromium are missing, say **browser not verified**.

## SVG gate

- XML parses; `xmlns`, `viewBox`, `title` and `desc` present; no remote refs/scripts/foreign objects;
- standalone exported SVG matches inline figure geometry/typography;
- labels remain legible (not a 9px forest); finite coordinates and all plot axes labeled;
- live interaction must not be the only way to discover the exact value.

## Repository gate

1. Keep demo synthetic and clearly labeled (including in article).
2. Use a topic branch and PR for review; check existing project instructions and CI.
3. Avoid committing `node_modules/`, images from disclosures without permission, caches, screenshot artifacts or credentials.
4. Test the diff, run GitHub Actions and verify PR results; do not claim checks green until inspected.
5. Publish GitHub Pages only if configured, and verify the deployed page URL separately.
6. Final response should link SKILL, demo, validator, tests and PR; disclose any unrun tests.

## Failure handling

A blank plot, non-reconciling waterfall, misleading double axis, missing source, unverifiable valuation as-of date or inaccessible table is a release blocker. Fix the problem or honestly document it; never relax the assertion merely to turn CI green.