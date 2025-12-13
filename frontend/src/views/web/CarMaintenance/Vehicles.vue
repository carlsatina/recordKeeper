<template>
<div class="car-shell">
    <div class="car-orb one"></div>
    <div class="car-orb two"></div>
    <header class="car-hero">
        <div class="car-brand">
            <div class="logo-circle">
                <mdicon name="car" :size="24"/>
            </div>
            <div>
                <p class="eyebrow">Car Maintenance</p>
                <h1 class="headline">Vehicles</h1>
            </div>
        </div>
        <nav class="car-tabs">
            <button @click="goHome">Home</button>
            <button @click="goSchedules">Schedules</button>
            <button @click="goReport">Report</button>
            <button class="active">Vehicles</button>
            <button @click="goSettings">Settings</button>
        </nav>
    </header>

    <main class="car-body">
        <div class="car-panel glass-card">
            <div class="car-toolbar">
                <div class="car-search">
                    <mdicon name="magnify" :size="20"/>
                    <input v-model="search" type="text" placeholder="Search Vehicle" />
                </div>
                <button class="car-btn" @click="addVehicle">
                    <mdicon name="plus" :size="18"/><span>Add Vehicle</span>
                </button>
            </div>

            <div v-if="loading" class="car-empty">Loading vehicles...</div>
            <div v-else-if="errorMessage" class="car-empty">{{ errorMessage }}</div>
            <div v-else-if="!filteredVehicles.length" class="car-empty">No vehicles yet. Add your first vehicle.</div>

            <div class="car-vehicle-grid" v-else>
                <div class="car-vehicle-card" v-for="v in filteredVehicles" :key="v.id" @click="openDetail(v.id)">
                    <div class="car-thumb">
                        <img v-if="v.imageUrl" :src="v.imageUrl.startsWith('http') ? v.imageUrl : `${API_BASE_URL}${v.imageUrl}`" alt="vehicle" />
                        <mdicon v-else name="clipboard-list-outline" :size="28"/>
                    </div>
                    <div class="car-info">
                        <p class="car-name">{{ displayName(v) }}</p>
                        <p class="car-sub">License: {{ v.licensePlate || '—' }}</p>
                        <p class="car-sub">VIN: {{ v.vin || '—' }}</p>
                        <p class="car-sub">Reg. Exp.: {{ formatExpiry(v.registrationExpiryDate) }}</p>
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
import { API_BASE_URL } from '@/constants/config'
import Loading from '@/components/Loading.vue'

export default {
    name: 'CarMaintenanceVehiclesWeb',
    components: {
        Loading
    },
    setup() {
        const router = useRouter()
        const { listVehicles } = useCarMaintenance()
        const vehicles = ref([])
        const loading = ref(false)
        const errorMessage = ref('')
        const search = ref('')

        const loadVehicles = async() => {
            loading.value = true
            errorMessage.value = ''
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                vehicles.value = await listVehicles(token)
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load vehicles'
                vehicles.value = []
            } finally {
                loading.value = false
            }
        }

        const filteredVehicles = computed(() => {
            const term = search.value.toLowerCase()
            return vehicles.value.filter(v => {
                const name = `${v.make || ''} ${v.model || ''} ${v.year || ''}`.trim().toLowerCase()
                const plate = (v.licensePlate || '').toLowerCase()
                return name.includes(term) || plate.includes(term)
            })
        })
        const showLoading = computed(() => loading.value)

        const displayName = (vehicle) => {
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }

        const formatExpiry = (value) => {
            if (!value) return '(No date set)'
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return '(No date set)'
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
        }

        const openDetail = (id) => router.push(`/car-maintenance/vehicles/${id}`)
        const addVehicle = () => router.push('/car-maintenance/vehicles/add')
        const goHome = () => router.push('/')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goReport = () => router.push('/car-maintenance/report')
        const goSettings = () => router.push('/car-maintenance/settings')

        onMounted(() => {
            loadVehicles()
        })

        return {
            vehicles,
            filteredVehicles,
            loading,
            errorMessage,
            search,
            displayName,
            formatExpiry,
            openDetail,
            addVehicle,
            goHome,
            goSchedules,
            goReport,
            goSettings,
            API_BASE_URL,
            showLoading
        }
    }
}
</script>
