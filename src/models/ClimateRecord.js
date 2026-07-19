import mongoose from 'mongoose'

const climateRecordSchema = new mongoose.Schema(
  {
    region: { type: String, required: true, index: true }, // state id, e.g. "MH"
    district: { type: String, default: null },
    date: { type: String, required: true }, // "YYYY-MM"
    year: { type: Number, required: true },
    month: { type: String, required: true }, // "Jul"
    rainfall_mm: { type: Number, required: true },
    temp_c: { type: Number, required: true },
    source: { type: String, default: 'IMD' },
  },
  { timestamps: true }
)

climateRecordSchema.index({ region: 1, date: 1 }, { unique: true })

export default mongoose.model('ClimateRecord', climateRecordSchema)
