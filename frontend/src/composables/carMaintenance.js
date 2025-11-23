import { API_BASE_URL } from '@/constants/config'

export const useCarMaintenance = () => {
    const createVehicle = async(token, formData) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/vehicles`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to create vehicle')
        }
        return data.vehicle
    }

    const updateVehicle = async(token, vehicleId, formData) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/vehicles/${vehicleId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to update vehicle')
        }
        return data.vehicle
    }

    const deleteVehicle = async(token, vehicleId) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/vehicles/${vehicleId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to delete vehicle')
        }
        return true
    }

    const getVehicle = async(token, vehicleId) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/vehicles/${vehicleId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to fetch vehicle')
        }
        return data.vehicle
    }

    const listVehicles = async(token) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/vehicles`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to load vehicles')
        }
        return data.vehicles || []
    }

    const createMaintenanceRecord = async(token, payload) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/maintenance-records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to create maintenance record')
        }
        return data.record
    }

    const getMaintenanceRecord = async(token, recordId) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/maintenance-records/${recordId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to fetch maintenance record')
        }
        return data.record
    }

    const deleteMaintenanceRecord = async(token, recordId) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/maintenance-records/${recordId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to delete maintenance record')
        }
        return true
    }

    const getPreferences = async(token) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/preferences`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to load preferences')
        }
        return data.preferences
    }

    const savePreferences = async(token, payload) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/preferences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to save preferences')
        }
        return data.preferences
    }

    const listMaintenanceRecords = async(token, vehicleId, searchParams) => {
        if (!token) throw new Error('Missing auth token')
        const params = searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams()
        if (vehicleId && !params.has('vehicleId')) params.append('vehicleId', vehicleId)
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/maintenance-records?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to load maintenance records')
        }
        return data.records || []
    }

    const listReminders = async(token, vehicleId) => {
        if (!token) throw new Error('Missing auth token')
        const params = new URLSearchParams()
        if (vehicleId) params.append('vehicleId', vehicleId)
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/reminders?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to load schedules')
        }
        return data.reminders || []
    }

    const createReminder = async(token, payload) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/reminders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to save schedule')
        }
        return data.reminder
    }

    const updateReminder = async(token, reminderId, payload) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/reminders/${reminderId}`, {
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

    const getReminder = async(token, reminderId) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/reminders/${reminderId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to fetch schedule')
        }
        return data.reminder
    }

    const deleteReminder = async(token, reminderId) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/reminders/${reminderId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to delete schedule')
        }
        return true
    }

    return {
        createVehicle,
        updateVehicle,
        deleteVehicle,
        getVehicle,
        listVehicles,
        getPreferences,
        savePreferences,
        createMaintenanceRecord,
        getMaintenanceRecord,
        deleteMaintenanceRecord,
        listMaintenanceRecords,
        listReminders,
        createReminder,
        updateReminder,
        getReminder,
        deleteReminder
    }
}
