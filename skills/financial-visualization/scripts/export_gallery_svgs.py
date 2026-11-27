#!/usr/bin/env python3
"""Export all independently readable gallery SVGs from a real Chromium page."""
import argparse
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def export(html, out):
    from playwright.sync_api import sync_playwright
    html, out = Path(html).resolve(), Path(out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            context = browser.new_context()
            context.set_offline(True)
            page = context.new_page()
            page.goto(html.as_uri(), wait_until="load")
            page.wait_for_function("document.documentElement.dataset.ready === 'true'")
            charts = page.locator(".chart-stage svg").evaluate_all("""nodes => nodes.map(
                svg => ({
                  filename: svg.closest('section').id + '.svg',
                  content: new XMLSerializer().serializeToString(svg)
                })
            )""")
            if len(charts) != 15:
                raise RuntimeError(f"expected 15 chart SVGs, got {len(charts)}")
            paths = []
            for item in charts:
                content = item["content"]
                root = ET.fromstring(content)
                if not root.tag.endswith("svg") or "viewBox" not in root.attrib:
                    raise ValueError(f"invalid standalone SVG: {item['filename']}")
                if not any(e.tag.endswith("title") for e in root.iter()):
                    raise ValueError(f"missing SVG title: {item['filename']}")
                dest = out / item["filename"]
                dest.write_text(content, encoding="utf-8")
                paths.append(str(dest))
            context.close()
            return paths
        finally:
            browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("html", type=Path)
    parser.add_argument("--out", type=Path, default=Path("reports/demo/svg"))
    args = parser.parse_args()
    try:
        paths = export(args.html, args.out)
        print(f"PASS: exported {len(paths)} independent SVG charts into {args.out}")
    except Exception as exc:
        print("FAIL: SVG export: " + str(exc), file=sys.stderr)
        raise SystemExit(1)
