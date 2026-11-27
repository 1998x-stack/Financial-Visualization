#!/usr/bin/env python3
"""Validate a normalized financial series dataset; no external dependencies."""
import argparse
import json
import math
import sys
from decimal import Decimal, InvalidOperation
from pathlib import Path

REQUIRED = {"revenue", "cost_of_revenue", "gross_profit", "net_profit"}
PERIOD_TYPES = {"FY", "HY", "Q", "TTM"}
STATUSES = {"verified", "derived", "estimate", "illustrative", "unverified"}


def value_decimal(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError("expected a finite JSON number")
    if not math.isfinite(value):
        raise ValueError("nonfinite numbers are not allowed")
    try:
        return Decimal(str(value))
    except InvalidOperation as exc:
        raise ValueError("unparseable numeric value") from exc


def yoy_percent(current, previous):
    a, b = value_decimal(current), value_decimal(previous)
    if b <= 0:
        raise ValueError("YoY growth is N/M when previous is nonpositive")
    return float((a / b - Decimal(1)) * Decimal(100))


def margin_percent(numerator, denominator):
    a, b = value_decimal(numerator), value_decimal(denominator)
    if b <= 0:
        raise ValueError("margin requires a positive denominator")
    return float(a / b * Decimal(100))


def validate(data, tolerance=Decimal("0.02")):
    """Return a list of actionable errors; zero errors means structurally valid."""
    errors = []
    if not isinstance(data, dict):
        return ["root must be a JSON object"]
    meta, periods, series = data.get("meta"), data.get("periods"), data.get("series")
    if not isinstance(meta, dict):
        errors.append("meta must be an object")
        meta = {}
    for field in ("issuer", "currency", "unit", "period_type", "accounting_standard", "consolidation"):
        if not isinstance(meta.get(field), str) or not meta[field].strip():
            errors.append("meta." + field + " must be a nonempty string")
    if meta.get("period_type") not in PERIOD_TYPES:
        errors.append("meta.period_type must be one of FY/HY/Q/TTM")
    if type(meta.get("is_synthetic")) is not bool:
        errors.append("meta.is_synthetic must be boolean")
    if not isinstance(periods, list) or not periods or any(not isinstance(x, str) or not x for x in periods):
        errors.append("periods must be a nonempty array of period labels")
        periods = []
    if len(periods) != len(set(periods)):
        errors.append("periods contains duplicates")
    if periods != sorted(periods):
        errors.append("periods must be in chronological/lexicographic order (use ISO-like labels)")
    if not isinstance(series, dict) or not series:
        errors.append("series must be a nonempty metric object")
        series = {}
    for metric in REQUIRED - series.keys():
        errors.append(f"missing required metric: {metric}")
    for metric, values in series.items():
        if not isinstance(values, list) or len(values) != len(periods):
            errors.append(f"series.{metric} must have exactly {len(periods)} values")
            continue
        for i, value in enumerate(values):
            if value is None:
                continue
            try:
                value_decimal(value)
            except ValueError as exc:
                errors.append(f"series.{metric}[{i}]: {exc}")
    if tolerance < 0:
        errors.append("tolerance must be nonnegative")

    def get(metric, i):
        seq = series.get(metric)
        if not isinstance(seq, list) or i >= len(seq) or seq[i] is None:
            return None
        try:
            return value_decimal(seq[i])
        except ValueError:
            return None

    for i, period in enumerate(periods):
        r, c, g = (get(name, i) for name in ("revenue", "cost_of_revenue", "gross_profit"))
        if None not in (r, c, g) and abs(r - c - g) > tolerance:
            errors.append(f"{period}: revenue - cost_of_revenue != gross_profit")
    for key in ("segments", "cost_bridge"):
        names = data.get(key, [])
        if not isinstance(names, list) or any(not isinstance(x, str) for x in names):
            errors.append(f"{key} must be an array of metric names")
            continue
        if len(names) != len(set(names)):
            errors.append(f"{key}: duplicate metric")
        for name in names:
            if name not in series:
                errors.append(f"{key}: unknown metric '{name}'")
        if not names or any(n not in series for n in names):
            continue
        for i, period in enumerate(periods):
            items = [get(n, i) for n in names]
            target = get("revenue" if key == "segments" else "net_profit", i)
            revenue = get("revenue", i)
            if target is None or any(x is None for x in items):
                continue
            actual = sum(items)
            if key == "segments":
                if abs(actual - target) > tolerance:
                    errors.append(f"{period}: segment sum {actual} != revenue {target}")
            elif revenue is not None and abs(revenue - actual - target) > tolerance:
                errors.append(f"{period}: profit bridge revenue {revenue} - costs {actual} != net profit {target}")
    evidence = data.get("evidence", [])
    if not isinstance(evidence, list):
        errors.append("evidence must be an array")
        evidence = []
    indexed = {}
    for item in evidence:
        if not isinstance(item, dict):
            errors.append("evidence entries must be objects")
            continue
        metric, period, status = item.get("metric"), item.get("period"), item.get("status")
        if metric not in series or period not in periods:
            errors.append(f"unknown evidence metric/period: {metric}/{period}")
            continue
        if status not in STATUSES:
            errors.append(f"invalid evidence status: {metric}/{period}")
        key = (metric, period)
        if key in indexed:
            errors.append(f"duplicate evidence: {metric}/{period}")
        indexed[key] = item
        if status in {"verified", "estimate"}:
            if not item.get("source_url") or not item.get("locator"):
                errors.append(f"{metric}/{period}: {status} needs source_url and locator")
            if status == "estimate" and not item.get("as_of"):
                errors.append(f"{metric}/{period}: estimate needs as_of")
        if status == "derived" and not item.get("formula"):
            errors.append(f"{metric}/{period}: derived requires formula")
    if meta.get("is_synthetic") is False:
        for metric, values in series.items():
            if not isinstance(values, list):
                continue
            for period, val in zip(periods, values):
                if val is None:
                    continue
                item = indexed.get((metric, period))
                if not item:
                    errors.append(f"missing evidence: {metric}/{period}")
                elif item.get("status") in {"illustrative", "unverified"}:
                    errors.append(f"{metric}/{period}: non-verified input cannot be published as real financial data")
    return errors


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("file", type=Path)
    parser.add_argument("--tolerance", type=Decimal, default=Decimal("0.02"))
    args = parser.parse_args(argv)
    try:
        dataset = json.loads(args.file.read_text(encoding="utf-8"))
        errors = validate(dataset, args.tolerance)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        errors = [str(exc)]
    if errors:
        for e in errors:
            print("ERROR: " + e, file=sys.stderr)
        return 1
    print(f"PASS: {args.file} (structural checks and declared reconciliations)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
