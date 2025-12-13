<template>
<div class="car-shell">
    <div class="car-orb one"></div>
    <div class="car-orb two"></div>
    <div class="car-hero">
        <span class="car-icon-btn ghost"></span>
        <div>
            <h2 class="car-hero-title">Report</h2>
            <p class="car-hero-sub">Service cost breakdown</p>
        </div>
        <button class="car-icon-btn" @click="goBack">
            <mdicon name="home" :size="22"/>
        </button>
    </div>

    <div class="car-body">
        <div class="report-card car-card" v-if="chartData.length">
            <div class="chart-placeholder">
                <div class="donut">
                    <div 
                        class="donut-segment" 
                        v-for="(slice, idx) in chartData" 
                        :key="slice.label"
                        :style="segmentStyle(slice, idx)"
                    ></div>
                </div>
            </div>
            <div class="total">
                <p class="total-label">Total : {{ formatCurrency(totalCost, currency) }}</p>
                <p class="total-range">{{ dateRange }}</p>
            </div>
        </div>

        <div v-else class="car-empty">
            <div class="icon-circle teal">
                <mdicon name="chart-donut" :size="22" />
            </div>
            <h4>No reports yet</h4>
            <p class="sub">Log maintenance for your vehicles to see reports here.</p>
        </div>

        <div class="legend car-card" v-if="legendData.length">
            <div class="legend-row" v-for="item in legendData" :key="item.label">
                <span class="dot" :style="{ background: item.color }">{{ item.percent }}%</span>
                <span class="legend-text">{{ item.label }}</span>
                <span class="legend-value">{{ formatCurrency(item.cost, currency) }}</span>
            </div>
        </div>
    </div>

    <nav class="car-bottom-nav glass-nav-orb">
        <button class="car-nav-item" @click="goHome">
            <mdicon name="view-dashboard-outline" :size="22"/>
            <span>Dashboard</span>
        </button>
        <button class="car-nav-item" @click="goSchedules">
            <mdicon name="clipboard-list-outline" :size="22"/>
            <span>Schedules</span>
        </button>
        <button class="car-nav-item active">
            <mdicon name="chart-pie" :size="22"/>
            <span>Report</span>
        </button>
        <button class="car-nav-item" @click="goVehicles">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'
import Loading from '@/components/Loading.vue'

export default {
    name: 'CarMaintenanceReportMobile',
    components: {
        Loading
    },
    setup() {
        const router = useRouter()
        const { listVehicles, listMaintenanceRecords } = useCarMaintenance()
        const vehicles = ref([])
        const selectedVehicleId = ref(localStorage.getItem('selectedVehicleId') || '')
        const records = ref([])
        const currency = ref('USD')
        const loadingOverlay = ref(false)

        const withOverlay = async(fn) => {
            loadingOverlay.value = true
            try {
                return await fn()
            } finally {
                loadingOverlay.value = false
            }
        }

        const goBack = () => router.push('/')
        const goHome = () => router.push('/')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goVehicles = () => router.push('/car-maintenance/vehicles')
        const goSettings = () => router.push('/car-maintenance/settings')

        const handleVehicleChange = async() => {
            await withOverlay(async() => {
                await loadRecords()
            })
        }

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

        const loadRecords = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token || !selectedVehicleId.value) {
                    records.value = []
                    return
                }
                records.value = await listMaintenanceRecords(token, selectedVehicleId.value)
            } catch (err) {
                records.value = []
            }
        }

        const totalCost = computed(() => {
            return records.value.reduce((sum, rec) => sum + (rec.cost || 0), 0)
        })

        const legendData = computed(() => {
            if (!records.value.length || totalCost.value === 0) return []
            const colors = ['#a03364', '#824f79', '#23a127', '#f39c12', '#4f46e5']
            return records.value.map((rec, idx) => {
                const cost = rec.cost || 0
                const percent = Math.round((cost / totalCost.value) * 100)
                return {
                    label: rec.title || rec.maintenanceType,
                    cost,
                    percent,
                    color: colors[idx % colors.length]
                }
            })
        })

        const chartData = computed(() => legendData.value)

        const dateRange = computed(() => {
            if (!records.value.length) return ''
            const dates = records.value
                .map(rec => new Date(rec.serviceDate))
                .filter(d => !Number.isNaN(d.getTime()))
                .sort((a, b) => a - b)
            if (!dates.length) return ''
            const start = dates[0]
            const end = dates[dates.length - 1]
            const fmt = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
            return `${fmt(start)} - ${fmt(end)}`
        })

        const formatCurrency = (value, cur = 'USD') => {
            if (value === null || value === undefined) return '—'
            try {
                return new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: cur
                }).format(value)
            } catch (e) {
                return `${value.toLocaleString()} ${cur}`
            }
        }

        const segmentStyle = (slice, idx) => {
            const offset = legendData.value.slice(0, idx).reduce((sum, s) => sum + s.percent, 0)
            return {
                background: `conic-gradient(${slice.color} ${slice.percent}%, transparent 0)`,
                transform: `rotate(${offset * 3.6}deg)`
            }
        }

        onMounted(async() => {
            await withOverlay(async() => {
                await loadVehicles()
                await loadRecords()
            })
        })

        return {
            goBack,
            goHome,
            goSchedules,
            goVehicles,
            goSettings,
            records,
            chartData,
            legendData,
            totalCost,
            dateRange,
            formatCurrency,
            currency,
            segmentStyle,
            loadingOverlay,
            handleVehicleChange
        }
    }
}
</script>

<style scoped>
.report-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.chart-placeholder {
  width: 200px;
  height: 200px;
  display: grid;
  place-items: center;
}

.donut {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  background: var(--glass-ghost-bg);
  border: 1px solid var(--glass-card-border);
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.15);
}

.donut-segment {
  position: absolute;
  inset: 0;
}

.total {
  text-align: center;
}

.total-label {
  margin: 0;
  font-weight: 800;
  color: var(--text-primary);
}

.total-range {
  margin: 0;
  color: var(--text-muted);
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-row {
  display: grid;
  grid-template-columns: 70px 1fr auto;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
}

.dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 10px;
  color: #0b1020;
  font-weight: 800;
}

.legend-text {
  font-weight: 700;
}

.legend-value {
  font-weight: 800;
}

.icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  background: var(--pill-gradient);
  color: #0b1020;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
}

.sub {
  margin: 0;
  color: var(--text-muted);
}
</style>
