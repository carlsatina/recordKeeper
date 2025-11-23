<template>
<div class="page">
    <header class="hero">
        <div class="brand">
            <button class="icon-btn" @click="router.back()">
                <mdicon name="chevron-left" :size="22"/>
            </button>
            <h2 class="title">Maintenance Detail</h2>
        </div>
    </header>
    <main class="content">
        <div v-if="loading" class="empty">Loading...</div>
        <div v-else-if="errorMessage" class="empty">{{ errorMessage }}</div>
        <div v-else-if="!record" class="empty">Record not found.</div>
        <div v-else class="panel">
            <div class="row header-row">
                <div>
                    <p class="label">Maintenance Type</p>
                    <p class="value big">{{ record.maintenanceType || 'Maintenance' }}</p>
                </div>
                <div>
                    <p class="label">Service Date</p>
                    <p class="value">{{ formatDate(record.serviceDate) }}</p>
                </div>
            </div>

            <div class="details-grid">
                <div class="row">
                    <span class="label">Vehicle</span>
                    <span class="value">{{ record.vehicle?.make }} {{ record.vehicle?.model }} {{ record.vehicle?.year }}</span>
                </div>
                <div class="row">
                    <span class="label">Mileage</span>
                    <span class="value">{{ formatMileage(record.mileageAtService) }}</span>
                </div>
                <div class="row">
                    <span class="label">Cost</span>
                    <span class="value">{{ formatCurrency(record.cost, record.currency || defaultCurrency) }}</span>
                </div>
                <div class="row">
                    <span class="label">Serviced By</span>
                    <span class="value">{{ record.servicedBy || '—' }}</span>
                </div>
                <div class="row">
                    <span class="label">Location</span>
                    <span class="value">{{ record.location || '—' }}</span>
                </div>
                <div class="row">
                    <span class="label">Parts Used</span>
                    <span class="value">{{ record.partsUsed || '—' }}</span>
                </div>
                <div class="row">
                    <span class="label">Labor Hours</span>
                    <span class="value">{{ record.laborHours || '—' }}</span>
                </div>
                <div class="row span-2">
                    <span class="label">Description</span>
                    <span class="value">{{ record.description || '—' }}</span>
                </div>
            </div>

            <div class="bottom-actions">
                <button class="ghost full" @click="editRecord">Edit</button>
                <button class="danger full" @click="showDelete = true">Delete</button>
            </div>
        </div>
    </main>

    <div v-if="showDelete" class="modal-backdrop" @click.self="showDelete = false">
        <div class="modal">
            <p class="modal-title">Delete maintenance?</p>
            <p class="modal-text">This cannot be undone.</p>
            <div class="modal-actions">
                <button class="cancel" @click="showDelete = false">Cancel</button>
                <button class="confirm" :disabled="deleting" @click="confirmDelete">
                    {{ deleting ? 'Deleting...' : 'Delete' }}
                </button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'

export default {
    name: 'CarMaintenanceMaintenanceDetailWeb',
    setup() {
        const route = useRoute()
        const router = useRouter()
        const { getMaintenanceRecord, deleteMaintenanceRecord, getPreferences } = useCarMaintenance()
        const record = ref(null)
        const loading = ref(false)
        const deleting = ref(false)
        const errorMessage = ref('')
        const showDelete = ref(false)
        const distanceUnit = ref('km')
        const defaultCurrency = ref('USD')

        const formatDate = (value) => {
            if (!value) return '—'
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return '—'
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
        }

        const formatMileage = (value) => {
            if (value === null || value === undefined) return '—'
            const num = Number(value) || 0
            const converted = distanceUnit.value === 'mi' ? num * 0.621371 : num
            const unitLabel = distanceUnit.value === 'mi' ? 'mi' : 'km'
            return `${converted.toLocaleString()} ${unitLabel}`
        }

        const formatCurrency = (value, currency = 'USD') => {
            if (value === null || value === undefined) return '—'
            try {
                return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value)
            } catch (e) {
                return `${value.toLocaleString()} ${currency}`
            }
        }

        const loadPrefs = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const prefs = await getPreferences(token)
                if (prefs?.distanceUnit) distanceUnit.value = prefs.distanceUnit
                if (prefs?.currency) defaultCurrency.value = prefs.currency
            } catch (err) {
                distanceUnit.value = 'km'
                defaultCurrency.value = 'USD'
            }
        }

        const loadRecord = async() => {
            loading.value = true
            errorMessage.value = ''
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                const rec = await getMaintenanceRecord(token, route.params.id)
                record.value = rec
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load record'
            } finally {
                loading.value = false
            }
        }

        const editRecord = () => {
            if (!record.value?.id) return
            router.push({ path: '/web/car-maintenance/maintenance/add', query: { id: record.value.id } })
        }

        const confirmDelete = async() => {
            if (!record.value?.id) return
            deleting.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                await deleteMaintenanceRecord(token, record.value.id)
                showDelete.value = false
                router.push('/web/car-maintenance')
            } catch (err) {
                alert(err?.message || 'Unable to delete record')
            } finally {
                deleting.value = false
            }
        }

        onMounted(async() => {
            await loadPrefs()
            await loadRecord()
        })

        return {
            router,
            record,
            loading,
            deleting,
            errorMessage,
            showDelete,
            formatDate,
            formatMileage,
            formatCurrency,
            editRecord,
            confirmDelete,
            defaultCurrency
        }
    }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f6f7fb; }
.hero {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #6f6cf7, #f093fb);
    color: white;
    box-shadow: 0 8px 18px rgba(0,0,0,0.12);
}
.brand { display: flex; align-items: center; gap: 10px; }
.title { margin: 0; font-weight: 800; }
.icon-btn { border: none; background: transparent; color: inherit; }
.content { padding: 20px 24px 40px; max-width: 900px; margin: 0 auto; }
.panel {
    background: white;
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 10px 24px rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.ghost { border: 1px solid #e5e7eb; background: transparent; color: #4b5563; padding: 10px 12px; border-radius: 10px; cursor: pointer; }
.danger { border: none; background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 10px 12px; border-radius: 10px; cursor: pointer; }
.bottom-actions { display: flex; gap: 12px; margin-top: 6px; }
.bottom-actions .full { flex: 1; }
.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 8px 14px;
}
.row { display: flex; justify-content: space-between; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
.row:last-child { border-bottom: none; }
.row.span-2 { grid-column: span 2; border-bottom: none; }
.label { color: #6b7280; margin: 0; }
.value { margin: 0; font-weight: 700; color: #111827; }
.big { font-size: 18px; }
.header-row { border-bottom: 1px solid #f1f5f9; }
.empty { padding: 16px; text-align: center; color: #6b7280; }

.modal-backdrop {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 3000;
}
.modal {
    display: block;
    position: relative;
    background: white;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 360px;
    height: auto;
}
.modal-title { margin: 0 0 4px; font-weight: 800; font-size: 16px; color: #1f2937; }
.modal-text { margin: 0 0 12px; color: #6b7280; font-size: 14px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.modal-actions button { border-radius: 12px; padding: 10px 14px; font-weight: 700; border: none; }
.cancel { background: #f3f4f6; color: #374151; }
.confirm { background: linear-gradient(135deg, #f093fb, #f5576c); color: white; }
</style>
