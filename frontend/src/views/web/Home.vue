<template>
<div class="home-container">
    <div class="header glass-card">
        <div class="brand-block">
            <div class="logo-wrap">
                <img src="@/assets/MECLogger.png" alt="MEC Logger Logo" />
            </div>
            <div class="brand-text">
                <p class="brand-chip">MEC Logger</p>
                <h1 class="brand-title">Record Keeper</h1>
                <p class="brand-sub">Health, maintenance, and finance in one dashboard.</p>
            </div>
        </div>
        <div class="user-block">
            <p class="user-label">Signed in as</p>
            <div class="user-row">
                <h3 class="user-name">{{ userName }}</h3>
                <div class="user-actions">
                    <button class="theme-toggle-pill" type="button" @click="toggleTheme">
                        <mdicon :name="isDark ? 'white-balance-sunny' : 'moon-waning-crescent'" size="18"/>
                        <span>{{ isDark ? 'Dark' : 'Light' }}</span>
                    </button>
                    <button class="logout-btn" @click="logout">
                        <mdicon name="logout" size="20"/>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="features-grid">
        <!-- Medical Records Feature -->
        <div class="feature-card" @click="navigateTo('/medical-records')">
            <div class="feature-icon medical">
                <mdicon name="hospital-box" size="64"/>
            </div>
            <h3 class="feature-title">Medical Records</h3>
            <p class="feature-description">Track health records, medications, and vitals for you and your family</p>
        </div>

        <!-- Car Maintenance Feature -->
        <div class="feature-card" @click="navigateTo('/car-maintenance')">
            <div class="feature-icon vehicle">
                <mdicon name="car-wrench" size="64"/>
            </div>
            <h3 class="feature-title">Car Maintenance</h3>
            <p class="feature-description">Manage vehicle service history, reminders, and maintenance logs</p>
        </div>

        <!-- Expense Tracking Feature -->
        <div class="feature-card" @click="navigateTo('/expense-tracking')">
            <div class="feature-icon expense">
                <mdicon name="cash-multiple" size="64"/>
            </div>
            <h3 class="feature-title">Expense Tracking</h3>
            <p class="feature-description">Monitor spending, manage budgets, and track financial goals</p>
        </div>

        <div v-if="isAdmin" class="feature-card admin" @click="navigateTo('/admin/users')">
            <div class="feature-icon admin">
                <mdicon name="shield-account" size="64"/>
            </div>
            <h3 class="feature-title admin-title">User Approvals</h3>
            <p class="feature-description admin-desc">Review pending registrations and update roles</p>
        </div>
    </div>
</div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import Loading from '@/components/Loading.vue'
import store from '@/store'
import Datepicker from 'vuejs3-datepicker'
import getProfile from '@/composables/getProfile'
import { useMedicineReminders } from '@/composables/medicineReminders'
import { Role } from '@/constants/enums'
import { useTheme } from '@/composables/theme'

export default {
    name: "HomeWeb",
    components: {
        Modal,
        Loading,
        Datepicker
    },
    setup() {
        const router = useRouter()
        const activeProfileId = ref(localStorage.getItem('selectedProfileId') || null)
        const { isDark, toggleTheme } = useTheme()

        const navigateTo = (path) => {
            router.push(path)
        }

        const logout = () => {
            store.methods.logoutUser()
            router.push('/login')
        }

        const ensureProfile = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                logout()
                return
            }
            store.methods.loginUser(token)
            if (!store.state.userProfile) {
                const { response, error } = await getProfile(token)
                if (error.value === null && response.value?.userInfo) {
                    const profile = response.value.userInfo
                    store.methods.setUserAdmin(profile.role === Role.ADMIN)
                    store.methods.setUserProfile(profile)
                    if (profile.role === Role.GUEST) {
                        router.push('/pending-approval')
                    }
                } else {
                    logout()
                }
            }
        }

        const {
            reminders: reminderSource,
            loading: remindersLoading,
            error: remindersError,
            fetchReminders
        } = useMedicineReminders()

        const formatReminderTime = (timeString) => {
            if (!timeString) return '—'
            const [hour, minute] = timeString.split(':')
            const date = new Date()
            date.setHours(Number(hour), Number(minute), 0, 0)
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        }

        const todaysReminders = computed(() => {
            return reminderSource.value.slice(0, 3).map(reminder => {
                const reminderSlots = Array.isArray(reminder.slots) && reminder.slots.length
                    ? reminder.slots
                    : [{ time: reminder.time, status: reminder.status }]
                const slots = reminderSlots
                    .map((slot, index) => {
                        const rawTime = typeof slot === 'string' ? slot : slot.time
                        if (!rawTime) return null
                        return {
                            id: `${reminder.id}-${rawTime}-${index}`,
                            reminderId: reminder.id,
                            rawTime,
                            status: slot.status || null,
                            label: formatReminderTime(rawTime)
                        }
                    })
                    .filter(Boolean)
                return {
                    id: reminder.id,
                    medicineName: reminder.medicineName,
                    intakeMethod: reminder.intakeMethod,
                    slots
                }
            })
        })

        const loadReminders = async () => {
            const token = localStorage.getItem('token')
            activeProfileId.value = localStorage.getItem('selectedProfileId')
            if (!token || !activeProfileId.value) {
                reminderSource.value = []
                return
            }
            await fetchReminders(token, activeProfileId.value, { date: new Date() })
        }

        onMounted(() => {
            ensureProfile()
            loadReminders()
        })

        const userName = computed(() => store.state.userProfile?.fullName || 'there')
        const isAdmin = computed(() => store.state.userProfile?.role === Role.ADMIN || store.state.isUserAdmin)

        return {
            navigateTo,
            logout,
            userName,
            todaysReminders,
            remindersLoading,
            remindersError,
            activeProfileId,
            isAdmin,
            isDark,
            toggleTheme
        }
    }
}
</script>

<style scoped>
.home-container {
    min-height: 100vh;
    padding: 24px 20px 32px;
    background: var(--home-bg-web);
    color: var(--text-primary);
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    margin: 0 auto 24px;
    max-width: 1200px;
}

.brand-block {
    display: flex;
    align-items: center;
    gap: 14px;
}

.logo-wrap {
    width: 120px;
    height: 120px;
    border-radius: 20px;
    background: var(--glass-ghost-bg);
    display: grid;
    place-items: center;
    border: 1px solid var(--glass-card-border);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.16);
    overflow: hidden;
}

.logo-wrap img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.brand-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.brand-chip {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
    font-size: 12px;
    color: var(--text-muted);
}

.brand-title {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: var(--text-primary);
}

.brand-sub {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
}

.user-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-end;
    min-width: 240px;
}

.user-label {
    margin: 0;
    font-size: 12px;
    color: var(--text-muted);
}

.user-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.user-name {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
}

.reminders-section {
    max-width: 1200px;
    margin: 0 auto 24px;
    padding: 0 12px;
}

.reminders-card {
    background: var(--glass-card-bg);
    border-radius: 20px;
    padding: 24px;
    box-shadow: var(--glass-card-shadow);
    border: 1px solid var(--glass-card-border);
}

.reminders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.reminders-header h3 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
}

.view-all-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    transition: color 0.2s ease;
}

.view-all-link:hover {
    color: #5568d3;
}

.reminders-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.reminder-item {
    border: 1px solid var(--glass-card-border);
    border-radius: 16px;
    padding: 16px 20px;
    background: var(--surface-plain);
    transition: all 0.2s ease;
}

.reminder-item:hover {
    border-color: var(--accent-1);
    transform: translateY(-2px);
}

.reminder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.reminder-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
}

.reminder-method {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0 0 12px 0;
}

.reminder-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.time-slot {
    background: var(--glass-ghost-bg);
    border-radius: 999px;
    border: 1px solid var(--glass-card-border);
    padding: 6px 12px;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--text-primary);
}

.time-slot.taken {
    border-color: #22c55e;
    color: #15803d;
    background: #f0fdf4;
}

.time-slot.missed {
    border-color: #f97316;
    color: #c2410c;
    background: #fff7ed;
}

.slot-status-icon {
    font-size: 12px;
}

.reminders-empty {
    text-align: center;
    padding: 30px;
    color: var(--text-muted);
}

.reminders-error {
    text-align: center;
    padding: 20px;
    color: #dc2626;
    font-size: 14px;
}

.reminders-loading {
    text-align: center;
    padding: 30px;
    color: var(--text-muted);
}

.header h2 {
    color: var(--text-primary);
    font-weight: 700;
    font-size: 36px;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 12px;
}

@media (min-width: 768px) {
    .features-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .header {
        flex-direction: column;
        align-items: flex-start;
    }
    .user-block {
        align-items: flex-start;
        width: 100%;
    }
    .user-row {
        justify-content: flex-start;
    }
    .logo-wrap {
        width: 100px;
        height: 100px;
    }
    .brand-title {
        font-size: 24px;
    }
}

.feature-card {
    background: var(--glass-card-bg);
    border-radius: 20px;
    padding: 28px 22px;
    box-shadow: var(--glass-card-shadow);
    border: 1px solid var(--glass-card-border);
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    min-height: 240px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
}

.feature-card:active {
    transform: translateY(-4px);
}

.feature-icon {
    width: 100px;
    height: 100px;
    margin: 0 auto 25px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.feature-icon.medical {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.feature-icon.vehicle {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.feature-icon.expense {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
.feature-icon.admin {
    background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
}

.feature-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 15px;
}

.feature-description {
    font-size: 15px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
}

.admin-title {
    color: var(--text-primary);
}
.admin-desc {
    color: var(--text-secondary);
}


.user-bar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 0;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-label {
    font-size: 12px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--text-muted);
    margin: 0;
}

.user-name {
    margin: 0;
    font-size: 18px;
    color: var(--text-primary);
    font-weight: 700;
}

.user-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.logout-btn {
    border: none;
    border-radius: 999px;
    padding: 10px 18px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
    color: white;
    background: linear-gradient(135deg, #4c51bf 0%, #764ba2 100%);
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(71, 79, 184, 0.25);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    margin-left: auto;
}

.logout-btn:hover {
    box-shadow: 0 14px 24px rgba(71, 79, 184, 0.3);
}

.logout-btn:active {
    transform: translateY(1px);
}


</style>
