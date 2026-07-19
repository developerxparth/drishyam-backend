import { Router } from 'express'
import { getForecast } from '../controllers/forecast.controller.js'

const router = Router()

router.get('/:region', getForecast)

export default router
