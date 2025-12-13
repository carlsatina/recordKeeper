<template>
<div class="car-shell">
    <div class="car-orb one"></div>
    <div class="car-orb two"></div>
    <header class="car-hero">
        <div class="car-brand">
            <div class="logo-circle">
                <mdicon name="calendar-clock" :size="24"/>
            </div>
            <div>
                <p class="eyebrow">Car Maintenance</p>
                <h1 class="headline">Schedules</h1>
            </div>
        </div>
        <nav class="car-tabs">
            <button @click="goHome">Home</button>
            <button class="active">Schedules</button>
            <button @click="goReport">Report</button>
            <button @click="goVehicles">Vehicles</button>
            <button @click="goSettings">Settings</button>
        </nav>
    </header>

    <main class="car-body">
        <div class="car-panel">
            <div class="car-panel-header">
                <div class="vehicle-select">
                    <label>Vehicle</label>
                    <select class="car-select" v-model="selectedVehicleId" @change="handleVehicleChange">
                        <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ displayName(v) }}</option>
                    </select>
                </div>
                <button class="car-btn" @click="goAddSchedule">
                    <mdicon name="plus" :size="18"/><span>Add Schedule</span>
                </button>
            </div>

            <div class="car-search">
                <mdicon name="magnify" :size="20"/>
                <input v-model="searchTerm" type="text" placeholder="Search schedules..." @input="debouncedSearch">
            </div>

            <div v-if="loading" class="car-empty">Loading schedules...</div>
            <div v-else-if="errorMessage" class="car-empty">{{ errorMessage }}</div>
            <div v-else-if="!filteredReminders.length" class="car-empty">No schedules found.</div>

            <div class="car-schedule-grid" v-else>
                <div class="car-schedule-card" v-for="item in filteredReminders" :key="item.id">
                    <div class="car-record-top">
                        <div>
                            <p class="car-record-title">{{ item.maintenanceType || 'Schedule' }}</p>
                            <p class="car-record-date">{{ formatDate(item.dueDate) }}</p>
                        </div>
                        <button class="car-status-pill" :class="statusFor(item).class" @click.stop="toggleStatus(item)">
                            <mdicon :name="statusFor(item).icon" :size="18"/>
                            <span>{{ statusFor(item).label }}</span>
                        </button>
                    </div>
                    <div class="car-meta-row">
                        <div class="car-meta">
                            <mdicon name="counter" :size="18"/>
                            <span>{{ formatMileage(item.dueMileage) }}</span>
                        </div>
                        <div class="car-meta">
                            <mdicon name="timer-sand" :size="18"/>
                            <span>{{ deadlineText(item) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <Loading v-if="showLoading"/>
</div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'
import Loading from '@/components/Loading.vue'

export default {
    name: 'CarMaintenanceSchedulesWeb',
    components: {
        Loading
    },
    setup() {
        const router = useRouter()
        const { listVehicles, listReminders, updateReminder, getPreferences } = useCarMaintenance()
        const vehicles = ref([])
        const selectedVehicleId = ref(localStorage.getItem('selectedVehicleId') || '')
        const reminders = ref([])
        const searchTerm = ref('')
        const loading = ref(false)
        const errorMessage = ref('')
        const distanceUnit = ref('km')
        let searchTimer = null
        const overlayActive = ref(false)

        const withOverlay = async(fn) => {
            overlayActive.value = true
            try {
                return await fn()
            } finally {
                overlayActive.value = false
            }
        }

        const formatDate = (value) => {
            if (!value) return 'No date'
            const d = new Date(value)
            if (Number.isNaN(d.getTime())) return 'No date'
            return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
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
        const daysLeft = (reminder) => {
            if (!reminder?.dueDate) return null
            const due = new Date(reminder.dueDate)
            if (Number.isNaN(due.getTime())) return null
            const now = new Date()
            return Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
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
        const statusFor = (reminder) => {
            const now = new Date()
            if (reminder?.completed) return { class: 'done', icon: 'check-circle', label: 'Done' }
            const due = reminder?.dueDate ? new Date(reminder.dueDate) : null
            if (due && due.getTime() < now.getTime()) return { class: 'missed', icon: 'close-circle', label: 'Missed' }
            return { class: 'upcoming', icon: 'clock-outline', label: 'Upcoming' }
        }

        const loadPreferences = async() => {
            await withOverlay(async() => {
                try {
                    const token = localStorage.getItem('token')
                    if (!token) return
                    const prefs = await getPreferences(token)
                    if (prefs?.distanceUnit) distanceUnit.value = prefs.distanceUnit
                } catch (err) {
                    distanceUnit.value = 'km'
                }
            })
        }

        const loadVehicles = async() => {
            loading.value = true
            errorMessage.value = ''
            await withOverlay(async() => {
                try {
                    const token = localStorage.getItem('token')
                    if (!token) throw new Error('You must be logged in.')
                    vehicles.value = await listVehicles(token)
                    if (!vehicles.value.length) {
                        selectedVehicleId.value = ''
                        reminders.value = []
                        return
                    }
                    const stored = localStorage.getItem('selectedVehicleId')
                    const preferred = vehicles.value.find(v => v.id === stored) || vehicles.value[0]
                    selectedVehicleId.value = preferred.id
                    await loadReminders()
                } catch (err) {
                    errorMessage.value = err?.message || 'Unable to load vehicles'
                    vehicles.value = []
                } finally {
                    loading.value = false
                }
            })
        }

        const loadReminders = async() => {
            if (!selectedVehicleId.value) {
                reminders.value = []
                return
            }
            loading.value = true
            await withOverlay(async() => {
                try {
                    const token = localStorage.getItem('token')
                    if (!token) throw new Error('You must be logged in.')
                    reminders.value = await listReminders(token, selectedVehicleId.value)
                } catch (err) {
                    reminders.value = []
                } finally {
                    loading.value = false
                }
            })
        }

        const filteredReminders = computed(() => {
            const term = searchTerm.value.toLowerCase().trim()
            if (!term) return reminders.value
            return reminders.value.filter(r => {
                return [r.maintenanceType, r.title, r.description].filter(Boolean).some(f => String(f).toLowerCase().includes(term))
            })
        })
        const showLoading = computed(() => loading.value || overlayActive.value)
        const showLoading = computed(() => loading.value)

        const handleVehicleChange = async() => {
            localStorage.setItem('selectedVehicleId', selectedVehicleId.value)
            await loadReminders()
        }

        const debouncedSearch = () => {
            if (searchTimer) clearTimeout(searchTimer)
            searchTimer = setTimeout(() => loadReminders(), 250)
        }

        const toggleStatus = async(reminder) => {
            if (!reminder?.id) return
            await withOverlay(async() => {
                try {
                    const token = localStorage.getItem('token')
                    if (!token) throw new Error('You must be logged in.')
                    const updated = await updateReminder(token, reminder.id, { completed: !reminder.completed })
                    reminders.value = reminders.value.map(r => r.id === reminder.id ? updated : r)
                } catch (err) {
                    alert(err?.message || 'Unable to update status')
                }
            })
        }

        const goHome = () => router.push('/')
        const goReport = () => router.push('/car-maintenance/report')
        const goVehicles = () => router.push('/car-maintenance/vehicles')
        const goSettings = () => router.push('/car-maintenance/settings')
        const goAddSchedule = () => {
            const query = selectedVehicleId.value ? { vehicleId: selectedVehicleId.value } : {}
            router.push({ path: '/car-maintenance/schedules/add', query })
        }

        onMounted(async() => {
            await withOverlay(async() => {
                await loadPreferences()
                await loadVehicles()
            })
        })

        return {
            goHome,
            goReport,
            goVehicles,
            goSettings,
            vehicles,
            selectedVehicleId,
            handleVehicleChange,
            maintenanceRecords: reminders,
            reminders,
            filteredReminders,
            searchTerm,
            debouncedSearch,
            statusFor,
            formatDate,
            formatMileage,
            deadlineText,
            toggleStatus,
            loading,
            errorMessage,
            goAddSchedule,
            distanceUnit,
            displayName,
            showLoading
        }
    }
}
</script>
