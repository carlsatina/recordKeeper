<template>
<div class="car-shell stagger-page stagger-seq" :class="{ 'stagger-ready': staggerReady }">
    <div class="car-orb one"></div>
    <div class="car-orb two"></div>
    <header class="car-hero">
        <div class="brand">
            <button class="logo-circle" @click="goLanding">
                <mdicon name="home" :size="22"/>
            </button>
            <div>
                <p class="eyebrow">Car Maintenance</p>
                <h1 class="headline">Keep every ride in peak shape</h1>
            </div>
        </div>
        <nav class="car-tabs">
            <button :class="{ active: currentTab === 'home' }" @click="setTab('home')">Home</button>
            <button :class="{ active: currentTab === 'schedules' }" @click="setTab('schedules')">Schedules</button>
            <button :class="{ active: currentTab === 'report' }" @click="setTab('report')">Report</button>
            <button :class="{ active: currentTab === 'vehicles' }" @click="setTab('vehicles')">Vehicles</button>
            <button :class="{ active: currentTab === 'settings' }" @click="setTab('settings')">Settings</button>
        </nav>
    </header>

    <main class="car-body">
        <section v-if="currentTab === 'home'" class="car-panel">
            <div class="car-panel-header">
                <div class="vehicle-select">
                    <label>Vehicle</label>
                    <div class="select-wrapper">
                        <select class="car-select" v-model="selectedVehicleId" @change="handleVehicleChange">
                            <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ displayName(v) }}</option>
                        </select>
                    </div>
                </div>
                <button class="car-btn" @click="goAddMaintenance">
                    <mdicon name="plus" :size="18"/><span>Add Maintenance</span>
                </button>
            </div>

            <div class="car-search">
                <mdicon name="magnify" :size="20"/>
                <input v-model="searchTerm" type="text" placeholder="Search maintenance..." @input="debouncedSearch">
            </div>

            <div v-if="loading" class="car-empty">Loading maintenance...</div>
            <div v-else-if="errorMessage" class="car-empty">{{ errorMessage }}</div>
            <div v-else-if="!maintenanceRecords.length" class="car-empty">No maintenance records yet. Add one to get started.</div>

            <div v-else class="car-records">
                <div class="car-record-card" v-for="item in maintenanceRecords" :key="item.id" @click="openRecordDetail(item.id)">
                    <div class="car-record-top">
                        <div>
                            <p class="car-record-title">{{ item.maintenanceType || 'Maintenance' }}</p>
                            <p class="car-record-date">{{ formatDate(item.serviceDate) }}</p>
                        </div>
                        <span class="car-pill">{{ formatMileage(item.mileageAtService) }}</span>
                    </div>
                    <div class="car-record-bottom">
                        <div class="car-meta">
                            <mdicon name="cash" :size="18"/>
                            <span>{{ formatCurrency(item.cost, item.currency || defaultCurrency) }}</span>
                        </div>
                        <div class="car-meta">
                            <mdicon name="map-marker" :size="18"/>
                            <span>{{ item.location || '—' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section v-else-if="currentTab === 'schedules'" class="car-panel">
            <div class="car-panel-header">
                <div class="vehicle-select">
                    <label>Vehicle</label>
                    <div class="select-wrapper">
                        <select class="car-select" v-model="selectedVehicleId" @change="handleVehicleChange">
                            <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ displayName(v) }}</option>
                        </select>
                    </div>
                </div>
                <button class="car-btn" @click="goAddSchedule">
                    <mdicon name="plus" :size="18"/><span>Add Schedule</span>
                </button>
            </div>

            <div class="car-search">
                <mdicon name="magnify" :size="20"/>
                <input v-model="scheduleSearch" type="text" placeholder="Search schedules..." @input="debouncedScheduleSearch">
            </div>

            <div v-if="loadingReminders" class="car-empty">Loading schedules...</div>
            <div v-else-if="errorMessage" class="car-empty">{{ errorMessage }}</div>
            <div v-else-if="!filteredReminders.length" class="car-empty">No schedules found.</div>
            <div class="car-schedule-grid" v-else>
                <div class="car-schedule-card" v-for="item in filteredReminders" :key="item.id" @click="openScheduleDetail(item.id)">
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
        </section>

        <section v-else-if="currentTab === 'report'" class="car-panel">
            <div class="car-panel-header">
                <div class="vehicle-select">
                    <label>Vehicle</label>
                    <div class="select-wrapper">
                        <select class="car-select" v-model="selectedVehicleId" @change="handleVehicleChange">
                            <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ displayName(v) }}</option>
                        </select>
                    </div>
                </div>
            </div>
            <div v-if="!chartData.length" class="car-empty">No maintenance records to show.</div>
            <div v-else class="car-chart-card">
                <div class="car-donut">
                    <div class="car-donut-visual">
                        <svg viewBox="0 0 42 42">
                            <circle class="car-donut-ring" cx="21" cy="21" r="15.91549431" fill="transparent" stroke-width="5"></circle>
                            <circle
                                v-for="(slice, idx) in chartSlices"
                                :key="idx"
                                class="car-donut-segment"
                                cx="21" cy="21" r="15.91549431"
                                fill="transparent"
                                stroke-width="5"
                                :stroke="slice.color"
                                :stroke-dasharray="slice.dash"
                                :stroke-dashoffset="slice.offset"
                            ></circle>
                        </svg>
                        <div class="car-donut-center">
                            <p class="car-donut-total">{{ formatCurrency(totalCost, defaultCurrency) }}</p>
                            <p class="car-donut-range">Across {{ chartData.length }} types</p>
                        </div>
                    </div>
                </div>
                <div class="car-legend">
                    <div class="car-legend-item" v-for="item in chartData" :key="item.type">
                        <span class="car-legend-dot" :style="{ background: item.color }"></span>
                        <div class="car-legend-meta">
                            <p class="label">{{ item.type }}</p>
                            <p class="value">{{ formatCurrency(item.cost, defaultCurrency) }} ({{ item.percent }}%)</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section v-else-if="currentTab === 'vehicles'" class="car-panel">
            <div class="car-panel-header">
                <h3 class="car-record-title" style="margin: 0;">Vehicles</h3>
                <button class="car-btn" @click="addVehicle">
                    <mdicon name="plus" :size="18"/><span>Add Vehicle</span>
                </button>
            </div>
            <div class="car-search">
                <mdicon name="magnify" :size="20"/>
                <input v-model="vehicleSearch" type="text" placeholder="Search vehicle..." />
            </div>
            <div v-if="loading" class="car-empty">Loading vehicles...</div>
            <div v-else-if="errorMessage" class="car-empty">{{ errorMessage }}</div>
            <div v-else-if="!filteredVehicles.length" class="car-empty">No vehicles yet. Add your first vehicle.</div>
            <div class="car-vehicle-grid" v-else>
                <div class="car-vehicle-card" v-for="v in filteredVehicles" :key="v.id" @click="openVehicle(v.id)">
                    <div class="car-thumb">
                        <img v-if="v.imageUrl" :src="v.imageUrl.startsWith('http') ? v.imageUrl : `${API_BASE_URL}${v.imageUrl}`" alt="vehicle" />
                        <mdicon v-else name="clipboard-list-outline" :size="28"/>
                    </div>
                    <div class="car-info">
                        <p class="car-name">{{ displayName(v) }}</p>
                        <p class="car-sub">License: {{ v.licensePlate || '—' }}</p>
                        <p class="car-sub">VIN: {{ v.vin || '—' }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section v-else-if="currentTab === 'settings'" class="car-panel">
            <div class="car-profile">
                <div class="car-avatar"><mdicon name="account-circle" :size="36"/></div>
                <div>
                    <p class="car-record-title">{{ userName }}</p>
                    <p class="car-record-date">{{ userEmail }}</p>
                </div>
            </div>
            <div class="car-card-grid">
                <div class="car-card">
                    <p class="car-record-title">Distance Unit</p>
                    <div class="car-inline">
                        <label><input type="radio" value="km" v-model="distanceUnit" @change="persistPreferences"> Kilometers</label>
                        <label><input type="radio" value="mi" v-model="distanceUnit" @change="persistPreferences"> Miles</label>
                    </div>
                </div>
                <div class="car-card">
                    <p class="car-record-title">Currency</p>
                    <select class="car-select" v-model="defaultCurrency" @change="persistPreferences">
                        <option v-for="c in currencyOptions" :key="c" :value="c">{{ c }}</option>
                    </select>
                </div>
                <div class="car-card">
                    <p class="car-record-title">Maintenance Types</p>
                    <div class="car-inline">
                        <input class="car-input" v-model="newMaintenanceType" type="text" placeholder="Add type" />
                        <button class="car-btn" type="button" @click="addType">Add</button>
                    </div>
                    <div class="car-chip-row">
                        <span v-for="t in visibleTypes" :key="t" class="car-chip">
                            {{ t }}
                            <button @click="removeType(t)">
                                <mdicon name="close" :size="14"/>
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </section>
    </main>
    <Loading v-if="showLoading"/>
</div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import store from '@/store'
import { useCarMaintenance } from '@/composables/carMaintenance'
import { API_BASE_URL } from '@/constants/config'
import Loading from '@/components/Loading.vue'
import { useStaggerReady } from '@/composables/staggerReady'

const palette = ['#f472b6', '#6f6cf7', '#34d399', '#f59e0b', '#60a5fa', '#9ca3af']

export default {
    name: "CarMaintenanceWeb",
    components: {
        Loading
    },
    setup() {
        const router = useRouter()
        const {
            listVehicles,
            listMaintenanceRecords,
            listReminders,
            updateReminder,
            getPreferences,
            savePreferences
        } = useCarMaintenance()

        const vehicles = ref([])
        const selectedVehicleId = ref('')
        const maintenanceRecords = ref([])
        const reminders = ref([])
        const searchTerm = ref('')
        const scheduleSearch = ref('')
        const vehicleSearch = ref('')
        const loading = ref(false)
        const loadingReminders = ref(false)
        const overlayActive = ref(false)
        const errorMessage = ref('')
        const staggerReady = useStaggerReady()
        const distanceUnit = ref('km')
        const defaultCurrency = ref('USD')
        const maintenanceTypes = ref([])
        const newMaintenanceType = ref('')
        const visibleTypes = computed(() => maintenanceTypes.value?.length ? maintenanceTypes.value : ['Oil Change', 'Brake Pad Replacement', 'Tire Rotation', 'Tire Replacement', 'Battery Replacement', 'Air Filter Replacement', 'Transmission Service', 'Coolant Flush', 'Spark Plug Replacement', 'Brake Fluid Change', 'Alignment', 'Inspection', 'Repair', 'Other'])
        const userName = ref('User')
        const userEmail = ref('user@example.com')
        const currencyOptions = ref(['USD', 'PHP', 'EUR', 'JPY', 'SGD'])
        let searchTimer = null
        let scheduleTimer = null

        const currentTab = ref('home')

        const withOverlay = async(fn) => {
            overlayActive.value = true
            try {
                return await fn()
            } finally {
                overlayActive.value = false
            }
        }

        const setTab = (tab) => {
            currentTab.value = tab
        }

        const displayName = (vehicle) => {
            if (!vehicle) return 'Vehicle'
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            const assembled = parts.join(' ').trim()
            return assembled || vehicle.licensePlate || vehicle.vin || 'Vehicle'
        }

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

        const loadPreferences = async() => {
            await withOverlay(async() => {
                try {
                    const token = localStorage.getItem('token')
                    if (!token) return
                    const prefs = await getPreferences(token)
                    if (prefs?.distanceUnit) distanceUnit.value = prefs.distanceUnit
                    if (prefs?.currency) defaultCurrency.value = prefs.currency
                    if (Array.isArray(prefs?.maintenanceTypes) && prefs.maintenanceTypes.length) {
                        maintenanceTypes.value = prefs.maintenanceTypes
                    }
                } catch (err) {
                    distanceUnit.value = 'km'
                    defaultCurrency.value = 'USD'
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
                        maintenanceRecords.value = []
                        reminders.value = []
                        return
                    }
                    const stored = localStorage.getItem('selectedVehicleId')
                    const preferred = vehicles.value.find(v => v.id === stored) || vehicles.value[0]
                    selectedVehicleId.value = preferred.id
                    await loadMaintenanceRecords()
                    await loadReminders()
                } catch (err) {
                    errorMessage.value = err?.message || 'Unable to load vehicles'
                    vehicles.value = []
                } finally {
                    loading.value = false
                }
            })
        }

        const loadMaintenanceRecords = async() => {
            if (!selectedVehicleId.value) {
                maintenanceRecords.value = []
                return
            }
            loading.value = true
            await withOverlay(async() => {
                try {
                    const token = localStorage.getItem('token')
                    if (!token) throw new Error('You must be logged in.')
                    const params = new URLSearchParams()
                    params.append('vehicleId', selectedVehicleId.value)
                    if (searchTerm.value.trim()) params.append('search', searchTerm.value.trim())
                    maintenanceRecords.value = await listMaintenanceRecords(token, selectedVehicleId.value, params)
                } catch (err) {
                    maintenanceRecords.value = []
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
            loadingReminders.value = true
            await withOverlay(async() => {
                try {
                    const token = localStorage.getItem('token')
                    if (!token) throw new Error('You must be logged in.')
                    reminders.value = await listReminders(token, selectedVehicleId.value)
                } catch (err) {
                    reminders.value = []
                } finally {
                    loadingReminders.value = false
                }
            })
        }

        const handleVehicleChange = async() => {
            localStorage.setItem('selectedVehicleId', selectedVehicleId.value)
            await loadMaintenanceRecords()
            await loadReminders()
        }

        const debouncedSearch = () => {
            if (searchTimer) clearTimeout(searchTimer)
            searchTimer = setTimeout(() => {
                loadMaintenanceRecords()
            }, 250)
        }

        const debouncedScheduleSearch = () => {
            if (scheduleTimer) clearTimeout(scheduleTimer)
            scheduleTimer = setTimeout(() => {
                // filter is computed; no extra fetch needed
            }, 250)
        }

        const goAddMaintenance = () => {
            const query = selectedVehicleId.value ? { vehicleId: selectedVehicleId.value } : {}
            router.push({ path: '/web/car-maintenance/maintenance/add', query })
        }

        const openRecordDetail = (id) => {
            if (!id) return
            router.push(`/web/car-maintenance/maintenance/${id}`)
        }

        const goAddSchedule = () => {
            const query = selectedVehicleId.value ? { vehicleId: selectedVehicleId.value } : {}
            router.push({ path: '/web/car-maintenance/schedules/add', query })
        }

        const goLanding = () => router.push('/')

        const filteredReminders = computed(() => {
            const term = scheduleSearch.value.toLowerCase().trim()
            if (!term) return reminders.value
            return reminders.value.filter(r => {
                return [r.maintenanceType, r.title, r.description].filter(Boolean).some(f => String(f).toLowerCase().includes(term))
            })
        })
        const showLoading = computed(() => loading.value || loadingReminders.value || overlayActive.value)

        const statusFor = (reminder) => {
            const now = new Date()
            if (reminder?.completed) return { class: 'done', icon: 'check-circle', label: 'Done' }
            const due = reminder?.dueDate ? new Date(reminder.dueDate) : null
            if (due && due.getTime() < now.getTime()) return { class: 'missed', icon: 'close-circle', label: 'Missed' }
            return { class: 'upcoming', icon: 'clock-outline', label: 'Upcoming' }
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

        const filteredVehicles = computed(() => {
            const term = vehicleSearch.value.toLowerCase().trim()
            if (!term) return vehicles.value
            return vehicles.value.filter(v => {
                const name = `${v.make || ''} ${v.model || ''} ${v.year || ''}`.trim().toLowerCase()
                const plate = (v.licensePlate || '').toLowerCase()
                return name.includes(term) || plate.includes(term)
            })
        })

        const openVehicle = (id) => router.push(`/web/car-maintenance/vehicles/${id}`)
        const addVehicle = () => router.push('/web/car-maintenance/vehicles/add')
        const openScheduleDetail = (id) => router.push(`/web/car-maintenance/schedules/${id}`)

        const chartData = computed(() => {
            if (!maintenanceRecords.value.length) return []
            const totals = {}
            maintenanceRecords.value.forEach(r => {
                const type = r.maintenanceType || 'Other'
                const cost = Number(r.cost) || 0
                totals[type] = (totals[type] || 0) + cost
            })
            const sum = Object.values(totals).reduce((a, b) => a + b, 0)
            return Object.entries(totals).map(([type, cost], idx) => ({
                type,
                cost,
                percent: sum ? Math.round((cost / sum) * 100) : 0,
                color: palette[idx % palette.length]
            }))
        })

        const totalCost = computed(() => chartData.value.reduce((acc, item) => acc + item.cost, 0))

        const chartSlices = computed(() => {
            let cumulative = 0
            return chartData.value.map(item => {
                const dash = `${item.percent} ${100 - item.percent}`
                const offset = 25 - cumulative
                cumulative += (item.percent / 100) * 100
                return { dash, offset, color: item.color }
            })
        })

        const persistPreferences = async() => {
            try {
                const token = localStorage.getItem('token')
                if (token) {
                    await savePreferences(token, {
                        distanceUnit: distanceUnit.value,
                        currency: defaultCurrency.value,
                        maintenanceTypes: maintenanceTypes.value
                    })
                }
            } catch (err) {
                // fallback to local storage if backend fails
                localStorage.setItem('distanceUnit', distanceUnit.value)
                localStorage.setItem('currencyPreference', defaultCurrency.value)
                localStorage.setItem('maintenanceTypes', JSON.stringify(maintenanceTypes.value))
            }
        }

        const addType = () => {
            const value = newMaintenanceType.value.trim()
            if (!value) return
            if (!maintenanceTypes.value.includes(value)) {
                maintenanceTypes.value.push(value)
                persistPreferences()
            }
            newMaintenanceType.value = ''
        }

        const removeType = (val) => {
            maintenanceTypes.value = maintenanceTypes.value.filter(t => t !== val)
            persistPreferences()
        }

        onMounted(async() => {
            await withOverlay(async() => {
                await loadPreferences()
                await loadVehicles()
            })
        })

        // const userName = computed(() => store.state.userProfile?.fullName || 'there')
        userName.value = (store.state.userProfile?.fullName)
        userEmail.value = (store.state.userProfile?.email)
        return {
            router,
            API_BASE_URL,
            vehicles,
            filteredVehicles,
            vehicleSearch,
            selectedVehicleId,
            maintenanceRecords,
            searchTerm,
            scheduleSearch,
            loading,
            loadingReminders,
            errorMessage,
            displayName,
            formatDate,
            formatMileage,
            formatCurrency,
            currentTab,
            setTab,
            handleVehicleChange,
            debouncedSearch,
            debouncedScheduleSearch,
            goAddMaintenance,
            goAddSchedule,
            goLanding,
            openRecordDetail,
            defaultCurrency,
            reminders,
            filteredReminders,
            statusFor,
            deadlineText,
            toggleStatus,
            distanceUnit,
            chartData,
            chartSlices,
            totalCost,
            addVehicle,
            openVehicle,
            openScheduleDetail,
            userName,
            userEmail,
            maintenanceTypes,
            visibleTypes,
            currencyOptions,
            vehicleSearch,
            persistPreferences,
            setTab,
            newMaintenanceType,
            addType,
            removeType,
            showLoading,
            staggerReady
        }
    }
}
</script>
