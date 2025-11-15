import { VitalType } from '@prisma/client'
import prisma from '../../lib/prisma'
import { ExtendedRequest } from '../../extendedRequest'

const resolveProfileForUser = async(userId: string, profileId?: string) => {
    if (profileId) {
        return prisma.profile.findFirst({
            where: {
                id: profileId,
                userId
            }
        })
    }

    return prisma.profile.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' }
    })
}

const ensureUser = (req: ExtendedRequest, res: any) => {
    if (!req.user) {
        res.status(401).json({
            status: 401,
            message: 'Unauthorized'
        })
        return null
    }
    return req.user
}

const createBloodPressureRecord = async (req: ExtendedRequest, res: any) => {
    const user = ensureUser(req, res)
    if (!user) return

    const { profileId, systolic, diastolic, recordedAt, notes } = req.body

    const systolicValue = Number(systolic)
    const diastolicValue = Number(diastolic)

    if (Number.isNaN(systolicValue) || Number.isNaN(diastolicValue)) {
        return res.status(400).json({
            status: 400,
            message: 'Systolic and diastolic values are required and must be numbers.'
        })
    }

    const profile = await resolveProfileForUser(user.id, profileId)
    if (!profile) {
        return res.status(404).json({
            status: 404,
            message: 'Profile not found for current user.'
        })
    }

    const entry = await prisma.vitalEntry.create({
        data: {
            profileId: profile.id,
            vitalType: VitalType.BLOOD_PRESSURE_SYSTOLIC,
            systolic: systolicValue,
            diastolic: diastolicValue,
            unit: 'mmHg',
            recordedAt: recordedAt ? new Date(recordedAt) : undefined,
            notes
        }
    })

    return res.status(201).json({
        status: 201,
        record: entry
    })
}

const createBloodSugarRecord = async (req: ExtendedRequest, res: any) => {
    const user = ensureUser(req, res)
    if (!user) return

    const { profileId, reading, context, recordedAt, notes } = req.body
    const readingValue = Number(reading)

    if (Number.isNaN(readingValue)) {
        return res.status(400).json({
            status: 400,
            message: 'Blood sugar reading must be provided as a number.'
        })
    }

    const profile = await resolveProfileForUser(user.id, profileId)
    if (!profile) {
        return res.status(404).json({
            status: 404,
            message: 'Profile not found for current user.'
        })
    }

    const entry = await prisma.vitalEntry.create({
        data: {
            profileId: profile.id,
            vitalType: VitalType.BLOOD_GLUCOSE,
            valueNumber: readingValue,
            unit: 'mg/dL',
            chartGroup: context,
            recordedAt: recordedAt ? new Date(recordedAt) : undefined,
            notes
        }
    })

    return res.status(201).json({
        status: 201,
        record: entry
    })
}

const createBodyWeightRecord = async (req: ExtendedRequest, res: any) => {
    const user = ensureUser(req, res)
    if (!user) return

    const { profileId, weight, recordedAt, notes } = req.body
    const weightValue = Number(weight)

    if (Number.isNaN(weightValue)) {
        return res.status(400).json({
            status: 400,
            message: 'Weight must be provided as a number.'
        })
    }

    const profile = await resolveProfileForUser(user.id, profileId)
    if (!profile) {
        return res.status(404).json({
            status: 404,
            message: 'Profile not found for current user.'
        })
    }

    const entry = await prisma.vitalEntry.create({
        data: {
            profileId: profile.id,
            vitalType: VitalType.WEIGHT,
            valueNumber: weightValue,
            unit: 'kg',
            recordedAt: recordedAt ? new Date(recordedAt) : undefined,
            notes
        }
    })

    return res.status(201).json({
        status: 201,
        record: entry
    })
}

const getBodyWeightRecords = async (req: ExtendedRequest, res: any) => {
    const user = ensureUser(req, res)
    if (!user) return

    const profileId = req.query.profileId as string | undefined

    if (!profileId) {
        return res.status(400).json({
            status: 400,
            message: 'profileId query parameter is required.'
        })
    }

    const profile = await resolveProfileForUser(user.id, profileId)
    if (!profile) {
        return res.status(404).json({
            status: 404,
            message: 'Profile not found for current user.'
        })
    }

    const records = await prisma.vitalEntry.findMany({
        where: {
            profileId: profile.id,
            vitalType: VitalType.WEIGHT
        },
        orderBy: {
            recordedAt: 'asc'
        }
    })

    return res.status(200).json({
        status: 200,
        records
    })
}

export {
    createBloodPressureRecord,
    createBloodSugarRecord,
    createBodyWeightRecord,
    getBodyWeightRecords
}
