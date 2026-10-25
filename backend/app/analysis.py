from bisect import bisect_right
from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

LONDON = ZoneInfo("Europe/London")
STEP = timedelta(minutes=30)
# Assumed gate closure of the GB day-ahead auction, local time on the day before delivery.
GATE_CLOSURE = time(9, 30)


def gate_closure(target):
    """Last moment a day-ahead decision for `target` can be made."""
    day_before = target.astimezone(LONDON).date() - timedelta(days=1)
    return datetime.combine(day_before, GATE_CLOSURE, LONDON)


def latest_run(runs, cutoff):
    """Most recent (publishTime, MW) published at or before `cutoff`; runs sorted by publishTime."""
    i = bisect_right(runs, cutoff, key=lambda run: run[0])
    return runs[i - 1] if i else None


def build_series(actuals, forecasts, start, end, cutoff_of):
    """Half-hourly actual vs the forecast that was available at cutoff_of(target)."""
    rows, target = [], start
    while target < end:
        run = latest_run(forecasts.get(target, []), cutoff_of(target))
        rows.append({
            "time": target.isoformat(),
            "actual": actuals.get(target),
            "forecast": run[1] if run else None,
            "publishTime": run[0].isoformat() if run else None,
        })
        target += STEP
    return rows


def metrics(rows):
    """Error statistics in MW; error = forecast - actual, so positive bias means over-forecast."""
    errors = [r["forecast"] - r["actual"] for r in rows if r["forecast"] is not None and r["actual"] is not None]
    if not errors:
        return None
    n = len(errors)
    abs_sorted = sorted(abs(e) for e in errors)
    return {
        "n": n,
        "mae": sum(abs_sorted) / n,
        "rmse": (sum(e * e for e in errors) / n) ** 0.5,
        "bias": sum(errors) / n,
        "p90": abs_sorted[min(n - 1, int(0.9 * n))],
        "p99": abs_sorted[min(n - 1, int(0.99 * n))],
    }


def accuracy_by_horizon(actuals, forecasts, start, end, max_horizon=48):
    """Error of the latest forecast published at least h hours before each target, for h = 0..max."""
    out = []
    for h in range(max_horizon + 1):
        m = metrics(build_series(actuals, forecasts, start, end, lambda t: t - timedelta(hours=h)))
        if m:
            out.append({"horizon": h, **m})
    return out
