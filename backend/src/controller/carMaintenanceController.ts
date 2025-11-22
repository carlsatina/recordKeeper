import prisma from '../../lib/prisma'
import { Request, Response } from 'express'

const ensureUser = (req: any, res: Response) => {
    if (!req.user) {
        res.status(401).json({
            status: 401,
            message: 'Unauthorized'
        })
        return null
    }
    return req.user
}

export const addVehicle = async(req: Request, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return

    const {
        make,
        model,
        year,
        color,
        licensePlate,
        vin,
        vehicleType = 'CAR',
        purchaseDate,
        currentMileage,
        imageUrl,
        notes
    } = req.body || {}
    const uploadedImage = (req as any).file

    if (!make || !model) {
        return res.status(400).json({
            status: 400,
            message: 'make and model are required'
        })
    }

    const resolvedImageUrl = uploadedImage
        ? `/vehicles/${uploadedImage.filename}`
        : imageUrl || null

    try {
        const vehicle = await prisma.vehicle.create({
            data: {
                userId: user.id,
                make,
                model,
                year: year ? Number(year) : null,
                color: color || null,
                licensePlate: licensePlate || null,
                vin: vin || null,
                vehicleType,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                currentMileage: currentMileage ? Number(currentMileage) : null,
                imageUrl: resolvedImageUrl,
                notes: notes || null
            }
        })

        return res.status(201).json({
            status: 201,
            vehicle
        })
    } catch (error: any) {
        const message = error?.message || 'Unable to create vehicle'
        return res.status(500).json({
            status: 500,
            message
        })
    }
}
