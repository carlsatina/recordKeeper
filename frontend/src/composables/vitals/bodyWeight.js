import { ref } from 'vue'
import { API_BASE_URL } from '@/constants/config'

export const useBodyWeight = () => {
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
            const res = await fetch(`${API_BASE_URL}/api/v1/vitals/body-weight?profileId=${profileId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (res.ok) {
                records.value = data.records || []
            } else {
                throw new Error(data.message || 'Unable to fetch body weight records')
            }
        } catch (err) {
            error.value = err
        } finally {
            loading.value = false
        }
    }

    const addRecord = async(token, payload) => {
        const res = await fetch(`${API_BASE_URL}/api/v1/vitals/body-weight`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to save body weight record')
        }
        return data
    }

    const updateRecord = async(token, recordId, payload) => {
        const res = await fetch(`${API_BASE_URL}/api/v1/vitals/body-weight/${recordId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to update body weight record')
        }
        return data
    }

    const fetchRecordById = async(token, recordId) => {
        const res = await fetch(`${API_BASE_URL}/api/v1/vitals/body-weight/${recordId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to fetch body weight record')
        }
        return data.record
    }

    const deleteRecord = async(token, recordId) => {
        const res = await fetch(`${API_BASE_URL}/api/v1/vitals/body-weight/${recordId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.message || 'Unable to delete body weight record')
        }
        return true
    }

    return {
        records,
        loading,
        error,
        fetchRecords,
        addRecord,
        updateRecord,
        fetchRecordById,
        deleteRecord
    }
}
