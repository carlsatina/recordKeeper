<template>
<div class="vital-detail-container">
    <div class="vital-detail-wrapper">
        <div class="detail-header">
            <button class="back-btn" @click="goBack">
                <mdicon name="arrow-left" :size="20"/>
            </button>
            <div class="header-text">
                <p class="header-label">Vitals · Blood Sugar</p>
                <h2>{{ profileName }}</h2>
            </div>
            <button class="add-btn" @click="goToAddRecord">
                <mdicon name="plus" :size="18"/>
                <span>Add record</span>
            </button>
        </div>

        <div v-if="loading" class="state-card">Loading blood sugar records...</div>
        <div v-else-if="errorMessage" class="state-card error">{{ errorMessage }}</div>

        <div v-else class="detail-content">
            <section class="measurement-panel sugar">
                <div class="measurement-header">
                    <div class="measurement-icon">
                        <mdicon name="water-percent" :size="32"/>
                    </div>
                    <div>
                        <p class="measurement-label">Latest reading</p>
                        <p class="measurement-status" :class="latestStatus?.toLowerCase()">
                            {{ latestStatus || 'No data' }}
                        </p>
                    </div>
                </div>
                <div v-if="latestRecord" class="measurement-value">
                    <h3>{{ latestRecord.value }}</h3>
                    <p>mg/dL · {{ latestRecord.type }}</p>
                    <p class="measurement-date">{{ latestRecord.formattedDate }} · {{ latestRecord.formattedTime }}</p>
                </div>
                <p v-else class="empty-hint">No blood sugar records yet.</p>
            </section>

            <section class="history-panel">
                <div class="history-header">
                    <h3>Recent history</h3>
                </div>
                <div v-if="history.length" class="history-list">
                    <div class="history-row" v-for="entry in history" :key="entry.id">
                        <div class="history-date">
                            <p class="history-day">{{ entry.formattedDate }}</p>
                            <p class="history-time">{{ entry.formattedTime }}</p>
                        </div>
                        <div class="history-reading">
                            <p class="reading-value">{{ entry.value }} mg/dL</p>
                            <p class="reading-sub">{{ entry.type }}</p>
                        </div>
                        <span class="status-chip" :class="entry.status.toLowerCase()">
                            {{ entry.status }}
                        </span>
                    </div>
                </div>
                <p v-else class="empty-hint">Recent readings will appear here.</p>
            </section>
        </div>
    </div>
</div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBloodSugar } from '@/composables/vitals/bloodSugar'

const formatDateTime = (value) => {
    if (!value) return { date: 'Unknown', time: '' }
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return { date: 'Unknown', time: '' }
    return {
        date: parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        time: parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
}

const classifyStatus = (value, type = '') => {
    const reading = Number(value) || 0
    const ctx = (type || '').toLowerCase()
    if (ctx.includes('after')) {
        if (reading < 140) return 'Normal'
        if (reading < 200) return 'Elevated'
        return 'High'
    }
    if (reading < 100) return 'Normal'
    if (reading < 126) return 'Elevated'
    return 'High'
}

export default {
    name: 'BloodSugarDetailWeb',
    setup() {
        const router = useRouter()
        const { records, fetchRecords } = useBloodSugar()
        const loading = ref(false)
        const errorMessage = ref('')
        const profileId = ref(localStorage.getItem('selectedProfileId'))
        const profileName = ref(localStorage.getItem('selectedProfileName') || 'Select profile')

        const loadRecords = async () => {
            const token = localStorage.getItem('token')
            profileId.value = localStorage.getItem('selectedProfileId')
            profileName.value = localStorage.getItem('selectedProfileName') || 'Select profile'
            if (!token || !profileId.value) {
                records.value = []
                return
            }
            loading.value = true
            errorMessage.value = ''
            try {
                await fetchRecords(token, profileId.value)
            } catch (err) {
                errorMessage.value = err.message || 'Unable to load blood sugar records.'
            } finally {
                loading.value = false
            }
        }

        const latestRecord = computed(() => {
            if (!records.value.length) return null
            const sorted = [...records.value].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
            const latest = sorted[0]
            const { date, time } = formatDateTime(latest.recordedAt)
            return {
                id: latest.id,
                value: Number(latest.valueNumber) || 0,
                type: latest.chartGroup || 'Fasting',
                formattedDate: date,
                formattedTime: time
            }
        })

        const latestStatus = computed(() => {
            if (!latestRecord.value) return null
            return classifyStatus(latestRecord.value.value, latestRecord.value.type)
        })

        const history = computed(() => {
            const sorted = [...records.value].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
            return sorted.slice(0, 8).map(entry => {
                const { date, time } = formatDateTime(entry.recordedAt)
                const type = entry.chartGroup || 'Fasting'
                return {
                    id: entry.id,
                    value: Number(entry.valueNumber) || 0,
                    type,
                    formattedDate: date,
                    formattedTime: time,
                    status: classifyStatus(entry.valueNumber, type)
                }
            })
        })

        const goBack = () => {
            router.push({ path: '/medical-records', query: { tab: 'health' } })
        }

        const goToAddRecord = () => {
            router.push('/medical-records/blood-sugar/add')
        }

        const handleStorage = (event) => {
            if (event.key === 'selectedProfileId' || event.key === 'selectedProfileName') {
                loadRecords()
            }
        }

        onMounted(() => {
            loadRecords()
            window.addEventListener('storage', handleStorage)
        })

        onUnmounted(() => {
            window.removeEventListener('storage', handleStorage)
        })

        return {
            profileName,
            loading,
            errorMessage,
            latestRecord,
            latestStatus,
            history,
            goBack,
            goToAddRecord
        }
    }
}
</script>

<style scoped>
.vital-detail-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 32px 16px;
}

.vital-detail-wrapper {
    width: 100%;
    max-width: 960px;
    background: white;
    border-radius: 28px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
    padding: 32px;
}

.detail-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
}

.back-btn,
.add-btn {
    border: none;
    border-radius: 12px;
    background: #fee2e2;
    color: #be123c;
    padding: 10px 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.header-text {
    flex: 1;
}

.header-label {
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #94a3b8;
    margin: 0;
}

.header-text h2 {
    margin: 4px 0 0;
    font-size: 24px;
}

.detail-content {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 24px;
}

.measurement-panel,
.history-panel {
    background: #fef2f2;
    border-radius: 24px;
    padding: 24px;
    border: 1px solid #ffe4e6;
}

.measurement-panel.sugar {
    background: #fff7ed;
    border-color: #fde68a;
}

.measurement-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.measurement-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: rgba(251, 191, 36, 0.2);
    color: #d97706;
    display: flex;
    align-items: center;
    justify-content: center;
}

.measurement-label {
    margin: 0;
    color: #92400e;
}

.measurement-status {
    margin: 2px 0 0;
    font-weight: 600;
}

.measurement-status.normal {
    color: #15803d;
}

.measurement-status.elevated {
    color: #ca8a04;
}

.measurement-status.high {
    color: #b91c1c;
}

.measurement-value {
    text-align: center;
}

.measurement-value h3 {
    font-size: 48px;
    margin: 0;
}

.measurement-value p {
    margin: 4px 0;
    color: #92400e;
}

.measurement-date {
    font-size: 14px;
    color: #a16207;
}

.empty-hint {
    color: #a1a1aa;
    margin: 0;
}

.history-panel {
    background: white;
    border: 1px solid #ffe4e6;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.history-row {
    display: grid;
    grid-template-columns: 180px 1fr auto;
    align-items: center;
    border: 1px solid #fee2e2;
    border-radius: 16px;
    padding: 16px 20px;
}

.history-day {
    margin: 0;
    font-weight: 600;
}

.history-time {
    margin: 4px 0 0;
    color: #9f1239;
}

.reading-value {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
}

.reading-sub {
    margin: 2px 0 0;
    color: #9f1239;
}

.status-chip {
    padding: 8px 14px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
}

.status-chip.normal {
    background: #f0fdf4;
    color: #166534;
}

.status-chip.elevated {
    background: #fef3c7;
    color: #92400e;
}

.status-chip.high {
    background: #fee2e2;
    color: #b91c1c;
}

.state-card {
    padding: 24px;
    border-radius: 20px;
    background: #fff7ed;
    text-align: center;
    color: #92400e;
}

.state-card.error {
    color: #dc2626;
}

@media (max-width: 900px) {
    .detail-content {
        grid-template-columns: 1fr;
    }
}
</style>
