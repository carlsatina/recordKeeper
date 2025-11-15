import { ref } from 'vue'
import { API_BASE_URL } from '@/constants/config'

export const useProfiles = () => {
    const response = ref(null)
    const error = ref(null)

    const fetchProfiles = async (token) => {
        const bearer = `Bearer ${token}`
        try {
            const reqOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: bearer
                }
            }
            const res = await fetch(`${API_BASE_URL}/api/v1/profiles`, reqOptions)
            response.value = await res.json()
        } catch (err) {
            error.value = err
        }
        return { response, error }
    }

    return {
        fetchProfiles,
        response,
        error
    }
}

export const createProfile = async(token, payload) => {
    const response = ref(null)
    const error = ref(null)
    const bearer = `Bearer ${token}`
    try {
        const reqOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: bearer
            },
            body: JSON.stringify(payload)
        }
        const res = await fetch(`${API_BASE_URL}/api/v1/profiles`, reqOptions)
        response.value = await res.json()
    } catch (err) {
        error.value = err
    }
    return { response, error }
}
