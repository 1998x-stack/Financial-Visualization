"""Data contract regression tests for the synthetic financial fixture."""
import copy
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "skills/financial-visualization/scripts/validate_financials.py"
SPEC = importlib.util.spec_from_file_location("validator", SCRIPT)
validator = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)
BASE = json.loads((ROOT / "examples/demo/financials.json").read_text(encoding="utf-8"))


class FinancialDataTests(unittest.TestCase):
    def test_sample_reconciles(self):
        self.assertEqual([], validator.validate(BASE))

    def test_2025_profit_bridge(self):
        i = BASE["periods"].index("2025")
        s = BASE["series"]
        self.assertEqual(104, s["revenue"][i])
        self.assertEqual(20, s["net_profit"][i])
        self.assertEqual(104, sum(s[n][i] for n in BASE["segments"]))
        self.assertEqual(20, 104 - sum(s[n][i] for n in BASE["cost_bridge"]))

    def test_bad_gross_profit_fails(self):
        d = copy.deepcopy(BASE)
        d["series"]["gross_profit"][-1] = 53
        self.assertTrue(any("gross_profit" in e for e in validator.validate(d)))

    def test_bad_segment_sum_fails(self):
        d = copy.deepcopy(BASE)
        d["series"]["ads"][-1] = 90
        self.assertTrue(any("segment sum" in e for e in validator.validate(d)))

    def test_bad_profit_bridge_fails(self):
        d = copy.deepcopy(BASE)
        d["series"]["other_net_expense"][-1] = 1
        self.assertTrue(any("profit bridge" in e for e in validator.validate(d)))

    def test_wrong_length_fails(self):
        d = copy.deepcopy(BASE)
        d["series"]["revenue"] = [12]
        self.assertTrue(any("exactly" in e for e in validator.validate(d)))

    def test_no_evidence_when_real_fails(self):
        d = copy.deepcopy(BASE)
        d["meta"]["is_synthetic"] = False
        self.assertTrue(any("missing evidence" in e for e in validator.validate(d)))

    def test_calculation_and_zero_guard(self):
        self.assertAlmostEqual(18.181818, validator.yoy_percent(104, 88), places=5)
        self.assertAlmostEqual(51.9230769, validator.margin_percent(54, 104), places=5)
        with self.assertRaises(ValueError):
            validator.yoy_percent(10, 0)

    def test_bool_rejected(self):
        d = copy.deepcopy(BASE)
        d["series"]["net_profit"][-1] = True
        self.assertTrue(any("finite JSON number" in e for e in validator.validate(d)))


if __name__ == "__main__":
    unittest.main()
