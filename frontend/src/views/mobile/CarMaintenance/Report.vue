<template>
<div class="report-page">
    <div class="top-banner">
        <button class="icon-btn" @click="goBack">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <h2 class="title">Report</h2>
        <button class="icon-btn">
            <mdicon name="tune" :size="22"/>
        </button>
    </div>

    <div class="card" v-if="chartData.length">
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

    <div v-else class="empty-state">
        <div class="icon-circle teal">
            <mdicon name="chart-donut" :size="22" />
        </div>
        <h4>No reports yet</h4>
        <p class="sub">Log maintenance for your vehicles to see reports here.</p>
    </div>

    <div class="legend" v-if="legendData.length">
        <div class="legend-row" v-for="item in legendData" :key="item.label">
            <span class="dot" :style="{ background: item.color }">{{ item.percent }}%</span>
            <span class="legend-text">{{ item.label }}</span>
            <span class="legend-value">{{ formatCurrency(item.cost, currency) }}</span>
        </div>
    </div>

    <nav class="bottom-nav">
        <button class="nav-item" @click="goHome">
            <mdicon name="home" :size="22"/>
            <span>Home</span>
        </button>
        <button class="nav-item" @click="goSchedules">
            <mdicon name="clipboard-list-outline" :size="22"/>
            <span>Schedules</span>
        </button>
        <button class="nav-item active">
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

export default {
    name: 'CarMaintenanceReportMobile',
    setup() {
        const router = useRouter()
        const { listVehicles, listMaintenanceRecords } = useCarMaintenance()
        const vehicles = ref([])
        const selectedVehicleId = ref(localStorage.getItem('selectedVehicleId') || '')
        const records = ref([])
        const currency = ref('USD')

        const goBack = () => router.back()
        const goHome = () => router.push('/car-maintenance')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goVehicles = () => router.push('/car-maintenance/vehicles')
        const goSettings = () => router.push('/car-maintenance/settings')

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
            await loadVehicles()
            await loadRecords()
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
            segmentStyle
        }
    }
}
</script>

<style scoped>
.report-page {
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

.card {
    background: white;
    border-radius: 16px;
    margin: 16px;
    padding: 16px;
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.08);
}

.chart-placeholder {
    position: relative;
    display: flex;
    justify-content: center;
    padding: 12px 0 6px;
}

.donut {
    position: relative;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: #f3f4f6;
    overflow: hidden;
}

.donut-segment {
    position: absolute;
    inset: 0;
    border-radius: 50%;
}

.empty-state {
    margin: 24px 0;
    text-align: center;
    color: #475569;
    display: grid;
    place-items: center;
    gap: 8px;
    padding: 20px 0;
}

.donut:after {
    content: '';
    position: absolute;
    inset: 36px;
    background: white;
    border-radius: 50%;
}

.total {
    text-align: center;
    margin-top: 8px;
}

.total-label {
    margin: 0;
    font-weight: 800;
    font-size: 16px;
    color: #111827;
}

.total-range {
    margin: 4px 0 0;
    color: #6b7280;
    font-size: 13px;
}

.legend {
    padding: 0 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.legend-row {
    display: grid;
    grid-template-columns: 70px 1fr auto;
    align-items: center;
    gap: 10px;
}

.dot {
    width: 48px;
    height: 48px;
    border-radius: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 13px;
}

.d1 {
    background: #a03364;
}

.d2 {
    background: #824f79;
}

.d3 {
    background: #23a127;
}

.legend-text {
    color: #1f2937;
    font-weight: 600;
}

.legend-value {
    color: #4b5563;
    font-weight: 600;
    font-size: 14px;
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
