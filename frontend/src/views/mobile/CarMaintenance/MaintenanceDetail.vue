<template>
<div class="car-shell">
    <div class="car-orb one"></div>
    <div class="car-orb two"></div>
    <div class="car-hero">
        <button class="car-icon-btn" @click="goBack">
            <mdicon name="arrow-left" :size="22"/>
        </button>
        <div>
            <h2 class="car-hero-title">Maintenance Detail</h2>
            <p class="car-hero-sub">Service record overview</p>
        </div>
        <span class="car-icon-btn ghost"></span>
        <button class="car-icon-btn" @click="editRecord">
            <mdicon name="pencil" :size="20"/>
        </button>
    </div>

    <div v-if="loading" class="empty-state car-card">Loading...</div>
    <div v-else-if="errorMessage" class="empty-state car-card">{{ errorMessage }}</div>
    <div v-else-if="record" class="car-body">
        <div class="hero car-card">
            <div class="hero-image">
                <img v-if="vehicleImage" :src="vehicleImage" alt="Vehicle" />
                <mdicon v-else name="car" :size="48"/>
            </div>
            <div class="hero-meta">
                <p class="title-text">{{ record?.title }}</p>
                <p class="meta">{{ vehicleName }}</p>
            </div>
        </div>

        <div class="info-grid car-card">
            <div class="info-item full">
                <span class="label">Type</span>
                <span class="value">{{ record?.maintenanceType }}</span>
            </div>
            <div class="info-item full">
                <span class="label">Location</span>
                <span class="value">{{ record?.location || '—' }}</span>
            </div>
            <div class="info-item inline">
                <span class="label">Service Date</span>
                <span class="value">{{ formatDate(record?.serviceDate) }}</span>
            </div>
            <div class="info-item inline">
                <span class="label">Serviced By</span>
                <span class="value">{{ record?.servicedBy || '—' }}</span>
            </div>
            <div class="info-item">
                <span class="label">Mileage</span>
                <span class="value">{{ formatMileage(record?.mileageAtService) }}</span>
            </div>
            <div class="info-item">
                <span class="label">Cost</span>
                <span class="value">{{ formatCurrency(record?.cost, record?.currency) }}</span>
            </div>
        </div>

        <div class="notes car-card" v-if="record?.description">
            <p class="label">Notes</p>
            <p class="value">{{ record.description }}</p>
        </div>

        <div class="actions">
            <button class="car-btn danger" @click="confirmDelete = true">Delete</button>
            <button class="car-btn" @click="editRecord">Edit</button>
        </div>
    </div>

    <transition name="glass-fade">
        <div v-if="confirmDelete" class="glass-confirm-overlay" @click.self="confirmDelete = false">
            <div class="glass-confirm-card">
                <h3 class="glass-confirm-title">Delete maintenance record?</h3>
                <p class="glass-confirm-text">This action cannot be undone.</p>
                <div class="glass-confirm-actions">
                    <button type="button" @click="confirmDelete = false">Cancel</button>
                    <button type="button" class="danger" @click="deleteRecord">Delete</button>
                </div>
            </div>
        </div>
    </transition>
    <Loading v-if="loadingOverlay"/>
</div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE_URL } from '@/constants/config'
import { useCarMaintenance } from '@/composables/carMaintenance'
import Loading from '@/components/Loading.vue'

export default {
    name: 'MaintenanceDetailMobile',
    components: {
        Loading
    },
    setup() {
        const route = useRoute()
        const router = useRouter()
        const { getMaintenanceRecord, listVehicles, deleteMaintenanceRecord } = useCarMaintenance()

        const record = ref(null)
        const vehicles = ref([])
        const confirmDelete = ref(false)
        const loading = ref(true)
        const loadingOverlay = ref(false)

        const withOverlay = async(fn) => {
            loadingOverlay.value = true
            try {
                return await fn()
            } finally {
                loadingOverlay.value = false
            }
        }

        const vehicleName = computed(() => {
            if (!record.value) return ''
            const vehicle = vehicles.value.find(v => v.id === record.value.vehicleId)
            if (!vehicle) return ''
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            return parts.join(' ').trim()
        })

        const vehicleImage = computed(() => {
            const vehicle = vehicles.value.find(v => v.id === record.value?.vehicleId)
            if (!vehicle || !vehicle.imageUrl) return ''
            return vehicle.imageUrl.startsWith('http') ? vehicle.imageUrl : `${API_BASE_URL}${vehicle.imageUrl}`
        })

        const formatDate = (value) => {
            if (!value) return ''
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return ''
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
        }

        const formatMileage = (value) => {
            if (value === null || value === undefined) return '—'
            return `${value.toLocaleString()} km`
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

        const loadData = async() => {
            const token = localStorage.getItem('token')
            const id = route.params.id
            if (!token || !id) return router.back()
            loading.value = true
            await withOverlay(async() => {
                try {
                    const [rec, veh] = await Promise.all([
                        getMaintenanceRecord(token, id),
                        listVehicles(token)
                    ])
                    record.value = rec
                    vehicles.value = veh
                } catch (err) {
                    router.back()
                } finally {
                    loading.value = false
                }
            })
        }

        const goBack = () => {
            if (window.history.length > 1) {
                router.back()
            } else {
                router.push('/car-maintenance')
            }
        }
        const editRecord = () => {
            if (!record.value) return
            router.push({ path: '/car-maintenance/maintenance/add', query: { edit: 'true', id: record.value.id, vehicleId: record.value.vehicleId } })
        }
        const deleteRecord = async() => {
            if (!record.value) return
            const token = localStorage.getItem('token')
            if (!token) return
            await withOverlay(async() => {
                try {
                    await deleteMaintenanceRecord(token, record.value.id)
                    router.push('/car-maintenance')
                } catch (err) {
                    console.error(err)
                }
            })
        }

        onMounted(() => {
            loadData()
        })

        return {
            record,
            vehicleName,
            vehicleImage,
            formatDate,
            formatMileage,
            formatCurrency,
            goBack,
            editRecord,
            deleteRecord,
            confirmDelete,
            loading,
            loadingOverlay
        }
    }
}
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hero-image {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: var(--glass-ghost-bg);
  display: grid;
  place-items: center;
  border: 1px solid var(--glass-card-border);
  overflow: hidden;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-text {
  margin: 0;
  font-weight: 800;
  font-size: 18px;
  color: var(--text-primary);
}

.meta {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--glass-ghost-bg);
  border: 1px solid var(--glass-card-border);
  border-radius: 12px;
  padding: 10px;
  color: var(--text-primary);
}

.info-item.full {
  grid-column: 1 / -1;
}

.label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 700;
}

.value {
  font-weight: 700;
  font-size: 15px;
}

.notes .label {
  margin-bottom: 6px;
}

.notes .value {
  margin: 0;
  line-height: 1.5;
  color: var(--text-secondary);
}

.actions {
  display: flex;
  gap: 10px;
  padding: 0 16px 16px;
}

.car-btn.danger {
  background: var(--danger-gradient);
  color: #0b1020;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
}
</style>
