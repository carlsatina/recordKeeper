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
                <p class="card-title">Blood Sugar</p>
                <p class="card-subtitle">mg/dL</p>
            </div>
            <mdicon name="chart-line" :size="24" class="card-icon"/>
        </div>

        <div class="sugar-inputs">
            <div class="input-block">
                <label>Reading</label>
                <input
                    type="number"
                    inputmode="numeric"
                    placeholder="95"
                    v-model="reading"
                />
            </div>
            <div class="input-block">
                <label>Context</label>
                <select v-model="context">
                    <option value="fasting">Fasting</option>
                    <option value="after-meal">After Meal</option>
                    <option value="random">Random</option>
                </select>
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
    name: 'AddBloodSugarRecord',
    setup() {
        const router = useRouter()
        const reading = ref('')
        const context = ref('fasting')
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
                await fetch(`${API_BASE_URL}/api/v1/vitals/blood-sugar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        profileId: activeProfileId,
                        reading: reading.value,
                        context: context.value,
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
            reading,
            context,
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

.sugar-inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
}

select {
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 12px;
    font-size: 15px;
    background: #f8fafc;
    color: #0f172a;
}

select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
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
