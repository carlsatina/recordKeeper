<template>
<div class="illness-container">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <!-- Header -->
    <div class="header glass-nav">
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
    <div class="chart-card glass-card">
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
            class="record-item glass-card" 
            v-for="record in illnessList" 
            :key="record.id"
            @click="openRecord(record.id)"
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
    <button class="add-record-btn glass-btn-primary" @click="goToAddIllness">
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

        const openRecord = (recordId) => {
            if (!recordId) return
            router.push({
                path: `/medical-records/illness/${recordId}`,
                query: {
                    profileId: activeProfileId.value,
                    profileName: activeProfileName.value
                }
            })
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
            loading,
            openRecord
        }
    }
}
</script>

<style scoped>
.illness-container { min-height: 100vh; background: #05060a; position: relative; overflow: hidden; padding-bottom: 100px; }
.bg-orb { position: absolute; filter: blur(60px); opacity: 0.28; z-index: 0; }
.orb-1 { width: 320px; height: 320px; border-radius: 50%; background: linear-gradient(135deg, #22d3ee, #a855f7); top: -140px; left: -110px; }
.orb-2 { width: 260px; height: 260px; border-radius: 50%; background: linear-gradient(135deg, #22c55e, #06b6d4); bottom: -120px; right: -90px; }
.header { background: rgba(5,6,10,0.8); padding: 14px 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(148,163,184,0.16); position: sticky; top: 0; z-index: 5; backdrop-filter: blur(12px); }
.title-block { flex: 1; }
.profile-subtitle { margin: 0; font-size: 12px; color: #94a3b8; }
.back-btn, .menu-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); padding: 8px; cursor: pointer; color: #e2e8f0; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; border-radius: 12px; }
.back-btn:active, .menu-btn:active { transform: scale(0.92); background: rgba(255,255,255,0.12); }
.page-title { font-size: 20px; font-weight: 700; color: #e2e8f0; margin: 0; }
.chart-card { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 16px; margin: 16px; box-shadow: 0 14px 30px rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); position: relative; z-index: 1; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; color: #e2e8f0; }
.chart-label { font-size: 13px; color: #cbd5e1; }
.chart-latest { font-weight: 800; font-size: 18px; color: #67e8f9; }
.chart-date { font-size: 12px; color: #94a3b8; }
.chart-container { position: relative; display: flex; gap: 8px; }
.chart-y-axis { display: flex; flex-direction: column; justify-content: space-between; font-size: 11px; color: #94a3b8; padding: 10px 0; min-width: 30px; }
.chart-area { flex: 1; position: relative; }
.line-chart { width: 100%; height: 120px; }
.chart-x-labels { display: flex; justify-content: space-around; margin-top: 8px; color: #94a3b8; font-size: 11px; }
.chart-unit { position: absolute; top: 0; right: 0; font-size: 11px; color: #94a3b8; }
.chart-placeholder { padding: 30px 12px; text-align: center; color: #94a3b8; }
.records-list { padding: 0 16px; display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 1; }
.record-item { padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.05); box-shadow: 0 10px 24px rgba(0,0,0,0.28); display: flex; flex-direction: column; gap: 8px; }
.record-main { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.record-diagnosis { margin: 0; font-size: 15px; font-weight: 800; color: #e2e8f0; }
.record-date { margin: 0; font-size: 12px; color: #94a3b8; }
.badge { padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1px solid rgba(255,255,255,0.12); color: #e2e8f0; }
.badge.subtle { background: rgba(255,255,255,0.06); color: #cbd5e1; }
.record-meta { display: flex; flex-wrap: wrap; gap: 8px; }
.symptom-chip { background: rgba(103,232,249,0.12); color: #67e8f9; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 700; border: 1px solid rgba(103,232,249,0.3); }
.empty-state { padding: 32px 16px; text-align: center; color: #cbd5e1; }
.empty-icon { color: #94a3b8; }
.empty-title { font-size: 18px; font-weight: 700; color: #e2e8f0; margin: 0 0 6px 0; }
.empty-text { font-size: 13px; color: #94a3b8; margin: 0; }
.add-record-btn { position: fixed; bottom: 20px; left: 16px; right: 16px; border: none; padding: 16px; font-size: 16px; font-weight: 700; }
</style>
