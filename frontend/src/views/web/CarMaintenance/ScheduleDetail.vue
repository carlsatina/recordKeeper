<template>
<div class="page">
    <header class="hero">
        <div class="brand">
            <button class="icon-btn" @click="router.back()">
                <mdicon name="chevron-left" :size="22"/>
            </button>
            <h2 class="title">Schedule Detail</h2>
        </div>
    </header>
    <main class="content">
        <div v-if="loading" class="empty">Loading...</div>
        <div v-else-if="errorMessage" class="empty">{{ errorMessage }}</div>
        <div v-else-if="!reminder" class="empty">Schedule not found.</div>
        <div v-else class="panel">
            <div class="row header-row">
                <div>
                    <p class="label">Maintenance Type</p>
                    <p class="value big">{{ reminder.maintenanceType || 'Schedule' }}</p>
                </div>
                <div>
                    <p class="label">Due Date</p>
                    <p class="value">{{ formatDate(reminder.dueDate) }}</p>
                </div>
            </div>
            <div class="details-grid">
                <div class="row">
                    <span class="label">Vehicle</span>
                    <span class="value">{{ reminder.vehicle?.make }} {{ reminder.vehicle?.model }} {{ reminder.vehicle?.year }}</span>
                </div>
                <div class="row">
                    <span class="label">Mileage</span>
                    <span class="value">{{ formatMileage(reminder.dueMileage) }}</span>
                </div>
                <div class="row">
                    <span class="label">Status</span>
                    <span class="value">{{ statusFor(reminder).label }}</span>
                </div>
                <div class="row span-2">
                    <span class="label">Notes</span>
                    <span class="value">{{ reminder.description || '—' }}</span>
                </div>
            </div>

            <div class="bottom-actions">
                <button class="ghost full" @click="editSchedule">Edit</button>
                <button class="danger full" @click="showDelete = true">Delete</button>
            </div>
        </div>
    </main>

    <div v-if="showDelete" class="modal-backdrop" @click.self="showDelete = false">
        <div class="modal">
            <p class="modal-title">Delete schedule?</p>
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
    name: 'CarMaintenanceScheduleDetailWeb',
    setup() {
        const route = useRoute()
        const router = useRouter()
        const { getReminder, deleteReminder, getPreferences } = useCarMaintenance()
        const reminder = ref(null)
        const loading = ref(false)
        const deleting = ref(false)
        const errorMessage = ref('')
        const showDelete = ref(false)
        const distanceUnit = ref('km')

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

        const daysLeft = (rem) => {
            if (!rem?.dueDate) return null
            const due = new Date(rem.dueDate)
            if (Number.isNaN(due.getTime())) return null
            const now = new Date()
            return Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        }

        const statusFor = (rem) => {
            if (rem?.completed) return { label: 'Completed' }
            const d = daysLeft(rem)
            if (d === null) return { label: 'No due date' }
            if (d < 0) return { label: 'Missed' }
            if (d === 0) return { label: 'Due today' }
            if (d === 1) return { label: 'Due tomorrow' }
            return { label: `${d} days left` }
        }

        const loadPrefs = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const prefs = await getPreferences(token)
                if (prefs?.distanceUnit) distanceUnit.value = prefs.distanceUnit
            } catch (err) {
                distanceUnit.value = 'km'
            }
        }

        const loadReminder = async() => {
            loading.value = true
            errorMessage.value = ''
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                const data = await getReminder(token, route.params.id)
                reminder.value = data
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load schedule'
            } finally {
                loading.value = false
            }
        }

        const editSchedule = () => {
            if (!reminder.value?.id) return
            router.push({ path: '/web/car-maintenance/schedules/add', query: { id: reminder.value.id } })
        }

        const confirmDelete = async() => {
            if (!reminder.value?.id) return
            deleting.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                await deleteReminder(token, reminder.value.id)
                showDelete.value = false
                router.push('/web/car-maintenance')
            } catch (err) {
                alert(err?.message || 'Unable to delete schedule')
            } finally {
                deleting.value = false
            }
        }

        onMounted(async() => {
            await loadPrefs()
            await loadReminder()
        })

        return {
            router,
            reminder,
            loading,
            deleting,
            errorMessage,
            showDelete,
            formatDate,
            formatMileage,
            statusFor,
            editSchedule,
            confirmDelete
        }
    }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f6f7fb; }
.hero {
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
.header-row { display: flex; justify-content: space-between; gap: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
.label { color: #6b7280; margin: 0; }
.value { margin: 0; font-weight: 700; color: #111827; }
.big { font-size: 18px; }
.ghost { border: 1px solid #e5e7eb; background: transparent; color: #4b5563; padding: 10px 12px; border-radius: 10px; cursor: pointer; }
.danger { border: none; background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 10px 12px; border-radius: 10px; cursor: pointer; }
.bottom-actions { display: flex; gap: 12px; margin-top: 6px; }
.bottom-actions .full { flex: 1; }
.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 8px 14px; }
.row { display: flex; justify-content: space-between; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
.row:last-child { border-bottom: none; }
.row.span-2 { grid-column: span 2; border-bottom: none; }
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
