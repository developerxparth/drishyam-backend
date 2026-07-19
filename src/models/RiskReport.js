import mongoose from 'mongoose'

const riskReportSchema = new mongoose.Schema(
  {
    region: { type: String, required: true, index: true },
    month: { type: String, required: true },
    risk: { type: String, enum: ['drought', 'flood', 'normal'], required: true },
    label: { type: String, required: true },
    anomaly_pct: { type: Number, required: true },
    confidence: { type: Number, min: 0, max: 1, default: 0.75 },
  },
  { timestamps: true }
)

export default mongoose.model('RiskReport', riskReportSchema)
