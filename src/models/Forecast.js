import mongoose from 'mongoose'

const forecastSchema = new mongoose.Schema(
  {
    region: { type: String, required: true, index: true },
    month: { type: String, required: true },
    predicted_rainfall_mm: { type: Number, required: true },
    historical_mean_mm: { type: Number, required: true },
    anomaly_pct: { type: Number, required: true },
    source: { type: String, enum: ['ml-service', 'local-fallback'], default: 'local-fallback' },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model('Forecast', forecastSchema)
