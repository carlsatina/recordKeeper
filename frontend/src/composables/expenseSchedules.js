import { API_BASE_URL } from '@/constants/config'

export const useExpenseSchedules = () => {
    const listExpenseSchedules = async(token) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses/schedules`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Unable to load expense schedules')
        return data.schedules || data.data || []
    }

    const createExpenseSchedule = async(token, payload) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses/schedules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Unable to create expense schedule')
        return data.schedule
    }

    const updateExpenseSchedule = async(token, id, payload) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses/schedules/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Unable to update expense schedule')
        return data.schedule
    }

    const deleteExpenseSchedule = async(token, id) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses/schedules/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Unable to delete expense schedule')
        return true
    }

    const markExpenseSchedulePaid = async(token, id) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses/schedules/${id}/pay`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Unable to mark schedule paid')
        return data
    }

    return {
        listExpenseSchedules,
        createExpenseSchedule,
        updateExpenseSchedule,
        deleteExpenseSchedule,
        markExpenseSchedulePaid
    }
}
