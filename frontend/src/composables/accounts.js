import { API_BASE_URL } from '@/constants/config'

export const useAccounts = () => {
    const listAccounts = async(token) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses/accounts`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to load accounts')
        }
        return data.accounts || data.data || []
    }

    const createAccount = async(token, payload) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses/accounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to create account')
        }
        return data.account
    }

    const updateAccount = async(token, accountId, payload) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses/accounts/${accountId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to update account')
        }
        return data.account
    }

    const deleteAccount = async(token, accountId) => {
        if (!token) throw new Error('Missing auth token')
        const res = await fetch(`${API_BASE_URL}/api/v1/expenses/accounts/${accountId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message || 'Unable to delete account')
        }
        return true
    }

    return {
        listAccounts,
        createAccount,
        updateAccount,
        deleteAccount
    }
}
