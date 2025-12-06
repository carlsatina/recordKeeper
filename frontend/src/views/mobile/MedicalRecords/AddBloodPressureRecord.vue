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
        <div v-if="statusLabel" class="status-pill" :class="statusClass">
            {{ statusLabel }}
        </div>
    </div>

    <div class="card notes-card glass-card">
        <div class="card-header">
            <div>
                <p class="card-title">Notes</p>
                <p class="card-subtitle">Optional</p>
            </div>
            <mdicon name="note-text-outline" :size="22" class="card-icon"/>
        </div>
        <textarea
            class="notes-textarea"
            rows="4"
            placeholder="Add any context or observations"
            v-model="notes"
        ></textarea>
    </div>

    <div class="card datetime-card glass-card">
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

    <button class="save-btn glass-btn-primary" @click="saveRecord">
        Save
    </button>
</div>
</template>

<script>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL } from '@/constants/config'

export default {
    name: 'AddBloodPressureRecord',
    setup() {
        const router = useRouter()
        const padNumber = (value) => value.toString().padStart(2, '0')
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
        const systolic = ref('')
        const diastolic = ref('')
        const statusLabel = ref('')
        const statusClass = ref('')
        const readingDate = ref(getDateInZone('Asia/Manila'))
        const readingTime = ref(getTimeInZone('Asia/Manila'))
        const notes = ref('')
        const saving = ref(false)
        const activeProfileId = localStorage.getItem('selectedProfileId')
        const activeProfileName = ref(localStorage.getItem('selectedProfileName') || 'Profile')

        const updateStatus = () => {
            const systolicValue = Number(systolic.value)
            const diastolicValue = Number(diastolic.value)
            if (Number.isNaN(systolicValue) || Number.isNaN(diastolicValue)) {
                statusLabel.value = ''
                statusClass.value = ''
                return
            }
            if (systolicValue < 120 && diastolicValue < 80) {
                statusLabel.value = 'Normal'
                statusClass.value = 'status-normal'
            } else if (systolicValue < 130 && diastolicValue < 80) {
                statusLabel.value = 'Elevated'
                statusClass.value = 'status-elevated'
            } else {
                statusLabel.value = 'High'
                statusClass.value = 'status-high'
            }
        }

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
                        notes: notes.value,
                        recordedAt: `${readingDate.value}T${readingTime.value}:00+08:00`
                    })
                })
                router.back()
            } finally {
                saving.value = false
            }
        }

        watch([systolic, diastolic], () => {
            updateStatus()
        }, { immediate: true })

        return {
            router,
            systolic,
            diastolic,
            statusLabel,
            statusClass,
            readingDate,
            readingTime,
            notes,
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

.notes-card textarea {
    width: 100%;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.12);
    padding: 16px;
    min-height: 120px;
    font-size: 14px;
    resize: vertical;
    background: rgba(255,255,255,0.05);
    color: #e2e8f0;
}

.bp-inputs {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.bp-input {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border-radius: 14px;
    padding: 12px 14px;
    border: 1px solid rgba(255,255,255,0.08);
}

.bp-input label {
    display: block;
    font-size: 11px;
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
    font-weight: 700;
    color: #e2e8f0;
}

.bp-input input:focus {
    outline: none;
}

.divider {
    font-size: 26px;
    font-weight: 700;
    color: #cbd5e1;
}

.status-pill {
    margin-top: 10px;
    padding: 10px 14px;
    border-radius: 12px;
    font-weight: 700;
    text-align: center;
    font-size: 13px;
}

.status-normal {
    background: rgba(34, 197, 94, 0.16);
    color: #22c55e;
    border: 1px solid rgba(34,197,94,0.3);
}

.status-elevated {
    background: rgba(251, 191, 36, 0.15);
    color: #fbbf24;
    border: 1px solid rgba(251,191,36,0.35);
}

.status-high {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239,68,68,0.35);
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
    font-weight: 700;
    color: #e2e8f0;
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

.profile-chip {
    margin: 0;
    font-size: 14px;
    color: #cbd5e1;
}
</style>
