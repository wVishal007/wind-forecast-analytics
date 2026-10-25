"""Download January 2026 wind actuals (FUELHH) and forecasts (WINDFOR) from Elexon.

Writes backend/data/actuals.json and backend/data/forecasts.json. The API serves these
files, so this only needs to run when the data should be refreshed.
"""
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

BASE = "https://data.elexon.co.uk/bmrs/api/v1/datasets"
OUT = Path(__file__).resolve().parent.parent / "backend" / "data"
UTC = timezone.utc
TARGET_START = datetime(2026, 1, 1, tzinfo=UTC)
TARGET_END = datetime(2026, 2, 1, tzinfo=UTC)
MAX_HORIZON = timedelta(hours=48)
FMT = "%Y-%m-%dT%H:%M:%SZ"


def download(dataset, published_from, published_to, **params):
    """Stream endpoints cap the date range, so fetch in 7-day windows."""
    rows, start = [], published_from
    while start < published_to:
        end = min(start + timedelta(days=7), published_to)
        resp = requests.get(
            f"{BASE}/{dataset}/stream",
            params={"publishDateTimeFrom": start.strftime(FMT), "publishDateTimeTo": end.strftime(FMT), **params},
            timeout=120,
        )
        resp.raise_for_status()
        rows += resp.json()
        start = end
    return rows


def in_january(row):
    return TARGET_START <= datetime.fromisoformat(row["startTime"].replace("Z", "+00:00")) < TARGET_END


if __name__ == "__main__":
    raw_actuals = download("FUELHH", TARGET_START, TARGET_END + timedelta(hours=6), fuelType="WIND")
    # a settlement period can be republished; keep the latest publication
    latest = {}
    for row in sorted(raw_actuals, key=lambda r: r["publishTime"]):
        if row["fuelType"] == "WIND" and in_january(row):
            latest[row["startTime"]] = {"startTime": row["startTime"], "generation": row["generation"]}

    # forecasts for 1 Jan can be published up to 48h earlier
    raw_forecasts = download("WINDFOR", TARGET_START - MAX_HORIZON, TARGET_END)
    forecasts = [
        {k: row[k] for k in ("startTime", "publishTime", "generation")}
        for row in raw_forecasts
        if in_january(row)
    ]

    (OUT / "actuals.json").write_text(json.dumps(list(latest.values())))
    (OUT / "forecasts.json").write_text(json.dumps(forecasts))
    print(f"{len(latest)} actuals, {len(forecasts)} forecasts written to {OUT}")
