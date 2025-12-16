<template>
<div class="car-shell">
    <div class="car-orb one"></div>
    <div class="car-orb two"></div>
    <div class="car-hero">
        <span class="car-icon-btn ghost"></span>
        <div>
            <h2 class="car-hero-title">Maintenance Schedules</h2>
            <p class="car-hero-sub">Never miss a service</p>
        </div>
        <button class="car-icon-btn" @click="goBack">
            <mdicon name="home" :size="22"/>
        </button>
        <button class="car-icon-btn" @click="addSchedule">
            <mdicon name="plus" :size="20"/>
        </button>
    </div>

    <div class="car-body">
        <div class="vehicle-pill car-card" @click="toggleVehiclePicker">
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
        <div v-if="showVehiclePicker" class="vehicle-picker car-card">
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

        <div class="car-search car-card">
            <mdicon name="magnify" :size="20"/>
            <input
                v-model="searchTerm"
                type="text"
                placeholder="Search schedules..."
                @input="debouncedSearch"
            />
        </div>

        <div v-if="loading" class="car-empty">
            Loading schedules...
        </div>
        <div v-else-if="errorMessage" class="car-empty">
            {{ errorMessage }}
        </div>
        <div v-else-if="filteredReminders.length" class="car-list">
            <div
                v-for="item in filteredReminders"
                :key="item.id"
                class="schedule-card car-card"
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
        <div v-else class="car-empty">
            Tap the + button to add a scheduled maintenance for this vehicle.
        </div>
    </div>

    <div v-if="detailReminder" class="drawer-overlay" @click="closeDetail">
        <div class="drawer-content car-card" @click.stop>
            <div class="drawer-header">
                <button class="car-icon-btn" @click="closeDetail">
                    <mdicon name="chevron-left" :size="22"/>
                </button>
                <h3 class="drawer-title">{{ detailReminder.maintenanceType || detailReminder.title }}</h3>
                <button class="car-icon-btn" @click="editReminder">
                    <mdicon name="pencil" :size="20"/>
                </button>
            </div>
            <p class="drawer-date">{{ formatDate(detailReminder.dueDate) || 'No due date' }}</p>
            <div class="drawer-row">
                <span class="label">Mileage</span>
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
                <button class="car-btn danger" @click="confirmDelete">Delete</button>
                <button class="car-btn" @click="editReminder">Edit</button>
            </div>
        </div>
    </div>

    <transition name="glass-fade">
        <div v-if="showDeleteModal" class="glass-confirm-overlay" @click.self="cancelDelete">
            <div class="glass-confirm-card">
                <h3 class="glass-confirm-title">Delete schedule?</h3>
                <p class="glass-confirm-text">This cannot be undone.</p>
                <div class="glass-confirm-actions">
                    <button type="button" @click="cancelDelete">Cancel</button>
                    <button type="button" class="danger" @click="performDelete">Delete</button>
                </div>
            </div>
        </div>
    </transition>

    <transition name="glass-fade">
        <div v-if="showOdometerModal" class="glass-confirm-overlay" @click.self="showOdometerModal = false">
            <div class="glass-confirm-card">
                <h3 class="glass-confirm-title">Update Odometer</h3>
                <p class="glass-confirm-text">Current: {{ formattedOdometer }}</p>
                <input v-model="odometerInput" type="number" min="0" class="modal-input" />
                <div class="glass-confirm-actions">
                    <button type="button" @click="showOdometerModal = false">Cancel</button>
                    <button type="button" class="confirm" :disabled="savingOdometer" @click="saveOdometer">
                        {{ savingOdometer ? 'Saving...' : 'Save' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>

    <button class="car-fab" @click="addSchedule">
        <mdicon name="plus" :size="24"/>
    </button>

    <nav class="car-bottom-nav glass-nav-orb">
        <button class="car-nav-item" @click="goHome">
            <mdicon name="view-dashboard-outline" :size="22"/>
            <span>Dashboard</span>
        </button>
        <button class="car-nav-item active">
            <mdicon name="clipboard-list-outline" :size="22"/>
            <span>Schedules</span>
        </button>
        <button class="car-nav-item" @click="goReport">
            <mdicon name="chart-pie" :size="22"/>
            <span>Report</span>
        </button>
        <button class="car-nav-item" @click="goVehicles">
            <mdicon name="car" :size="22"/>
            <span>Vehicles</span>
        </button>
        <button class="car-nav-item" @click="goSettings">
            <mdicon name="cog-outline" :size="22"/>
            <span>Settings</span>
        </button>
    </nav>
    <Loading v-if="loadingOverlay"/>
</div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'
import { API_BASE_URL } from '@/constants/config'
import Loading from '@/components/Loading.vue'
import { useStaggerReady } from '@/composables/staggerReady'
import { scheduleMaintenanceNotification, cancelReminderNotifications, ensureLocalNotificationPermission } from '@/composables/localNotifications'

export default {
    name: 'CarMaintenanceSchedulesMobile',
    components: {
        Loading
    },
    setup() {
        const router = useRouter()
        const { listVehicles, updateVehicle, listReminders, updateReminder, deleteReminder, getPreferences } = useCarMaintenance()
        const vehicles = ref([])
        const selectedVehicleId = ref(localStorage.getItem('selectedVehicleId') || '')

        const showVehiclePicker = ref(false)
        const showOdometerModal = ref(false)
        const odometerInput = ref('')
        const savingOdometer = ref(false)
        const reminders = ref([])
        const distanceUnit = ref('km')
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
        const loadingOverlay = ref(false)
        const staggerReady = useStaggerReady()
        const notificationReady = ref(false)

        const withOverlay = async(fn) => {
            loadingOverlay.value = true
            try {
                return await fn()
            } finally {
                loadingOverlay.value = false
            }
        }

        const goBack = () => router.push('/')
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
            const num = Number(value) || 0
            const converted = distanceUnit.value === 'mi' ? num * 0.621371 : num
            return `${converted.toLocaleString()} ${distanceUnit.value === 'mi' ? 'mi' : 'km'}`
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
                await withOverlay(async() => {
                    const token = localStorage.getItem('token')
                    if (!token) throw new Error('You must be logged in.')
                    const payload = new FormData()
                    payload.append('currentMileage', odometerInput.value || '0')
                    await updateVehicle(token, selectedVehicle.value.id, payload)
                    selectedVehicle.value.currentMileage = Number(odometerInput.value) || 0
                    showOdometerModal.value = false
                })
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
            await withOverlay(async() => {
                try {
                    const token = localStorage.getItem('token')
                    if (!token) throw new Error('You must be logged in.')
                    const list = await listReminders(token, selectedVehicleId.value)
                    reminders.value = list
                    if (notificationReady.value) {
                        for (const reminder of list) {
                            if (reminder.completed) {
                                await cancelReminderNotifications(reminder.id)
                            } else if (reminder.dueDate) {
                                await scheduleMaintenanceNotification({
                                    id: reminder.id,
                                    title: reminder.maintenanceType || reminder.title,
                                    vehicleName: selectedVehicle.value ? displayName(selectedVehicle.value) : '',
                                    dueDate: reminder.dueDate
                                })
                            }
                        }
                    }
                } catch (err) {
                    errorMessage.value = err?.message || 'Unable to load schedules'
                    reminders.value = []
                } finally {
                    loading.value = false
                }
            })
        }

        const toggleReminderStatus = async(reminder) => {
            if (!reminder?.id || toggling.value[reminder.id]) return
            toggling.value = { ...toggling.value, [reminder.id]: true }
            try {
                await withOverlay(async() => {
                    const token = localStorage.getItem('token')
                    if (!token) throw new Error('You must be logged in.')
                    const updated = await updateReminder(token, reminder.id, { completed: !reminder.completed })
                    reminders.value = reminders.value.map(r => r.id === reminder.id ? updated : r)
                    if (notificationReady.value) {
                        if (updated.completed) {
                            await cancelReminderNotifications(updated.id)
                        } else if (updated.dueDate) {
                            await scheduleMaintenanceNotification({
                                id: updated.id,
                                title: updated.maintenanceType || updated.title,
                                vehicleName: selectedVehicle.value ? displayName(selectedVehicle.value) : '',
                                dueDate: updated.dueDate
                            })
                        }
                    }
                })
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
            await withOverlay(async() => {
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
            })
        }
        onMounted(() => {
            ensureLocalNotificationPermission()
                .then((granted) => { notificationReady.value = granted })
                .catch(() => { notificationReady.value = false })
            loadVehicles()
            loadPreferences()
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
            await withOverlay(async() => {
                try {
                    const token = localStorage.getItem('token')
                    if (!token) throw new Error('You must be logged in.')
                    await deleteReminder(token, detailReminder.value.id)
                    if (notificationReady.value) {
                        await cancelReminderNotifications(detailReminder.value.id)
                    }
                    reminders.value = reminders.value.filter(r => r.id !== detailReminder.value.id)
                    showDeleteModal.value = false
                    detailReminder.value = null
                } catch (err) {
                    alert(err?.message || 'Unable to delete schedule')
                }
            })
        }

        const loadPreferences = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const prefs = await getPreferences(token)
                if (prefs?.distanceUnit) distanceUnit.value = prefs.distanceUnit
            } catch (err) {
                distanceUnit.value = 'km'
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
            distanceUnit,
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
            debouncedSearch,
            loadingOverlay,
            staggerReady,
            notificationReady
        }
    }
}
</script>

<style scoped>
.vehicle-pill {
  margin-top: 12px;
  color: var(--text-primary);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: var(--glass-card-shadow);
  cursor: pointer;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--glass-ghost-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--glass-card-border);
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

.vehicle-type {
  font-size: 13px;
  opacity: 0.9;
}

.vehicle-odo {
  font-size: 12px;
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
  opacity: 0.9;
}

.update-btn {
  border: 1px solid var(--glass-card-border);
  background: var(--glass-ghost-bg);
  color: var(--text-primary);
  padding: 6px 10px;
  border-radius: 10px;
  font-weight: 700;
  box-shadow: none;
}

.update-btn.small {
  padding: 6px 10px;
  font-size: 13px;
}

.vehicle-picker {
  margin-top: 8px;
  color: var(--text-primary);
  border-radius: 12px;
  box-shadow: var(--glass-card-shadow);
  border: 1px solid var(--glass-card-border);
  overflow: hidden;
}

.picker-item {
  width: 100%;
  border: none;
  background: transparent;
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.picker-item + .picker-item {
  border-top: 1px solid var(--glass-card-border);
}

.picker-empty {
  margin: 0;
  padding: 10px 12px;
  color: var(--text-muted);
  font-size: 13px;
}

.schedule-card {
  display: grid;
  gap: 10px;
  cursor: pointer;
}

.schedule-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.schedule-title {
  margin: 0;
  color: var(--text-primary);
  font-weight: 800;
}

.schedule-date-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid var(--glass-card-border);
  background: var(--glass-ghost-bg);
  font-weight: 700;
  color: var(--text-primary);
}

.schedule-date-pill.status-missed {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.schedule-date-pill.status-complete {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
  border-color: rgba(34, 197, 94, 0.3);
}

.schedule-bottom {
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--text-primary);
  font-size: 13px;
}

.schedule-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 16px;
  z-index: 1050;
}

.drawer-content {
  width: 100%;
  max-width: 520px;
  border-radius: 18px;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.drawer-title {
  margin: 0;
  color: var(--text-primary);
}

.drawer-date {
  margin: 0 0 6px;
  color: var(--text-muted);
}

.drawer-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin: 6px 0;
  color: var(--text-primary);
  font-size: 14px;
}

.drawer-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.label {
  font-weight: 700;
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
}

.value {
  font-weight: 700;
}

.modal-input {
  width: 100%;
  border: 1px solid var(--glass-card-border);
  border-radius: 10px;
  padding: 10px;
  font-size: 16px;
  margin: 8px 0 12px;
  background: var(--glass-ghost-bg);
  color: var(--text-primary);
}
</style>
