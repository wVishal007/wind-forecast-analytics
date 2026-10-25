from datetime import date, datetime, time, timedelta, timezone
from functools import cache
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from pydantic import AwareDatetime

from .analysis import LONDON, accuracy_by_horizon, build_series, gate_closure, metrics
from .data import ACTUALS, FORECASTS

UTC = timezone.utc
WINDOW_START = datetime(2026, 1, 1, tzinfo=UTC)
WINDOW_END = datetime(2026, 2, 1, tzinfo=UTC)

app = FastAPI(title="Wind forecast monitor")


@app.get("/api/series")
def series(start: AwareDatetime, end: AwareDatetime, horizon: float = Query(4, ge=0, le=48)):
    """Actual vs the latest forecast published at least `horizon` hours before each target time."""
    if not WINDOW_START <= start < end <= WINDOW_END:
        raise HTTPException(422, "start and end must lie within January 2026 (UTC), with start < end")
    rows = build_series(ACTUALS, FORECASTS, start, end, lambda t: t - timedelta(hours=horizon))
    return {"series": rows, "metrics": metrics(rows)}


@app.get("/api/day-ahead")
def day_ahead(day: date):
    """The forecast a trader sees at gate closure the day before `day`, next to what happened."""
    start = datetime.combine(day, time.min, LONDON)
    if not WINDOW_START <= start.astimezone(UTC) < WINDOW_END:
        raise HTTPException(422, "day must be in January 2026")
    rows = build_series(ACTUALS, FORECASTS, start.astimezone(UTC), (start + timedelta(days=1)).astimezone(UTC), gate_closure)
    return {"gateClosure": gate_closure(start).isoformat(), "series": rows, "metrics": metrics(rows)}


@app.get("/api/accuracy")
@cache
def accuracy():
    """Whole-January accuracy: day-ahead decision rule, and error as a function of forecast horizon."""
    day_ahead_rows = build_series(ACTUALS, FORECASTS, WINDOW_START, WINDOW_END, gate_closure)
    return {
        "dayAhead": metrics(day_ahead_rows),
        "byHorizon": accuracy_by_horizon(ACTUALS, FORECASTS, WINDOW_START, WINDOW_END),
    }


# registered last so it doesn't shadow the API routes
DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if DIST.exists():
    app.mount("/", StaticFiles(directory=DIST, html=True))
