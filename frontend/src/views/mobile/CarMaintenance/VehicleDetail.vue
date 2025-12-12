<template>
<div class="car-shell">
    <div class="car-orb one"></div>
    <div class="car-orb two"></div>
    <div class="car-hero">
        <button class="car-icon-btn ghost" @click="goBackPage">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <div>
            <h2 class="car-hero-title">Vehicle Details</h2>
            <p class="car-hero-sub">Specs and registration info</p>
        </div>
        <button class="car-icon-btn" @click="goBack">
            <mdicon name="home" :size="22"/>
        </button>
    </div>

    <div v-if="loading" class="empty-state car-card">Loading...</div>
    <div v-else-if="errorMessage" class="empty-state car-card">{{ errorMessage }}</div>
    <div v-else-if="vehicle" class="car-body">
        <div class="hero car-card">
            <div class="hero-thumb">
                <img 
                    v-if="vehicle.imageUrl" 
                    :src="vehicle.imageUrl.startsWith('http') ? vehicle.imageUrl : `${API_BASE_URL}${vehicle.imageUrl}`" 
                    alt="Vehicle" 
                />
                <mdicon v-else name="car-sports" :size="42"/>
            </div>
            <div class="hero-meta">
                <p class="name">{{ displayName(vehicle) }}</p>
                <p class="type">{{ vehicle.vehicleType }} <span v-if="vehicle.year">· {{ vehicle.year }}</span></p>
                <p class="mileage" v-if="vehicle.currentMileage">Odometer: {{ vehicle.currentMileage.toLocaleString() }} km</p>
            </div>
        </div>

        <div class="detail-card car-card">
            <div class="row">
                <span class="label">License Plate</span>
                <span class="value">{{ vehicle.licensePlate || 'No data' }}</span>
            </div>
            <div class="row">
                <span class="label">VIN</span>
                <span class="value">{{ vehicle.vin || 'No data' }}</span>
            </div>
            <div class="row">
                <span class="label">Reg. Exp. Date</span>
                <span class="value">{{ formatExpiry(vehicle.registrationExpiryDate) }}</span>
            </div>
            <div class="row">
                <span class="label">Color</span>
                <span class="value">{{ vehicle.color || 'No data' }}</span>
            </div>
            <div class="row" v-if="vehicle.notes">
                <span class="label">Notes</span>
                <span class="value">{{ vehicle.notes }}</span>
            </div>
        </div>

        <div class="actions">
            <button class="car-btn danger" @click="showDelete = true">Delete</button>
            <button class="car-btn" @click="editVehicle">Edit</button>
        </div>
    </div>

    <transition name="glass-fade">
        <div v-if="showDelete" class="glass-confirm-overlay" @click.self="showDelete = false">
            <div class="glass-confirm-card">
                <h3 class="glass-confirm-title">Delete vehicle?</h3>
                <p class="glass-confirm-text">This cannot be undone.</p>
                <div class="glass-confirm-actions">
                    <button type="button" @click="showDelete = false" :disabled="deleting">Cancel</button>
                    <button type="button" class="danger" :disabled="deleting" @click="confirmDelete">
                        {{ deleting ? 'Deleting...' : 'Delete' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'
import { API_BASE_URL } from '@/constants/config'

export default {
    name: 'CarMaintenanceVehicleDetail',
    setup() {
        const route = useRoute()
        const router = useRouter()
        const { getVehicle, deleteVehicle } = useCarMaintenance()
        const vehicle = ref(null)
        const loading = ref(false)
        const deleting = ref(false)
        const errorMessage = ref('')
        const showDelete = ref(false)

        const goBack = () => router.push('/')
        const goBackPage = () => router.back()

        const loadVehicle = async() => {
            loading.value = true
            errorMessage.value = ''
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                const data = await getVehicle(token, route.params.id)
                vehicle.value = data
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load vehicle'
            } finally {
                loading.value = false
            }
        }

        const displayName = (v) => {
            const parts = [v?.make, v?.model, v?.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }

        const formatExpiry = (value) => {
            if (!value) return '(No date set)'
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return '(No date set)'
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
        }

        const confirmDelete = async() => {
            if (!vehicle.value?.id) return
            deleting.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                await deleteVehicle(token, vehicle.value.id)
                showDelete.value = false
                router.push('/car-maintenance/vehicles')
            } catch (err) {
                alert(err?.message || 'Unable to delete vehicle')
            } finally {
                deleting.value = false
            }
        }

        const editVehicle = () => {
            if (!vehicle.value?.id) return
            router.push(`/car-maintenance/vehicles/${vehicle.value.id}/edit`)
        }

        onMounted(() => {
            loadVehicle()
        })

        return {
            vehicle,
            loading,
            errorMessage,
            displayName,
            formatExpiry,
            goBack,
            goBackPage,
            API_BASE_URL,
            showDelete,
            confirmDelete,
            deleting,
            editVehicle
        }
    }
}
</script>

<style scoped>
.hero { display: flex; flex-direction: column; gap: 12px; align-items: stretch; }
.hero-thumb { width: 100%; max-height: 220px; border-radius: 18px; background: var(--surface-plain); display: grid; place-items: center; border: 1px solid var(--glass-card-border); overflow: hidden; padding: 12px; }
.hero-thumb img { width: 100%; height: 100%; object-fit: contain; background: transparent; border-radius: 12px; }
:global(.theme-light) .hero-thumb { background: linear-gradient(135deg, rgba(233, 236, 237, 0.1), rgba(241, 240, 243, 0.12)), var(--surface-plain); }
.hero-meta { display: flex; flex-direction: column; gap: 4px; }
.hero-meta p { margin: 0; }
.hero-meta .name { font-weight: 800; font-size: 18px; color: var(--text-primary); }
.hero-meta .type { font-size: 13px; color: var(--text-muted); }
.hero-meta .mileage { font-size: 12px; color: var(--text-muted); }
.detail-card { display: flex; flex-direction: column; gap: 10px; }
.row { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; color: var(--text-primary); }
.label { font-weight: 700; color: var(--text-muted); }
.value { font-weight: 600; }
.actions { display: flex; gap: 10px; padding: 0 16px 16px; width: 100%; }
.actions .car-btn { flex: 1; text-align: center; }
.car-btn.danger { background: var(--danger-gradient); color: #0b1020; }
.empty-state { text-align: center; color: var(--text-muted); }
</style>
