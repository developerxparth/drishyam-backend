import { Router } from 'express'
import { getExplanation } from '../controllers/explain.controller.js'

const router = Router()

router.get('/:region', getExplanation)

export default router
