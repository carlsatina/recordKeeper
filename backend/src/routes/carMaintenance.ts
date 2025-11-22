import { RequestHandler, Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { addVehicle } from '../controller/carMaintenanceController'
import uploadVehicleImage from '../middlewares/uploadVehicleImage'

const makeCarMaintenanceRouter = (
    _dbClient: PrismaClient,
    authenticateUser: RequestHandler
): Router => {
    const router = Router()

    router.post('/vehicles', authenticateUser, uploadVehicleImage.single('image'), addVehicle)

    return router
}

export default makeCarMaintenanceRouter
