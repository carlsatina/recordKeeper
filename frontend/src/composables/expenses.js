import { API_BASE_URL } from '@/constants/config'

export const useExpenses = () => {
    const listExpenses = async(token) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to load expenses')
        }
        return data.expenses || data.data || []
    }

    const createExpense = async(token, payload) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to create expense')
        }
        return data.expense
    }

    const deleteExpense = async(token, id) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to delete expense')
        }
        return true
    }

    const updateExpense = async(token, id, payload) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to update expense')
        }
        return data.expense
    }

    const createCategory = async(token, payload) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to create category')
        }
        return data.category
    }

    const listCategories = async(token) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses/categories`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to load categories')
        }
        return data.categories || data.data || []
    }

    return {
        listExpenses,
        createExpense,
        updateExpense,
        deleteExpense,
        createCategory,
        listCategories
    }
}
