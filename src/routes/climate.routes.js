import { Router } from 'express'
import { getHistory, listRegions } from '../controllers/climate.controller.js'

const router = Router()

router.get('/regions', listRegions)
router.get('/:region/history', getHistory)

export default router
