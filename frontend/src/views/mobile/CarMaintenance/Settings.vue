<template>
<div class="settings-page">
    <div class="top-banner">
        <button class="icon-btn" @click="goBack">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <h2 class="title">Settings</h2>
        <span class="icon-btn ghost"></span>
    </div>

    <div class="profile-card">
        <div class="avatar">
            <mdicon name="account-circle" :size="42"/>
        </div>
        <div class="profile-meta">
            <p class="name">John Doe</p>
            <p class="email">john.doe@example.com</p>
        </div>
    </div>

    <div class="settings-list">
        <div class="settings-group">
            <p class="group-title">Preferences</p>
            <button class="settings-item">
                <div class="item-left">
                    <mdicon name="bell-outline" :size="20"/>
                    <span>Notifications</span>
                </div>
                <mdicon name="chevron-right" :size="18"/>
            </button>
            <button class="settings-item">
                <div class="item-left">
                    <mdicon name="palette" :size="20"/>
                    <span>Theme</span>
                </div>
                <span class="pill">Light</span>
            </button>
        </div>

        <div class="settings-group">
            <p class="group-title">Account</p>
            <button class="settings-item">
                <div class="item-left">
                    <mdicon name="shield-account" :size="20"/>
                    <span>Security</span>
                </div>
                <mdicon name="chevron-right" :size="18"/>
            </button>
            <button class="settings-item">
                <div class="item-left">
                    <mdicon name="logout" :size="20"/>
                    <span>Logout</span>
                </div>
            </button>
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
        <button class="nav-item" @click="goVehicles">
            <mdicon name="car" :size="22"/>
            <span>Vehicles</span>
        </button>
        <button class="nav-item active">
            <mdicon name="cog-outline" :size="22"/>
            <span>Settings</span>
        </button>
    </nav>
</div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
    name: 'CarMaintenanceSettingsMobile',
    setup() {
        const router = useRouter()

        const goBack = () => router.back()
        const goHome = () => router.push('/car-maintenance')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goVehicles = () => router.push('/car-maintenance/vehicles')

        return {
            goBack,
            goHome,
            goSchedules,
            goVehicles
        }
    }
}
</script>

<style scoped>
.settings-page {
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

.profile-card {
    margin: -20px 16px 16px;
    background: white;
    border-radius: 16px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.avatar {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    background: #e0e7ff;
    display: flex;
    align-items: center;
    justify-content: center;
}

.profile-meta p {
    margin: 0;
}

.name {
    font-weight: 700;
    font-size: 16px;
    color: #111827;
}

.email {
    color: #6b7280;
    font-size: 13px;
}

.settings-list {
    padding: 0 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.settings-group {
    background: white;
    border-radius: 14px;
    padding: 12px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.06);
}

.group-title {
    margin: 0 0 8px;
    font-size: 13px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.settings-item {
    width: 100%;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    color: #111827;
    font-weight: 600;
    border-bottom: 1px solid #f1f5f9;
}

.settings-item:last-child {
    border-bottom: none;
}

.item-left {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
}

.pill {
    background: #e0e7ff;
    color: #4338ca;
    padding: 6px 10px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 12px;
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
