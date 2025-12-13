<template>
<div class="car-shell">
    <div class="car-orb one"></div>
    <div class="car-orb two"></div>
    <div class="car-hero">
        <span class="car-icon-btn ghost"></span>
        <div>
            <h2 class="car-hero-title">Vehicles</h2>
            <p class="car-hero-sub">Manage your garage</p>
        </div>
        <button class="car-icon-btn" @click="goBack">
            <mdicon name="home" :size="22"/>
        </button>
    </div>

    <div class="car-body">
        <div class="car-search car-card">
            <mdicon name="magnify" :size="20" />
            <input v-model="search" type="text" placeholder="Search vehicle" />
        </div>

        <div class="car-list">
            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
            <template v-if="filteredVehicles.length">
                <div
                    class="vehicle-card car-card"
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
                            <span class="value">{{ formatValue(vehicle.licensePlate) }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">VIN</span>
                            <span class="value">{{ formatValue(vehicle.vin) }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Reg. Exp. Date</span>
                            <span class="value"><em>{{ formatExpiry(vehicle.registrationExpiryDate) }}</em></span>
                        </div>
                    </div>
                </div>
            </template>
            <div v-else class="car-empty">
                <div class="icon-circle teal">
                    <mdicon name="car" :size="24" />
                </div>
                <h4>No vehicles yet</h4>
                <p class="sub">Create your first vehicle to start tracking maintenance and schedules.</p>
                <div class="empty-actions">
                    <button class="car-btn" type="button" @click="addVehicle">
                        <mdicon name="plus" :size="18" />
                        <span>Add vehicle</span>
                    </button>
                    <button class="car-btn ghost" type="button" @click="goHome">
                        <mdicon name="home" :size="18" />
                        <span>Home</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <button class="car-fab wide" @click="addVehicle">
        <mdicon name="car" :size="20"/>
        <span>Add vehicle</span>
    </button>

    <nav class="car-bottom-nav glass-nav-orb">
        <button class="car-nav-item" @click="goDashboard">
            <mdicon name="view-dashboard-outline" :size="22"/>
            <span>Dashboard</span>
        </button>
        <button class="car-nav-item" @click="goSchedules">
            <mdicon name="clipboard-list-outline" :size="22"/>
            <span>Schedules</span>
        </button>
        <button class="car-nav-item" @click="goReport">
            <mdicon name="chart-pie" :size="22"/>
            <span>Report</span>
        </button>
        <button class="car-nav-item active">
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
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'
import { API_BASE_URL } from '@/constants/config'
import Loading from '@/components/Loading.vue'

export default {
    name: 'CarMaintenanceVehiclesMobile',
    components: {
        Loading
    },
    setup() {
        const router = useRouter()
        const { listVehicles } = useCarMaintenance()
        const search = ref('')
        const vehicles = ref([])
        const errorMessage = ref('')
        const openMenuId = ref('')
        const loadingOverlay = ref(false)

        const goBack = () => router.push('/')
        const goHome = () => router.push('/')
        const goDashboard = () => router.push('/car-maintenance')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goSettings = () => router.push('/car-maintenance/settings')
        const goReport = () => router.push('/car-maintenance/report')
        const addVehicle = () => router.push('/car-maintenance/vehicles/add')

        const withOverlay = async(fn) => {
            loadingOverlay.value = true
            try {
                return await fn()
            } finally {
                loadingOverlay.value = false
            }
        }

        const openDetail = (id) => {
            if (!id) return
            router.push(`/car-maintenance/vehicles/${id}`)
        }

        const loadVehicles = async() => {
            errorMessage.value = ''
            await withOverlay(async() => {
                try {
                    const token = localStorage.getItem('token')
                    if (!token) throw new Error('You must be logged in.')
                    vehicles.value = await listVehicles(token)
                } catch (err) {
                    errorMessage.value = err?.message || 'Unable to load vehicles'
                    vehicles.value = []
                }
            })
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
            goDashboard,
            goSchedules,
            goSettings,
            goReport,
            displayName,
            formatValue,
            formatExpiry,
            openDetail,
            addVehicle,
            API_BASE_URL,
            loadingOverlay
        }
    }
}
</script>

<style scoped>
.vehicle-card { display: flex; gap: 12px; cursor: pointer; }
.vehicle-thumb { width: 60px; height: 60px; border-radius: 12px; background: var(--glass-ghost-bg); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--glass-card-border); }
.vehicle-thumb img { width: 100%; height: 100%; object-fit: cover; }
.vehicle-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.vehicle-name { margin: 0; font-weight: 800; font-size: 15px; color: var(--text-primary); }
.info-row { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
.label { font-weight: 700; text-transform: uppercase; font-size: 11px; color: var(--text-muted); }
.value { color: var(--text-primary); }
.icon-circle { width: 44px; height: 44px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px; background: var(--pill-gradient); color: #0b1020; box-shadow: 0 10px 22px rgba(0,0,0,0.18); }
.sub { margin: 0; color: var(--text-muted); }
.error-text { color: #dc2626; margin: 0; }
.empty-actions {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.empty-actions .car-btn {
  width: 100%;
  justify-content: center;
}

.empty-actions .car-btn.ghost {
  border: 1px solid var(--glass-card-border);
}
</style>
