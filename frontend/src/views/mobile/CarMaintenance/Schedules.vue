<template>
<div class="schedule-page">
    <div class="top-banner">
        <button class="icon-btn" @click="goBack">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <h2 class="title">Maintenance Schedules</h2>
        <span class="icon-btn ghost"></span>
    </div>

    <div class="vehicle-pill">
        <div class="avatar">
            <mdicon name="car-sports" :size="26"/>
        </div>
        <div class="vehicle-meta">
            <p class="vehicle-name">{{ vehicle.name }}</p>
            <p class="vehicle-type">{{ vehicle.type }}</p>
        </div>
        <mdicon name="chevron-down" :size="22" class="dropdown"/>
    </div>

    <div class="empty-wrapper">
        <div class="illustration">
            <mdicon name="car-wrench" :size="96"/>
        </div>
        <p class="empty-text">No Maintenance Data</p>
    </div>

    <button class="fab" @click="addSchedule">
        <mdicon name="plus" :size="24"/>
    </button>

    <nav class="bottom-nav">
        <button class="nav-item" @click="goHome">
            <mdicon name="home" :size="22"/>
            <span>Home</span>
        </button>
        <button class="nav-item active">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'CarMaintenanceSchedulesMobile',
    setup() {
        const router = useRouter()
        const vehicle = ref({
            name: 'Toyota Fortuner 2012',
            type: 'SUV'
        })

        const goBack = () => router.back()
        const goHome = () => router.push('/car-maintenance')
        const addSchedule = () => {
            alert('Add schedule')
        }
        const goVehicles = () => router.push('/car-maintenance/vehicles')
        const goSettings = () => router.push('/car-maintenance/settings')

        return {
            vehicle,
            goBack,
            goHome,
            addSchedule,
            goVehicles,
            goSettings
        }
    }
}
</script>

<style scoped>
.schedule-page {
    min-height: 100vh;
    background: #f2f4f8;
    padding-bottom: 90px;
}

.top-banner {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    padding: 14px 16px 22px;
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

.vehicle-pill {
    margin: 0 16px;
    margin-top: -28px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    border-radius: 16px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 10px 20px rgba(13, 115, 221, 0.3);
}

.avatar {
    width: 48px;
    height: 48px;
    border-radius: 14px;
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
    font-size: 15px;
}

.vehicle-type {
    font-size: 13px;
    opacity: 0.9;
}

.dropdown {
    margin-left: auto;
}

.empty-wrapper {
    padding: 80px 16px;
    text-align: center;
    color: #9ca3af;
}

.illustration {
    color: #3b82f6;
    margin-bottom: 16px;
}

.empty-text {
    margin: 0;
    font-size: 16px;
    color: #9ca3af;
}

.fab {
    position: fixed;
    bottom: 84px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    border: none;
    background: #f7931e;
    color: white;
    box-shadow: 0 10px 20px rgba(247, 147, 30, 0.35);
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
