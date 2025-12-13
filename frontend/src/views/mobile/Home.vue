<template>
<div class="home-shell">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>

    <header class="hero">
        <div class="hero-top">
            <div class="brand">
                <div class="logo-mark">
                    <img src="@/assets/MECLogger.png" alt="MEC Logger Logo" />
                </div>
                <div>
                    <p class="brand-chip">MEC LOGGER</p>
                    <h1>Control your universe</h1>
                    <p class="eyebrow">Hi, {{ userName }}</p>
                </div>
            </div>
            <div class="hero-actions">
                <button class="theme-toggle-pill" type="button" @click="toggleTheme">
                    <mdicon :name="isDark ? 'white-balance-sunny' : 'moon-waning-crescent'" size="18" />
                    <span>{{ isDark ? 'Dark' : 'Light' }}</span>
                </button>
                <button class="ghost-btn" @click="logout">
                    <mdicon name="logout" size="18" />
                    <span>Logout</span>
                </button>
                <span class="version-pill">v{{ appVersion }}</span>
            </div>
        </div>
        <p class="hero-sub">Health, maintenance, and finances—unified in a sleek console.</p>
    </header>

    <section class="feature-stack">
        <div class="glass-card medical" @click="navigateTo('/medical-records')">
            <div class="chip">Health</div>
            <div class="card-row">
                <div class="icon-hex">
                    <mdicon name="hospital-box" size="24"/>
                </div>
                <div>
                    <h3>Medical Records</h3>
                    <p>Vitals, prescriptions, and scans at light speed.</p>
                </div>
            </div>
        </div>

        <div class="glass-card vehicle" @click="navigateTo('/car-maintenance')">
            <div class="chip">Auto</div>
            <div class="card-row">
                <div class="icon-hex">
                    <mdicon name="car-wrench" size="24"/>
                </div>
                <div>
                    <h3>Car Maintenance</h3>
                    <p>Service history, reminders, and costs—always synced.</p>
                </div>
            </div>
        </div>

        <div class="glass-card expense" @click="navigateTo('/expense-tracking')">
            <div class="chip">Finance</div>
            <div class="card-row">
                <div class="icon-hex">
                    <mdicon name="cash-multiple" size="24"/>
                </div>
                <div>
                    <h3>Expense Tracking</h3>
                    <p>Budgets, insights, and subscriptions in one feed.</p>
                </div>
            </div>
        </div>

        <div v-if="isAdmin" class="glass-card admin" @click="navigateTo('/admin/users')">
            <div class="chip">Admin</div>
            <div class="card-row">
                <div class="icon-hex">
                    <mdicon name="shield-account" size="24"/>
                </div>
                <div>
                    <h3>User Approvals</h3>
                    <p>Review pending registrations and elevate roles.</p>
                </div>
            </div>
        </div>
    </section>
</div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import Loading from '@/components/Loading.vue'
import store from '@/store'
import Datepicker from 'vuejs3-datepicker'
import getProfile from '@/composables/getProfile'
import { Role } from '@/constants/enums'
import { useTheme } from '@/composables/theme'
import appMeta from '../../../package.json'

export default {
    name: "HomeMobile",
    components: {
        Modal,
        Loading,
        Datepicker
    },
    setup() {
        const router = useRouter()
        const { isDark, toggleTheme } = useTheme()
        const appVersion = appMeta.version || '1.0.0'

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

        onMounted(() => {
            ensureProfile()
        })

        const userName = computed(() => store.state.userProfile?.fullName || 'there')
        const isAdmin = computed(() => store.state.userProfile?.role === Role.ADMIN || store.state.isUserAdmin)

        return {
            navigateTo,
            logout,
            userName,
            isAdmin,
            isDark,
            appVersion,
            toggleTheme
        }
    }
}
</script>

<style scoped>
.home-shell {
    position: relative;
    min-height: 100vh;
    padding: 18px 16px 80px;
    background: var(--home-bg-mobile);
    color: var(--text-primary);
    overflow: hidden;
}

.bg-orb {
    position: absolute;
    filter: blur(50px);
    opacity: 0.35;
    z-index: 0;
}
.orb-1 {
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4f46e5, #06b6d4);
    top: -100px;
    left: -80px;
}
.orb-2 {
    width: 240px;
    height: 240px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #8b5cf6);
    bottom: -80px;
    right: -60px;
}

.hero {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 10px;
    padding: 14px 12px 6px;
}

.hero-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
}

.brand {
    display: flex;
    gap: 12px;
    align-items: center;
}

.logo-mark {
    width: 64px;
    height: 64px;
    border-radius: 14px;
    background: var(--glass-ghost-bg);
    display: grid;
    place-items: center;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
    border: 1px solid var(--glass-card-border);
    overflow: hidden;
}

.logo-mark img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.brand-chip {
    margin: 0;
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--text-secondary);
    font-weight: 700;
}

.hero h1 {
    margin: 2px 0 2px;
    font-size: 22px;
    font-weight: 800;
    background: linear-gradient(135deg, #a5b4fc, #67e8f9);
    -webkit-background-clip: text;
    color: transparent;
    letter-spacing: -0.3px;
}

.eyebrow {
    margin: 0;
    color: var(--text-muted);
    font-size: 13px;
}

.hero-sub {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
}

.hero-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.version-pill {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 12px;
    background: var(--glass-ghost-bg);
    border: 1px solid var(--glass-card-border);
    color: var(--text-primary);
    font-weight: 700;
    font-size: 12px;
}

.ghost-btn {
    border: 1px solid var(--glass-ghost-border);
    background: var(--glass-ghost-bg);
    color: var(--text-primary);
    border-radius: 12px;
    padding: 10px 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-weight: 700;
    backdrop-filter: blur(6px);
}

.feature-stack {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 12px;
    margin-top: 10px;
}

.glass-card {
    background: var(--glass-card-bg);
    border: 1px solid var(--glass-card-border);
    border-radius: 16px;
    padding: 14px;
    box-shadow: var(--glass-card-shadow);
    cursor: pointer;
    display: grid;
    gap: 10px;
    transition: transform 0.2s ease, border-color 0.2s ease;
}

.glass-card:hover {
    transform: translateY(-4px);
    border-color: rgba(94, 234, 212, 0.5);
}

.glass-card .chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 11px;
    color: #0b1020;
    background: var(--pill-gradient);
    box-shadow: 0 6px 14px rgba(6, 182, 212, 0.3);
    width: fit-content;
}

.glass-card.admin .chip {
    background: linear-gradient(135deg, #f97316, #ec4899);
    box-shadow: 0 6px 14px rgba(236, 72, 153, 0.3);
}

.card-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.icon-hex {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
    display: grid;
    place-items: center;
    color: #0b1020;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
}

.glass-card.admin .icon-hex {
    background: linear-gradient(135deg, #f97316, #ec4899);
}

.glass-card h3 {
    margin: 0;
    font-size: 16px;
    color: var(--text-primary);
    letter-spacing: -0.2px;
}

.glass-card p {
    margin: 2px 0 0;
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.4;
}

@media (max-width: 375px) {
    .hero h1 {
        font-size: 20px;
    }
    .glass-card h3 {
        font-size: 15px;
    }
    .glass-card p {
        font-size: 12px;
    }
    .logo-mark {
        width: 52px;
        height: 52px;
    }
}
</style>
