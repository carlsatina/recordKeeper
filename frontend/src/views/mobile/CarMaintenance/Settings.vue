<template>
<div class="car-shell stagger-page stagger-seq" :class="{ 'stagger-ready': staggerReady }">
    <div class="car-orb one"></div>
    <div class="car-orb two"></div>
    <div class="car-hero">
        <button class="car-icon-btn" @click="goBack">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <div>
            <h2 class="car-hero-title">Settings</h2>
            <p class="car-hero-sub">Personalize your maintenance</p>
        </div>
        <span class="car-icon-btn ghost"></span>
    </div>

    <div class="car-body settings-body">
        <div class="profile-card car-card">
            <div class="avatar">
                <mdicon name="account-circle" :size="42"/>
            </div>
            <div class="profile-meta">
                <p class="name">{{ userName }}</p>
                <p class="email">{{ userEmail }}</p>
            </div>
        </div>

        <div class="settings-group car-card">
            <p class="group-title">Preferences</p>
            <div class="settings-item static">
                <div class="item-left">
                    <mdicon name="map-marker-distance" :size="20"/>
                    <span>Distance Unit</span>
                </div>
                <select v-model="distanceUnit" @change="persistPreferences" class="inline-select car-select">
                    <option value="km">Kilometers</option>
                    <option value="mi">Miles</option>
                </select>
            </div>
            <div class="settings-item static">
                <div class="item-left">
                    <mdicon name="currency-usd" :size="20"/>
                    <span>Currency</span>
                </div>
                <select v-model="currency" @change="persistPreferences" class="inline-select car-select">
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
                    <input v-model="newMaintenanceType" type="text" placeholder="Add maintenance type" class="car-input" />
                    <button class="add-btn car-btn" type="button" @click="addMaintenanceType">Add</button>
                </div>
                <div class="chip-row">
                    <span v-for="t in maintenanceTypes" :key="t" class="chip">
                        {{ t }}
                        <button class="chip-remove" type="button" @click="removeType(t)">
                            <mdicon name="close" :size="14"/>
                        </button>
                    </span>
                </div>
            </div>
        </div>
    </div>

    <nav class="car-bottom-nav glass-nav-orb">
        <button class="car-nav-item" @click="goHome">
            <mdicon name="home" :size="22"/>
            <span>Home</span>
        </button>
        <button class="car-nav-item" @click="goSchedules">
            <mdicon name="clipboard-list-outline" :size="22"/>
            <span>Schedules</span>
        </button>
        <button class="car-nav-item">
            <mdicon name="chart-pie" :size="22"/>
            <span>Report</span>
        </button>
        <button class="car-nav-item" @click="goVehicles">
            <mdicon name="car" :size="22"/>
            <span>Vehicles</span>
        </button>
        <button class="car-nav-item active">
            <mdicon name="cog-outline" :size="22"/>
            <span>Settings</span>
        </button>
    </nav>
    <Loading v-if="loadingOverlay"/>
</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'
import Loading from '@/components/Loading.vue'
import { useStaggerReady } from '@/composables/staggerReady'

import store from '@/store'
export default {
    name: 'CarMaintenanceSettingsMobile',
    components: {
        Loading
    },
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
        const loadingOverlay = ref(false)
        const staggerReady = useStaggerReady()

        const withOverlay = async(fn) => {
            loadingOverlay.value = true
            try {
                return await fn()
            } finally {
                loadingOverlay.value = false
            }
        }

        const goBack = () => router.back()
        const goHome = () => router.push('/car-maintenance')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goVehicles = () => router.push('/car-maintenance/vehicles')

        const persistPreferences = async() => {
            await withOverlay(async() => {
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
            })
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
            await withOverlay(async() => {
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
            persistPreferences,
            loadingOverlay,
            staggerReady
        }
    }
}
</script>

<style scoped>
.profile-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--glass-ghost-bg);
  display: grid;
  place-items: center;
  border: 1px solid var(--glass-card-border);
}

.profile-meta p {
  margin: 0;
}

.name {
  font-weight: 800;
  color: var(--text-primary);
}

.email {
  color: var(--text-muted);
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-title {
  margin: 0;
  font-weight: 800;
  color: var(--text-primary);
  font-size: 15px;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  color: var(--text-primary);
  border-bottom: 1px solid var(--glass-card-border);
}

.settings-item:last-of-type {
  border-bottom: none;
}

.settings-item.column {
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.item-left {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.inline-select {
  min-width: 140px;
}

.type-row {
  display: flex;
  width: 100%;
  gap: 8px;
}

.add-btn {
  padding: 10px 12px;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--pill-gradient);
  color: #0b1020;
  font-weight: 700;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
}

.chip-remove {
  border: none;
  background: transparent;
  color: #0b1020;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.settings-body {
  padding-bottom: 160px;
}
</style>
