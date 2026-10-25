from datetime import datetime, timedelta, timezone

from backend.app.analysis import build_series, gate_closure, latest_run, metrics

UTC = timezone.utc


def at(day, hour, minute=0):
    return datetime(2026, 1, day, hour, minute, tzinfo=UTC)


RUNS = [(at(1, 6), 100), (at(1, 12), 120), (at(1, 18), 150)]


def test_latest_run_ignores_forecasts_published_after_cutoff():
    assert latest_run(RUNS, at(1, 13)) == (at(1, 12), 120)


def test_latest_run_includes_forecast_published_exactly_at_cutoff():
    assert latest_run(RUNS, at(1, 18)) == (at(1, 18), 150)


def test_latest_run_is_none_before_first_publication():
    assert latest_run(RUNS, at(1, 5)) is None


def test_gate_closure_is_0930_the_day_before():
    assert gate_closure(at(15, 12)) == at(14, 9, 30)


def test_build_series_applies_horizon_and_leaves_gaps_as_none():
    target = at(2, 0)
    rows = build_series({target: 130}, {target: RUNS}, target, target + timedelta(hours=1), lambda t: t - timedelta(hours=8))
    assert rows[0]["forecast"] == 120 and rows[0]["actual"] == 130
    assert rows[1]["forecast"] is None and rows[1]["actual"] is None


def test_metrics():
    rows = [{"forecast": f, "actual": a} for f, a in [(110, 100), (90, 100), (130, 100), (None, 100)]]
    m = metrics(rows)
    assert m["n"] == 3
    assert m["mae"] == (10 + 10 + 30) / 3
    assert m["bias"] == (10 - 10 + 30) / 3
    assert metrics([{"forecast": None, "actual": 1}]) is None
