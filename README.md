# Drishyam — Backend

Express + MongoDB API. Serves climate history, LSTM forecasts, what-if
scenarios, risk classification, and explainability data to the React
frontend — and forwards forecast/scenario requests to the FastAPI/PyTorch
service once it exists.

## Setup

```bash
npm install
cp .env.example .env     # then edit MONGODB_URI if needed
npm run seed              # populates MongoDB with 20 years of synthetic
                           # data per state, so the API has something to serve
npm run dev
```

API runs at `http://localhost:4000`. Point the frontend's `src/api/client.js`
(see the frontend README) at this base URL.

## Endpoints

| Method | Route                              | Returns                                  |
|--------|-------------------------------------|-------------------------------------------|
| GET    | `/api/health`                       | `{ ok: true }` liveness check             |
| GET    | `/api/climate/regions`              | list of known state ids/names             |
| GET    | `/api/climate/:region/history`      | full monthly rainfall/temp series         |
| GET    | `/api/forecast/:region`             | cached or freshly-computed forecast       |
| POST   | `/api/scenario`                     | `{ region, rainfallDelta, tempDelta }` in, simulated forecast out |
| GET    | `/api/risk/:region`                 | risk classification for current forecast  |
| GET    | `/api/explain/:region`              | precomputed feature-importance breakdown  |

`:region` is a state id from the seed list, e.g. `MH`, `KL`, `RJ`.

## How the ML service hook works

`src/services/mlService.js` is the only place that knows about the Python
service. Set `ML_SERVICE_URL` in `.env` once your FastAPI app is running
(e.g. `http://localhost:8000`), and:

- `getForecastFor()` will POST to `${ML_SERVICE_URL}/predict`
- `runScenarioFor()` will POST to `${ML_SERVICE_URL}/scenario`

If `ML_SERVICE_URL` is unset, the request times out, or the service errors,
both functions **fall back automatically** to a local trend estimate computed
from whatever's in MongoDB — the API never hard-fails just because the model
service is down. This is also your safety net for demo day: if the FastAPI
service hiccups mid-judging, the app keeps answering.

Every stored forecast/scenario document has a `source` field (`ml-service`
or `local-fallback`) so you can always tell which path served a given
response — useful for your own debugging and honest to show if a judge asks.

## Data model

- **ClimateRecord** — one document per state per month (the "ground truth" history)
- **Forecast** — cached model output per region/month, with a 6-hour TTL
- **Scenario** — every what-if run a user makes, for later review/demo replay
- **RiskReport** — the latest drought/flood/normal classification per region
- **Explanation** — precomputed SHAP-style feature importances per region

## Project structure

```
src/
  app.js                    — Express app assembly (middleware + routes)
  server.js                 — entry point, connects DB then listens
  config/db.js
  models/                   — Mongoose schemas
  routes/                   — one file per resource
  controllers/               — request handlers
  services/
    mlService.js             — calls FastAPI, falls back locally
    climateStats.js           — local trend-estimate math
  middleware/errorHandler.js
  scripts/seed.js            — populates MongoDB with synthetic data
  utils/regions.js           — shared state list + risk thresholds
```

## Next step

Build the FastAPI + PyTorch microservice with `/predict` and `/scenario`
routes matching the shapes in `src/services/mlService.js`, point
`ML_SERVICE_URL` at it, and the whole pipeline goes from "explainable
fallback math" to "an actual trained LSTM" with no other code changes.
