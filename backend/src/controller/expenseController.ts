import prisma from '../../lib/prisma'
import { ExtendedRequest } from '../../extendedRequest'
import { ExpenseFrequency, PaymentMethod } from '@prisma/client'
import { Response } from 'express'

const ensureUser = (req: ExtendedRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ status: 401, message: 'Unauthorized' })
        return null
    }
    return req.user
}

const normalizeExpenseFrequency = (value: unknown): ExpenseFrequency => {
    const valid = Object.values(ExpenseFrequency) as string[]
    if (typeof value === 'string') {
        const normalized = value.toUpperCase().replace(/[\s-]+/g, '_')
        if (valid.includes(normalized)) return normalized as ExpenseFrequency
    }
    return ExpenseFrequency.ONE_TIME
}

const normalizePaymentMethod = (value: unknown): PaymentMethod => {
    const valid = Object.values(PaymentMethod) as string[]
    if (typeof value === 'string') {
        const normalized = value.toUpperCase().replace(/[\s-]+/g, '_')
        if (valid.includes(normalized)) return normalized as PaymentMethod
    }
    return PaymentMethod.CASH
}

const parseStringArray = (value: unknown): string[] | null => {
    if (typeof value === 'undefined') return null
    if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean)
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed.length) return []
        try {
            const parsed = JSON.parse(trimmed)
            if (Array.isArray(parsed)) return parsed.map(v => String(v).trim()).filter(Boolean)
        } catch {
            // ignore
        }
        return trimmed.split(',').map(v => v.trim()).filter(Boolean)
    }
    return []
}

const resolveCategory = async(userId: string, categoryId?: string | null) => {
    if (!categoryId) return null
    return prisma.expenseCategory.findFirst({
        where: { id: categoryId, userId }
    })
}

// Expense CRUD
export const listExpenses = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { categoryId, startDate, endDate, isRecurring } = req.query || {}
    const where: any = { userId: user.id }

    if (categoryId) where.categoryId = String(categoryId)
    if (typeof isRecurring !== 'undefined') {
        where.isRecurring = String(isRecurring) === 'true'
    }
    if (startDate || endDate) {
        where.expenseDate = {}
        if (startDate) where.expenseDate.gte = new Date(String(startDate))
        if (endDate) where.expenseDate.lte = new Date(String(endDate))
    }

    const expenses = await prisma.expense.findMany({
        where,
        orderBy: { expenseDate: 'desc' }
    })

    res.status(200).json({ status: 200, expenses })
}

export const getExpense = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'Expense id is required' })

    const expense = await prisma.expense.findFirst({
        where: { id, userId: user.id }
    })
    if (!expense) return res.status(404).json({ status: 404, message: 'Expense not found' })
    res.status(200).json({ status: 200, expense })
}

export const createExpense = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const {
        title,
        description,
        amount,
        currency,
        expenseDate,
        categoryId,
        subcategory,
        tags,
        paymentMethod,
        paymentAccount,
        vendor,
        location,
        receiptUrl,
        notes,
        isRecurring,
        frequency,
        recurringUntil
    } = req.body || {}

    const parsedAmount = Number(amount)
    if (!title || Number.isNaN(parsedAmount)) {
        return res.status(400).json({ status: 400, message: 'title and amount are required' })
    }

    const category = categoryId ? await resolveCategory(user.id, categoryId) : null
    if (categoryId && !category) {
        return res.status(404).json({ status: 404, message: 'Category not found for current user' })
    }

    const expense = await prisma.expense.create({
        data: {
            userId: user.id,
            title,
            description: description || null,
            amount: parsedAmount,
            currency: currency || 'USD',
            expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
            categoryId: category?.id || null,
            subcategory: subcategory || null,
            tags: parseStringArray(tags) ?? [],
            paymentMethod: normalizePaymentMethod(paymentMethod),
            paymentAccount: paymentAccount || null,
            vendor: vendor || null,
            location: location || null,
            receiptUrl: receiptUrl || null,
            notes: notes || null,
            isRecurring: Boolean(isRecurring),
            frequency: normalizeExpenseFrequency(frequency),
            recurringUntil: recurringUntil ? new Date(recurringUntil) : null
        }
    })

    res.status(201).json({ status: 201, expense })
}

export const updateExpense = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'Expense id is required' })

    const existing = await prisma.expense.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Expense not found' })

    const {
        title,
        description,
        amount,
        currency,
        expenseDate,
        categoryId,
        subcategory,
        tags,
        paymentMethod,
        paymentAccount,
        vendor,
        location,
        receiptUrl,
        notes,
        isRecurring,
        frequency,
        recurringUntil
    } = req.body || {}

    if (categoryId) {
        const category = await resolveCategory(user.id, categoryId)
        if (!category) return res.status(404).json({ status: 404, message: 'Category not found for current user' })
    }

    const data: any = {
        title: title ?? existing.title,
        description: description ?? existing.description,
        amount: amount !== undefined ? Number(amount) : existing.amount,
        currency: currency || existing.currency,
        expenseDate: expenseDate ? new Date(expenseDate) : existing.expenseDate,
        categoryId: categoryId !== undefined ? categoryId || null : existing.categoryId,
        subcategory: subcategory ?? existing.subcategory,
        paymentMethod: paymentMethod ? normalizePaymentMethod(paymentMethod) : existing.paymentMethod,
        paymentAccount: paymentAccount ?? existing.paymentAccount,
        vendor: vendor ?? existing.vendor,
        location: location ?? existing.location,
        receiptUrl: receiptUrl ?? existing.receiptUrl,
        notes: notes ?? existing.notes,
        isRecurring: typeof isRecurring === 'undefined' ? existing.isRecurring : Boolean(isRecurring),
        frequency: frequency ? normalizeExpenseFrequency(frequency) : existing.frequency,
        recurringUntil: recurringUntil ? new Date(recurringUntil) : existing.recurringUntil
    }
    const parsedTags = parseStringArray(tags)
    if (parsedTags !== null) data.tags = parsedTags

    const expense = await prisma.expense.update({ where: { id }, data })
    res.status(200).json({ status: 200, expense })
}

export const deleteExpense = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'Expense id is required' })

    const existing = await prisma.expense.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Expense not found' })

    await prisma.expense.delete({ where: { id } })
    res.status(200).json({ status: 200, message: 'Expense deleted' })
}

// Category CRUD
export const listCategories = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const categories = await prisma.expenseCategory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    })
    res.status(200).json({ status: 200, categories })
}

export const createCategory = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { name, color, icon, isDefault } = req.body || {}
    if (!name) return res.status(400).json({ status: 400, message: 'name is required' })

    const category = await prisma.expenseCategory.create({
        data: {
            userId: user.id,
            name,
            color: color || null,
            icon: icon || null,
            isDefault: Boolean(isDefault)
        }
    })
    res.status(201).json({ status: 201, category })
}

export const updateCategory = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    const { name, color, icon, isDefault } = req.body || {}
    if (!id) return res.status(400).json({ status: 400, message: 'category id is required' })

    const existing = await prisma.expenseCategory.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Category not found' })

    const category = await prisma.expenseCategory.update({
        where: { id },
        data: {
            name: name ?? existing.name,
            color: color ?? existing.color,
            icon: icon ?? existing.icon,
            isDefault: typeof isDefault === 'undefined' ? existing.isDefault : Boolean(isDefault)
        }
    })
    res.status(200).json({ status: 200, category })
}

export const deleteCategory = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'category id is required' })

    const existing = await prisma.expenseCategory.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Category not found' })

    await prisma.expenseCategory.delete({ where: { id } })
    res.status(200).json({ status: 200, message: 'Category deleted' })
}

// Budget CRUD
export const listBudgets = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const budgets = await prisma.budget.findMany({
        where: { userId: user.id },
        orderBy: { startDate: 'desc' }
    })
    res.status(200).json({ status: 200, budgets })
}

export const createBudget = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const {
        name,
        amount,
        currency,
        startDate,
        endDate,
        categoryId,
        alertThreshold,
        alertEnabled,
        active
    } = req.body || {}

    const parsedAmount = Number(amount)
    if (!name || Number.isNaN(parsedAmount) || !startDate || !endDate) {
        return res.status(400).json({ status: 400, message: 'name, amount, startDate and endDate are required' })
    }

    if (categoryId) {
        const category = await resolveCategory(user.id, categoryId)
        if (!category) return res.status(404).json({ status: 404, message: 'Category not found for current user' })
    }

    const budget = await prisma.budget.create({
        data: {
            userId: user.id,
            name,
            amount: parsedAmount,
            currency: currency || 'USD',
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            categoryId: categoryId || null,
            alertThreshold: alertThreshold !== undefined ? Number(alertThreshold) : null,
            alertEnabled: typeof alertEnabled === 'undefined' ? true : Boolean(alertEnabled),
            active: typeof active === 'undefined' ? true : Boolean(active)
        }
    })

    res.status(201).json({ status: 201, budget })
}

export const updateBudget = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'budget id is required' })

    const existing = await prisma.budget.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Budget not found' })

    const {
        name,
        amount,
        currency,
        startDate,
        endDate,
        categoryId,
        alertThreshold,
        alertEnabled,
        active
    } = req.body || {}

    if (categoryId) {
        const category = await resolveCategory(user.id, categoryId)
        if (!category) return res.status(404).json({ status: 404, message: 'Category not found for current user' })
    }

    const budget = await prisma.budget.update({
        where: { id },
        data: {
            name: name ?? existing.name,
            amount: amount !== undefined ? Number(amount) : existing.amount,
            currency: currency || existing.currency,
            startDate: startDate ? new Date(startDate) : existing.startDate,
            endDate: endDate ? new Date(endDate) : existing.endDate,
            categoryId: categoryId !== undefined ? categoryId || null : existing.categoryId,
            alertThreshold: alertThreshold !== undefined ? Number(alertThreshold) : existing.alertThreshold,
            alertEnabled: typeof alertEnabled === 'undefined' ? existing.alertEnabled : Boolean(alertEnabled),
            active: typeof active === 'undefined' ? existing.active : Boolean(active)
        }
    })

    res.status(200).json({ status: 200, budget })
}

export const deleteBudget = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'budget id is required' })

    const existing = await prisma.budget.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Budget not found' })

    await prisma.budget.delete({ where: { id } })
    res.status(200).json({ status: 200, message: 'Budget deleted' })
}

// Financial goals CRUD
export const listFinancialGoals = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const goals = await prisma.financialGoal.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    })
    res.status(200).json({ status: 200, goals })
}

export const createFinancialGoal = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { title, description, targetAmount, currentAmount, currency, targetDate, color, icon } = req.body || {}

    const parsedTarget = Number(targetAmount)
    if (!title || Number.isNaN(parsedTarget)) {
        return res.status(400).json({ status: 400, message: 'title and targetAmount are required' })
    }

    const goal = await prisma.financialGoal.create({
        data: {
            userId: user.id,
            title,
            description: description || null,
            targetAmount: parsedTarget,
            currentAmount: currentAmount !== undefined ? Number(currentAmount) : 0,
            currency: currency || 'USD',
            targetDate: targetDate ? new Date(targetDate) : null,
            color: color || null,
            icon: icon || null
        }
    })

    res.status(201).json({ status: 201, goal })
}

export const updateFinancialGoal = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'goal id is required' })

    const existing = await prisma.financialGoal.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Goal not found' })

    const { title, description, targetAmount, currentAmount, currency, targetDate, color, icon, completed } = req.body || {}

    const goal = await prisma.financialGoal.update({
        where: { id },
        data: {
            title: title ?? existing.title,
            description: description ?? existing.description,
            targetAmount: targetAmount !== undefined ? Number(targetAmount) : existing.targetAmount,
            currentAmount: currentAmount !== undefined ? Number(currentAmount) : existing.currentAmount,
            currency: currency || existing.currency,
            targetDate: targetDate ? new Date(targetDate) : existing.targetDate,
            color: color ?? existing.color,
            icon: icon ?? existing.icon,
            completed: typeof completed === 'undefined' ? existing.completed : Boolean(completed),
            completedAt: typeof completed === 'undefined'
                ? existing.completedAt
                : Boolean(completed)
                    ? existing.completedAt || new Date()
                    : null
        }
    })

    res.status(200).json({ status: 200, goal })
}

export const deleteFinancialGoal = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'goal id is required' })

    const existing = await prisma.financialGoal.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Goal not found' })

    await prisma.financialGoal.delete({ where: { id } })
    res.status(200).json({ status: 200, message: 'Goal deleted' })
}

// Recurring schedules
export const listExpenseSchedules = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const schedules = await prisma.expenseSchedule.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    })
    res.status(200).json({ status: 200, schedules })
}

export const createExpenseSchedule = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const {
        title,
        amount,
        currency,
        startDate,
        endDate,
        expenseId,
        frequency,
        nextRunAt,
        lastRunAt,
        active
    } = req.body || {}

    const parsedAmount = Number(amount)
    if (!title || Number.isNaN(parsedAmount) || !startDate) {
        return res.status(400).json({ status: 400, message: 'title, amount, startDate are required' })
    }

    if (expenseId) {
        const expense = await prisma.expense.findFirst({ where: { id: expenseId, userId: user.id } })
        if (!expense) return res.status(404).json({ status: 404, message: 'Linked expense not found' })
    }

    const schedule = await prisma.expenseSchedule.create({
        data: {
            userId: user.id,
            expenseId: expenseId || null,
            title,
            amount: parsedAmount,
            currency: currency || 'USD',
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            frequency: normalizeExpenseFrequency(frequency || ExpenseFrequency.MONTHLY),
            nextRunAt: nextRunAt ? new Date(nextRunAt) : null,
            lastRunAt: lastRunAt ? new Date(lastRunAt) : null,
            active: typeof active === 'undefined' ? true : Boolean(active)
        }
    })

    res.status(201).json({ status: 201, schedule })
}

export const updateExpenseSchedule = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'schedule id is required' })

    const existing = await prisma.expenseSchedule.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Schedule not found' })

    const {
        title,
        amount,
        currency,
        startDate,
        endDate,
        expenseId,
        frequency,
        nextRunAt,
        lastRunAt,
        active
    } = req.body || {}

    if (expenseId) {
        const expense = await prisma.expense.findFirst({ where: { id: expenseId, userId: user.id } })
        if (!expense) return res.status(404).json({ status: 404, message: 'Linked expense not found' })
    }

    const schedule = await prisma.expenseSchedule.update({
        where: { id },
        data: {
            title: title ?? existing.title,
            amount: amount !== undefined ? Number(amount) : existing.amount,
            currency: currency || existing.currency,
            startDate: startDate ? new Date(startDate) : existing.startDate,
            endDate: endDate ? new Date(endDate) : existing.endDate,
            expenseId: expenseId !== undefined ? expenseId || null : existing.expenseId,
            frequency: frequency ? normalizeExpenseFrequency(frequency) : existing.frequency,
            nextRunAt: nextRunAt ? new Date(nextRunAt) : existing.nextRunAt,
            lastRunAt: lastRunAt ? new Date(lastRunAt) : existing.lastRunAt,
            active: typeof active === 'undefined' ? existing.active : Boolean(active)
        }
    })

    res.status(200).json({ status: 200, schedule })
}

export const deleteExpenseSchedule = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'schedule id is required' })

    const existing = await prisma.expenseSchedule.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Schedule not found' })

    await prisma.expenseSchedule.delete({ where: { id } })
    res.status(200).json({ status: 200, message: 'Schedule deleted' })
}

// Subscriptions
export const listSubscriptions = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const subscriptions = await prisma.subscription.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    })
    res.status(200).json({ status: 200, subscriptions })
}

export const createSubscription = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const {
        title,
        description,
        amount,
        currency,
        billingCycle,
        nextBillingDate,
        lastBilledAt,
        categoryId,
        vendor,
        paymentMethod,
        paymentAccount,
        active,
        cancelAt,
        notes
    } = req.body || {}

    const parsedAmount = Number(amount)
    if (!title || Number.isNaN(parsedAmount)) {
        return res.status(400).json({ status: 400, message: 'title and amount are required' })
    }

    if (categoryId) {
        const category = await resolveCategory(user.id, categoryId)
        if (!category) return res.status(404).json({ status: 404, message: 'Category not found for current user' })
    }

    const subscription = await prisma.subscription.create({
        data: {
            userId: user.id,
            title,
            description: description || null,
            amount: parsedAmount,
            currency: currency || 'USD',
            billingCycle: normalizeExpenseFrequency(billingCycle || ExpenseFrequency.MONTHLY),
            nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : null,
            lastBilledAt: lastBilledAt ? new Date(lastBilledAt) : null,
            categoryId: categoryId || null,
            vendor: vendor || null,
            paymentMethod: normalizePaymentMethod(paymentMethod),
            paymentAccount: paymentAccount || null,
            active: typeof active === 'undefined' ? true : Boolean(active),
            cancelAt: cancelAt ? new Date(cancelAt) : null,
            notes: notes || null
        }
    })

    res.status(201).json({ status: 201, subscription })
}

export const updateSubscription = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'subscription id is required' })

    const existing = await prisma.subscription.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Subscription not found' })

    const {
        title,
        description,
        amount,
        currency,
        billingCycle,
        nextBillingDate,
        lastBilledAt,
        categoryId,
        vendor,
        paymentMethod,
        paymentAccount,
        active,
        cancelAt,
        notes
    } = req.body || {}

    if (categoryId) {
        const category = await resolveCategory(user.id, categoryId)
        if (!category) return res.status(404).json({ status: 404, message: 'Category not found for current user' })
    }

    const subscription = await prisma.subscription.update({
        where: { id },
        data: {
            title: title ?? existing.title,
            description: description ?? existing.description,
            amount: amount !== undefined ? Number(amount) : existing.amount,
            currency: currency || existing.currency,
            billingCycle: billingCycle ? normalizeExpenseFrequency(billingCycle) : existing.billingCycle,
            nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : existing.nextBillingDate,
            lastBilledAt: lastBilledAt ? new Date(lastBilledAt) : existing.lastBilledAt,
            categoryId: categoryId !== undefined ? categoryId || null : existing.categoryId,
            vendor: vendor ?? existing.vendor,
            paymentMethod: paymentMethod ? normalizePaymentMethod(paymentMethod) : existing.paymentMethod,
            paymentAccount: paymentAccount ?? existing.paymentAccount,
            active: typeof active === 'undefined' ? existing.active : Boolean(active),
            cancelAt: cancelAt ? new Date(cancelAt) : existing.cancelAt,
            notes: notes ?? existing.notes
        }
    })

    res.status(200).json({ status: 200, subscription })
}

export const deleteSubscription = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'subscription id is required' })

    const existing = await prisma.subscription.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Subscription not found' })

    await prisma.subscription.delete({ where: { id } })
    res.status(200).json({ status: 200, message: 'Subscription deleted' })
}

// Accounts
export const listAccounts = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const accounts = await prisma.account.findMany({
        where: { userId: user.id, archived: false },
        orderBy: { createdAt: 'desc' }
    })
    res.status(200).json({ status: 200, accounts })
}

export const createAccount = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { name, institution, type, currency, balance, isDefault, notes } = req.body || {}
    if (!name) return res.status(400).json({ status: 400, message: 'Account name is required' })

    const account = await prisma.$transaction(async(tx) => {
        if (isDefault) {
            await tx.account.updateMany({
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false }
            })
        }
        return tx.account.create({
            data: {
                userId: user.id,
                name,
                institution: institution || null,
                type: type || null,
                currency: currency || 'PHP',
                balance: balance !== undefined ? Number(balance) : 0,
                isDefault: Boolean(isDefault),
                notes: notes || null
            }
        })
    })
    res.status(201).json({ status: 201, account })
}

export const updateAccount = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'account id is required' })
    const existing = await prisma.account.findFirst({ where: { id, userId: user.id, archived: false } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Account not found' })

    const { name, institution, type, currency, balance, isDefault, notes, archived } = req.body || {}

    const account = await prisma.$transaction(async(tx) => {
        if (typeof isDefault !== 'undefined' && isDefault) {
            await tx.account.updateMany({
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false }
            })
        }
        return tx.account.update({
            where: { id },
            data: {
                name: name ?? existing.name,
                institution: institution ?? existing.institution,
                type: type ?? existing.type,
                currency: currency || existing.currency,
                balance: balance !== undefined ? Number(balance) : existing.balance,
                isDefault: typeof isDefault === 'undefined' ? existing.isDefault : Boolean(isDefault),
                notes: notes ?? existing.notes,
                archived: typeof archived === 'undefined' ? existing.archived : Boolean(archived)
            }
        })
    })
    res.status(200).json({ status: 200, account })
}

export const deleteAccount = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'account id is required' })
    const existing = await prisma.account.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Account not found' })

    await prisma.account.delete({ where: { id } })
    res.status(200).json({ status: 200, message: 'Account deleted' })
}

// Currencies
export const listCurrencies = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const currencies = await prisma.userCurrency.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    })
    res.status(200).json({ status: 200, currencies })
}

export const createCurrency = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { code, name, symbol, isDefault } = req.body || {}
    if (!code) return res.status(400).json({ status: 400, message: 'Currency code is required' })
    const normalizedCode = String(code).toUpperCase()
    const currency = await prisma.$transaction(async(tx) => {
        if (isDefault) {
            await tx.userCurrency.updateMany({
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false }
            })
            await tx.userPreference.updateMany({
                where: { userId: user.id },
                data: { currency: normalizedCode }
            })
        }
        return tx.userCurrency.create({
            data: {
                userId: user.id,
                code: normalizedCode,
                name: name || null,
                symbol: symbol || null,
                isDefault: Boolean(isDefault)
            }
        })
    })
    res.status(201).json({ status: 201, currency })
}

export const updateCurrency = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'currency id is required' })
    const existing = await prisma.userCurrency.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Currency not found' })

    const { code, name, symbol, isDefault } = req.body || {}
    const normalizedCode = code ? String(code).toUpperCase() : existing.code

    const currency = await prisma.$transaction(async(tx) => {
        if (typeof isDefault !== 'undefined' && isDefault) {
            await tx.userCurrency.updateMany({
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false }
            })
            await tx.userPreference.updateMany({
                where: { userId: user.id },
                data: { currency: normalizedCode }
            })
        }
        return tx.userCurrency.update({
            where: { id },
            data: {
                code: normalizedCode,
                name: name ?? existing.name,
                symbol: symbol ?? existing.symbol,
                isDefault: typeof isDefault === 'undefined' ? existing.isDefault : Boolean(isDefault)
            }
        })
    })

    res.status(200).json({ status: 200, currency })
}

export const deleteCurrency = async(req: ExtendedRequest, res: Response) => {
    const user = ensureUser(req, res)
    if (!user) return
    const { id } = req.params
    if (!id) return res.status(400).json({ status: 400, message: 'currency id is required' })
    const existing = await prisma.userCurrency.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ status: 404, message: 'Currency not found' })

    await prisma.userCurrency.delete({ where: { id } })
    res.status(200).json({ status: 200, message: 'Currency deleted' })
}
