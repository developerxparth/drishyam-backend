import mongoose from 'mongoose'

const featureSchema = new mongoose.Schema(
  {
    feature: { type: String, required: true },
    importance: { type: Number, required: true }, // percent contribution
  },
  { _id: false }
)

const explanationSchema = new mongoose.Schema(
  {
    region: { type: String, required: true, unique: true, index: true },
    features: { type: [featureSchema], required: true },
    computedWith: { type: String, default: 'SHAP (offline, precomputed)' },
  },
  { timestamps: true }
)

export default mongoose.model('Explanation', explanationSchema)
