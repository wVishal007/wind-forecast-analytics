#!/usr/bin/env python3
"""Pre-compute accuracy data at build time for static serving on Vercel."""
import json
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.analysis import accuracy_by_horizon, build_series, gate_closure, metrics
from backend.app.data import ACTUALS, FORECASTS

import datetime
UTC = datetime.timezone.utc
WINDOW_START = datetime.datetime(2026, 1, 1, tzinfo=UTC)
WINDOW_END = datetime.datetime(2026, 2, 1, tzinfo=UTC)


def main():
    # Day-ahead accuracy (gate closure cutoff)
    day_ahead_rows = build_series(ACTUALS, FORECASTS, WINDOW_START, WINDOW_END, gate_closure)
    day_ahead_metrics = metrics(day_ahead_rows)

    # By horizon (0-48h)
    by_horizon = accuracy_by_horizon(ACTUALS, FORECASTS, WINDOW_START, WINDOW_END)

    output = {
        "dayAhead": day_ahead_metrics,
        "byHorizon": by_horizon,
    }

    out_path = Path(__file__).resolve().parent.parent / "frontend" / "public" / "accuracy.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output))
    n_val = day_ahead_metrics.get("n") if day_ahead_metrics else 0
    print(f"Pre-computed accuracy written to {out_path}")
    print(f"  Day-ahead: n={n_val}")
    print(f"  By horizon: {len(by_horizon)} entries")

if __name__ == "__main__":
    main()
