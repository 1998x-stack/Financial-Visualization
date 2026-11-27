# Financial Chart Atlas · GitHub Pages

Publishing snapshot derived **directly from** `financial_charts_16_HTML_SVG.zip`.

This is the full original atlas, not `examples/demo`: 16 individually linked HTML chart pages, 16 standalone SVG exports, an overview gallery, a financial data CSV, and the actual JavaScript/CSS used by the pages.

## Provenance and optimization

The original ZIP contains standalone HTML with repeated embedded CSS and JS. For Pages we deduplicated the **identical** inline styles/scripts into locally served `styles/` and `scripts/` assets without changing the chart data or SVGs. Excluded generated browser screenshots and Python QA builders from the published website. All 16 original SVGs were preserved, and the 16 chart pages remain individually navigable.

The versioned `financial_charts_16.snapshot.tar.xz.b64` is base64 of an XZ-compressed TAR snapshot of the gallery directory. It contains only public, synthetic teaching data. The workflow checks the compressed SHA-256 before extraction:

`9a38464add29156a3211a713c8ae24a224acc851171a65238693bdede23912f0`

To inspect the site locally:

```bash
mkdir -p /tmp/financial-atlas
base64 -d site/financial_charts_16.snapshot.tar.xz.b64 | tar -xJ -C /tmp/financial-atlas
python -m http.server 8000 --directory /tmp/financial-atlas
# http://localhost:8000
```

## GitHub Pages

Push to main launches `.github/workflows/pages.yml`, verifies the 16 HTML/SVG files, tests in Chromium, uploads an artifact, and attempts Pages deployment.

Expected URL: https://1998x-stack.github.io/Financial-Visualization/

GitHub Pages must be enabled with **Settings → Pages → Build and deployment → Source: GitHub Actions**. A standard GitHub Actions GITHUB_TOKEN cannot create/enable a Pages site by itself. The workflow is prepared to publish once that repository setting is active; do not claim the site is live until a successful deploy and a public HTTP check.

## Relationship to the SKILL

`skills/financial-visualization/` and `examples/demo/` remain unchanged. The Pages site publishes the richer chart atlas from the original ZIP. All numbers are illustrative rather than issuer-reported.