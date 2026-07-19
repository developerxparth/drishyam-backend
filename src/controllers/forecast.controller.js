import ClimateRecord from '../models/ClimateRecord.js'
import Forecast from '../models/Forecast.js'
import { getForecastFor } from '../services/mlService.js'
import { currentTargetMonth } from '../services/climateStats.js'

const CACHE_TTL_MS = 1000 * 60 * 60 * 6 // 6 hours — fine for a hackathon demo

export async function getForecast(req, res, next) {
  try {
    const region = req.params.region.toUpperCase()
    const targetMonth = currentTargetMonth()

    const cached = await Forecast.findOne({ region, month: targetMonth }).sort({ generatedAt: -1 })
    if (cached && Date.now() - cached.generatedAt.getTime() < CACHE_TTL_MS) {
      return res.json(cached)
    }

    const records = await ClimateRecord.find({ region }).lean()
    if (records.length === 0) {
      return res.status(404).json({
        error: `No climate history for "${region}" to forecast from. Run "npm run seed" first.`,
      })
    }

    const forecast = await getForecastFor(region, targetMonth, records)
    const saved = await Forecast.create({ region, ...forecast })

    res.json(saved)
  } catch (err) {
    next(err)
  }
}
