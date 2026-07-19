import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import climateRoutes from './routes/climate.routes.js'
import forecastRoutes from './routes/forecast.routes.js'
import scenarioRoutes from './routes/scenario.routes.js'
import riskRoutes from './routes/risk.routes.js'
import explainRoutes from './routes/explain.routes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
  app.use(express.json())
  app.use(morgan('dev'))

  app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'drishyam-backend' }))

  app.use('/api/climate', climateRoutes)
  app.use('/api/forecast', forecastRoutes)
  app.use('/api/scenario', scenarioRoutes)
  app.use('/api/risk', riskRoutes)
  app.use('/api/explain', explainRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
