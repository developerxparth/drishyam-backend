import { MONTH_NAMES } from '../utils/regions.js'

export function historicalMeanForMonth(records, monthName) {
  const vals = records.filter(r => r.month === monthName).map(r => r.rainfall_mm)
  if (vals.length === 0) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

// A simple, explainable stand-in for the LSTM: recent years for this month
// vs. the full historical mean for this month. Deterministic given the data
// already in MongoDB — no randomness, no external calls.
export function localFallbackForecast(records, targetMonthName) {
  const histMean = historicalMeanForMonth(records, targetMonthName)
  if (histMean === null) {
    throw new Error(`No historical records found for month "${targetMonthName}" in this region`)
  }

  const monthRecords = records
    .filter(r => r.month === targetMonthName)
    .sort((a, b) => b.year - a.year)
  const recent = monthRecords.slice(0, 3)
  const recentMean = recent.reduce((a, b) => a + b.rainfall_mm, 0) / recent.length

  const trend = recentMean / histMean
  const predicted = Math.round(histMean * trend)
  const anomaly_pct = Math.round(((predicted - histMean) / histMean) * 100)

  return {
    month: targetMonthName,
    predicted_rainfall_mm: predicted,
    historical_mean_mm: Math.round(histMean),
    anomaly_pct,
    source: 'local-fallback',
  }
}

export function currentTargetMonth() {
  return MONTH_NAMES[new Date().getMonth()]
}
