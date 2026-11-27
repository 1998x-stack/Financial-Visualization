#!/usr/bin/env python3
"""Real Chromium smoke test of the uploaded financial-chart atlas."""
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright

STEMS = [
    "grouped-bar", "multi-line", "combo", "waterfall", "stacked-bar",
    "sankey", "stacked-area", "treemap", "donut", "bubble-scatter",
    "heatmap", "radar", "bullet", "indexed-trend",
    "valuation-band", "financial-table"
]

def main(root):
    root = Path(root).resolve()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for w, h in [(1440, 900), (390, 844)]:
                ctx = browser.new_context(viewport={"width": w, "height": h}, accept_downloads=True)
                ctx.set_offline(True)
                page = ctx.new_page()
                errors = []
                page.on("pageerror", lambda e: errors.append(str(e)))
                page.goto((root/"index.html").as_uri())
                page.wait_for_selector("#chart-16 svg", timeout=15000)
                assert page.locator(".chart-card").count() == 16
                assert page.locator(".chart-slot svg").count() == 16
                assert not errors, f"{w}px: script errors: {errors}"
                assert page.locator("text=模拟数据").count() > 0
                if w == 1440:
                    with page.expect_download() as d:
                        page.locator('[data-export="4"]').first.click()
                    assert d.value.suggested_filename.lower().endswith(".svg")
                    for i, stem in enumerate(STEMS, 1):
                        page.goto((root/f"{i:02d}-{stem}.html").as_uri())
                        page.wait_for_selector(".chart-slot svg", timeout=15000)
                        assert page.locator(".chart-slot svg").count() == 1, stem
                    page.locator("#search-fin").fill("净利润")
                    assert page.locator("#fin-table tbody tr:visible").count() == 1
                    page.locator("#search-fin").fill("")
                    with page.expect_download() as csv:
                        page.locator("#csv-fin").click()
                    assert csv.value.suggested_filename.endswith(".csv")
                print(f"PASS: {w}x{h} offline gallery, 16 SVGs, JS errors: {len(errors)}")
                ctx.close()
        finally:
            browser.close()

if __name__=="__main__":
    main(sys.argv[1])
