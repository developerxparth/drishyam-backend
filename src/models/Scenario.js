import mongoose from 'mongoose'

const scenarioSchema = new mongoose.Schema(
  {
    region: { type: String, required: true, index: true },
    inputs: {
      rainfallDelta: { type: Number, required: true }, // percent, e.g. -20
      tempDelta: { type: Number, required: true }, // degrees C
    },
    result: {
      month: String,
      predicted_rainfall_mm: Number,
      historical_mean_mm: Number,
      anomaly_pct: Number,
    },
    source: { type: String, enum: ['ml-service', 'local-fallback'], default: 'local-fallback' },
  },
  { timestamps: true }
)

export default mongoose.model('Scenario', scenarioSchema)
