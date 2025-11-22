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
        <div
            class="vehicle-card"
            v-for="vehicle in filteredVehicles"
            :key="vehicle.id"
        >
            <div class="vehicle-thumb">
                <mdicon name="clipboard-list-outline" :size="24"/>
            </div>
            <div class="vehicle-info">
                <p class="vehicle-name">{{ vehicle.name }}</p>
                <div class="info-row">
                    <span class="label">Fuel Type</span>
                    <span class="value">: {{ vehicle.fuelType || 'No data' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Registration</span>
                    <span class="value">: {{ vehicle.registration || 'No data' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Plate No.</span>
                    <span class="value">: {{ vehicle.plateNumber || 'No data' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Registration</span>
                    <span class="value">: {{ vehicle.registration2 || 'No data' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">Expiry Date</span>
                    <span class="value">: <em>{{ vehicle.expiryDate || '(No date set)' }}</em></span>
                </div>
            </div>
            <mdicon name="dots-vertical" :size="22" class="card-menu"/>
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
        <button class="nav-item">
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'CarMaintenanceVehiclesMobile',
    setup() {
        const router = useRouter()
        const search = ref('')
        const vehicles = ref([
            {
                id: '1',
                name: 'Suzuki Alto 2020',
                fuelType: 'Petrol',
                registration: 'No data',
                plateNumber: '',
                registration2: 'No data',
                expiryDate: '(No date set)'
            },
            {
                id: '2',
                name: 'Nissan Navarra 2018',
                fuelType: 'Diesel',
                registration: 'No data',
                plateNumber: '',
                registration2: 'No data',
                expiryDate: '(No date set)'
            },
            {
                id: '3',
                name: 'Toyota Fortuner 2012',
                fuelType: 'Diesel',
                registration: 'No data',
                plateNumber: 'YKZ905',
                registration2: 'No data',
                expiryDate: '(No date set)'
            }
        ])

        const goBack = () => router.back()
        const goHome = () => router.push('/car-maintenance')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goSettings = () => router.push('/car-maintenance/settings')

        const filteredVehicles = computed(() => {
            const term = search.value.toLowerCase()
            return vehicles.value.filter(v => v.name.toLowerCase().includes(term))
        })

        return {
            search,
            vehicles,
            filteredVehicles,
            goBack,
            goHome,
            goSchedules,
            goSettings
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

.vehicle-card {
    display: grid;
    grid-template-columns: 90px 1fr 32px;
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

.card-menu {
    justify-self: end;
    color: #6b7280;
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
