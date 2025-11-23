<template>
<div class="schedule-page">
    <div class="top-banner">
        <button class="icon-btn" @click="goBack">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <h2 class="title">Maintenance Schedules</h2>
        <span class="icon-btn ghost"></span>
    </div>

    <div class="vehicle-pill" @click="toggleVehiclePicker">
        <div class="avatar">
            <img v-if="selectedVehicle?.imageUrl" :src="selectedVehicle.imageUrl.startsWith('http') ? selectedVehicle.imageUrl : `${API_BASE_URL}${selectedVehicle.imageUrl}`" alt="Vehicle" />
            <mdicon v-else name="car-sports" :size="26"/>
        </div>
        <div class="vehicle-meta">
            <p class="vehicle-name">{{ selectedVehicle ? displayName(selectedVehicle) : 'Select a vehicle' }}</p>
            <p class="vehicle-type">{{ selectedVehicle?.vehicleType || '' }}</p>
            <p class="vehicle-odo" v-if="selectedVehicle">Odometer: {{ formattedOdometer }}</p>
            <p class="vehicle-updated">Last update: {{ formattedOdometerDate || '—' }}</p>
        </div>
        <div class="vehicle-actions">
            <button class="update-btn small" @click.stop="updateOdometer" :disabled="!selectedVehicle">
                Update
            </button>
            <mdicon name="chevron-down" :size="22" class="vehicle-dropdown"/>
        </div>
    </div>
    <div v-if="showVehiclePicker" class="vehicle-picker">
        <button 
            v-for="v in vehicles" 
            :key="v.id" 
            class="picker-item"
            @click.stop="selectVehicle(v.id)"
        >
            <span class="picker-name">{{ displayName(v) }}</span>
            <span class="picker-odo">Odometer: {{ formatMileage(v.currentMileage) }}</span>
        </button>
        <p v-if="!vehicles.length" class="picker-empty">No vehicles yet.</p>
    </div>

    <div class="search-bar">
        <mdicon name="magnify" :size="20"/>
        <input
            v-model="searchTerm"
            type="text"
            placeholder="Search schedules..."
            @input="debouncedSearch"
        />
    </div>

    <div v-if="loading" class="empty-wrapper">
        <p class="empty-title">Loading schedules...</p>
        <p class="empty-text">Please wait.</p>
    </div>
    <div v-else-if="errorMessage" class="empty-wrapper">
        <p class="empty-title">Unable to load schedules</p>
        <p class="empty-text">{{ errorMessage }}</p>
    </div>
    <div v-else-if="filteredReminders.length" class="schedule-list">
        <div
            v-for="item in filteredReminders"
            :key="item.id"
            class="schedule-card"
            @click="openDetail(item)"
        >
            <div class="schedule-top">
                <p class="schedule-title">{{ item.maintenanceType || item.title }}</p>
                <div
                    class="schedule-date-pill"
                    :class="statusFor(item).class"
                    @click.stop="toggleReminderStatus(item)"
                >
                    <span>{{ formatDate(item.dueDate) || 'No date' }}</span>
                    <mdicon :name="statusFor(item).icon" :size="18"/>
                </div>
            </div>
            <div class="schedule-bottom">
                <div class="schedule-meta">
                    <mdicon name="counter" :size="18"/>
                    <span>{{ formatMileage(item.dueMileage) }}</span>
                </div>
                <div class="schedule-meta">
                    <mdicon name="calendar" :size="18"/>
                    <span>{{ deadlineText(item) }}</span>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="empty-wrapper">
        <p class="empty-title">No schedules yet</p>
        <p class="empty-text">Tap the + button to add a scheduled maintenance for this vehicle.</p>
    </div>

    <div v-if="detailReminder" class="detail-drawer" @click="closeDetail">
        <div class="drawer-content" @click.stop>
            <div class="drawer-header">
                <button class="icon-btn" @click="closeDetail">
                    <mdicon name="chevron-left" :size="22"/>
                </button>
                <h3 class="drawer-title">{{ detailReminder.maintenanceType || detailReminder.title }}</h3>
                <button class="icon-btn" @click="editReminder">
                    <mdicon name="pencil" :size="20"/>
                </button>
            </div>
            <p class="drawer-date">{{ formatDate(detailReminder.dueDate) || 'No due date' }}</p>
            <div class="drawer-row">
                <span class="label">Mileagess</span>
                <span class="value">{{ formatMileage(detailReminder.dueMileage) }}</span>
            </div>
            <div class="drawer-row">
                <span class="label">Status</span>
                <span class="value">{{ detailReminder.completed ? 'Completed' : statusFor(detailReminder).class === 'status-missed' ? 'Missed' : 'Upcoming' }}</span>
            </div>
            <div class="drawer-row" v-if="detailReminder.description">
                <span class="label">Notes</span>
                <span class="value">{{ detailReminder.description }}</span>
            </div>
            <div class="drawer-actions">
                <button class="danger" @click="confirmDelete">Delete</button>
                <button class="primary" @click="editReminder">Edit</button>
            </div>
        </div>
    </div>

    <div v-if="showDeleteModal" class="modal-backdrop delete-backdrop" @click="cancelDelete">
        <div class="modal-delete">
            <p class="modal-title">Delete schedule?</p>
            <p class="modal-text">This cannot be undone.</p>
            <div class="modal-actions">
                <button class="cancel" @click="cancelDelete">Cancel</button>
                <button class="confirm" @click="performDelete">Delete</button>
            </div>
        </div>
    </div>

    <div v-if="showOdometerModal" class="modal-backdrop odometer-backdrop" @click="showOdometerModal = false">
        <div class="modal" @click.stop>
            <p class="modal-title">Update Odometer</p>
            <p class="modal-text">Current: {{ formattedOdometer }}</p>
            <input v-model="odometerInput" type="number" min="0" class="modal-input" />
            <div class="modal-actions">
                <button class="cancel" @click="showOdometerModal = false">Cancel</button>
                <button class="confirm" :disabled="savingOdometer" @click="saveOdometer">
                    {{ savingOdometer ? 'Saving...' : 'Save' }}
                </button>
            </div>
        </div>
    </div>

    <button class="fab" @click="addSchedule">
        <mdicon name="plus" :size="24"/>
    </button>

    <nav class="bottom-nav">
        <button class="nav-item" @click="goHome">
            <mdicon name="home" :size="22"/>
            <span>Home</span>
        </button>
        <button class="nav-item active">
            <mdicon name="clipboard-list-outline" :size="22"/>
            <span>Schedules</span>
        </button>
        <button class="nav-item" @click="goReport">
            <mdicon name="chart-pie" :size="22"/>
            <span>Report</span>
        </button>
        <button class="nav-item" @click="goVehicles">
            <mdicon name="car" :size="22"/>
            <span>Vehicles</span>
        </button>
        <button class="nav-item" @click="goSettings">
            <mdicon name="cog-outline" :size="22"/>
            <span>Settings</span>
        </button>
    </nav>
</div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'
import { API_BASE_URL } from '@/constants/config'

export default {
    name: 'CarMaintenanceSchedulesMobile',
    setup() {
        const router = useRouter()
        const { listVehicles, updateVehicle, listReminders, updateReminder, deleteReminder } = useCarMaintenance()
        const vehicles = ref([])
        const selectedVehicleId = ref(localStorage.getItem('selectedVehicleId') || '')

        const showVehiclePicker = ref(false)
        const showOdometerModal = ref(false)
        const odometerInput = ref('')
        const savingOdometer = ref(false)
        const reminders = ref([])
        const searchTerm = ref('')
        const filteredReminders = computed(() => {
            if (!searchTerm.value.trim()) return reminders.value
            const term = searchTerm.value.trim().toLowerCase()
            return reminders.value.filter(r => {
                const fields = [
                    r.maintenanceType,
                    r.title,
                    r.description
                ].filter(Boolean).map(v => String(v).toLowerCase())
                return fields.some(f => f.includes(term))
            })
        })
        let searchTimer = null
        const debouncedSearch = () => {
            if (searchTimer) clearTimeout(searchTimer)
            searchTimer = setTimeout(() => {
                // local filter only; reminders already loaded
            }, 250)
        }
        const loading = ref(false)
        const errorMessage = ref('')
        const toggling = ref({})
        const detailReminder = ref(null)
        const showDeleteModal = ref(false)

        const goBack = () => router.back()
        const goHome = () => router.push('/car-maintenance')
        const addSchedule = () => {
            router.push({ path: '/car-maintenance/schedules/add', query: selectedVehicleId.value ? { vehicleId: selectedVehicleId.value } : {} })
        }
        const goVehicles = () => router.push('/car-maintenance/vehicles')
        const goSettings = () => router.push('/car-maintenance/settings')
        const goReport = () => router.push('/car-maintenance/report')

        const selectedVehicle = computed(() => {
            return vehicles.value.find(v => v.id === selectedVehicleId.value) || null
        })

        const formattedOdometer = computed(() => {
            const value = selectedVehicle.value?.currentMileage
            if (value === null || value === undefined) return '—'
            return Number(value).toLocaleString()
        })

        const formattedOdometerDate = computed(() => formatDate(selectedVehicle.value?.updatedAt || selectedVehicle.value?.createdAt))

        const formatDate = (value) => {
            if (!value) return ''
            const date = value instanceof Date ? value : new Date(value)
            if (Number.isNaN(date.getTime())) return ''
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
        }
        const displayName = (vehicle) => {
            if (!vehicle) return 'Vehicle'
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }

        const formatMileage = (value) => {
            if (value === null || value === undefined) return '—'
            return `${value.toLocaleString()} km`
        }

        const toggleVehiclePicker = () => {
            showVehiclePicker.value = !showVehiclePicker.value
        }
        const updateOdometer = () => {
            if (!selectedVehicle.value) return
            odometerInput.value = selectedVehicle.value.currentMileage || ''
            showOdometerModal.value = true
        }

        const saveOdometer = async() => {
            if (!selectedVehicle.value) return
            savingOdometer.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                const payload = new FormData()
                payload.append('currentMileage', odometerInput.value || '0')
                await updateVehicle(token, selectedVehicle.value.id, payload)
                selectedVehicle.value.currentMileage = Number(odometerInput.value) || 0
                showOdometerModal.value = false
            } catch (err) {
                alert(err?.message || 'Unable to update odometer')
            } finally {
                savingOdometer.value = false
            }
        }

        const selectVehicle = (vehicleId) => {
            selectedVehicleId.value = vehicleId
            showVehiclePicker.value = false
            localStorage.setItem('selectedVehicleId', vehicleId)
            loadReminders()
        }

        const loadReminders = async() => {
            if (!selectedVehicleId.value) {
                reminders.value = []
                return
            }
            loading.value = true
            errorMessage.value = ''
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                reminders.value = await listReminders(token, selectedVehicleId.value)
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load schedules'
                reminders.value = []
            } finally {
                loading.value = false
            }
        }

        const toggleReminderStatus = async(reminder) => {
            if (!reminder?.id || toggling.value[reminder.id]) return
            toggling.value = { ...toggling.value, [reminder.id]: true }
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                const updated = await updateReminder(token, reminder.id, { completed: !reminder.completed })
                reminders.value = reminders.value.map(r => r.id === reminder.id ? updated : r)
            } catch (err) {
                alert(err?.message || 'Unable to update status')
            } finally {
                const { [reminder.id]: _omit, ...rest } = toggling.value
                toggling.value = rest
            }
        }

        const statusFor = (reminder) => {
            const now = new Date()
            if (reminder?.completed) {
                return { class: 'status-done', icon: 'check-circle' }
            }
            const due = reminder?.dueDate ? new Date(reminder.dueDate) : null
            if (due && due.getTime() < now.getTime()) {
                return { class: 'status-missed', icon: 'close-circle' }
            }
            return { class: 'status-upcoming', icon: 'clock-outline' }
        }

        const daysLeft = (reminder) => {
            if (!reminder?.dueDate) return null
            const due = new Date(reminder.dueDate)
            if (Number.isNaN(due.getTime())) return null
            const now = new Date()
            const diff = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            return diff
        }

        const deadlineText = (reminder) => {
            if (reminder?.completed) return 'Completed'
            const d = daysLeft(reminder)
            if (d === null) return 'No due date'
            if (d < 0) return 'Missed'
            if (d === 0) return 'Due today'
            if (d === 1) return 'Due tomorrow'
            return `${d} days left`
        }

        const loadVehicles = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const list = await listVehicles(token)
                vehicles.value = Array.isArray(list) ? list : []
                const preferred = vehicles.value.find(v => v.id === selectedVehicleId.value)
                selectedVehicleId.value = preferred ? preferred.id : vehicles.value[0]?.id || ''
                await loadReminders()
            } catch (err) {
                vehicles.value = []
            }
        }
        onMounted(() => {
            loadVehicles()
        })

        const openDetail = (item) => {
            detailReminder.value = item
        }

        const closeDetail = () => {
            detailReminder.value = null
        }

        const editReminder = () => {
            if (!detailReminder.value) return
            router.push({ path: '/car-maintenance/schedules/add', query: { reminderId: detailReminder.value.id } })
        }

        const confirmDelete = () => {
            showDeleteModal.value = true
        }

        const cancelDelete = () => {
            showDeleteModal.value = false
        }

        const performDelete = async() => {
            if (!detailReminder.value?.id) return
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                await deleteReminder(token, detailReminder.value.id)
                reminders.value = reminders.value.filter(r => r.id !== detailReminder.value.id)
                showDeleteModal.value = false
                detailReminder.value = null
            } catch (err) {
                alert(err?.message || 'Unable to delete schedule')
            }
        }

        return {
            vehicles,
            goBack,
            goHome,
            addSchedule,
            goVehicles,
            goSettings,
            goReport,
            selectedVehicle,
            displayName,
            formatMileage,
            API_BASE_URL,
            formattedOdometerDate,
            formattedOdometer,
            formatDate,
            showVehiclePicker,
            toggleVehiclePicker,
            selectVehicle,
            showOdometerModal,
            odometerInput,
            updateOdometer,
            saveOdometer,
            savingOdometer,
            reminders,
            filteredReminders,
            loading,
            errorMessage,
            statusFor,
            toggleReminderStatus,
            toggling,
            deadlineText,
            detailReminder,
            openDetail,
            closeDetail,
            editReminder,
            showDeleteModal,
            confirmDelete,
            cancelDelete,
            performDelete,
            searchTerm,
            debouncedSearch
        }
    }
}
</script>

<style scoped>
.schedule-page {
    min-height: 100vh;
    background: #f2f4f8;
    padding-bottom: 90px;
}

.top-banner {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    padding: 14px 16px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
}

.title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
}

.icon-btn {
    border: none;
    background: transparent;
    color: inherit;
    padding: 6px;
}

.icon-btn.ghost {
    visibility: hidden;
}

.vehicle-pill {
    margin: 0 16px;
    margin-top: -28px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    border-radius: 16px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 10px 20px rgba(13, 115, 221, 0.3);
}

.avatar {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.vehicle-meta p {
    margin: 0;
}

.vehicle-name {
    font-weight: 700;
    font-size: 15px;
}

.vehicle-odo {
    font-size: 12px;
    opacity: 0.9;
}

.vehicle-type {
    font-size: 13px;
    opacity: 0.9;
}

.vehicle-updated {
    font-size: 11px;
    opacity: 0.8;
    margin: 2px 0 0;
}

.vehicle-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
}

.vehicle-dropdown {
    color: white;
}

.update-btn {
    background: linear-gradient(135deg, #f093fb, #f5576c);
    border: none;
    color: white;
    padding: 6px 10px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 12px;
}

.picker-name {
    font-weight: 700;
}

.picker-odo {
    font-size: 12px;
    color: #6b7280;
}

.vehicle-picker {
    margin: 8px 16px 0;
    background: white;
    color: #1f2937;
    border-radius: 12px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
    overflow: hidden;
}

.picker-item {
    width: 100%;
    border: none;
    background: transparent;
    padding: 10px 12px;
    text-align: left;
    font-weight: 600;
    color: #111827;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.picker-item + .picker-item {
    border-top: 1px solid #f3f4f6;
}

.picker-empty {
    margin: 0;
    padding: 10px 12px;
    color: #6b7280;
    font-size: 13px;
}

.vehicle-odo {
    font-size: 12px;
    opacity: 0.9;
}

.search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    border-radius: 12px;
    padding: 10px 12px;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.05);
    margin: 12px 16px;
}

.search-bar input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 14px;
}

.empty-wrapper {
    padding: 80px 16px;
    text-align: center;
    color: #9ca3af;
}

.illustration {
    color: #3b82f6;
    margin-bottom: 16px;
}

.empty-text {
    margin: 0;
    font-size: 16px;
    color: #9ca3af;
}

.schedule-list {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.schedule-card {
    background: white;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
}

.schedule-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
}

.schedule-title {
    margin: 0;
    font-weight: 700;
    color: #1f2937;
}

.schedule-date-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
}

.status-upcoming {
    background: #eef2ff;
    color: #4f46e5;
}

.status-done {
    background: #e7f8ef;
    color: #059669;
}

.status-missed {
    background: #fee2e2;
    color: #dc2626;
}

.schedule-bottom {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    gap: 10px;
}

.schedule-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #4b5563;
    font-size: 13px;
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 9999;
}

.modal-backdrop.delete-backdrop {
    z-index: 10000;
}

.modal {
    background: white;
    border-radius: 16px;
    padding: 16px;
    width: 100%;
    max-width: 340px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.16);
    position: relative;
    z-index: 10000;
}
.odometer-backdrop {
    z-index: 12000;
}
.modal-delete {
    background: white;
    border-radius: 16px;
    padding: 16px;
    width: 100%;
    max-width: 340px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.16);
    position: relative;
    z-index: 20000;
}

.modal-title {
    margin: 0 0 4px;
    font-weight: 800;
    font-size: 16px;
    color: #1f2937;
}

.modal-text {
    margin: 0 0 12px;
    color: #6b7280;
    font-size: 14px;
}

.modal-input {
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px 12px;
    font-size: 16px;
    margin-bottom: 12px;
}

.modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.modal-actions button {
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 700;
    border: none;
}

.cancel {
    background: #f3f4f6;
    color: #374151;
}

.confirm {
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: white;
}

.detail-drawer {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding: 16px;
    z-index: 500;
}

.drawer-content {
    background: white;
    border-radius: 18px;
    width: 100%;
    max-width: 520px;
    padding: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.16);
}

.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.drawer-title {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: #1f2937;
    flex: 1;
    text-align: center;
}

.drawer-date {
    margin: 4px 0 12px;
    color: #6b7280;
    font-size: 14px;
    text-align: center;
}

.drawer-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
    font-size: 14px;
    color: #111827;
}

.drawer-row .label {
    color: #6b7280;
}

.drawer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 16px;
}

.drawer-actions button {
    border: none;
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 700;
}

.drawer-actions .danger {
    background: #fee2e2;
    color: #b91c1c;
}

.drawer-actions .primary {
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: white;
}

.fab {
    position: fixed;
    bottom: 84px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    border: none;
    background: #f7931e;
    color: white;
    box-shadow: 0 10px 20px rgba(247, 147, 30, 0.35);
}

.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    border-top: 1px solid #e5e7eb;
    padding: 8px 4px;
}

.nav-item {
    border: none;
    background: transparent;
    color: #8a95a6;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 12px;
}

.nav-item.active {
    color: #f5576c;
    font-weight: 700;
}
</style>
