import ClimateRecord from '../models/ClimateRecord.js'
import { STATES } from '../utils/regions.js'

export async function getHistory(req, res, next) {
  try {
    const { region } = req.params
    const { limit } = req.query

    const known = STATES.find(s => s.id === region.toUpperCase())
    if (!known) {
      return res.status(404).json({ error: `Unknown region "${region}"` })
    }

    let query = ClimateRecord.find({ region: region.toUpperCase() }).sort({ date: 1 })
    if (limit) query = query.limit(Number(limit))

    const records = await query.lean()
    if (records.length === 0) {
      return res.status(404).json({
        error: `No climate history found for "${region}". Run "npm run seed" first.`,
      })
    }

    res.json({ region: region.toUpperCase(), name: known.name, count: records.length, records })
  } catch (err) {
    next(err)
  }
}

export async function listRegions(_req, res) {
  res.json({ regions: STATES.map(s => ({ id: s.id, name: s.name })) })
}
