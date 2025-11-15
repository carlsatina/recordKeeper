import { ref } from 'vue'
import { API_BASE_URL } from '@/constants/config'

export const useBloodSugar = () => {
    const records = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchRecords = async(token, profileId) => {
        if (!token || !profileId) {
            records.value = []
            return
        }
        loading.value = true
        error.value = null
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/vitals/blood-sugar?profileId=${profileId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (res.ok) {
                records.value = data.records || []
            } else {
                throw new Error(data.message || 'Unable to fetch blood sugar records')
            }
        } catch (err) {
            error.value = err
        } finally {
            loading.value = false
        }
    }

    const addRecord = async(token, payload) => {
        const res = await fetch(`${API_BASE_URL}/api/v1/vitals/blood-sugar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to save blood sugar record')
        }
        return data
    }

    const updateRecord = async(token, recordId, payload) => {
        const res = await fetch(`${API_BASE_URL}/api/v1/vitals/blood-sugar/${recordId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to update blood sugar record')
        }
        return data
    }

    const fetchRecordById = async(token, recordId) => {
        const res = await fetch(`${API_BASE_URL}/api/v1/vitals/blood-sugar/${recordId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to fetch blood sugar record')
        }
        return data.record
    }

    return {
        records,
        loading,
        error,
        fetchRecords,
        addRecord,
        updateRecord,
        fetchRecordById
    }
}
