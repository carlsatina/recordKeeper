<template>
<div class="page">
    <header class="top-nav">
        <button class="icon-btn" @click="router.back()">
            <mdicon name="chevron-left" size="24" />
        </button>
        <div class="title-group">
            <p class="eyebrow">Wallet</p>
            <h3>Accounts & Currency</h3>
        </div>
        <button class="icon-btn ghost" @click="openAddAccount">
            <mdicon name="plus-circle-outline" size="24" />
        </button>
    </header>

    <main class="content">
        <section class="hero">
            <div>
                <p class="label">Default currency</p>
                <h2>{{ defaultCurrency || 'PHP' }}</h2>
                <p class="sub">Used for budgets, insights, and conversions</p>
            </div>
            <button class="primary-chip ghost-chip" @click="openAddCurrency">
                <mdicon name="pencil-outline" size="18" />
                <span>Manage</span>
            </button>
        </section>

        <section class="section">
            <div class="section-head">
                <h4>Currencies</h4>
                <button class="text-btn" @click="openAddCurrency">Add</button>
            </div>
            <div class="list" v-if="currencies.length">
                <div class="item" v-for="currency in currencies" :key="currency.id">
                    <div>
                        <p class="item-title">{{ currency.code }}</p>
                        <p class="item-sub">{{ currency.name || 'Custom currency' }}</p>
                    </div>
                    <div class="item-actions">
                        <span v-if="currency.isDefault" class="pill safe">Default</span>
                        <button class="icon-btn ghost" @click="setCurrencyDefault(currency)">
                            <mdicon name="star-outline" size="18" />
                        </button>
                        <button class="icon-btn ghost danger" @click="removeCurrency(currency)">
                            <mdicon name="trash-can-outline" size="18" />
                        </button>
                    </div>
                </div>
            </div>
            <p v-else class="empty">No currencies yet. Add PHP or another code.</p>
        </section>

        <section class="section">
            <div class="section-head">
                <h4>Accounts</h4>
                <button class="text-btn" @click="openAddAccount">Add</button>
            </div>
            <div class="list" v-if="accounts.length">
                <div class="item" v-for="acct in accounts" :key="acct.id">
                    <div class="icon-circle teal">
                        <mdicon name="credit-card-outline" size="20" />
                    </div>
                    <div class="item-main">
                        <p class="item-title">{{ acct.name }}</p>
                        <p class="item-sub">{{ acct.institution || 'Personal' }} • {{ acct.currency }}</p>
                    </div>
                    <div class="item-actions">
                        <span v-if="acct.isDefault" class="pill safe">Default</span>
                        <button class="icon-btn ghost" @click="setAccountDefault(acct)">
                            <mdicon name="star-outline" size="18" />
                        </button>
                        <button class="icon-btn ghost danger" @click="removeAccount(acct)">
                            <mdicon name="trash-can-outline" size="18" />
                        </button>
                    </div>
                </div>
            </div>
            <p v-else class="empty">No accounts yet. Add your cards, banks, or cash.</p>
        </section>
    </main>

    <div v-if="showAccountSheet" class="overlay">
        <div class="sheet">
            <div class="sheet-head">
                <div class="pill ghost">Add account</div>
                <button class="icon-btn ghost" @click="closeAccountSheet">
                    <mdicon name="close" size="22" />
                </button>
            </div>
            <form class="form" @submit.prevent>
                <label class="field">
                    <span>Name</span>
                    <input v-model="accountForm.name" type="text" placeholder="e.g. Sapphire Visa" />
                </label>
                <label class="field">
                    <span>Institution</span>
                    <input v-model="accountForm.institution" type="text" placeholder="e.g. Chase" />
                </label>
                <label class="field">
                    <span>Type</span>
                    <input v-model="accountForm.type" type="text" placeholder="Card, Bank, Cash" />
                </label>
                <label class="field">
                    <span>Currency</span>
                    <input v-model="accountForm.currency" type="text" placeholder="PHP" />
                </label>
                <label class="field">
                    <span>Balance (optional)</span>
                    <input v-model.number="accountForm.balance" type="number" step="0.01" placeholder="0.00" />
                </label>
                <label class="checkbox">
                    <input type="checkbox" v-model="accountForm.isDefault" />
                    <span>Set as default</span>
                </label>
                <p v-if="accountError" class="error-text">{{ accountError }}</p>
                <div class="actions">
                    <button type="button" class="text-btn" @click="closeAccountSheet">Cancel</button>
                    <button type="button" class="primary-btn solid" :disabled="accountSaving" @click="handleAccountSave">
                        {{ accountSaving ? 'Saving...' : 'Save account' }}
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div v-if="showCurrencySheet" class="overlay">
        <div class="sheet">
            <div class="sheet-head">
                <div class="pill ghost">Add currency</div>
                <button class="icon-btn ghost" @click="closeCurrencySheet">
                    <mdicon name="close" size="22" />
                </button>
            </div>
            <form class="form" @submit.prevent>
                <label class="field">
                    <span>Code</span>
                    <input v-model="currencyForm.code" type="text" placeholder="PHP" />
                </label>
                <label class="field">
                    <span>Name</span>
                    <input v-model="currencyForm.name" type="text" placeholder="Philippine Peso" />
                </label>
                <label class="field">
                    <span>Symbol</span>
                    <input v-model="currencyForm.symbol" type="text" placeholder="₱" />
                </label>
                <label class="checkbox">
                    <input type="checkbox" v-model="currencyForm.isDefault" />
                    <span>Set as default currency</span>
                </label>
                <p v-if="currencyError" class="error-text">{{ currencyError }}</p>
                <div class="actions">
                    <button type="button" class="text-btn" @click="closeCurrencySheet">Cancel</button>
                    <button type="button" class="primary-btn solid" :disabled="currencySaving" @click="handleCurrencySave">
                        {{ currencySaving ? 'Saving...' : 'Save currency' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAccounts } from '@/composables/accounts'
import { useCurrencies } from '@/composables/currencies'

export default {
    name: "ManageAccountsMobile",
    setup() {
        const router = useRouter()
        const { listAccounts, createAccount, updateAccount, deleteAccount } = useAccounts()
        const { listCurrencies, createCurrency, updateCurrency, deleteCurrency } = useCurrencies()

        const accounts = ref([])
        const currencies = ref([])
        const defaultCurrency = ref('PHP')
        const accountError = ref('')
        const accountSaving = ref(false)
        const currencyError = ref('')
        const currencySaving = ref(false)
        const showAccountSheet = ref(false)
        const showCurrencySheet = ref(false)

        const accountForm = ref({
            name: '',
            institution: '',
            type: '',
            currency: 'PHP',
            balance: 0,
            isDefault: false
        })

        const currencyForm = ref({
            code: 'PHP',
            name: 'Philippine Peso',
            symbol: '₱',
            isDefault: true
        })

        const loadData = async() => {
            const token = localStorage.getItem('token')
            if (!token) return
            try {
                const [acctList, curList] = await Promise.all([
                    listAccounts(token),
                    listCurrencies(token)
                ])
                accounts.value = acctList
                currencies.value = curList
                const def = curList.find(c => c.isDefault)
                defaultCurrency.value = def?.code || defaultCurrency.value
            } catch (err) {
                // keep quiet for static demo
                console.error(err)
            }
        }

        const resetAccountForm = () => {
            accountForm.value = {
                name: '',
                institution: '',
                type: '',
                currency: defaultCurrency.value || 'PHP',
                balance: 0,
                isDefault: false
            }
            accountError.value = ''
        }

        const resetCurrencyForm = () => {
            currencyForm.value = {
                code: defaultCurrency.value || 'PHP',
                name: 'Philippine Peso',
                symbol: '₱',
                isDefault: currencies.value.length === 0
            }
            currencyError.value = ''
        }

        const openAddAccount = () => {
            resetAccountForm()
            showAccountSheet.value = true
        }

        const closeAccountSheet = () => {
            showAccountSheet.value = false
        }

        const openAddCurrency = () => {
            resetCurrencyForm()
            showCurrencySheet.value = true
        }

        const closeCurrencySheet = () => {
            showCurrencySheet.value = false
        }

        const handleAccountSave = async() => {
            accountError.value = ''
            if (!accountForm.value.name.trim()) {
                accountError.value = 'Account name is required.'
                return
            }
            const token = localStorage.getItem('token')
            if (!token) {
                accountError.value = 'Not logged in.'
                return
            }
            accountSaving.value = true
            try {
                const account = await createAccount(token, {
                    name: accountForm.value.name.trim(),
                    institution: accountForm.value.institution || null,
                    type: accountForm.value.type || null,
                    currency: accountForm.value.currency || 'PHP',
                    balance: accountForm.value.balance || 0,
                    isDefault: accountForm.value.isDefault
                })
                accounts.value = [account, ...accounts.value]
                if (account.isDefault) defaultCurrency.value = account.currency
                closeAccountSheet()
            } catch (err) {
                accountError.value = err?.message || 'Unable to save account.'
            } finally {
                accountSaving.value = false
            }
        }

        const handleCurrencySave = async() => {
            currencyError.value = ''
            if (!currencyForm.value.code.trim()) {
                currencyError.value = 'Currency code is required.'
                return
            }
            const token = localStorage.getItem('token')
            if (!token) {
                currencyError.value = 'Not logged in.'
                return
            }
            currencySaving.value = true
            try {
                const currency = await createCurrency(token, {
                    code: currencyForm.value.code.trim().toUpperCase(),
                    name: currencyForm.value.name || null,
                    symbol: currencyForm.value.symbol || null,
                    isDefault: currencyForm.value.isDefault
                })
                currencies.value = [currency, ...currencies.value]
                if (currency.isDefault) defaultCurrency.value = currency.code
                closeCurrencySheet()
            } catch (err) {
                currencyError.value = err?.message || 'Unable to save currency.'
            } finally {
                currencySaving.value = false
            }
        }

        const setAccountDefault = async(account) => {
            const token = localStorage.getItem('token')
            if (!token) return
            try {
                const updated = await updateAccount(token, account.id, { isDefault: true })
                accounts.value = accounts.value.map(a => a.id === updated.id ? updated : { ...a, isDefault: false })
                if (updated.currency) defaultCurrency.value = updated.currency
            } catch (err) {
                console.error(err)
            }
        }

        const removeAccount = async(account) => {
            const token = localStorage.getItem('token')
            if (!token) return
            try {
                await deleteAccount(token, account.id)
                accounts.value = accounts.value.filter(a => a.id !== account.id)
            } catch (err) {
                console.error(err)
            }
        }

        const setCurrencyDefault = async(currency) => {
            const token = localStorage.getItem('token')
            if (!token) return
            try {
                const updated = await updateCurrency(token, currency.id, { isDefault: true })
                currencies.value = currencies.value.map(c => c.id === updated.id ? updated : { ...c, isDefault: false })
                defaultCurrency.value = updated.code
            } catch (err) {
                console.error(err)
            }
        }

        const removeCurrency = async(currency) => {
            const token = localStorage.getItem('token')
            if (!token) return
            try {
                await deleteCurrency(token, currency.id)
                currencies.value = currencies.value.filter(c => c.id !== currency.id)
                if (currency.isDefault) {
                    const next = currencies.value[0]
                    defaultCurrency.value = next?.code || 'PHP'
                }
            } catch (err) {
                console.error(err)
            }
        }

        onMounted(loadData)

        return {
            router,
            accounts,
            currencies,
            defaultCurrency,
            showAccountSheet,
            showCurrencySheet,
            accountForm,
            currencyForm,
            accountError,
            currencyError,
            accountSaving,
            currencySaving,
            openAddAccount,
            openAddCurrency,
            closeAccountSheet,
            closeCurrencySheet,
            handleAccountSave,
            handleCurrencySave,
            setAccountDefault,
            setCurrencyDefault,
            removeAccount,
            removeCurrency
        }
    }
}
</script>

<style scoped>
.page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #f5f7fb, #e8ecf6);
    color: #0f172a;
}

.top-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
}

.icon-btn {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    border: none;
    background: #e7ecf3;
    color: #0f172a;
}

.icon-btn.ghost {
    background: transparent;
}

.icon-btn.danger {
    color: #e11d48;
}

.title-group h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
}

.eyebrow {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: #64748b;
}

.content {
    flex: 1;
    padding: 10px 14px 20px;
}

.hero {
    background: linear-gradient(135deg, #0f172a, #1e293b);
    color: #e2e8f0;
    border-radius: 18px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.35);
}

.hero h2 {
    margin: 6px 0 2px;
    font-size: 28px;
    font-weight: 900;
}

.hero .sub {
    margin: 0;
    color: #cbd5e1;
}

.label {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
}

.primary-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: none;
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: #fff;
    padding: 10px 14px;
    border-radius: 12px;
    font-weight: 700;
    box-shadow: 0 10px 24px rgba(99, 102, 241, 0.35);
}

.ghost-chip {
    background: #f8fafc;
    color: #0f172a;
    border: 1px solid #e2e8f0;
    box-shadow: none;
}

.section {
    margin-top: 18px;
}

.section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.section-head h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
}

.text-btn {
    background: none;
    border: none;
    color: #6366f1;
    font-weight: 700;
}

.list {
    display: grid;
    gap: 10px;
}

.item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
    align-items: center;
    padding: 12px;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}

.icon-circle {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: #fff;
}

.icon-circle.teal { background: #14b8a6; }

.item-title {
    margin: 0;
    font-weight: 800;
    color: #0f172a;
}

.item-sub {
    margin: 2px 0 0;
    font-size: 12px;
    color: #64748b;
}

.item-actions {
    display: flex;
    align-items: center;
    gap: 6px;
}

.pill {
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
}

.pill.safe {
    background: #ecfdf3;
    color: #15803d;
}

.empty {
    margin: 0;
    color: #94a3b8;
    font-size: 14px;
}

.overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(10px);
    display: grid;
    place-items: end center;
    padding: 0 12px 16px;
    z-index: 30;
}

.sheet {
    width: 100%;
    max-width: 480px;
    background: #fff;
    border-radius: 18px 18px 0 0;
    padding: 16px;
    box-shadow: 0 -10px 30px rgba(15, 23, 42, 0.25);
    animation: slideUp 0.2s ease;
}

.sheet-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.form {
    display: grid;
    gap: 12px;
}

.field {
    display: grid;
    gap: 6px;
    font-weight: 700;
    color: #0f172a;
}

.field span {
    font-size: 13px;
    color: #475569;
}

.field input {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    font-size: 15px;
    background: #f8fafc;
}

.checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #0f172a;
}

.checkbox input {
    width: 18px;
    height: 18px;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 6px;
}

.primary-btn.solid {
    width: auto;
    padding: 12px 16px;
    border-radius: 12px;
}

.error-text {
    color: #e11d48;
    font-size: 13px;
    margin: 0;
}

@keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
</style>
