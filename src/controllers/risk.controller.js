import Forecast from '../models/Forecast.js'
import ClimateRecord from '../models/ClimateRecord.js'
import RiskReport from '../models/RiskReport.js'
import { getForecastFor } from '../services/mlService.js'
import { currentTargetMonth } from '../services/climateStats.js'
import { riskFromAnomaly } from '../utils/regions.js'

export async function getRisk(req, res, next) {
  try {
    const region = req.params.region.toUpperCase()
    const targetMonth = currentTargetMonth()

    let forecast = await Forecast.findOne({ region, month: targetMonth }).sort({ generatedAt: -1 })
    if (!forecast) {
      const records = await ClimateRecord.find({ region }).lean()
      if (records.length === 0) {
        return res.status(404).json({
          error: `No climate history for "${region}". Run "npm run seed" first.`,
        })
      }
      const computed = await getForecastFor(region, targetMonth, records)
      forecast = await Forecast.create({ region, ...computed })
    }

    const { level, label } = riskFromAnomaly(forecast.anomaly_pct)

    const saved = await RiskReport.findOneAndUpdate(
      { region, month: targetMonth },
      {
        region,
        month: targetMonth,
        risk: level,
        label,
        anomaly_pct: forecast.anomaly_pct,
        confidence: 0.75,
      },
      { upsert: true, new: true }
    )

    res.json(saved)
  } catch (err) {
    next(err)
  }
}
