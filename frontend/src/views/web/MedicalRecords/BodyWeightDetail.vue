<template>
<div class="vital-detail-container">
    <div class="vital-detail-wrapper">
        <div class="detail-header">
            <button class="back-btn" @click="goBack">
                <mdicon name="arrow-left" :size="20"/>
            </button>
            <div class="header-text">
                <p class="header-label">Vitals · Body Weight</p>
                <h2>{{ profileName }}</h2>
            </div>
            <button class="add-btn" @click="goToAddRecord">
                <mdicon name="plus" :size="18"/>
                <span>Add record</span>
            </button>
        </div>

        <div v-if="loading" class="state-card">Loading body weight records...</div>
        <div v-else-if="errorMessage" class="state-card error">{{ errorMessage }}</div>

        <div v-else class="detail-content">
            <section class="measurement-panel weight">
                <div class="measurement-header">
                    <div class="measurement-icon">
                        <mdicon name="scale-bathroom" :size="32"/>
                    </div>
                    <div>
                        <p class="measurement-label">Latest measurement</p>
                        <p class="measurement-status" :class="weightTrendClass">
                            {{ weightTrendLabel }}
                        </p>
                    </div>
                </div>
                <div v-if="latestRecord" class="measurement-value">
                    <h3>{{ latestRecord.value }}</h3>
                    <p>kg</p>
                    <p class="measurement-date">{{ latestRecord.formattedDate }} · {{ latestRecord.formattedTime }}</p>
                </div>
                <p v-else class="empty-hint">No body weight records yet.</p>
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
                            <p class="reading-value">{{ entry.value }} kg</p>
                            <p class="reading-sub" :class="entry.deltaClass">
                                {{ entry.deltaLabel }}
                            </p>
                        </div>
                    </div>
                </div>
                <p v-else class="empty-hint">Recent measurements will appear here.</p>
            </section>
        </div>
    </div>
</div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBodyWeight } from '@/composables/vitals/bodyWeight'

const formatDateTime = (value) => {
    if (!value) return { date: 'Unknown', time: '' }
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return { date: 'Unknown', time: '' }
    return {
        date: parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        time: parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
}

export default {
    name: 'BodyWeightDetailWeb',
    setup() {
        const router = useRouter()
        const { records, fetchRecords } = useBodyWeight()
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
                errorMessage.value = err.message || 'Unable to load body weight records.'
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
                formattedDate: date,
                formattedTime: time
            }
        })

        const previousRecord = computed(() => {
            if (records.value.length < 2) return null
            const sorted = [...records.value].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
            return Number(sorted[1].valueNumber) || 0
        })

        const weightDelta = computed(() => {
            if (!latestRecord.value || previousRecord.value === null) return 0
            return +(latestRecord.value.value - previousRecord.value).toFixed(1)
        })

        const weightTrendLabel = computed(() => {
            if (!latestRecord.value) return 'No history'
            if (weightDelta.value > 0) return `+${weightDelta.value} kg since last entry`
            if (weightDelta.value < 0) return `${weightDelta.value} kg since last entry`
            return 'Stable since last entry'
        })

        const weightTrendClass = computed(() => {
            if (weightDelta.value > 0) return 'up'
            if (weightDelta.value < 0) return 'down'
            return 'stable'
        })

        const history = computed(() => {
            const sorted = [...records.value].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
            return sorted.slice(0, 8).map((entry, index, arr) => {
                const { date, time } = formatDateTime(entry.recordedAt)
                const prev = arr[index + 1] ? Number(arr[index + 1].valueNumber) || 0 : null
                const value = Number(entry.valueNumber) || 0
                const delta = prev !== null ? +(value - prev).toFixed(1) : null
                let deltaLabel = '—'
                let deltaClass = 'stable'
                if (delta !== null) {
                    if (delta > 0) {
                        deltaLabel = `+${delta} kg`
                        deltaClass = 'up'
                    } else if (delta < 0) {
                        deltaLabel = `${delta} kg`
                        deltaClass = 'down'
                    } else {
                        deltaLabel = 'No change'
                    }
                }
                return {
                    id: entry.id,
                    value,
                    formattedDate: date,
                    formattedTime: time,
                    deltaLabel,
                    deltaClass
                }
            })
        })

        const goBack = () => {
            router.push({ path: '/medical-records', query: { tab: 'health' } })
        }

        const goToAddRecord = () => {
            router.push('/medical-records/body-weight/add')
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
            weightTrendLabel,
            weightTrendClass,
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
    background: #dcfce7;
    color: #15803d;
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
    background: #f0fdf4;
    border-radius: 24px;
    padding: 24px;
    border: 1px solid #bbf7d0;
}

.measurement-panel.weight {
    background: #ecfdf5;
    border-color: #a7f3d0;
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
    background: rgba(16, 185, 129, 0.15);
    color: #0f766e;
    display: flex;
    align-items: center;
    justify-content: center;
}

.measurement-label {
    margin: 0;
    color: #0f766e;
}

.measurement-status {
    margin: 2px 0 0;
    font-weight: 600;
}

.measurement-status.up {
    color: #dc2626;
}

.measurement-status.down {
    color: #15803d;
}

.measurement-status.stable {
    color: #0f172a;
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
    color: #0f766e;
}

.measurement-date {
    font-size: 14px;
    color: #0f172a;
}

.empty-hint {
    color: #94a3b8;
    margin: 0;
}

.history-panel {
    background: white;
    border: 1px solid #d1fae5;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.history-row {
    display: grid;
    grid-template-columns: 180px 1fr;
    align-items: center;
    border: 1px solid #d1fae5;
    border-radius: 16px;
    padding: 16px 20px;
}

.history-day {
    margin: 0;
    font-weight: 600;
}

.history-time {
    margin: 4px 0 0;
    color: #0f172a;
}

.reading-value {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
}

.reading-sub {
    margin: 2px 0 0;
    font-weight: 600;
}

.reading-sub.up {
    color: #dc2626;
}

.reading-sub.down {
    color: #15803d;
}

.reading-sub.stable {
    color: #4b5563;
}

.state-card {
    padding: 24px;
    border-radius: 20px;
    background: #ecfdf5;
    text-align: center;
    color: #0f766e;
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
