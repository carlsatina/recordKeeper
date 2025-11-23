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
            <p class="name">{{ userName }}</p>
            <p class="email">{{ userEmail }}</p>
        </div>
    </div>

    <div class="settings-list">
        <div class="settings-group">
            <p class="group-title">Preferences</p>
            <div class="settings-item static">
                <div class="item-left">
                    <mdicon name="map-marker-distance" :size="20"/>
                    <span>Distance Unit</span>
                </div>
                <select v-model="distanceUnit" @change="persistPreferences" class="inline-select">
                    <option value="km">Kilometers</option>
                    <option value="mi">Miles</option>
                </select>
            </div>
            <div class="settings-item static">
                <div class="item-left">
                    <mdicon name="currency-usd" :size="20"/>
                    <span>Currency</span>
                </div>
                <select v-model="currency" @change="persistPreferences" class="inline-select">
                    <option value="USD">USD</option>
                    <option value="PHP">PHP</option>
                    <option value="EUR">EUR</option>
                    <option value="JPY">JPY</option>
                    <option value="SGD">SGD</option>
                </select>
            </div>
            <div class="settings-item static column">
                <div class="item-left">
                    <mdicon name="wrench-outline" :size="20"/>
                    <span>Maintenance Types</span>
                </div>
                <div class="type-row">
                    <input v-model="newMaintenanceType" type="text" placeholder="Add maintenance type" />
                    <button class="add-btn" @click="addMaintenanceType">Add</button>
                </div>
                <div class="chip-row">
                    <span v-for="t in maintenanceTypes" :key="t" class="chip">
                        {{ t }}
                        <button class="chip-remove" @click="removeType(t)">
                            <mdicon name="close" :size="14"/>
                        </button>
                    </span>
                </div>
            </div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'

import store from '@/store'
export default {
    name: 'CarMaintenanceSettingsMobile',
    setup() {
        const router = useRouter()
        const { getPreferences, savePreferences } = useCarMaintenance()
        const defaultMaintenanceTypes = [
            'Oil Change',
            'Brake Pad Replacement',
            'Tire Rotation',
            'Tire Replacement',
            'Battery Replacement',
            'Air Filter Replacement',
            'Transmission Service',
            'Coolant Flush',
            'Spark Plug Replacement',
            'Brake Fluid Change',
            'Alignment',
            'Inspection',
            'Repair'
        ]
        const userName = ref('User')
        const userEmail = ref('user@example.com')
        const distanceUnit = ref('km')
        const currency = ref('USD')
        const maintenanceTypes = ref([...defaultMaintenanceTypes])
        const newMaintenanceType = ref('')

        const goBack = () => router.back()
        const goHome = () => router.push('/car-maintenance')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goVehicles = () => router.push('/car-maintenance/vehicles')

        const persistPreferences = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                await savePreferences(token, {
                    distanceUnit: distanceUnit.value,
                    currency: currency.value,
                    maintenanceTypes: maintenanceTypes.value
                })
            } catch (err) {
                // fallback to local storage
                localStorage.setItem('distanceUnit', distanceUnit.value)
                localStorage.setItem('currencyPreference', currency.value)
                localStorage.setItem('maintenanceTypes', JSON.stringify(maintenanceTypes.value))
            }
        }

        const addMaintenanceType = () => {
            const value = newMaintenanceType.value.trim()
            if (!value) return
            if (!maintenanceTypes.value.includes(value)) {
                maintenanceTypes.value.push(value)
                persistPreferences()
            }
            newMaintenanceType.value = ''
        }

        const removeType = (type) => {
            maintenanceTypes.value = maintenanceTypes.value.filter(t => t !== type)
            persistPreferences()
        }

        onMounted(async() => {
            userName.value = store.state.userProfile?.fullName
            userEmail.value = store.state.userProfile?.email
            try {
                const token = localStorage.getItem('token')
                if (token) {
                    const prefs = await getPreferences(token)
                    if (prefs?.distanceUnit) distanceUnit.value = prefs.distanceUnit
                    if (prefs?.currency) currency.value = prefs.currency
                    if (Array.isArray(prefs?.maintenanceTypes) && prefs.maintenanceTypes.length) {
                        maintenanceTypes.value = prefs.maintenanceTypes
                    } else {
                        maintenanceTypes.value = [...defaultMaintenanceTypes]
                    }
                }
            } catch (err) {
                maintenanceTypes.value = [...defaultMaintenanceTypes]
            }
        })

        return {
            goBack,
            goHome,
            goSchedules,
            goVehicles,
            userName,
            userEmail,
            distanceUnit,
            currency,
            maintenanceTypes,
            newMaintenanceType,
            addMaintenanceType,
            removeType,
            persistPreferences
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

.settings-item.static {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
}

.settings-item.column {
    gap: 8px;
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

.inline-select {
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 8px 10px;
    font-weight: 600;
}

.type-row {
    display: flex;
    gap: 8px;
    width: 100%;
}

.type-row input {
    flex: 1;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 8px 10px;
}

.add-btn {
    border: none;
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: white;
    padding: 8px 12px;
    border-radius: 10px;
    font-weight: 700;
}

.chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.chip {
    background: #eef2ff;
    color: #4338ca;
    padding: 6px 8px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
}

.chip-remove {
    border: none;
    background: transparent;
    color: #6b7280;
    display: inline-flex;
    align-items: center;
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
