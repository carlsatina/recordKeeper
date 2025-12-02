<template>
<div class="vehicles-page">
    <div class="top-banner">
        <button class="icon-btn" @click="goBack">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <h2 class="title">Vehicles</h2>
        <span class="icon-btn ghost"></span>
    </div>

    <div class="search-bar">
        <mdicon name="magnify" :size="20" />
        <input v-model="search" type="text" placeholder="Search Vehicle" />
    </div>

        <div class="vehicle-list">
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <template v-if="filteredVehicles.length">
                <div
                    class="vehicle-card"
                    v-for="vehicle in filteredVehicles"
                    :key="vehicle.id"
                    @click="openDetail(vehicle.id)"
                >
                    <div class="vehicle-thumb">
                        <img 
                            v-if="vehicle.imageUrl" 
                            :src="vehicle.imageUrl.startsWith('http') ? vehicle.imageUrl : `${API_BASE_URL}${vehicle.imageUrl}`" 
                            alt="Vehicle" 
                        />
                        <mdicon v-else name="clipboard-list-outline" :size="24"/>
                    </div>
                    <div class="vehicle-info">
                        <p class="vehicle-name">{{ displayName(vehicle) }}</p>
                        <div class="info-row">
                            <span class="label">License Plate</span>
                            <span class="value">: {{ formatValue(vehicle.licensePlate) }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">VIN</span>
                            <span class="value">: {{ formatValue(vehicle.vin) }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Reg. Exp. Date</span>
                            <span class="value">: <em>{{ formatExpiry(vehicle.registrationExpiryDate) }}</em></span>
                        </div>
                    </div>
                </div>
            </template>
            <div v-else class="empty-vehicles">
                <div class="icon-circle teal">
                    <mdicon name="car" :size="24" />
                </div>
                <h4>No vehicles yet</h4>
                <p class="sub">Create your first vehicle to start tracking maintenance and schedules.</p>
            </div>
        </div>

        <button class="fab add-vehicle" @click="addVehicle">
            <mdicon name="car" :size="20"/>
            <span>Add vehicle</span>
        </button>

    <nav class="bottom-nav">
        <button class="nav-item" @click="goHome">
            <mdicon name="home" :size="22"/>
            <span>Home</span>
        </button>
        <button class="nav-item" @click="goSchedules">
            <mdicon name="clipboard-list-outline" :size="22"/>
            <span>Schedules</span>
        </button>
        <button class="nav-item" @click="goReport">
            <mdicon name="chart-pie" :size="22"/>
            <span>Report</span>
        </button>
        <button class="nav-item active">
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
    name: 'CarMaintenanceVehiclesMobile',
    setup() {
        const router = useRouter()
        const { listVehicles } = useCarMaintenance()
        const search = ref('')
        const vehicles = ref([])
        const errorMessage = ref('')
        const openMenuId = ref('')

        const goBack = () => router.back()
        const goHome = () => router.push('/car-maintenance')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goSettings = () => router.push('/car-maintenance/settings')
        const goReport = () => router.push('/car-maintenance/report')
        const addVehicle = () => router.push('/car-maintenance/vehicles/add')

        const openDetail = (id) => {
            if (!id) return
            router.push(`/car-maintenance/vehicles/${id}`)
        }

        const loadVehicles = async() => {
            errorMessage.value = ''
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                vehicles.value = await listVehicles(token)
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load vehicles'
                vehicles.value = []
            }
        }

        const filteredVehicles = computed(() => {
            const term = search.value.toLowerCase()
            return vehicles.value.filter(v => {
                const name = `${v.make || ''} ${v.model || ''} ${v.year || ''}`.trim()
                return name.toLowerCase().includes(term)
            })
        })

        const displayName = (vehicle) => {
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }

        const formatValue = (value, fallback = 'No data') => value || fallback

        const formatExpiry = (value) => value || '(No date set)'

        onMounted(() => {
            loadVehicles()
        })

        return {
            search,
            vehicles,
            filteredVehicles,
            errorMessage,
            goBack,
            goHome,
            goSchedules,
            goSettings,
            goReport,
            displayName,
            formatValue,
            formatExpiry,
            openDetail,
            addVehicle,
            API_BASE_URL
        }
    }
}
</script>

<style scoped>
.vehicles-page {
    min-height: 100vh;
    background: #f2f4f8;
    padding-bottom: 80px;
}

.top-banner {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    padding: 14px 16px 18px;
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

.search-bar {
    margin: 14px 12px 8px;
    background: white;
    border-radius: 14px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: inset 0 0 0 1px #e5e7eb;
}

.search-bar input {
    border: none;
    outline: none;
    flex: 1;
    font-size: 14px;
}

.vehicle-list {
    padding: 0 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.empty-vehicles {
    margin-top: 20px;
    padding: 18px;
    border-radius: 14px;
    border: 1px dashed #cbd5e1;
    background: #f8fafc;
    text-align: center;
    display: grid;
    gap: 8px;
    place-items: center;
}

.vehicle-card {
    display: grid;
    grid-template-columns: 90px 1fr auto;
    gap: 12px;
    background: white;
    border-radius: 14px;
    padding: 10px;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
    align-items: center;
}

.vehicle-thumb {
    width: 90px;
    height: 80px;
    border-radius: 12px;
    background: #d9e6f7;
    display: flex;
    align-items: center;
    justify-content: center;
}

.vehicle-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
}

.fab {
    position: fixed;
    bottom: 84px;
    right: 20px;
    height: 52px;
    padding: 0 16px;
    border-radius: 18px;
    border: none;
    background: linear-gradient(135deg, #4f46e5, #22d3ee);
    color: #fff;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    box-shadow: 0 12px 26px rgba(79, 70, 229, 0.3);
}

.vehicle-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.vehicle-name {
    margin: 0;
    font-weight: 800;
    font-size: 15px;
    color: #1f2937;
}

.info-row {
    display: flex;
    gap: 6px;
    font-size: 12px;
    color: #4b5563;
}

.label {
    min-width: 88px;
    color: #6b7280;
}

.value em {
    font-style: italic;
    color: #6b7280;
}

.menu-wrapper {
    position: relative;
    justify-self: end;
}

.card-menu {
    border: none;
    background: transparent;
    color: #6b7280;
}

.card-actions {
    position: absolute;
    top: 28px;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    min-width: 120px;
    z-index: 5;
}

.action-btn {
    border: none;
    background: transparent;
    padding: 10px 12px;
    text-align: left;
    font-size: 13px;
    color: #1f2937;
}

.action-btn + .action-btn {
    border-top: 1px solid #f1f5f9;
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
