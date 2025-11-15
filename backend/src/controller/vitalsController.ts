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

const findEntryForUser = async(userId: string, entryId: string) => {
    return prisma.vitalEntry.findFirst({
        where: {
            id: entryId,
            profile: {
                userId
            }
        }
    })
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

const getBloodPressureRecords = async (req: ExtendedRequest, res: any) => {
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
            vitalType: VitalType.BLOOD_PRESSURE_SYSTOLIC
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

const getBloodSugarRecords = async (req: ExtendedRequest, res: any) => {
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
            vitalType: VitalType.BLOOD_GLUCOSE
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

const getBloodPressureRecord = async (req: ExtendedRequest, res: any) => {
    const user = ensureUser(req, res)
    if (!user) return

    const entryId = req.params.id
    const entry = await findEntryForUser(user.id, entryId)
    if (!entry || entry.vitalType !== VitalType.BLOOD_PRESSURE_SYSTOLIC) {
        return res.status(404).json({
            status: 404,
            message: 'Blood pressure record not found.'
        })
    }

    res.status(200).json({
        status: 200,
        record: entry
    })
}

const getBloodSugarRecord = async (req: ExtendedRequest, res: any) => {
    const user = ensureUser(req, res)
    if (!user) return

    const entryId = req.params.id
    const entry = await findEntryForUser(user.id, entryId)
    if (!entry || entry.vitalType !== VitalType.BLOOD_GLUCOSE) {
        return res.status(404).json({
            status: 404,
            message: 'Blood sugar record not found.'
        })
    }

    res.status(200).json({
        status: 200,
        record: entry
    })
}

const getBodyWeightRecord = async (req: ExtendedRequest, res: any) => {
    const user = ensureUser(req, res)
    if (!user) return

    const entryId = req.params.id
    const entry = await findEntryForUser(user.id, entryId)
    if (!entry || entry.vitalType !== VitalType.WEIGHT) {
        return res.status(404).json({
            status: 404,
            message: 'Body weight record not found.'
        })
    }

    res.status(200).json({
        status: 200,
        record: entry
    })
}

const updateBloodPressureRecord = async (req: ExtendedRequest, res: any) => {
    const user = ensureUser(req, res)
    if (!user) return

    const entryId = req.params.id
    const existing = await findEntryForUser(user.id, entryId)
    if (!existing || existing.vitalType !== VitalType.BLOOD_PRESSURE_SYSTOLIC) {
        return res.status(404).json({
            status: 404,
            message: 'Blood pressure record not found.'
        })
    }

    const {
        systolic,
        diastolic,
        recordedAt,
        notes
    } = req.body

    const updateData: any = {}
    if (typeof systolic !== 'undefined') {
        const value = Number(systolic)
        if (Number.isNaN(value)) {
            return res.status(400).json({ status: 400, message: 'Systolic must be a number.' })
        }
        updateData.systolic = value
    }
    if (typeof diastolic !== 'undefined') {
        const value = Number(diastolic)
        if (Number.isNaN(value)) {
            return res.status(400).json({ status: 400, message: 'Diastolic must be a number.' })
        }
        updateData.diastolic = value
    }
    if (typeof notes !== 'undefined') {
        updateData.notes = notes
    }
    if (recordedAt) {
        updateData.recordedAt = new Date(recordedAt)
    }

    const updated = await prisma.vitalEntry.update({
        where: { id: entryId },
        data: updateData
    })

    return res.status(200).json({
        status: 200,
        record: updated
    })
}

const updateBloodSugarRecord = async (req: ExtendedRequest, res: any) => {
    const user = ensureUser(req, res)
    if (!user) return

    const entryId = req.params.id
    const existing = await findEntryForUser(user.id, entryId)
    if (!existing || existing.vitalType !== VitalType.BLOOD_GLUCOSE) {
        return res.status(404).json({
            status: 404,
            message: 'Blood sugar record not found.'
        })
    }

    const {
        reading,
        context,
        recordedAt,
        notes
    } = req.body

    const updateData: any = {}
    if (typeof reading !== 'undefined') {
        const value = Number(reading)
        if (Number.isNaN(value)) {
            return res.status(400).json({ status: 400, message: 'Reading must be a number.' })
        }
        updateData.valueNumber = value
    }
    if (typeof context !== 'undefined') {
        updateData.chartGroup = context
    }
    if (typeof notes !== 'undefined') {
        updateData.notes = notes
    }
    if (recordedAt) {
        updateData.recordedAt = new Date(recordedAt)
    }

    const updated = await prisma.vitalEntry.update({
        where: { id: entryId },
        data: updateData
    })

    return res.status(200).json({
        status: 200,
        record: updated
    })
}

const updateBodyWeightRecord = async (req: ExtendedRequest, res: any) => {
    const user = ensureUser(req, res)
    if (!user) return

    const entryId = req.params.id
    const existing = await findEntryForUser(user.id, entryId)
    if (!existing || existing.vitalType !== VitalType.WEIGHT) {
        return res.status(404).json({
            status: 404,
            message: 'Body weight record not found.'
        })
    }

    const {
        weight,
        recordedAt,
        notes
    } = req.body

    const updateData: any = {}
    if (typeof weight !== 'undefined') {
        const value = Number(weight)
        if (Number.isNaN(value)) {
            return res.status(400).json({ status: 400, message: 'Weight must be a number.' })
        }
        updateData.valueNumber = value
    }
    if (typeof notes !== 'undefined') {
        updateData.notes = notes
    }
    if (recordedAt) {
        updateData.recordedAt = new Date(recordedAt)
    }

    const updated = await prisma.vitalEntry.update({
        where: { id: entryId },
        data: updateData
    })

    return res.status(200).json({
        status: 200,
        record: updated
    })
}

export {
    createBloodPressureRecord,
    createBloodSugarRecord,
    createBodyWeightRecord,
    getBodyWeightRecords,
    getBloodPressureRecords,
    getBloodSugarRecords,
    getBloodPressureRecord,
    getBloodSugarRecord,
    getBodyWeightRecord,
    updateBloodPressureRecord,
    updateBloodSugarRecord,
    updateBodyWeightRecord
}
