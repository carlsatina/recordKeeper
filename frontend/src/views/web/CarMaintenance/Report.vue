<template>
<div class="car-shell stagger-page stagger-seq" :class="{ 'stagger-ready': staggerReady }">
    <div class="car-orb one"></div>
    <div class="car-orb two"></div>
    <header class="car-hero">
        <div class="car-brand">
            <div class="logo-circle">
                <mdicon name="chart-pie" :size="24"/>
            </div>
            <div>
                <p class="eyebrow">Car Maintenance</p>
                <h1 class="headline">Report</h1>
            </div>
        </div>
        <nav class="car-tabs">
            <button @click="goHome">Home</button>
            <button @click="goSchedules">Schedules</button>
            <button class="active">Report</button>
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
            </div>

            <div v-if="loading" class="car-empty">Loading report...</div>
            <div v-else-if="errorMessage" class="car-empty">{{ errorMessage }}</div>
            <div v-else-if="!chartData.length" class="car-empty">No maintenance records to show.</div>
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
        </div>
    </main>
    <Loading v-if="showLoading"/>
</div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'
import { useStaggerReady } from '@/composables/staggerReady'
import Loading from '@/components/Loading.vue'

const palette = ['#f472b6', '#6f6cf7', '#34d399', '#f59e0b', '#60a5fa', '#9ca3af']

export default {
    name: 'CarMaintenanceReportWeb',
    components: {
        Loading
    },
    setup() {
        const router = useRouter()
        const { listVehicles, listMaintenanceRecords, getPreferences } = useCarMaintenance()

        const vehicles = ref([])
        const selectedVehicleId = ref(localStorage.getItem('selectedVehicleId') || '')
        const records = ref([])
        const loading = ref(false)
        const errorMessage = ref('')
        const defaultCurrency = ref('USD')
        const overlayActive = ref(false)
        const showLoading = computed(() => loading.value || overlayActive.value)
        const staggerReady = useStaggerReady()

        const withOverlay = async(fn) => {
            overlayActive.value = true
            try {
                return await fn()
            } finally {
                overlayActive.value = false
            }
        }
        const displayName = (vehicle) => {
            if (!vehicle) return 'Vehicle'
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }
        const formatCurrency = (value, currency = 'USD') => {
            if (value === null || value === undefined) return '—'
            try {
                return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value)
            } catch (e) {
                return `${value.toLocaleString()} ${currency}`
            }
        }

        const chartData = computed(() => {
            if (!records.value.length) return []
            const totals = {}
            records.value.forEach(r => {
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

        const loadPreferences = async() => {
            await withOverlay(async() => {
                try {
                    const token = localStorage.getItem('token')
                    if (!token) return
                    const prefs = await getPreferences(token)
                    if (prefs?.currency) defaultCurrency.value = prefs.currency
                } catch (err) {
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
                        records.value = []
                        return
                    }
                    const stored = localStorage.getItem('selectedVehicleId')
                    const preferred = vehicles.value.find(v => v.id === stored) || vehicles.value[0]
                    selectedVehicleId.value = preferred.id
                    await loadRecords()
                } catch (err) {
                    errorMessage.value = err?.message || 'Unable to load vehicles'
                    vehicles.value = []
                } finally {
                    loading.value = false
                }
            })
        }

        const loadRecords = async() => {
            if (!selectedVehicleId.value) {
                records.value = []
                return
            }
            loading.value = true
            await withOverlay(async() => {
                try {
                    const token = localStorage.getItem('token')
                    if (!token) throw new Error('You must be logged in.')
                    const params = new URLSearchParams()
                    params.append('vehicleId', selectedVehicleId.value)
                    records.value = await listMaintenanceRecords(token, selectedVehicleId.value, params)
                } catch (err) {
                    records.value = []
                } finally {
                    loading.value = false
                }
            })
        }

        const handleVehicleChange = async() => {
            localStorage.setItem('selectedVehicleId', selectedVehicleId.value)
            await loadRecords()
        }

        const goHome = () => router.push('/')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goVehicles = () => router.push('/car-maintenance/vehicles')
        const goSettings = () => router.push('/car-maintenance/settings')

        onMounted(async() => {
            await withOverlay(async() => {
                await loadPreferences()
                await loadVehicles()
            })
        })

        return {
            goHome,
            goSchedules,
            goVehicles,
            goSettings,
            vehicles,
            selectedVehicleId,
            handleVehicleChange,
            chartData,
            chartSlices,
            formatCurrency,
            totalCost,
            loading,
            errorMessage,
            displayName,
            defaultCurrency,
            showLoading,
            staggerReady
        }
}
}
</script>
