#!/usr/bin/env python3
"""
BookMarklet Builder
Made By Payson (with help from llm ofc)

Convert JavaScript source into a URL-encoded bookmarklet file.

Defaults are tailored to this repository:
- input: source.js
- output: paysontyper.bookmarklet.js

Modes:
- compact (default): removes blank/full-line // comments, trims lines, joins
  them, and collapses whitespace to match a needed bookmarklet style.
- safe: preserves source formatting/comments and only URL-encodes it.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from urllib.parse import quote


PREFIX = "javascript:"


def strip_prefix(code: str) -> str:
    text = code.strip()
    if text[: len(PREFIX)].lower() == PREFIX:
        return text[len(PREFIX) :]
    return text


def compact_source(code: str) -> str:
    lines: list[str] = []
    for raw_line in strip_prefix(code).splitlines():
        line = raw_line.strip()
        if not line or line.startswith("//"):
            continue
        lines.append(line)
    joined = " ".join(lines)
    return re.sub(r"\s+", " ", joined).strip()


def safe_source(code: str) -> str:
    return strip_prefix(code)


def make_bookmarklet(js_code: str) -> str:
    return PREFIX + quote(js_code, safe="")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert a JavaScript source file into bookmarklet format."
    )
    parser.add_argument(
        "-i",
        "--input",
        default="source.js",
        help="Input file (default: source.js).",
    )
    parser.add_argument(
        "-o",
        "--output",
        default="paysontyper.bookmarklet.js",
        help="Output file (default: paysontyper.bookmarklet.js).",
    )
    parser.add_argument(
        "--mode",
        choices=("compact", "safe"),
        default="compact",
        help="Compact (default) or safe. Read header comment in script source for more information.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        print(f"Input file not found: {input_path}", file=sys.stderr)
        return 1

    source = input_path.read_text(encoding="utf-8")
    prepared = compact_source(source) if args.mode == "compact" else safe_source(source)
    bookmarklet = make_bookmarklet(prepared)
    output_path.write_text(bookmarklet, encoding="utf-8")

    print(
        f"Wrote {output_path} ({len(bookmarklet)} chars) "
        f"from {input_path} using mode={args.mode}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
