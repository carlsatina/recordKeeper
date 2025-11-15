<template>
<div class="personal-info-page">
    <TopBar
        title="Personal Information"
        :show-back="true"
        back-route="/medical-records?tab=profile"
    />

    <div class="content">
        <section class="info-card primary" v-if="userInfo">
            <div class="card-header">
                <div class="avatar-circle">
                    <mdicon name="account-circle" :size="48"/>
                </div>
                <div>
                    <p class="section-label">Logged in user</p>
                    <p class="section-title">{{ userInfo.fullName || 'User' }}</p>
                </div>
            </div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ userInfo.email || '—' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Role</span>
                    <span class="info-value">{{ userInfo.role || 'User' }}</span>
                </div>
            </div>
        </section>

        <section class="info-card" v-if="activeProfile">
            <p class="section-label">Selected profile</p>
            <p class="section-title">{{ activeProfile.name }}</p>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Relationship</span>
                    <span class="info-value">{{ activeProfile.relation || '—' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Birth date</span>
                    <span class="info-value">{{ formatDate(activeProfile.dateOfBirth) }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Gender</span>
                    <span class="info-value">{{ activeProfile.gender || '—' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Blood type</span>
                    <span class="info-value">{{ activeProfile.bloodGroup || '—' }}</span>
                </div>
                <div class="info-item wide">
                    <span class="info-label">Allergies</span>
                    <span class="info-value">{{ activeProfile.allergies || 'None reported' }}</span>
                </div>
                <div class="info-item wide">
                    <span class="info-label">Chronic conditions</span>
                    <span class="info-value">{{ activeProfile.chronicConditions || 'None reported' }}</span>
                </div>
            </div>
        </section>

        <div v-if="loading" class="state-card">Loading info...</div>
        <div v-else-if="!activeProfile" class="state-card">
            Please select or add a profile to view details.
        </div>
    </div>
</div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TopBar from '@/components/MedicalRecords/TopBar.vue'
import { useProfiles } from '@/composables/profiles'
import { API_BASE_URL } from '@/constants/config'

export default {
    name: 'PersonalInformation',
    components: {
        TopBar
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { fetchProfiles } = useProfiles()
        const userInfo = ref(null)
        const profiles = ref([])
        const loading = ref(true)
        const activeProfileId = ref(
            Array.isArray(route.query.profileId) ? route.query.profileId[0] : route.query.profileId || localStorage.getItem('selectedProfileId')
        )

        const formatDate = (date) => {
            if (!date) return '—'
            const parsed = new Date(date)
            if (Number.isNaN(parsed.getTime())) return '—'
            return parsed.toLocaleDateString()
        }

        const activeProfile = computed(() => {
            return profiles.value.find((profile) => profile.id === activeProfileId.value) || null
        })

        const loadUserInfo = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                const data = await res.json()
                if (res.ok) {
                    userInfo.value = data.userInfo
                }
            } catch (err) {
                console.error(err)
            }
        }

        const loadProfiles = async () => {
            const token = localStorage.getItem('token')
            if (!token) return
            const { response, error } = await fetchProfiles(token)
            if (error.value === null && response.value?.profiles) {
                profiles.value = response.value.profiles.map((profile) => ({
                    id: profile.id,
                    name: profile.displayName || 'Profile',
                    relation: profile.relationToUser,
                    dateOfBirth: profile.dateOfBirth,
                    gender: profile.gender,
                    bloodGroup: profile.bloodGroup,
                    allergies: profile.allergies,
                    chronicConditions: profile.chronicConditions
                }))
            }
        }

        onMounted(async () => {
            await Promise.all([loadUserInfo(), loadProfiles()])
            loading.value = false
        })

        return {
            userInfo,
            activeProfile,
            loading,
            formatDate
        }
    }
}
</script>

<style scoped>
.personal-info-page {
    min-height: 100vh;
    background: #f8f9fa;
}

.content {
    padding: 20px 16px 40px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.info-card {
    background: white;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 15px 35px rgba(17, 24, 39, 0.08);
    border: 1px solid #eef2ff;
}

.info-card.primary {
    background: linear-gradient(135deg, #6f7efc, #a855f7);
    color: white;
}

.info-card.primary .info-item {
    background: rgba(255, 255, 255, 0.12);
    border: none;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
}

.avatar-circle {
    width: 60px;
    height: 60px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.section-label {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9ca3af;
    margin: 0 0 4px;
}

.info-card.primary .section-label {
    color: rgba(255, 255, 255, 0.8);
}

.section-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #111827;
}

.info-card.primary .section-title {
    color: white;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 12px;
}

.info-item {
    background: #f9fafb;
    border-radius: 14px;
    padding: 12px;
    border: 1px solid #f3f4f6;
}

.info-item.wide {
    grid-column: span 2;
}

.info-label {
    display: block;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9ca3af;
    margin-bottom: 4px;
}

.info-value {
    font-size: 15px;
    color: #111827;
    font-weight: 600;
}

.info-card.primary .info-label,
.info-card.primary .info-value {
    color: white;
}

.state-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    color: #4b5563;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
</style>
