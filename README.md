# Wind Forecast Monitor

A dashboard for analysing Great Britain's wind power forecasts and actual generation. Built around a day-ahead power buying use case, it helps answer two questions: what forecast was available before a decision deadline, and how accurate was it compared with actual generation?

The app uses Elexon's WINDFOR forecasts and FUELHH generation data for January 2026.

## What it does

- **Overview:** Summarises forecast performance across January using MAE, RMSE, bias, and the 90th and 99th percentiles of absolute error.
- **Day-ahead view:** Select a delivery date and compare actual generation with the latest forecast published before the configured 09:30 London-time cutoff on the previous day.
- **Horizon explorer:** Choose a date range and forecast horizon to see how forecasts compare with actual generation at different lead times.
- **Error by horizon:** Compare MAE and P90 absolute error across horizons from 0 to 48 hours.

The charts show forecast and actual generation together, making it easier to identify periods when the forecast missed the shape or level of wind output.

## How it works

The data is downloaded using `scripts/fetch_data.py` and saved as JSON files. The backend loads and indexes the data to find the relevant forecast for each half-hourly delivery period.

For a delivery time and a given cutoff, the app selects the forecast with the latest publication time that is **at or before the cutoff**. This prevents the analysis from using forecasts published after the decision time.

The backend uses FastAPI, while the frontend is built with React, Vite, and Recharts. Docker packages the frontend and backend together. Vercel deployment is configured separately.

## Method and assumptions

- **Actual generation:** Elexon FUELHH, filtered to `fuelType=WIND`.
- **Forecasts:** Elexon WINDFOR.
- **Period:** January 2026.
- **Day-ahead cutoff:** 09:30 Europe/London on the day before delivery. This is a configurable assumption, not a verified representation of every relevant market deadline.
- **Horizon analysis:** For each target time, the cutoff is calculated as the target time minus the selected horizon.
- **Error:** `forecast - actual`. Positive bias means the forecast was higher than actual generation on average.
- **Metrics:** MAE measures average absolute error, RMSE gives greater weight to larger misses, bias indicates the direction of average error, and P90/P99 describe the upper tail of absolute errors.

This is a forecast-performance analysis, not a complete power procurement or trading model. It does not currently include electricity prices, demand forecasts, or the financial cost of forecast errors.

## Implementation details

### Backend

The backend loads the datasets, selects forecasts, builds half-hourly time series, and calculates accuracy metrics.

Forecasts are indexed by delivery time and ordered by publication time. The analysis uses binary search to select the latest eligible forecast for a cutoff. The same selection logic is reused across the day-ahead and horizon views.

The API provides three main endpoints:

- `/api/series`
- `/api/day-ahead`
- `/api/accuracy`

### Frontend

The React dashboard provides the four analysis views, date and horizon controls, charts, metric cards, loading and error states, and theme support.

It also includes keyboard shortcuts, chart interactions, and URL-based view state so a particular date or analysis view can be shared.

### Data and deployment

The JSON datasets are committed to the repository so the application can run without downloading data on every request. The fetch script can be used to refresh them.

Docker builds the frontend and packages it with the FastAPI application. Vercel is configured to serve the frontend and expose the API through a Python function.

## Running locally

### 1. Refresh the data (optional)

This requires internet access.

```bash
pip install -r requirements-dev.txt
python scripts/fetch_data.py
```

The existing JSON files can be used if you do not need to refresh the dataset.

### 2. Run with Docker

```bash
docker build -t wind-monitor .
docker run -p 8000:8000 wind-monitor
```

Open [http://localhost:8000](http://localhost:8000).

### 3. Run for development

Start the backend in one terminal:

```bash
uvicorn backend.app.main:app --reload
```

Start the frontend in another:

```bash
cd frontend
npm install
npm run dev
```

Run the backend tests from the project root:

```bash
pytest
```

## Testing

The backend analysis tests cover forecast cutoff selection, including forecasts published exactly at the cutoff, forecasts published after it, missing earlier forecasts, and metric calculations.

Frontend and deployment checks should be run separately. The presence of configuration files alone does not establish that a deployment or browser flow has been verified.

## Limitations and next steps

- The 09:30 day-ahead cutoff is an assumption and should be checked against the intended procurement decision process.
- The analysis covers January 2026 and the two specified Elexon datasets.
- There is no demand or price data, so forecast errors are measured in MW rather than monetary exposure.
- Data refresh is manual rather than scheduled.
- Frontend and end-to-end test coverage can be expanded.

Potential next steps include scheduled data ingestion, incorporating demand and price data, estimating the financial exposure associated with forecast errors, and alerting users when a new forecast materially changes expected generation.

## Use of AI tools

I used **Claude Code and OpenCode** during development to work more efficiently on the project. They helped with initial scaffolding, exploring implementation approaches, writing and refactoring code, and preparing documentation.

Using these tools reduced time spent on repetitive setup and helped me iterate on the implementation more quickly. I reviewed the generated changes, focused on understanding the forecast-selection and metric calculations, and used tests and application checks to validate the parts I could verify.

AI tools assisted the development process, but the project still required engineering decisions around data handling, forecast cutoffs, error metrics, deployment, and the limitations of the analysis.