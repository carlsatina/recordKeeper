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
                <p class="card-title">Blood Pressure</p>
                <p class="card-subtitle">in mmHg</p>
            </div>
            <mdicon name="heart-pulse" :size="24" class="card-icon"/>
        </div>

        <div class="bp-inputs">
            <div class="bp-input">
                <label>Systolic</label>
                <input
                    type="number"
                    inputmode="numeric"
                    placeholder="120"
                    v-model="systolic"
                />
            </div>
            <span class="divider">/</span>
            <div class="bp-input">
                <label>Diastolic</label>
                <input
                    type="number"
                    inputmode="numeric"
                    placeholder="80"
                    v-model="diastolic"
                />
            </div>
        </div>
    </div>

    <div class="card datetime-card">
        <div class="card-header">
            <div>
                <p class="card-title">Date & Time</p>
                <p class="card-subtitle">When was this reading taken?</p>
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
import { useRouter } from 'vue-router'
import { API_BASE_URL } from '@/constants/config'

export default {
    name: 'AddBloodPressureRecord',
    setup() {
        const router = useRouter()
        const systolic = ref('')
        const diastolic = ref('')
        const readingDate = ref(new Date().toISOString().slice(0, 10))
        const readingTime = ref(new Date().toISOString().slice(11, 16))
        const saving = ref(false)
        const activeProfileId = localStorage.getItem('selectedProfileId')
        const activeProfileName = ref(localStorage.getItem('selectedProfileName') || 'Profile')

        const saveRecord = async () => {
            if (!activeProfileId) {
                alert('Please select a profile first.')
                return
            }
            saving.value = true
            const token = localStorage.getItem('token')
            try {
                await fetch(`${API_BASE_URL}/api/v1/vitals/blood-pressure`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        profileId: activeProfileId,
                        systolic: systolic.value,
                        diastolic: diastolic.value,
                        recordedAt: `${readingDate.value}T${readingTime.value}:00`
                    })
                })
                router.back()
            } finally {
                saving.value = false
            }
        }

        return {
            router,
            systolic,
            diastolic,
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

.bp-inputs {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.bp-input {
    flex: 1;
    background: #f1f5f9;
    border-radius: 16px;
    padding: 12px 14px;
}

.bp-input label {
    display: block;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #94a3b8;
    margin-bottom: 6px;
}

.bp-input input {
    width: 100%;
    border: none;
    background: transparent;
    font-size: 20px;
    font-weight: 600;
    color: #0f172a;
}

.bp-input input:focus {
    outline: none;
}

.divider {
    font-size: 28px;
    font-weight: 700;
    color: #94a3b8;
}

.date-time-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
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
