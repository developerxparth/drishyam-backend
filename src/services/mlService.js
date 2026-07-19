import fetch from 'node-fetch'
import { localFallbackForecast } from './climateStats.js'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL // e.g. http://localhost:8000
const TIMEOUT_MS = 3000

async function callMlService(path, body) {
  if (!ML_SERVICE_URL) return null
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(`${ML_SERVICE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`ML service responded ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn(`[mlService] ${path} unavailable (${err.message}) — using local fallback`)
    return null
  }
}

/**
 * Returns a forecast for `region` at `targetMonth`, trying the FastAPI/PyTorch
 * LSTM service first and falling back to a local trend estimate over
 * `records` if the service is unset, unreachable, or errors. This fallback
 * is what keeps the demo alive if the Python service hiccups during judging.
 */
export async function getForecastFor(region, targetMonth, records) {
  const remote = await callMlService('/predict', { region, month: targetMonth })
  if (remote) return { ...remote, source: 'ml-service' }
  return localFallbackForecast(records, targetMonth)
}

/**
 * Runs a what-if scenario, trying the FastAPI service first.
 * Local fallback mirrors the frontend's client-side math exactly, so
 * behavior is consistent whether or not the ML service is up.
 */
export async function runScenarioFor(region, baseline, inputs) {
  const remote = await callMlService('/scenario', { region, ...inputs })
  if (remote) return { ...remote, source: 'ml-service' }

  const { rainfallDelta, tempDelta } = inputs
  const rainfallFactor = 1 + rainfallDelta / 100
  const tempPenalty = 1 - Math.max(0, tempDelta) * 0.025
  const predicted = Math.round(baseline.predicted_rainfall_mm * rainfallFactor * tempPenalty)
  const anomaly_pct = Math.round(
    ((predicted - baseline.historical_mean_mm) / baseline.historical_mean_mm) * 100
  )
  return {
    month: baseline.month,
    predicted_rainfall_mm: predicted,
    historical_mean_mm: baseline.historical_mean_mm,
    anomaly_pct,
    source: 'local-fallback',
  }
}
