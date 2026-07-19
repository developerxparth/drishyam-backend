import ClimateRecord from '../models/ClimateRecord.js'
import Forecast from '../models/Forecast.js'
import Scenario from '../models/Scenario.js'
import { getForecastFor, runScenarioFor } from '../services/mlService.js'
import { currentTargetMonth } from '../services/climateStats.js'

export async function postScenario(req, res, next) {
  try {
    const { region, rainfallDelta, tempDelta } = req.body

    if (!region) return res.status(400).json({ error: 'region is required' })
    if (typeof rainfallDelta !== 'number' || typeof tempDelta !== 'number') {
      return res.status(400).json({ error: 'rainfallDelta and tempDelta must be numbers' })
    }

    const regionId = region.toUpperCase()
    const targetMonth = currentTargetMonth()

    let baseline = await Forecast.findOne({ region: regionId, month: targetMonth }).sort({ generatedAt: -1 })
    if (!baseline) {
      const records = await ClimateRecord.find({ region: regionId }).lean()
      if (records.length === 0) {
        return res.status(404).json({
          error: `No climate history for "${regionId}". Run "npm run seed" first.`,
        })
      }
      const forecast = await getForecastFor(regionId, targetMonth, records)
      baseline = await Forecast.create({ region: regionId, ...forecast })
    }

    const result = await runScenarioFor(regionId, baseline, { rainfallDelta, tempDelta })

    const saved = await Scenario.create({
      region: regionId,
      inputs: { rainfallDelta, tempDelta },
      result: {
        month: result.month,
        predicted_rainfall_mm: result.predicted_rainfall_mm,
        historical_mean_mm: result.historical_mean_mm,
        anomaly_pct: result.anomaly_pct,
      },
      source: result.source,
    })

    res.json(saved)
  } catch (err) {
    next(err)
  }
}
