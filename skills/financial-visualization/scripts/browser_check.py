#!/usr/bin/env python3
"""Run real Chromium QA on the offline demo. Requires Playwright + installed Chromium."""
import argparse
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

VIEWPORTS = [(1440, 900), (768, 1024), (390, 844), (360, 800)]


def run(html, out_dir):
    from playwright.sync_api import sync_playwright
    html, out_dir = Path(html).resolve(), Path(out_dir).resolve()
    if not html.is_file():
        raise FileNotFoundError(html)
    out_dir.mkdir(parents=True, exist_ok=True)
    findings = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for width, height in VIEWPORTS:
                ctx = browser.new_context(viewport={"width": width, "height": height},
                                          accept_downloads=True)
                # Test true local-file/offline render; external URLs cannot be needed.
                ctx.set_offline(True)
                page = ctx.new_page()
                errors, remote = [], []
                page.on("pageerror", lambda err: errors.append(str(err)))
                page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
                page.on("request", lambda req: remote.append(req.url)
                        if req.url.startswith(("http:", "https:")) else None)
                page.goto(html.as_uri(), wait_until="load")
                page.wait_for_function("document.documentElement.dataset.ready === 'true'", timeout=10000)
                count = page.locator(".chart-stage svg").count()
                assert count == 15, f"{width}px: expected 15 SVG charts, found {count}"
                assert page.locator("#financial-table tbody tr").count() >= 10
                titles = page.locator(".chart-stage svg > title").count()
                descs = page.locator(".chart-stage svg > desc").count()
                assert titles == descs == 15, f"{width}px: SVG accessibility labels missing"
                overflow = page.evaluate(
                    "() => document.documentElement.scrollWidth - window.innerWidth")
                assert overflow <= 2, f"{width}px: document horizontal overflow {overflow}px"
                assert not errors, f"{width}px: JavaScript/console errors {errors}"
                assert not remote, f"{width}px: remote dependencies in offline example: {remote}"
                page.screenshot(path=str(out_dir / f"viewport-{width}.png"), full_page=False)
                if width == 1440:
                    page.locator("#chart-04").screenshot(path=str(out_dir / "waterfall.png"))
                    page.locator("#chart-06").screenshot(path=str(out_dir / "sankey.png"))
                    with page.expect_download() as downloaded:
                        page.locator("#chart-01 .export-svg").click()
                    download = downloaded.value
                    assert download.suggested_filename == "chart-01.svg"
                    svg_path = out_dir / download.suggested_filename
                    download.save_as(svg_path)
                    root = ET.parse(svg_path).getroot()
                    assert root.tag.endswith("svg") and "viewBox" in root.attrib
                    page.locator("#table-filter").fill("净利润")
                    assert page.locator("#financial-table tbody tr:visible").count() == 1
                    page.locator("#table-filter").fill("")
                    with page.expect_download() as csv_dl:
                        page.locator("#export-csv").click()
                    csv = csv_dl.value
                    assert csv.suggested_filename.endswith(".csv")
                    csv.save_as(out_dir / csv.suggested_filename)
                    page.emulate_media(media="print")
                    page.screenshot(path=str(out_dir / "print.png"), full_page=False)
                findings.append({"width": width, "height": height, "svg_charts": count,
                                 "overflow_px": overflow, "page_errors": errors,
                                 "remote_requests": remote, "status": "pass"})
                ctx.close()
        finally:
            browser.close()
    report = {"html": str(html), "offline": True, "viewports": findings,
              "tested": ["SVG titles/descs", "body overflow", "CSV export",
                         "SVG download/XML", "table search", "print emulation",
                         "offline local-file loading"]}
    (out_dir / "report.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("html", type=Path)
    parser.add_argument("--out", type=Path, default=Path("reports/demo"))
    args = parser.parse_args()
    try:
        result = run(args.html, args.out)
        print("PASS: Chromium offline QA", [v["width"] for v in result["viewports"]])
    except Exception as exc:
        print(f"FAIL: browser QA: {exc}", file=sys.stderr)
        raise SystemExit(1)
