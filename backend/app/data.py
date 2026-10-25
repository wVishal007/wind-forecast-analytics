import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def parse(ts):
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


# target time -> MW
ACTUALS = {
    parse(r["startTime"]): r["generation"]
    for r in json.loads((DATA_DIR / "actuals.json").read_text())
}

# target time -> [(publishTime, MW), ...] sorted by publishTime
FORECASTS = defaultdict(list)
for r in json.loads((DATA_DIR / "forecasts.json").read_text()):
    FORECASTS[parse(r["startTime"])].append((parse(r["publishTime"]), r["generation"]))
for runs in FORECASTS.values():
    runs.sort()
