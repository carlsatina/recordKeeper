<template>
<div class="page">
    <header class="hero">
        <div class="brand">
            <button class="icon-btn" @click="router.back()">
                <mdicon name="chevron-left" :size="22"/>
            </button>
            <h2 class="title">Vehicle Detail</h2>
        </div>
    </header>
    <main class="content">
        <div v-if="loading" class="empty">Loading...</div>
        <div v-else-if="errorMessage" class="empty">{{ errorMessage }}</div>
        <div v-else-if="!vehicle" class="empty">Vehicle not found.</div>
        <div v-else class="panel">
            <div class="hero-image">
                <img
                    v-if="vehicle.imageUrl"
                    :src="vehicle.imageUrl.startsWith('http') ? vehicle.imageUrl : `${API_BASE_URL}${vehicle.imageUrl}`"
                    alt="vehicle"
                />
                <div v-else class="placeholder">
                    <mdicon name="car-sports" :size="48"/>
                </div>
            </div>

            <div class="top">
                <div class="meta">
                    <p class="name">{{ displayName(vehicle) }}</p>
                    <p class="sub">{{ vehicle.vehicleType || 'Vehicle' }}</p>
                    <p class="sub" v-if="vehicle.currentMileage">Odometer: {{ vehicle.currentMileage.toLocaleString() }} km</p>
                </div>
            </div>

            <div class="details-grid">
                <div class="row"><span class="label">License Plate</span><span class="value">{{ vehicle.licensePlate || '—' }}</span></div>
                <div class="row"><span class="label">VIN</span><span class="value">{{ vehicle.vin || '—' }}</span></div>
                <div class="row"><span class="label">Registration Exp.</span><span class="value">{{ formatExpiry(vehicle.registrationExpiryDate) }}</span></div>
                <div class="row"><span class="label">Color</span><span class="value">{{ vehicle.color || '—' }}</span></div>
                <div class="row"><span class="label">Notes</span><span class="value">{{ vehicle.notes || '—' }}</span></div>
            </div>

            <div class="bottom-actions">
                <button class="ghost full" @click="editVehicle">Edit</button>
                <button class="danger full" @click="showDelete = true">Delete</button>
            </div>
        </div>
    </main>

    <div v-if="showDelete" class="modal-backdrop" @click.self="showDelete = false">
        <div class="modal">
            <p class="modal-title">Delete vehicle?</p>
            <p class="modal-text">This cannot be undone.</p>
            <div class="modal-actions">
                <button class="cancel" @click="showDelete = false">Cancel</button>
                <button class="confirm" :disabled="deleting" @click="confirmDelete">
                    {{ deleting ? 'Deleting...' : 'Delete' }}
                </button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'
import { API_BASE_URL } from '@/constants/config'

export default {
    name: 'CarMaintenanceVehicleDetailWeb',
    setup() {
        const route = useRoute()
        const router = useRouter()
        const { getVehicle, deleteVehicle } = useCarMaintenance()
        const vehicle = ref(null)
        const loading = ref(false)
        const deleting = ref(false)
        const errorMessage = ref('')
        const showDelete = ref(false)

        const displayName = (v) => {
            const parts = [v?.make, v?.model, v?.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }
        const formatExpiry = (value) => {
            if (!value) return '(No date set)'
            const d = new Date(value)
            if (Number.isNaN(d.getTime())) return '(No date set)'
            return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
        }

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

        const editVehicle = () => {
            if (!vehicle.value?.id) return
            router.push(`/web/car-maintenance/vehicles/${vehicle.value.id}/edit`)
        }

        const confirmDelete = async() => {
            if (!vehicle.value?.id) return
            deleting.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                await deleteVehicle(token, vehicle.value.id)
                showDelete.value = false
                router.push('/web/car-maintenance/vehicles')
            } catch (err) {
                alert(err?.message || 'Unable to delete vehicle')
            } finally {
                deleting.value = false
            }
        }

        onMounted(() => {
            loadVehicle()
        })

        return {
            router,
            API_BASE_URL,
            vehicle,
            loading,
            errorMessage,
            showDelete,
            displayName,
            formatExpiry,
            editVehicle,
            confirmDelete,
            deleting
        }
    }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f6f7fb; }
.hero {
    padding: 16px 20px;
    background: linear-gradient(135deg, #6f6cf7, #f093fb);
    color: white;
    box-shadow: 0 8px 18px rgba(0,0,0,0.12);
}
.brand { display: flex; align-items: center; gap: 10px; }
.title { margin: 0; font-weight: 800; }
.icon-btn { border: none; background: transparent; color: inherit; }
.content { padding: 20px 24px 40px; max-width: 900px; margin: 0 auto; }
.panel {
    background: white;
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 10px 24px rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.hero-image {
    width: 100%;
    height: 400px;
    aspect-ratio: 16 / 9;
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(135deg, #eef2ff, #e0e7ff);
    display: flex;
    align-items: center;
    justify-content: center;
}
.hero-image img { width: 100%; height: 100%; object-fit:fill; }
.placeholder { color: #6b7280; }
.top { display: grid; grid-template-columns: 1fr; gap: 8px; align-items: center; }
.meta { display: flex; flex-direction: column; gap: 4px; }
.name { margin: 0; font-weight: 800; font-size: 18px; color: #111827; }
.sub { margin: 0; color: #6b7280; font-size: 13px; }
.ghost { border: 1px solid #e5e7eb; background: transparent; color: #4b5563; padding: 10px 12px; border-radius: 10px; cursor: pointer; }
.danger { border: none; background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 10px 12px; border-radius: 10px; cursor: pointer; }
.bottom-actions { display: flex; gap: 12px; margin-top: 8px; }
.bottom-actions .full { flex: 1; }
.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 8px 14px; }
.row { display: flex; justify-content: space-between; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
.row:last-child { border-bottom: none; }
.label { color: #6b7280; margin: 0; }
.value { margin: 0; font-weight: 700; color: #111827; }
.empty { padding: 16px; text-align: center; color: #6b7280; }

.modal-backdrop {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 3000;
}
.modal {
    display: block;
    position: relative;
    background: white;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 360px;
    height: auto;
}
.modal-title { margin: 0 0 4px; font-weight: 800; font-size: 16px; color: #1f2937; }
.modal-text { margin: 0 0 12px; color: #6b7280; font-size: 14px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.modal-actions button { border-radius: 12px; padding: 10px 14px; font-weight: 700; border: none; }
.cancel { background: #f3f4f6; color: #374151; }
.confirm { background: linear-gradient(135deg, #f093fb, #f5576c); color: white; }
</style>
