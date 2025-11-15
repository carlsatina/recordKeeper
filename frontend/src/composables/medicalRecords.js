import { ref } from 'vue'
import { API_BASE_URL } from '@/constants/config'

export const useMedicalRecords = () => {
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
            const res = await fetch(`${API_BASE_URL}/api/v1/medical-records?profileId=${profileId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (res.ok) {
                records.value = data.records || []
            } else {
                throw new Error(data.message || 'Unable to fetch medical records')
            }
        } catch (err) {
            error.value = err
        } finally {
            loading.value = false
        }
    }

    const createRecord = async(token, payload) => {
        const isFormData = payload instanceof FormData
        const headers = {
            Authorization: `Bearer ${token}`
        }
        if (!isFormData) {
            headers['Content-Type'] = 'application/json'
        }
        const res = await fetch(`${API_BASE_URL}/api/v1/medical-records`, {
            method: 'POST',
            headers,
            body: isFormData ? payload : JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to create record')
        }
        return data.record
    }

    const updateRecord = async(token, recordId, payload) => {
        const isFormData = payload instanceof FormData
        const headers = {
            Authorization: `Bearer ${token}`
        }
        if (!isFormData) {
            headers['Content-Type'] = 'application/json'
        }
        const res = await fetch(`${API_BASE_URL}/api/v1/medical-records/${recordId}`, {
            method: 'PUT',
            headers,
            body: isFormData ? payload : JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to update record')
        }
        return data.record
    }

    const deleteRecord = async(token, recordId) => {
        const res = await fetch(`${API_BASE_URL}/api/v1/medical-records/${recordId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to delete record')
        }
        return true
    }

    const fetchRecordById = async(token, recordId) => {
        if (!recordId) {
            throw new Error('Record ID is required')
        }
        const res = await fetch(`${API_BASE_URL}/api/v1/medical-records/${recordId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to fetch record details')
        }
        return data.record
    }

    return {
        records,
        loading,
        error,
        fetchRecords,
        createRecord,
        updateRecord,
        deleteRecord,
        fetchRecordById
    }
}
