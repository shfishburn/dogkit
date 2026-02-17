#!/usr/bin/env python3
"""Extract per-ingredient median macro + key micro nutrients.

Input schema (from `specs/kyokon-synthetic-ingredients.json`):
- Top-level object with `ingredients: [...]`
- Each ingredient has `nutrients: [{nutrientId, name, unit, median, ...}, ...]`

This script outputs one row per ingredient with a single median value per selected nutrient.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path
from typing import Any, Iterable


# Nutrient IDs match USDA/FDC conventions used in the source export.
# Keys include units in the name to avoid ambiguity.
DEFAULT_NUTRIENTS: dict[str, tuple[str, str]] = {
    # Macros
    "energy_kcal": ("1008", "kcal"),
    "protein_g": ("1003", "g"),
    "fat_g": ("1004", "g"),
    "carb_g": ("1005", "g"),
    "fiber_g": ("1079", "g"),
    "sugars_g": ("2000", "g"),
    "water_g": ("1051", "g"),
    "ash_g": ("1007", "g"),

    # Minerals (key micros)
    "calcium_mg": ("1087", "mg"),
    "phosphorus_mg": ("1091", "mg"),
    "potassium_mg": ("1092", "mg"),
    "sodium_mg": ("1093", "mg"),
    "magnesium_mg": ("1090", "mg"),
    "iron_mg": ("1089", "mg"),
    "zinc_mg": ("1095", "mg"),
    "copper_mg": ("1098", "mg"),
    "manganese_mg": ("1101", "mg"),
    "iodine_ug": ("1100", "µg"),
    "selenium_ug": ("1103", "µg"),

    # Vitamins / related (key micros)
    "vitamin_a_rae_ug": ("1106", "µg"),
    "vitamin_d_ug": ("1114", "µg"),
    "vitamin_e_mg": ("1109", "mg"),
    "vitamin_k_ug": ("1185", "µg"),
    "vitamin_c_mg": ("1162", "mg"),
    "thiamin_b1_mg": ("1165", "mg"),
    "riboflavin_b2_mg": ("1166", "mg"),
    "niacin_b3_mg": ("1167", "mg"),
    "pantothenic_b5_mg": ("1170", "mg"),
    "vitamin_b6_mg": ("1175", "mg"),
    "folate_total_ug": ("1177", "µg"),
    "vitamin_b12_ug": ("1178", "µg"),
    "choline_mg": ("1180", "mg"),
}


META_FIELDS: tuple[str, ...] = (
    "canonicalId",
    "ingredientName",
    "ingredientSlug",
    "syntheticFdcId",
    "frequency",
    "fdcCount",
    "canonicalRank",
)


def _nutrient_index(nutrients: Iterable[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    for n in nutrients:
        nutrient_id = n.get("nutrientId")
        if nutrient_id is None:
            continue
        out[str(nutrient_id)] = n
    return out


def _extract_median(n: dict[str, Any] | None, expected_unit: str) -> float | int | None:
    if not n:
        return None
    median = n.get("median")
    if median is None:
        return None

    # If the unit differs from what we expect, we still return the value as-is.
    # This keeps the script dependency-free and avoids silent conversions.
    return median


def _iter_rows(data: dict[str, Any], only_present: bool) -> Iterable[dict[str, Any]]:
    for ing in data.get("ingredients", []):
        nutrients_by_id = _nutrient_index(ing.get("nutrients", []))

        row: dict[str, Any] = {k: ing.get(k) for k in META_FIELDS}
        for out_key, (nutrient_id, expected_unit) in DEFAULT_NUTRIENTS.items():
            value = _extract_median(nutrients_by_id.get(nutrient_id), expected_unit)
            if only_present and value is None:
                continue
            row[out_key] = value
        yield row


def _write_jsonl(rows: Iterable[dict[str, Any]], fp: Any) -> None:
    for row in rows:
        fp.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")))
        fp.write("\n")


def _write_json(rows: Iterable[dict[str, Any]], fp: Any) -> None:
    json.dump(list(rows), fp, ensure_ascii=False, indent=2)
    fp.write("\n")


def _write_csv(rows: Iterable[dict[str, Any]], fp: Any) -> None:
    rows_list = list(rows)
    if not rows_list:
        return

    # Stable column ordering: meta first, then nutrient keys.
    fieldnames = list(META_FIELDS) + [k for k in DEFAULT_NUTRIENTS.keys() if k in rows_list[0]]
    # If only_present is used, some nutrient columns may be absent; include all seen keys.
    seen = set(fieldnames)
    for r in rows_list:
        for k in r.keys():
            if k not in seen:
                fieldnames.append(k)
                seen.add(k)

    writer = csv.DictWriter(fp, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows_list:
        writer.writerow(row)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Extract per-ingredient median macros and key micronutrients from the Kyokon synthetic ingredient export.",
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("specs/kyokon-synthetic-ingredients.json"),
        help="Path to the exported ingredient JSON.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output file path (defaults to stdout).",
    )
    parser.add_argument(
        "--format",
        choices=("jsonl", "json", "csv"),
        default="jsonl",
        help="Output format.",
    )
    parser.add_argument(
        "--only-present",
        action="store_true",
        help="Omit nutrient keys that are missing for a given ingredient.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Process only the first N ingredients (useful for quick sanity checks).",
    )

    args = parser.parse_args(argv)

    with args.input.open("r", encoding="utf-8") as f:
        data = json.load(f)

    rows_iter: Iterable[dict[str, Any]] = _iter_rows(data, only_present=args.only_present)
    if args.limit is not None:
        rows_iter = (row for i, row in enumerate(rows_iter) if i < args.limit)

    if args.output is None:
        out_fp = sys.stdout
        close_when_done = False
    else:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        out_fp = args.output.open("w", encoding="utf-8", newline="")
        close_when_done = True

    try:
        if args.format == "jsonl":
            _write_jsonl(rows_iter, out_fp)
        elif args.format == "json":
            _write_json(rows_iter, out_fp)
        else:
            _write_csv(rows_iter, out_fp)
    finally:
        if close_when_done:
            out_fp.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
