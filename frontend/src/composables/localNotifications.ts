import { Capacitor } from '@capacitor/core'
import {
    LocalNotifications,
    type LocalNotificationSchema,
    type PendingLocalNotificationSchema,
} from '@capacitor/local-notifications'

type ReminderInput = {
    id: string | number
    medicineName?: string
    times?: string[]
    time?: string
    startDate?: string
    intakeMethod?: string
}

type MaintenanceReminderInput = {
    id: string | number
    title?: string
    vehicleName?: string
    dueDate?: string | Date
    time?: string
}

const isNativePlatform = () => Capacitor.getPlatform() !== 'web'

const parseTime = (value?: string) => {
    const [hour, minute] = (value || '09:00').split(':').map((num) => parseInt(num, 10))
    return {
        hour: Number.isFinite(hour) ? hour : 9,
        minute: Number.isFinite(minute) ? minute : 0,
    }
}

const normalizeDate = (value?: string | Date) => {
    if (!value) return null
    const parsed = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed
}

const toStartDate = (value?: string) => {
    const parsed = value ? new Date(value) : new Date()
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

const reminderBaseId = (value: string | number) => {
    const input = String(value ?? '')
    let hash = 0
    for (let i = 0; i < input.length; i += 1) {
        hash = (hash << 5) - hash + input.charCodeAt(i)
        hash |= 0
    }
    const normalized = Math.abs(hash) % 100000
    return normalized * 100
}

const buildNotificationIds = (reminderId: string | number, count: number) => {
    const base = reminderBaseId(reminderId)
    return Array.from({ length: count }).map((_, index) => base + index)
}

export const ensureLocalNotificationPermission = async () => {
    if (!isNativePlatform()) return false

    const current = await LocalNotifications.checkPermissions()
    if (current.display === 'granted') return true

    const request = await LocalNotifications.requestPermissions()
    return request.display === 'granted'
}

export const cancelReminderNotifications = async (reminderId: string | number) => {
    if (!isNativePlatform() || reminderId === undefined || reminderId === null) return

    const base = reminderBaseId(reminderId)
    const pending = await LocalNotifications.getPending()
    const toCancel = pending.notifications.filter((item) => {
        if (typeof item.id !== 'number') return false
        return item.id >= base && item.id < base + 100
    })

    if (toCancel.length) {
        await LocalNotifications.cancel({ notifications: toCancel })
    }
}

const findNotificationsNotInSet = (
    notifications: PendingLocalNotificationSchema[],
    allowSet: Set<string>,
) => {
    return notifications.filter((item) => {
        const extraId = (item.extra as any)?.reminderId
        if (extraId !== undefined && extraId !== null) {
            return !allowSet.has(String(extraId))
        }
        if (typeof item.id === 'number') {
            const belongsToAllowed = Array.from(allowSet).some((id) => {
                const base = reminderBaseId(id)
                return item.id >= base && item.id < base + 100
            })
            return !belongsToAllowed
        }
        return false
    })
}

export const clearNotificationsExcept = async (reminderIds: Array<string | number>) => {
    if (!isNativePlatform()) return
    const allowSet = new Set(reminderIds.map((id) => String(id)))

    // Pending (scheduled) notifications
    const pending = await LocalNotifications.getPending()
    const pendingToCancel = findNotificationsNotInSet(pending.notifications, allowSet)
    if (pendingToCancel.length) {
        await LocalNotifications.cancel({ notifications: pendingToCancel })
    }

    // Delivered notifications sitting in the tray
    const delivered = await LocalNotifications.getDeliveredNotifications()
    const deliveredToClear = delivered.notifications.filter((item) => {
        const extraId = (item.extra as any)?.reminderId
        if (extraId !== undefined && extraId !== null) {
            return !allowSet.has(String(extraId))
        }
        return false
    })
    if (deliveredToClear.length) {
        const ids = deliveredToClear.map((n) => n.id)
        await LocalNotifications.removeDeliveredNotifications({ notifications: ids })
    }
}

export const scheduleReminderNotifications = async (reminder: ReminderInput) => {
    if (!isNativePlatform()) return false
    if (!reminder || reminder.id === undefined || reminder.id === null) return false

    try {
        const times = Array.isArray(reminder.times) && reminder.times.length
            ? reminder.times
            : reminder.time
                ? [reminder.time]
                : []

        if (!times.length) return false

        const hasPermission = await ensureLocalNotificationPermission()
        if (!hasPermission) return false

        await cancelReminderNotifications(reminder.id)

        const startDate = toStartDate(reminder.startDate)
        const notificationIds = buildNotificationIds(reminder.id, times.length)

        const notifications: LocalNotificationSchema[] = times.map((time, index) => {
            const { hour, minute } = parseTime(time)

            const firstRun = new Date(startDate)
            firstRun.setHours(hour, minute, 0, 0)
            if (firstRun.getTime() <= Date.now()) {
                firstRun.setDate(firstRun.getDate() + 1)
            }

            return {
                id: notificationIds[index],
                title: reminder.medicineName
                    ? `${reminder.medicineName} reminder`
                    : 'Medicine reminder',
                body: reminder.intakeMethod
                    ? `Time to take ${reminder.medicineName || 'your medicine'} (${reminder.intakeMethod})`
                    : `Time to take ${reminder.medicineName || 'your medicine'}`,
                schedule: {
                    at: firstRun,
                    repeats: true,
                    every: 'day',
                    allowWhileIdle: true,
                },
                extra: {
                    reminderId: reminder.id,
                    slotIndex: index,
                },
                smallIcon: 'ic_stat_meclogger',
                largeIcon: 'ic_meclogger_large',
            }
        })

        if (!notifications.length) return false

        await LocalNotifications.schedule({ notifications })
        return true
    } catch (err) {
        console.warn('Failed to schedule local notifications', err)
        return false
    }
}

export const scheduleMaintenanceNotification = async(reminder: MaintenanceReminderInput) => {
    if (!isNativePlatform()) return false
    if (!reminder || reminder.id === undefined || reminder.id === null) return false

    const dueDate = normalizeDate(reminder.dueDate)
    if (!dueDate) return false

    const hasPermission = await ensureLocalNotificationPermission()
    if (!hasPermission) return false

    await cancelReminderNotifications(reminder.id)

    const { hour, minute } = parseTime(reminder.time || '09:00')
    dueDate.setHours(hour, minute, 0, 0)
    if (dueDate.getTime() <= Date.now()) {
        // avoid scheduling in the past; push to next day so the user still sees it
        dueDate.setDate(dueDate.getDate() + 1)
    }

    const notificationId = reminderBaseId(reminder.id) + 1
    await LocalNotifications.schedule({
        notifications: [
            {
                id: notificationId,
                title: reminder.title
                    ? `${reminder.title} due`
                    : 'Maintenance due',
                body: reminder.vehicleName
                    ? `Scheduled for ${reminder.vehicleName}`
                    : 'You have a maintenance schedule coming up.',
                schedule: {
                    at: dueDate,
                    allowWhileIdle: true,
                },
                extra: {
                    reminderId: reminder.id,
                },
                smallIcon: 'ic_stat_meclogger',
                largeIcon: 'ic_meclogger_large',
            },
        ],
    })
    return true
}

export const triggerImmediateReminderNotification = async (
    reminder: ReminderInput & { time?: string; slotLabel?: string },
    slotIndex = 0,
) => {
    if (!isNativePlatform()) return false
    const hasPermission = await ensureLocalNotificationPermission()
    if (!hasPermission) return false

    const { hour, minute } = parseTime(reminder.time)
    const id = reminderBaseId(reminder.id) + 80 + slotIndex
    await LocalNotifications.schedule({
        notifications: [
            {
                id,
                title: reminder.medicineName
                    ? `${reminder.medicineName} is due`
                    : 'Medicine reminder',
                body: reminder.intakeMethod
                    ? `Time to take ${reminder.medicineName || 'your medicine'} (${reminder.intakeMethod})`
                    : `Time to take ${reminder.medicineName || 'your medicine'}`,
                schedule: { at: new Date(Date.now() + 750) },
                extra: {
                    reminderId: reminder.id,
                    slotIndex,
                    scheduledHour: hour,
                    scheduledMinute: minute,
                    slotLabel: reminder.slotLabel,
                },
                smallIcon: 'ic_stat_meclogger',
                largeIcon: 'ic_meclogger_large',
            },
        ],
    })
    return true
}

export const presentTestLocalNotification = async () => {
    if (!isNativePlatform()) return false
    const hasPermission = await ensureLocalNotificationPermission()
    if (!hasPermission) return false

    const inFiveSeconds = new Date(Date.now() + 5000)
        await LocalNotifications.schedule({
            notifications: [
                {
                    id: reminderBaseId('test'),
                    title: 'Local notification test',
                    body: 'This is a test notification from Meclogger.',
                    schedule: { at: inFiveSeconds },
                    smallIcon: 'ic_stat_meclogger',
                    largeIcon: 'ic_meclogger_large',
                },
            ],
        })
        return true
    }
