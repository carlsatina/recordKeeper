import { RequestHandler, Router } from 'express'
import { PrismaClient } from '@prisma/client'
import {
    createBloodPressureRecord,
    createBloodSugarRecord,
    createBodyWeightRecord
} from '../controller/vitalsController'

const makeVitalsRouter = (
    _dbClient: PrismaClient,
    authenticateUser: RequestHandler
): Router => {
    const router = Router()

    router.post('/blood-pressure', authenticateUser, createBloodPressureRecord)
    router.post('/blood-sugar', authenticateUser, createBloodSugarRecord)
    router.post('/body-weight', authenticateUser, createBodyWeightRecord)

    return router
}

export default makeVitalsRouter
