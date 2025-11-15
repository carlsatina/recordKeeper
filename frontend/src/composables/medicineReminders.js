import { ref } from 'vue'
import { API_BASE_URL } from '@/constants/config'

const toDateString = (value) => {
    if (!value) return null
    if (value instanceof Date) {
        return value.toISOString()
    }
    if (typeof value === 'string') {
        const parsed = new Date(value)
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString()
        }
    }
    return null
}

export const useMedicineReminders = () => {
    const reminders = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchReminders = async(token, profileId, options = {}) => {
        if (!token || !profileId) {
            reminders.value = []
            return
        }
        loading.value = true
        error.value = null
        try {
            const params = new URLSearchParams({ profileId })
            const dateParam = toDateString(options.date)
            if (dateParam) {
                params.append('date', dateParam)
            }
            const res = await fetch(`${API_BASE_URL}/api/v1/medicine-reminders?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (res.ok) {
                reminders.value = data.reminders || []
            } else {
                throw new Error(data.message || 'Unable to fetch reminders')
            }
        } catch (err) {
            error.value = err
        } finally {
            loading.value = false
        }
    }

    const createReminder = async(token, payload) => {
        const res = await fetch(`${API_BASE_URL}/api/v1/medicine-reminders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to create reminder')
        }
        return data.reminder
    }

    const updateReminder = async(token, reminderId, payload) => {
        const res = await fetch(`${API_BASE_URL}/api/v1/medicine-reminders/${reminderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to update reminder')
        }
        return data.reminder
    }

    const fetchReminderById = async(token, reminderId) => {
        const res = await fetch(`${API_BASE_URL}/api/v1/medicine-reminders/${reminderId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to fetch reminder')
        }
        return data.reminder
    }

    const deleteReminder = async(token, reminderId) => {
        const res = await fetch(`${API_BASE_URL}/api/v1/medicine-reminders/${reminderId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to delete reminder')
        }
        return true
    }

    const setReminderStatus = async(token, reminderId, status, date, time) => {
        const res = await fetch(`${API_BASE_URL}/api/v1/medicine-reminders/${reminderId}/logs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                status,
                date: toDateString(date),
                time
            })
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to update reminder status')
        }
        return data.log
    }

    return {
        reminders,
        loading,
        error,
        fetchReminders,
        createReminder,
        updateReminder,
        deleteReminder,
        setReminderStatus,
        fetchReminderById
    }
}
