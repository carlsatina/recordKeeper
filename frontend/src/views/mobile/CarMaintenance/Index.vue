<template>
<div class="car-shell">
    <div class="car-orb one"></div>
    <div class="car-orb two"></div>
    <div class="car-hero">
        <button class="car-icon-btn" @click="goBack">
            <mdicon name="arrow-left" :size="22"/>
        </button>
        <div>
            <h2 class="car-hero-title">Vehicle Logs</h2>
            <p class="car-hero-sub">Maintenance, costs, and history</p>
        </div>
        <button class="car-icon-btn" @click="goHome">
            <mdicon name="home" :size="24"/>
        </button>
    </div>

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

    <section class="history-section car-body">
        <div class="section-header">
            <h3>Maintenance History</h3>
        </div>

        <div class="search-bar car-card">
            <mdicon name="magnify" :size="20"/>
            <input
                v-model="searchTerm"
                type="text"
                placeholder="Search maintenance..."
                @input="debouncedSearch"
            />
        </div>
        <div v-if="errorMessage" class="empty-state">{{ errorMessage }}</div>
        <div v-else-if="loading" class="empty-state small">Loading maintenance records...</div>
        <div v-else-if="!maintenanceRecords.length" class="empty-state">
            No maintenance records yet.
        </div>
        <div 
            v-else
            class="history-card car-card"
            v-for="item in maintenanceRecords"
            :key="item.id || item._id"
            @click="openRecordDetail(item)"
        >
            <div class="history-top">
                <p class="history-title">{{ item.maintenanceType || item.title }}</p>
                <p class="history-date">{{ formatDate(item.serviceDate) }}</p>
            </div>
            <div class="history-bottom">
                <div class="history-meta">
                    <mdicon name="counter" :size="18"/>
                    <span>{{ formatMileage(item.mileageAtService) }}</span>
                </div>
                <div class="history-meta">
                    <mdicon name="cash" :size="18"/>
                    <span>{{ formatCurrency(item.cost, item.currency) }}</span>
                </div>
            </div>
        </div>
    </section>

    <div class="fab-wrapper">
        <button class="fab" @click="addMaintenance">
            <mdicon name="plus" :size="24"/>
        </button>
    </div>

    <div v-if="showOdometerModal" class="modal-backdrop" @click.self="showOdometerModal = false">
        <div class="modal">
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

    <nav class="bottom-nav glass-nav-orb">
        <button class="nav-item active" @click="goHome">
            <mdicon name="view-dashboard-outline" :size="22"/>
            <span>Dashboard</span>
        </button>
        <button class="nav-item" @click="goSchedules">
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
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'
import { API_BASE_URL } from '@/constants/config'

export default {
    name: "CarMaintenanceMobile",
    setup() {
        const router = useRouter()
        const showOdometerModal = ref(false)
        const odometerInput = ref('')
        const savingOdometer = ref(false)
        const { listVehicles, listMaintenanceRecords, updateVehicle, getPreferences } = useCarMaintenance()

        const vehicles = ref([])
        const selectedVehicleId = ref(localStorage.getItem('selectedVehicleId') || '')
        const maintenanceRecords = ref([])
        const searchTerm = ref('')
        const showVehiclePicker = ref(false)
        const loading = ref(false)
        const errorMessage = ref('')
        const distanceUnit = ref('km')

        const selectedVehicle = computed(() => {
            return vehicles.value.find(v => v.id === selectedVehicleId.value) || null
        })

        const goBack = () => {
            if (window.history.length > 1) {
                router.back()
            } else {
                router.push('/car-maintenance/vehicles')
            }
        }

        const goHome = () => router.push('/car-maintenance')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goReport = () => router.push('/car-maintenance/report')
        const goVehicles = () => router.push('/car-maintenance/vehicles')
        const goSettings = () => router.push('/car-maintenance/settings')

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

        const addMaintenance = () => {
            router.push({
                path: '/car-maintenance/maintenance/add',
                query: selectedVehicleId.value ? { vehicleId: selectedVehicleId.value } : {}
            })
        }

        const addVehicle = () => {
            router.push('/car-maintenance/vehicles/add')
        }

        const openHistory = () => {
            alert('Open maintenance history')
        }

        const openRecordDetail = (record) => {
            const id = record?.id || record?._id
            if (!id) return
            const query = record?.vehicleId ? { vehicleId: record.vehicleId } : {}
            router.push({ path: `/car-maintenance/maintenance/${id}`, query })
        }

        const formattedOdometer = computed(() => {
            const value = selectedVehicle.value?.currentMileage
            if (value === null || value === undefined) return '—'
            const converted = distanceUnit.value === 'mi' ? Number(value) * 0.621371 : Number(value)
            const unitLabel = distanceUnit.value === 'mi' ? 'mi' : 'km'
            return `${Math.round(converted).toLocaleString()} ${unitLabel}`
        })

        const formattedOdometerDate = computed(() => formatDate(selectedVehicle.value?.updatedAt || selectedVehicle.value?.createdAt))

        const formatDate = (value) => {
            if (!value) return ''
            const date = value instanceof Date ? value : new Date(value)
            if (Number.isNaN(date.getTime())) return ''
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
                return new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency
                }).format(value)
            } catch (e) {
                return `${value.toLocaleString()} ${currency}`
            }
        }

        const loadVehicles = async() => {
            errorMessage.value = ''
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                const data = await listVehicles(token)
                vehicles.value = data
                const preferred = data.find(v => v.id === selectedVehicleId.value)
                const targetId = preferred ? preferred.id : data[0]?.id || ''
                selectedVehicleId.value = targetId
                if (targetId) {
                    localStorage.setItem('selectedVehicleId', targetId)
                    await loadMaintenanceRecords(targetId, searchTerm.value)
                } else {
                    localStorage.removeItem('selectedVehicleId')
                    maintenanceRecords.value = []
                    router.push('/car-maintenance/vehicles')
                }
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load vehicles'
                vehicles.value = []
                maintenanceRecords.value = []
            }
        }

        const loadMaintenanceRecords = async(vehicleId, search = '') => {
            if (!vehicleId) {
                maintenanceRecords.value = []
                return
            }
            loading.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                const params = new URLSearchParams()
                params.append('vehicleId', vehicleId)
                if (search) params.append('search', search)
                maintenanceRecords.value = await listMaintenanceRecords(token, vehicleId, params)
            } catch (err) {
                console.error(err)
                maintenanceRecords.value = []
            } finally {
                loading.value = false
            }
        }

        const toggleVehiclePicker = () => {
            showVehiclePicker.value = !showVehiclePicker.value
        }

        const selectVehicle = async(vehicleId) => {
            selectedVehicleId.value = vehicleId
            showVehiclePicker.value = false
            localStorage.setItem('selectedVehicleId', vehicleId)
            await loadMaintenanceRecords(vehicleId, searchTerm.value)
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

        onMounted(() => {
            loadVehicles()
            loadPreferences()
        })

        let searchTimer = null
        const debouncedSearch = () => {
            if (searchTimer) clearTimeout(searchTimer)
            searchTimer = setTimeout(() => {
                if (selectedVehicleId.value) {
                    loadMaintenanceRecords(selectedVehicleId.value, searchTerm.value)
                }
            }, 300)
        }

        const displayName = (vehicle) => {
            if (!vehicle) return 'Vehicle'
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }

        return {
            goBack,
            vehicles,
            selectedVehicle,
            maintenanceRecords,
            formattedOdometer,
            formattedOdometerDate,
            formatDate,
            formatMileage,
            formatCurrency,
            updateOdometer,
            addMaintenance,
            openHistory,
            goHome,
            goSchedules,
            goReport,
            goVehicles,
            goSettings,
            addVehicle,
            searchTerm,
            debouncedSearch,
            showVehiclePicker,
            toggleVehiclePicker,
            selectVehicle,
            selectedVehicleId,
            loading,
            errorMessage,
            displayName,
            distanceUnit,
            API_BASE_URL,
            openRecordDetail,
            showOdometerModal,
            odometerInput,
            saveOdometer,
            savingOdometer
        }
    }
}
</script>

<style scoped>
.vehicle-picker { margin: 8px 16px 0; background: var(--glass-ghost-bg); color: var(--text-primary); border-radius: 12px; box-shadow: var(--glass-card-shadow); border: 1px solid var(--glass-card-border); overflow: hidden; }
.picker-item { width: 100%; border: none; background: transparent; padding: 10px 12px; text-align: left; font-weight: 600; color: var(--text-primary); display: flex; flex-direction: column; gap: 2px; }
.picker-item + .picker-item { border-top: 1px solid var(--glass-card-border); }
.picker-empty { margin: 0; padding: 10px 12px; color: var(--text-muted); font-size: 13px; }
.vehicle-pill { margin: 12px 16px 0; color: var(--text-primary); border-radius: 16px; padding: 12px; display: flex; align-items: center; gap: 10px; box-shadow: var(--glass-card-shadow); }
.avatar { width: 48px; height: 48px; border-radius: 14px; background: var(--glass-ghost-bg); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--glass-card-border); }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.vehicle-meta p { margin: 0; }
.vehicle-name { font-weight: 700; font-size: 15px; }
.vehicle-odo { font-size: 12px; opacity: 0.9; }
.picker-name { font-weight: 700; }
picker-odo { font-size: 12px; color: var(--text-muted); }
.vehicle-type { font-size: 13px; opacity: 0.9; }
.vehicle-updated { font-size: 11px; opacity: 0.8; margin: 2px 0 0; }
.vehicle-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.vehicle-dropdown { opacity: 0.9; }
.update-btn { border: 1px solid var(--glass-card-border); background: var(--glass-ghost-bg); color: var(--text-primary); padding: 6px 10px; border-radius: 10px; font-weight: 700; box-shadow: none; }
.update-btn.small { padding: 6px 10px; font-size: 13px; }
.history-section { padding: 12px 16px 80px; display: flex; flex-direction: column; gap: 12px; }
.section-header { display: flex; align-items: center; justify-content: space-between; }
.search-bar { display: flex; align-items: center; gap: 8px; }
.search-bar input { border: none; outline: none; width: 100%; font-size: 14px; background: transparent; color: var(--text-primary); }
.history-card { display: grid; gap: 8px; cursor: pointer; }
.history-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.history-title { margin: 0; color: var(--text-primary); font-weight: 700; }
.history-date { margin: 0; color: var(--text-muted); font-size: 13px; }
.history-bottom { display: flex; align-items: center; gap: 14px; color: var(--text-primary); font-size: 13px; }
.history-meta { display: inline-flex; align-items: center; gap: 6px; }
.empty-state { color: var(--text-muted); text-align: center; padding: 16px; background: var(--glass-ghost-bg); border-radius: 12px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); border: 1px solid var(--glass-card-border); }
.fab { width: 56px; height: 56px; border-radius: 28px; border: none; background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); color: #0b1020; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35); }
.fab-wrapper { position: fixed; bottom: 84px; right: 20px; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.fab-menu { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
.fab-row { border: none; background: transparent; display: inline-flex; align-items: center; gap: 8px; padding: 0; }
.fab-label { padding: 10px 12px; border-radius: 12px; color: #0b1020; font-weight: 700; font-size: 13px; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); background: var(--pill-gradient); }
.fab-icon { width: 44px; height: 44px; border-radius: 22px; background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); color: #0b1020; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); }
.bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: var(--glass-ghost-bg); display: grid; grid-template-columns: repeat(5, 1fr); border-top: 1px solid var(--glass-card-border); padding: 8px 4px; backdrop-filter: blur(10px); }
.nav-item { border: none; background: transparent; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 12px; }
.nav-item.active { color: var(--accent-1); font-weight: 700; }
.modal-backdrop { position: fixed; inset: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.55); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 3000; }
.modal { display: block; position: relative; background: var(--glass-card-bg); border-radius: 16px; padding: 16px; box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2); width: 85%; max-width: 320px; height: auto; border: 1px solid var(--glass-card-border); }
.modal-title { margin: 0 0 6px; font-weight: 800; color: var(--text-primary); }
.modal-text { margin: 0 0 10px; color: var(--text-muted); }
.modal-input { width: 100%; border: 1px solid var(--glass-card-border); border-radius: 10px; padding: 10px; font-size: 16px; margin-bottom: 12px; background: var(--glass-ghost-bg); color: var(--text-primary); }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
.modal-actions .cancel { border: 1px solid var(--glass-card-border); background: var(--glass-ghost-bg); color: var(--text-primary); padding: 8px 12px; border-radius: 10px; font-weight: 700; }
.modal-actions .confirm { border: none; background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); color: #0b1020; padding: 8px 12px; border-radius: 10px; font-weight: 700; }
</style>
