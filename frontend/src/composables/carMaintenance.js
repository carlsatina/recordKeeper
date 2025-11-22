import { API_BASE_URL } from '@/constants/config'

export const useCarMaintenance = () => {
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

    return {
        createMaintenanceRecord
    }
}
