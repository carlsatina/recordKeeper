<template>
<div class="add-record-container">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <header class="app-bar glass-nav">
        <button class="icon-btn" @click="router.back()">
            <mdicon name="close" :size="22"/>
        </button>
        <h2 class="screen-title">Add Data</h2>
        <button class="icon-btn ghost">
            <mdicon name="fullscreen" :size="22"/>
        </button>
    </header>

    <div class="card measurement-card glass-card">
        <div class="card-header">
            <div>
                <p class="card-title">Body Weight</p>
                <p class="card-subtitle">in kilograms</p>
            </div>
            <mdicon name="scale-bathroom" :size="24" class="card-icon"/>
        </div>

        <div class="weight-input">
            <label>Weight</label>
            <div class="weight-field">
                <input
                    type="number"
                    inputmode="decimal"
                    placeholder="68.5"
                    step="0.1"
                    v-model="weight"
                />
                <span>kg</span>
            </div>
        </div>

        <div class="input-block">
            <label>Notes (optional)</label>
            <textarea v-model="notes" placeholder="e.g., Morning before breakfast"></textarea>
        </div>
    </div>

    <div class="card datetime-card glass-card">
        <div class="card-header">
            <div>
                <p class="card-title">Date & Time</p>
                <p class="card-subtitle">When was this recorded?</p>
            </div>
            <mdicon name="square-edit-outline" :size="22" class="card-icon"/>
        </div>

        <div class="date-time-grid">
            <div class="input-block">
                <label>Date</label>
                <input type="date" v-model="readingDate"/>
            </div>
            <div class="input-block">
                <label>Time</label>
                <input type="time" v-model="readingTime"/>
            </div>
        </div>
    </div>

    <button class="save-btn glass-btn-primary" @click="saveRecord">
        Save
    </button>
</div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { API_BASE_URL } from '@/constants/config'

export default {
    name: 'AddBodyWeightRecord',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const weight = ref('')
        const notes = ref('')
        const getTimeInZone = (tz) => {
            return new Date().toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: tz,
                hour12: false
            })
        }
        const getDateInZone = (tz) => {
            const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz })
            return formatter.format(new Date())
        }
        const readingDate = ref(getDateInZone('Asia/Manila'))
        const readingTime = ref(getTimeInZone('Asia/Manila'))
        const saving = ref(false)
        const profileIdFromQuery = Array.isArray(route.query.profileId) ? route.query.profileId[0] : route.query.profileId
        const profileNameFromQuery = Array.isArray(route.query.profileName) ? route.query.profileName[0] : route.query.profileName
        const activeProfileId = profileIdFromQuery || localStorage.getItem('selectedProfileId')
        const activeProfileName = ref(profileNameFromQuery || localStorage.getItem('selectedProfileName') || 'Profile')
        if (activeProfileId) {
            localStorage.setItem('selectedProfileId', activeProfileId)
        }
        if (activeProfileName.value) {
            localStorage.setItem('selectedProfileName', activeProfileName.value)
        }

        const saveRecord = async () => {
            if (!activeProfileId) {
                alert('Please select a profile first.')
                return
            }
            if (!weight.value) {
                return
            }
            saving.value = true
            const token = localStorage.getItem('token')
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/vitals/body-weight`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        profileId: activeProfileId,
                        weight: weight.value,
                        notes: notes.value,
                        recordedAt: `${readingDate.value}T${readingTime.value}:00+08:00`
                    })
                })
                const data = await res.json()
                if (data.status === 201) {
                    router.replace({
                        path: '/medical-records/body-weight',
                        query: {
                            profileId: activeProfileId,
                            profileName: activeProfileName.value
                        }
                    })
                }
            } finally {
                saving.value = false
            }
        }

        return {
            router,
            weight,
            notes,
            readingDate,
            readingTime,
            saveRecord,
            activeProfileName,
            saving
        }
    }
}
</script>

<style scoped>
.add-record-container {
    min-height: 100vh;
    background: #05060a;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
    overflow: hidden;
}

.bg-orb {
    position: absolute;
    filter: blur(60px);
    opacity: 0.28;
    z-index: 0;
}
.orb-1 {
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22d3ee, #a855f7);
    top: -140px;
    left: -110px;
}
.orb-2 {
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #06b6d4);
    bottom: -120px;
    right: -90px;
}

.app-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    position: relative;
    z-index: 1;
}

.screen-title {
    font-size: 20px;
    font-weight: 700;
    color: #e2e8f0;
}

.icon-btn {
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e2e8f0;
}

.icon-btn.ghost {
    background: transparent;
    border-color: transparent;
}

.card {
    background: rgba(255,255,255,0.05);
    border-radius: 18px;
    padding: 18px;
    box-shadow: 0 14px 30px rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.08);
    position: relative;
    z-index: 1;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.card-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    color: #e2e8f0;
}

.card-subtitle {
    margin: 4px 0 0;
    font-size: 12px;
    color: #94a3b8;
}

.card-icon {
    color: #67e8f9;
}

.weight-input {
    background: rgba(255,255,255,0.05);
    border-radius: 14px;
    padding: 12px 14px;
    margin-bottom: 16px;
    border: 1px solid rgba(255,255,255,0.1);
}

.weight-input label {
    display: block;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #94a3b8;
    margin-bottom: 6px;
}

.weight-field {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.weight-field input {
    border: none;
    background: transparent;
    font-size: 28px;
    font-weight: 800;
    color: #e2e8f0;
}

.weight-field input:focus {
    outline: none;
}

.weight-field span {
    font-weight: 700;
    color: #cbd5e1;
}

.input-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.input-block label {
    font-size: 13px;
    font-weight: 700;
    color: #e2e8f0;
}

.input-block textarea {
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 12px;
    font-size: 14px;
    color: #e2e8f0;
    background: rgba(255,255,255,0.05);
    min-height: 80px;
}

.input-block textarea:focus {
    outline: none;
    border-color: rgba(103,232,249,0.6);
    box-shadow: 0 0 0 2px rgba(103,232,249,0.25);
}

.input-block input {
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 12px;
    font-size: 14px;
    color: #e2e8f0;
    background: rgba(255,255,255,0.05);
}

.input-block input:focus {
    outline: none;
    border-color: rgba(103,232,249,0.6);
    box-shadow: 0 0 0 2px rgba(103,232,249,0.25);
}

.date-time-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
}

.save-btn {
    margin-top: auto;
}

.profile-chip {
    margin: 0;
    font-size: 14px;
    color: #cbd5e1;
}
</style>
