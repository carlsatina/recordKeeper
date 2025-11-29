<template>
<div class="illness-container">
    <!-- Header -->
    <div class="header">
        <button class="back-btn" @click="goBack">
            <mdicon name="arrow-left" :size="24"/>
        </button>
        <div class="title-block">
            <h2 class="page-title">Illness</h2>
            <p class="profile-subtitle">{{ activeProfileName }}</p>
        </div>
        <button class="menu-btn">
            <mdicon name="dots-vertical" :size="24"/>
        </button>
    </div>

    <!-- Chart Card -->
    <div class="chart-card">
        <div class="chart-header">
            <div class="chart-title">
                <span class="chart-label">Body temperature</span>
                <span class="chart-latest" v-if="latestTemp">
                    {{ latestTemp.value }}°{{ latestTemp.unit }}
                </span>
            </div>
            <span class="chart-date" v-if="latestTemp">Last: {{ latestTemp.date }}</span>
        </div>
        <div class="chart-container" v-if="chartPoints.length">
            <div class="chart-y-axis">
                <span>{{ yAxis.max }}</span>
                <span>{{ yAxis.mid }}</span>
                <span>{{ yAxis.min }}</span>
            </div>
            <div class="chart-area">
                <svg class="line-chart" viewBox="0 0 280 120" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="illnessGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0.05" />
                        </linearGradient>
                    </defs>
                    <path 
                        v-if="chartPath" 
                        :d="chartPath" 
                        fill="url(#illnessGradient)" 
                        stroke="none"/>
                    <path 
                        v-if="chartPath" 
                        :d="chartPath" 
                        fill="none" 
                        stroke="#6366f1" 
                        stroke-width="2"/>
                    <circle 
                        v-for="(point, index) in chartPoints" 
                        :key="index" 
                        :cx="point.x" 
                        :cy="point.y" 
                        r="3" 
                        fill="#6366f1"/>
                </svg>
                <div class="chart-x-labels">
                    <span v-for="point in chartPoints" :key="point.label">{{ point.label }}</span>
                </div>
            </div>
            <span class="chart-unit">°{{ latestTemp?.unit || 'C' }}</span>
        </div>
        <div class="chart-placeholder" v-else>
            <p>No temperature data yet</p>
        </div>
    </div>

    <!-- Records List -->
    <div class="records-list">
        <div 
            class="record-item" 
            v-for="record in illnessList" 
            :key="record.id"
        >
            <div class="record-main">
                <div>
                    <p class="record-diagnosis">{{ record.diagnosis }}</p>
                    <p class="record-date">{{ record.date }}</p>
                </div>
                <span class="badge" :class="record.statusClass">{{ record.status }}</span>
            </div>
            <div class="record-meta">
                <span class="badge subtle">{{ record.severity }}</span>
                <span v-if="record.temperature" class="badge subtle">{{ record.temperature }}</span>
                <span v-if="record.symptoms.length" class="symptom-chip" v-for="symptom in record.symptoms" :key="symptom">
                    {{ symptom }}
                </span>
            </div>
        </div>

        <div v-if="!illnessList.length && !loading" class="empty-state">
            <mdicon name="stethoscope" :size="48" class="empty-icon"/>
            <p class="empty-title">No illness records yet</p>
            <p class="empty-text">Add an illness entry to start tracking your recovery.</p>
        </div>
    </div>

    <!-- Add New Record Button -->
    <button class="add-record-btn" @click="goToAddIllness">
        Add illness record
    </button>
</div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useIllness } from '@/composables/vitals/illness'

export default {
    name: 'Illness',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { records, loading, fetchRecords } = useIllness()

        const profileIdFromQuery = Array.isArray(route.query.profileId) ? route.query.profileId[0] : route.query.profileId
        const profileNameFromQuery = Array.isArray(route.query.profileName) ? route.query.profileName[0] : route.query.profileName
        const activeProfileId = ref(profileIdFromQuery || localStorage.getItem('selectedProfileId'))
        const activeProfileName = ref(profileNameFromQuery || localStorage.getItem('selectedProfileName') || 'Profile')
        if (activeProfileId.value) {
            localStorage.setItem('selectedProfileId', activeProfileId.value)
        }
        if (activeProfileName.value) {
            localStorage.setItem('selectedProfileName', activeProfileName.value)
        }

        const goBack = () => {
            router.push({ path: '/medical-records', query: { tab: 'health' } })
        }

        const goToAddIllness = () => {
            router.push({
                path: '/medical-records/illness/add',
                query: {
                    profileId: activeProfileId.value,
                    profileName: activeProfileName.value
                }
            })
        }

        const loadRecords = async () => {
            const token = localStorage.getItem('token')
            if (!token || !activeProfileId.value) {
                return
            }
            await fetchRecords(token, activeProfileId.value)
        }

        const illnessList = computed(() => {
            return [...records.value]
                .sort((a, b) => new Date(b.recordedAt || b.createdAt) - new Date(a.recordedAt || a.createdAt))
                .map(entry => ({
                    id: entry.id,
                    diagnosis: entry.diagnosis,
                    status: entry.status || 'ONGOING',
                    statusClass: (entry.status || 'ONGOING').toLowerCase(),
                    severity: entry.severity || 'MILD',
                    temperature: entry.bodyTemperature ? `${entry.bodyTemperature}°${entry.temperatureUnit || 'C'}` : '',
                    date: new Date(entry.recordedAt || entry.createdAt).toLocaleDateString(),
                    symptoms: entry.symptoms || [],
                    notes: entry.notes
                }))
        })

        const tempSeries = computed(() => {
            return [...records.value]
                .filter(r => typeof r.bodyTemperature === 'number')
                .sort((a, b) => new Date(a.recordedAt || a.createdAt) - new Date(b.recordedAt || b.createdAt))
        })

        const chartPoints = computed(() => {
            const values = tempSeries.value.slice(-7)
            if (!values.length) return []
            const numbers = values.map(entry => Number(entry.bodyTemperature))
            const max = Math.max(...numbers)
            const min = Math.min(...numbers)
            const range = (max - min) || 1
            const width = 280
            const height = 120
            const step = numbers.length > 1 ? width / (numbers.length - 1) : 0
            return numbers.map((value, index) => {
                const x = numbers.length === 1 ? width / 2 : index * step
                const normalized = (value - min) / range
                const y = height - (normalized * height)
                return {
                    x,
                    y,
                    label: new Date(values[index].recordedAt || values[index].createdAt).toLocaleDateString(undefined, { weekday: 'short' })
                }
            })
        })

        const chartPath = computed(() => {
            const points = chartPoints.value
            if (!points.length) return ''
            return points.map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
        })

        const latestTemp = computed(() => {
            if (!tempSeries.value.length) return null
            const latest = tempSeries.value[tempSeries.value.length - 1]
            return {
                value: latest.bodyTemperature,
                unit: latest.temperatureUnit || 'C',
                date: new Date(latest.recordedAt || latest.createdAt).toLocaleDateString()
            }
        })

        const yAxis = computed(() => {
            if (!tempSeries.value.length) {
                return { max: '--', mid: '--', min: '--' }
            }
            const temps = tempSeries.value.slice(-7).map(v => Number(v.bodyTemperature))
            const max = Math.max(...temps)
            const min = Math.min(...temps)
            const mid = ((max + min) / 2).toFixed(1)
            return {
                max: max.toFixed(1),
                mid,
                min: min.toFixed(1)
            }
        })

        onMounted(() => {
            loadRecords()
        })

        watch(
            () => route.query.profileId,
            (newVal) => {
                const profileId = Array.isArray(newVal) ? newVal[0] : newVal
                if (profileId) {
                    activeProfileId.value = profileId
                    localStorage.setItem('selectedProfileId', profileId)
                    loadRecords()
                }
            }
        )

        return {
            goBack,
            goToAddIllness,
            illnessList,
            chartPoints,
            chartPath,
            latestTemp,
            yAxis,
            activeProfileName,
            loading
        }
    }
}
</script>

<style scoped>
.illness-container {
    min-height: 100vh;
    background: #f8fafc;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.back-btn,
.menu-btn {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: none;
    background: #eef2ff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4338ca;
}

.title-block {
    flex: 1;
    padding: 0 12px;
}

.page-title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
}

.profile-subtitle {
    margin: 2px 0 0;
    color: #475569;
    font-size: 13px;
}

.chart-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.chart-title {
    display: flex;
    align-items: baseline;
    gap: 8px;
}

.chart-label {
    font-size: 14px;
    color: #475569;
}

.chart-latest {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
}

.chart-date {
    font-size: 12px;
    color: #6b7280;
}

.chart-container {
    display: flex;
    gap: 10px;
    position: relative;
}

.chart-y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 11px;
    color: #94a3b8;
    min-width: 32px;
}

.chart-area {
    flex: 1;
}

.line-chart {
    width: 100%;
    height: 120px;
}

.chart-x-labels {
    display: flex;
    justify-content: space-around;
    margin-top: 6px;
    font-size: 11px;
    color: #94a3b8;
}

.chart-unit {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 11px;
    color: #94a3b8;
}

.chart-placeholder {
    text-align: center;
    padding: 24px 0;
    color: #94a3b8;
    font-size: 14px;
}

.records-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.record-item {
    background: #fff;
    border-radius: 14px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.record-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
}

.record-diagnosis {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
}

.record-date {
    margin: 2px 0 0;
    font-size: 12px;
    color: #64748b;
}

.badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
}

.badge.subtle {
    background: #f3f4f6;
    color: #374151;
    font-weight: 600;
}

.badge.ongoing,
.badge.chronic {
    background: #fff7ed;
    color: #ea580c;
}

.badge.recovered,
.badge.resolved {
    background: #ecfdf3;
    color: #16a34a;
}

.badge.severe,
.badge.critical {
    background: #fef2f2;
    color: #dc2626;
}

.record-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.symptom-chip {
    background: #eef2ff;
    color: #4338ca;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 600;
}

.empty-state {
    background: #fff;
    border-radius: 14px;
    padding: 24px;
    text-align: center;
    color: #475569;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.empty-icon {
    color: #cbd5e1;
    margin-bottom: 8px;
}

.empty-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
}

.empty-text {
    margin: 4px 0 0;
    font-size: 13px;
    color: #64748b;
}

.add-record-btn {
    position: sticky;
    bottom: 0;
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #7c3aed, #6366f1);
    color: #fff;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 700;
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.3);
    margin-top: 4px;
    margin-left: auto;
    margin-right: auto;
}

.illness-container {
    position: relative;
    padding-bottom: 24px;
}
</style>
