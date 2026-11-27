"""Demo fixture consistency and HTML structural checks (no browser required)."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEMO = ROOT / "examples/demo"


class DemoTests(unittest.TestCase):
    def test_js_fixture_is_json_fixture(self):
        obj = json.loads((DEMO / "financials.json").read_text(encoding="utf-8"))
        js = (DEMO / "financials.js").read_text(encoding="utf-8").strip()
        self.assertTrue(js.startswith("window.FINANCIALS = "))
        self.assertEqual(obj, json.loads(js[len("window.FINANCIALS = "):].removesuffix(";")))

    def test_16_catalog_entries_and_source_table(self):
        html = (DEMO / "index.html").read_text(encoding="utf-8")
        self.assertEqual(15, len(re.findall(r'id="chart-\d{2}" data-title=', html)))
        self.assertIn('id="chart-16"', html)
        self.assertIn('id="financial-table"', html)
        self.assertIn('type="search"', html)
        self.assertIn("合成", html)

    def test_no_external_script_or_font(self):
        html = (DEMO / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("https://", html)
        self.assertIn('src="charts.js"', html)
        self.assertIn('src="financials.js"', html)


if __name__ == "__main__":
    unittest.main()
