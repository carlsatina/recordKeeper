<template>
<div class="add-record-container">
    <header class="app-bar">
        <button class="icon-btn" @click="router.back()">
            <mdicon name="close" :size="22"/>
        </button>
        <h2 class="screen-title">Add Data</h2>
        <button class="icon-btn ghost">
            <mdicon name="fullscreen" :size="22"/>
        </button>
    </header>

    <div class="card measurement-card">
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

    <div class="card datetime-card">
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

    <button class="save-btn" @click="saveRecord">
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
        const readingDate = ref(new Date().toISOString().slice(0, 10))
        const readingTime = ref(new Date().toISOString().slice(11, 16))
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
                        recordedAt: `${readingDate.value}T${readingTime.value}:00`
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
    background: #f8f9fa;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.app-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
}

.screen-title {
    font-size: 20px;
    font-weight: 600;
}

.icon-btn {
    border: none;
    background: rgba(0, 0, 0, 0.04);
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #111;
}

.icon-btn.ghost {
    background: transparent;
}

.card {
    background: white;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 15px 30px rgba(15, 23, 42, 0.08);
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.card-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
}

.card-subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    color: #6b7280;
}

.card-icon {
    color: #667eea;
}

.weight-input {
    background: #f1f5f9;
    border-radius: 16px;
    padding: 12px 14px;
    margin-bottom: 16px;
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
    font-size: 24px;
    font-weight: 600;
    color: #0f172a;
}

.weight-field input:focus {
    outline: none;
}

.weight-field span {
    font-weight: 600;
    color: #94a3b8;
}

.input-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.input-block label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
}

.input-block textarea {
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 12px;
    font-size: 15px;
    color: #0f172a;
    background: #f8fafc;
    min-height: 80px;
}

.input-block textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
}

.input-block input {
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 12px;
    font-size: 15px;
    color: #0f172a;
    background: #f8fafc;
}

.input-block input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
}

.date-time-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
}

.save-btn {
    margin-top: auto;
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    border: none;
    border-radius: 16px;
    color: white;
    font-size: 17px;
    font-weight: 600;
    padding: 16px;
    cursor: pointer;
    box-shadow: 0 15px 25px rgba(79, 70, 229, 0.3);
}

.save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.profile-chip {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
}
</style>
