import Explanation from '../models/Explanation.js'

const DEFAULT_FEATURES = [
  'Previous month rainfall',
  'INSAT cloud cover index',
  'ERA5 soil moisture',
  'Sea surface temp anomaly',
  'ENSO index',
  'Elevation-adjusted trend',
]

// If a region has no precomputed SHAP values yet (e.g. seed script for
// explanations hasn't been run for it), return a clearly-labeled flat
// placeholder rather than fail the request outright.
function placeholderExplanation(region) {
  const even = 100 / DEFAULT_FEATURES.length
  return {
    region,
    features: DEFAULT_FEATURES.map(feature => ({ feature, importance: Math.round(even * 10) / 10 })),
    computedWith: 'placeholder — run the SHAP precompute script for this region',
  }
}

export async function getExplanation(req, res, next) {
  try {
    const region = req.params.region.toUpperCase()
    const found = await Explanation.findOne({ region }).lean()
    res.json(found || placeholderExplanation(region))
  } catch (err) {
    next(err)
  }
}
