import { Router } from 'express'
import { getRisk } from '../controllers/risk.controller.js'

const router = Router()

router.get('/:region', getRisk)

export default router
