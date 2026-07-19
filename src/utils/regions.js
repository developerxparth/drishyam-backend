// Kept in sync with drishyam-frontend/src/data/mockData.js STATES list
// (id + display name only — the backend doesn't need the hex grid
// coordinates, that's purely a frontend layout concern).
export const STATES = [
  { id: 'JK', name: 'Jammu & Kashmir', baseline: 55, volatility: 0.5 },
  { id: 'PB', name: 'Punjab', baseline: 60, volatility: 0.4 },
  { id: 'HP', name: 'Himachal Pradesh', baseline: 90, volatility: 0.5 },
  { id: 'UK', name: 'Uttarakhand', baseline: 110, volatility: 0.5 },
  { id: 'RJ', name: 'Rajasthan', baseline: 35, volatility: 0.7 },
  { id: 'UP', name: 'Uttar Pradesh', baseline: 95, volatility: 0.4 },
  { id: 'BR', name: 'Bihar', baseline: 115, volatility: 0.45 },
  { id: 'AS', name: 'Assam', baseline: 220, volatility: 0.4 },
  { id: 'WB', name: 'West Bengal', baseline: 175, volatility: 0.4 },
  { id: 'GJ', name: 'Gujarat', baseline: 80, volatility: 0.75 },
  { id: 'MP', name: 'Madhya Pradesh', baseline: 100, volatility: 0.5 },
  { id: 'JH', name: 'Jharkhand', baseline: 120, volatility: 0.45 },
  { id: 'MH', name: 'Maharashtra', baseline: 105, volatility: 0.6 },
  { id: 'CG', name: 'Chhattisgarh', baseline: 130, volatility: 0.45 },
  { id: 'OD', name: 'Odisha', baseline: 150, volatility: 0.45 },
  { id: 'TG', name: 'Telangana', baseline: 95, volatility: 0.55 },
  { id: 'KA', name: 'Karnataka', baseline: 115, volatility: 0.55 },
  { id: 'AP', name: 'Andhra Pradesh', baseline: 100, volatility: 0.5 },
  { id: 'KL', name: 'Kerala', baseline: 275, volatility: 0.4 },
  { id: 'TN', name: 'Tamil Nadu', baseline: 95, volatility: 0.5 },
]

export const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Indian monsoon-shaped seasonal multiplier by month (synthetic, for the prototype)
export const SEASONAL = [0.15, 0.12, 0.2, 0.3, 0.55, 1.3, 1.9, 1.75, 1.1, 0.5, 0.2, 0.15]

export function riskFromAnomaly(anomalyPct) {
  if (anomalyPct <= -20) return { level: 'drought', label: 'Drought risk' }
  if (anomalyPct >= 30) return { level: 'flood', label: 'Flood risk' }
  return { level: 'normal', label: 'Within normal range' }
}
