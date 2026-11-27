#!/usr/bin/env python3
"""Validate an extracted 16-chart atlas; snapshot is derived from user's original ZIP."""
from html.parser import HTMLParser
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

NAMES = [
    "grouped-bar", "multi-line", "combo", "waterfall", "stacked-bar",
    "sankey", "stacked-area", "treemap", "donut", "bubble-scatter",
    "heatmap", "radar", "bullet", "indexed-trend",
    "valuation-band", "financial-table"
]

class Assets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.scripts = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "script" and "src" in a: self.scripts.append(a["src"])
        if tag == "link" and a.get("rel") == "stylesheet": self.links.append(a.get("href", ""))

def verify(root):
    root = Path(root)
    assert (root / "index.html").exists(), "No gallery index.html"
    expected = [f"{i:02d}-{name}" for i, name in enumerate(NAMES,1)]
    for stem in expected:
        html = root / (stem + ".html")
        svg = root / "svg" / (stem + ".svg")
        assert html.is_file(), f"Missing independent HTML: {html}"
        assert svg.is_file(), f"Missing independent SVG: {svg}"
        tree = ET.parse(svg)
        assert tree.getroot().tag.endswith("svg") and "viewBox" in tree.getroot().attrib, svg
    for page in [root / "index.html", *(root / (stem + ".html") for stem in expected)]:
        data = page.read_text(encoding="utf-8")
        assert ("模拟" in data or "演示" in data), f"Missing synthetic-data notice: {page}"
        parser = Assets(); parser.feed(data)
        assert parser.scripts and parser.links, f"Missing JS/CSS asset: {page}"
        for link in parser.scripts + parser.links:
            assert not link.startswith(("https://", "http://", "//")), f"Remote asset in {page}"
            assert (root / link).is_file(), f"Missing asset: {link} for {page.name}"
    index = (root/"index.html").read_text(encoding="utf-8")
    for stem in expected:
        assert stem + ".html" in index, f"Missing gallery navigation link: {stem}"
    assert (root/"finance-demo.csv").exists(), "Missing financial CSV"
    print("PASS: 16 HTML detail pages + gallery, 16 standalone SVGs, offline JS/CSS, links, synthetic labels")

if __name__ == "__main__":
    verify(sys.argv[1])
