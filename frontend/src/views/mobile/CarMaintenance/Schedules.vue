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

    <div class="empty-wrapper">
        <p class="empty-title">No schedules yet</p>
        <p class="empty-text">Tap the + button to add a scheduled maintenance for this vehicle.</p>
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
        const { listVehicles, updateVehicle } = useCarMaintenance()
        const vehicles = ref([])
        const selectedVehicleId = ref(localStorage.getItem('selectedVehicleId') || '')

        const showVehiclePicker = ref(false)
        const showOdometerModal = ref(false)
        const odometerInput = ref('')
        const savingOdometer = ref(false)

        const goBack = () => router.back()
        const goHome = () => router.push('/car-maintenance')
        const addSchedule = () => {
            router.push({ path: '/car-maintenance/schedules/add', query: selectedVehicleId.value ? { vehicleId: selectedVehicleId.value } : {} })
        }
        const goVehicles = () => router.push('/car-maintenance/vehicles')
        const goSettings = () => router.push('/car-maintenance/settings')
        const goReport = () => router.push('/car-maintenance/report')

        const loadVehicles = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                vehicles.value = await listVehicles(token)
                const preferred = vehicles.value.find(v => v.id === selectedVehicleId.value)
                selectedVehicleId.value = preferred ? preferred.id : vehicles.value[0]?.id || ''
            } catch (err) {
                vehicles.value = []
            }
        }

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
        }
        onMounted(() => {
            loadVehicles()
        })

        return {
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
            savingOdometer
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

.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 20;
}

.modal {
    background: white;
    border-radius: 16px;
    padding: 16px;
    width: 100%;
    max-width: 340px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.16);
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
