import 'dotenv/config'
import { connectDB } from '../config/db.js'
import mongoose from 'mongoose'
import ClimateRecord from '../models/ClimateRecord.js'
import Explanation from '../models/Explanation.js'
import { STATES, MONTH_NAMES, SEASONAL } from '../utils/regions.js'

// Same seeded-PRNG approach as the frontend's mockData.js, so a given
// state produces comparable-looking data on both sides during development.
function seededRandom(seedStr) {
  let h = 1779033703 ^ seedStr.length
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h = (h ^= h >>> 16) >>> 0
    return h / 4294967296
  }
}

const YEARS_OF_HISTORY = 20
const CURRENT_YEAR = 2026

function buildHistory(state) {
  const rnd = seededRandom(state.id)
  const rows = []
  for (let y = CURRENT_YEAR - YEARS_OF_HISTORY; y < CURRENT_YEAR; y++) {
    for (let m = 0; m < 12; m++) {
      const noise = 1 + (rnd() - 0.5) * state.volatility
      const rainfall = Math.max(0, state.baseline * SEASONAL[m] * noise)
      const temp = 22 + (m > 2 && m < 9 ? 6 : 2) + (rnd() - 0.5) * 3
      rows.push({
        region: state.id,
        date: `${y}-${String(m + 1).padStart(2, '0')}`,
        year: y,
        month: MONTH_NAMES[m],
        rainfall_mm: Math.round(rainfall),
        temp_c: Math.round(temp * 10) / 10,
        source: 'IMD (synthetic seed)',
      })
    }
  }
  return rows
}

function buildExplanation(state) {
  const rnd = seededRandom(state.id + '-shap')
  const featureNames = [
    'Previous month rainfall',
    'INSAT cloud cover index',
    'ERA5 soil moisture',
    'Sea surface temp anomaly',
    'ENSO index',
    'Elevation-adjusted trend',
  ]
  const raw = featureNames.map(feature => ({ feature, importance: 0.15 + rnd() * 0.85 }))
  const total = raw.reduce((a, b) => a + b.importance, 0)
  const features = raw
    .map(r => ({ feature: r.feature, importance: Math.round((r.importance / total) * 1000) / 10 }))
    .sort((a, b) => b.importance - a.importance)
  return { region: state.id, features, computedWith: 'SHAP (offline, synthetic seed)' }
}

async function seed() {
  await connectDB()

  console.log(`[seed] clearing existing ClimateRecord + Explanation documents...`)
  await ClimateRecord.deleteMany({})
  await Explanation.deleteMany({})

  for (const state of STATES) {
    const history = buildHistory(state)
    await ClimateRecord.insertMany(history, { ordered: false })

    const explanation = buildExplanation(state)
    await Explanation.create(explanation)

    console.log(`[seed] ${state.id} (${state.name}): ${history.length} records + explanation`)
  }

  console.log(`[seed] done — ${STATES.length} regions seeded.`)
  await mongoose.connection.close()
}

seed().catch(err => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
