<template>
<div class="vehicle-logs-page">
    <div class="top-bar">
        <button class="icon-btn" @click="goBack">
            <mdicon name="chevron-left" :size="24"/>
        </button>
        <h2 class="page-title">Vehicle Logs</h2>
        <span class="icon-btn ghost"></span>
    </div>

    <div class="vehicle-card">
        <div class="vehicle-header">
            <div class="avatar">
                <mdicon name="car-sports" :size="28"/>
            </div>
            <div class="vehicle-meta">
                <p class="vehicle-name">{{ vehicle.name }}</p>
                <p class="vehicle-type">{{ vehicle.type }}</p>
            </div>
            <mdicon name="chevron-down" :size="22" class="vehicle-dropdown"/>
        </div>

        <div class="odometer-card">
            <div class="odometer-label">Odometer</div>
            <div class="odometer-row">
                <div class="odometer-reading">{{ formattedOdometer }}</div>
                <button class="update-btn" @click="updateOdometer">
                    Update Odometer
                </button>
            </div>
            <p class="odometer-updated">Last update: {{ formattedOdometerDate }}</p>
        </div>
    </div>

    <section class="history-section">
        <div class="section-header">
            <h3>Maintenance History</h3>
            <button class="circle-btn" @click="openHistory">
                <mdicon name="chevron-right" :size="20"/>
            </button>
        </div>

        <div v-if="!history.length" class="empty-state">
            No maintenance records yet.
        </div>
        <div 
            v-else
            class="history-card"
            v-for="item in history"
            :key="item.id"
        >
            <div class="history-top">
                <p class="history-title">{{ item.title }}</p>
                <p class="history-date">{{ formatDate(item.serviceDate) }}</p>
            </div>
            <div class="history-bottom">
                <div class="history-meta">
                    <mdicon name="counter" :size="18"/>
                    <span>{{ formatMileage(item.mileageAtService) }}</span>
                </div>
                <div class="history-meta">
                    <mdicon name="cash" :size="18"/>
                    <span>{{ formatCurrency(item.cost, item.currency) }}</span>
                </div>
            </div>
        </div>
    </section>

    <div class="fab-wrapper">
        <div v-if="showFabMenu" class="fab-menu">
            <button class="fab-row" @click="addMaintenance">
                <span class="fab-label maintenance">Add Maintenance</span>
                <span class="fab-icon maintenance-icon">
                    <mdicon name="tools" :size="18"/>
                </span>
            </button>
            <button class="fab-row" @click="addVehicle">
                <span class="fab-label vehicle">Add Vehicle</span>
                <span class="fab-icon vehicle-icon">
                    <mdicon name="car" :size="18"/>
                </span>
            </button>
        </div>
        <button class="fab" @click="toggleFabMenu">
            <mdicon :name="showFabMenu ? 'close' : 'plus'" :size="24"/>
        </button>
    </div>

    <nav class="bottom-nav">
        <button class="nav-item active" @click="goHome">
            <mdicon name="home" :size="22"/>
            <span>Home</span>
        </button>
        <button class="nav-item" @click="goSchedules">
            <mdicon name="clipboard-list-outline" :size="22"/>
            <span>Schedules</span>
        </button>
        <button class="nav-item">
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: "CarMaintenanceMobile",
    setup() {
        const router = useRouter()
        const showFabMenu = ref(false)

        const vehicle = ref({
            name: 'Toyota Fortuner 2012',
            type: 'SUV',
            odometer: 80456,
            lastOdometerUpdate: new Date('2025-11-13')
        })

        const history = ref([
            {
                id: '1',
                title: 'Aircon Cleaning',
                serviceDate: new Date('2025-11-22'),
                mileageAtService: 80456,
                cost: 4000,
                currency: 'PHP'
            }
        ])

        const goBack = () => {
            router.push('/')
        }

        const toggleFabMenu = () => {
            showFabMenu.value = !showFabMenu.value
        }

        const goHome = () => router.push('/car-maintenance')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goVehicles = () => router.push('/car-maintenance/vehicles')
        const goSettings = () => router.push('/car-maintenance/settings')

        const updateOdometer = () => {
            alert('Update odometer action')
        }

        const addMaintenance = () => {
            router.push('/car-maintenance/maintenance/add')
        }

        const addVehicle = () => {
            router.push('/car-maintenance/vehicles/add')
        }

        const openHistory = () => {
            alert('Open maintenance history')
        }

        const formattedOdometer = computed(() => {
            return vehicle.value.odometer.toLocaleString()
        })

        const formattedOdometerDate = computed(() => formatDate(vehicle.value.lastOdometerUpdate))

        const formatDate = (value) => {
            if (!value) return ''
            const date = value instanceof Date ? value : new Date(value)
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

        return {
            goBack,
            vehicle,
            history,
            formattedOdometer,
            formattedOdometerDate,
            formatDate,
            formatMileage,
            formatCurrency,
            updateOdometer,
            addMaintenance,
            openHistory,
            goHome,
            goSchedules,
            goVehicles,
            goSettings,
            showFabMenu,
            toggleFabMenu,
            addVehicle
        }
    }
}
</script>

<style scoped>
.vehicle-logs-page {
    min-height: 100vh;
    background: #f2f4f8;
    padding-bottom: 90px;
}

.top-bar {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    padding: 12px 16px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
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

.page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
}

.vehicle-card {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    border-bottom-left-radius: 22px;
    border-bottom-right-radius: 22px;
    padding: 16px;
    box-shadow: 0 8px 20px rgba(13, 115, 221, 0.35);
}

.vehicle-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
}

.avatar {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.vehicle-meta p {
    margin: 0;
}

.vehicle-name {
    font-weight: 700;
    font-size: 16px;
}

.vehicle-type {
    font-size: 13px;
    opacity: 0.9;
}

.vehicle-dropdown {
    margin-left: auto;
}

.odometer-card {
    background: linear-gradient(135deg, #f6a6ff 0%, #f5576c 100%);
    border-radius: 18px;
    padding: 14px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.odometer-label {
    font-size: 13px;
    opacity: 0.9;
    margin-bottom: 6px;
}

.odometer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.odometer-reading {
    font-size: 34px;
    font-weight: 800;
    letter-spacing: 1px;
}

.update-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.7);
    color: white;
    padding: 10px 12px;
    border-radius: 10px;
    font-weight: 700;
}

.odometer-updated {
    margin: 8px 0 0;
    font-size: 12px;
    opacity: 0.9;
}

.history-section {
    padding: 16px;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.section-header h3 {
    margin: 0;
    color: #444;
    font-size: 16px;
}

.circle-btn {
    border: none;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 16px rgba(13, 115, 221, 0.3);
}

.history-card {
    background: white;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 10px;
}

.history-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
}

.history-title {
    margin: 0;
    color: #f5576c;
    font-weight: 700;
}

.history-date {
    margin: 0;
    color: #555;
    font-size: 13px;
}

.history-bottom {
    display: flex;
    align-items: center;
    gap: 14px;
    color: #666;
    font-size: 13px;
}

.history-meta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.empty-state {
    color: #888;
    text-align: center;
    padding: 16px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.fab {
    width: 56px;
    height: 56px;
    border-radius: 28px;
    border: none;
    background: #f7931e;
    color: white;
    box-shadow: 0 10px 20px rgba(247, 147, 30, 0.35);
}

.fab-wrapper {
    position: fixed;
    bottom: 84px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
}

.fab-menu {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
}

.fab-row {
    border: none;
    background: transparent;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0;
}

.fab-label {
    padding: 10px 12px;
    border-radius: 12px;
    color: white;
    font-weight: 700;
    font-size: 13px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.fab-label.maintenance {
    background: #7b4a2b;
}

.fab-label.vehicle {
    background: #0f1b7a;
}

.fab-icon {
    width: 44px;
    height: 44px;
    border-radius: 22px;
    background: #0d73dd;
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.fab-icon.vehicle-icon {
    background: linear-gradient(135deg, #0f1b7a, #0d73dd);
}

.fab-icon.maintenance-icon {
    background: linear-gradient(135deg, #7b4a2b, #bb7b3f);
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
