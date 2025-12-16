<template>
<div class="body-weight-container">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <!-- Header -->
    <div class="header glass-nav">
        <button class="back-btn" @click="goBack">
            <mdicon name="arrow-left" :size="24"/>
        </button>
        <div class="title-block">
            <h2 class="page-title">Body Weight</h2>
            <p class="profile-subtitle">{{ activeProfileName }}</p>
        </div>
        <button class="menu-btn">
            <mdicon name="dots-vertical" :size="24"/>
        </button>
    </div>

    <!-- Time Period Tabs -->
    <div class="time-tabs">
        <button 
            v-for="period in timePeriods" 
            :key="period"
            class="time-tab"
            :class="{ active: selectedPeriod === period }"
            @click="selectedPeriod = period"
        >
            {{ period }}
        </button>
    </div>

    <!-- Chart Card -->
    <div class="chart-card glass-card">
        <div class="chart-header">
            <button class="nav-arrow" @click="previousWeek">
                <mdicon name="chevron-left" :size="24"/>
            </button>
            <span class="date-range">{{ dateRange }}</span>
            <button class="nav-arrow" @click="nextWeek">
                <mdicon name="chevron-right" :size="24"/>
            </button>
        </div>

        <div class="chart-container">
            <div class="chart-y-axis">
                <span>75</span>
                <span>70</span>
                <span>65</span>
                <span>60</span>
                <span>55</span>
            </div>
            <div class="chart-area">
                <svg class="line-chart" viewBox="0 0 280 120" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:#667eea;stop-opacity:0.05" />
                        </linearGradient>
                    </defs>
                    <path 
                        v-if="chartPath" 
                        :d="chartPath" 
                        fill="url(#weightGradient)" 
                        stroke="none"/>
                    <path 
                        v-if="chartPath" 
                        :d="chartPath" 
                        fill="none" 
                        stroke="#667eea" 
                        stroke-width="2"/>
                    <circle 
                        v-for="(point, index) in chartPoints" 
                        :key="index" 
                        :cx="point.x" 
                        :cy="point.y" 
                        r="3" 
                        fill="#667eea"/>
                </svg>
                <div class="chart-x-labels">
                    <span v-for="day in weekDaysLong" :key="day">{{ day }}</span>
                </div>
            </div>
            <span class="chart-unit">kg</span>
        </div>
    </div>

    <!-- Records List -->
    <div class="records-list">
        <div class="record-item glass-card" v-for="record in weightRecords" :key="record.id" @click="openRecordDetail(record.id)">
            <div class="record-info">
                <p class="record-date">{{ record.date }}</p>
                <p class="record-value">{{ record.weight }} kg <span class="record-change" :class="record.change > 0 ? 'increase' : 'decrease'">{{ record.change > 0 ? '+' : '' }}{{ record.change }} kg</span></p>
            </div>
            <span class="status-badge" :class="record.status.toLowerCase()">
                {{ record.status }}
            </span>
        </div>
    </div>

    <!-- Add New Record Button -->
    <button class="add-record-btn glass-btn-primary" @click="goToAddRecord">
        Add new record
    </button>
</div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { API_BASE_URL } from '@/constants/config'

export default {
    name: 'BodyWeightDetail',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const selectedPeriod = ref('Week')
        const timePeriods = ['Day', 'Week', 'Month', 'Year']
        const dateRange = ref('05 Jan - 11 Jan')
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
        const weekDaysLong = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        const weightRecords = ref([])
        const loadRecords = async () => {
            const token = localStorage.getItem('token')
            if (!token || !activeProfileId.value) {
                weightRecords.value = []
                return
            }
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/vitals/body-weight?profileId=${activeProfileId.value}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                const data = await res.json()
                if (data.status === 200) {
                    weightRecords.value = data.records.map((entry, index, arr) => {
                        const previous = arr[index - 1]
                        const change = previous ? +(entry.valueNumber - previous.valueNumber).toFixed(1) : 0
                        return {
                            id: entry.id,
                            date: new Date(entry.recordedAt).toLocaleDateString(),
                            weight: entry.valueNumber,
                            change,
                            status: change > 0 ? 'Increase' : (change < 0 ? 'Decrease' : 'Stable')
                        }
                    })
                }
            } catch (err) {
                console.error(err)
            }
        }

        const goBack = () => {
            router.push({ path: '/medical-records', query: { tab: 'health' } })
        }
        const openRecordDetail = (recordId) => {
            if (!recordId) return
            router.push({
                path: `/medical-records/body-weight/${recordId}`,
                query: {
                    profileId: activeProfileId.value,
                    profileName: activeProfileName.value
                }
            })
        }
        const goToAddRecord = () => {
            router.push({
                path: '/medical-records/body-weight/add',
                query: {
                    profileId: activeProfileId.value,
                    profileName: activeProfileName.value
                }
            })
        }

        const previousWeek = () => {
            console.log('Previous week')
        }

        const nextWeek = () => {
            console.log('Next week')
        }

        onMounted(() => {
            loadRecords()
        })

        watch(
            () => route.query.profileId,
            (newVal) => {
                const profileId = Array.isArray(newVal) ? newVal[0] : newVal
                if (profileId && profileId !== activeProfileId.value) {
                    activeProfileId.value = profileId
                    localStorage.setItem('selectedProfileId', profileId)
                    loadRecords()
                }
            }
        )

        watch(
            () => route.query.profileName,
            (newVal) => {
                const profileName = Array.isArray(newVal) ? newVal[0] : newVal
                if (profileName) {
                    activeProfileName.value = profileName
                    localStorage.setItem('selectedProfileName', profileName)
                }
            }
        )

        const chartPoints = computed(() => {
            const weights = weightRecords.value.map(record => Number(record.weight)).filter(val => !Number.isNaN(val))
            if (weights.length === 0) {
                return []
            }
            const max = Math.max(...weights)
            const min = Math.min(...weights)
            const range = (max - min) || 1
            const width = 280
            const height = 120
            const step = weights.length > 1 ? width / (weights.length - 1) : 0
            return weights.map((value, index) => {
                const x = weights.length === 1 ? width / 2 : index * step
                const normalized = (value - min) / range
                const y = height - (normalized * height)
                return { x, y }
            })
        })

        const chartPath = computed(() => {
            const points = chartPoints.value
            if (!points.length) {
                return ''
            }
            return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
        })

        return {
            selectedPeriod,
            timePeriods,
            dateRange,
            weekDaysLong,
            weightRecords,
            goBack,
            previousWeek,
            nextWeek,
            goToAddRecord,
            activeProfileName,
            chartPoints,
            chartPath,
            openRecordDetail
        }
    }
}
</script>

<style scoped>
.body-weight-container { min-height: 100vh; background: var(--bg-main); position: relative; overflow: hidden; padding-bottom: 100px; }
.bg-orb { position: absolute; filter: blur(60px); opacity: 0.28; z-index: 0; }
.orb-1 { width: 320px; height: 320px; border-radius: 50%; background: linear-gradient(135deg, #22d3ee, #a855f7); top: -140px; left: -110px; }
.orb-2 { width: 260px; height: 260px; border-radius: 50%; background: linear-gradient(135deg, #22c55e, #06b6d4); bottom: -120px; right: -90px; }
.header { background: var(--glass-ghost-bg); padding: 14px 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--glass-card-border); position: sticky; top: 0; z-index: 5; backdrop-filter: blur(12px); }
.title-block { flex: 1; }
.profile-subtitle { margin: 0; font-size: 12px; color: var(--text-muted); }
.back-btn, .menu-btn { background: var(--glass-ghost-bg); border: 1px solid var(--glass-card-border); padding: 8px; cursor: pointer; color: var(--text-primary); display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; border-radius: 12px; }
.back-btn:active, .menu-btn:active { transform: scale(0.92); background: rgba(255,255,255,0.12); }
.page-title { font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0; }
.time-tabs { display: flex; gap: 0; padding: 14px 16px 0; }
.time-tab { flex: 1; background: transparent; border: none; padding: 12px 10px; font-size: 14px; font-weight: 700; color: var(--text-muted); cursor: pointer; position: relative; transition: color 0.2s ease; }
.time-tab.active { color: #67e8f9; }
.time-tab.active::after { content: ''; position: absolute; bottom: 0; left: 20%; right: 20%; height: 3px; background: linear-gradient(135deg, #22d3ee, #a855f7); border-radius: 3px 3px 0 0; }
.chart-card { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 16px; margin: 16px; box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35); border: 1px solid rgba(255,255,255,0.08); position: relative; z-index: 1; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.nav-arrow { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); padding: 6px; cursor: pointer; color: var(--text-primary); display: flex; align-items: center; justify-content: center; border-radius: 10px; }
.nav-arrow:active { transform: scale(0.92); }
.date-range { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.chart-container { position: relative; display: flex; gap: 8px; }
.chart-y-axis { display: flex; flex-direction: column; justify-content: space-between; font-size: 11px; color: var(--text-muted); padding: 10px 0; min-width: 30px; }
.chart-area { flex: 1; position: relative; }
.chart-unit { position: absolute; top: 0; right: 0; font-size: 11px; color: var(--text-muted); }
.line-chart { width: 100%; height: 120px; }
.chart-x-labels { display: flex; justify-content: space-around; margin-top: 8px; color: var(--text-muted); font-size: 11px; }
.records-list { padding: 0 16px; display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 1; }
.record-item { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 14px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 24px rgba(0,0,0,0.28); }
.record-info { flex: 1; }
.record-date { font-size: 12px; color: var(--text-muted); margin: 0 0 4px 0; }
.record-value { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0; }
.record-change { font-size: 12px; font-weight: 700; }
.record-change.increase { color: #4ade80; }
.record-change.decrease { color: #f87171; }
.status-badge { padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 700; border: 1px solid rgba(255,255,255,0.12); color: var(--text-secondary); }
.add-record-btn { 
    position: fixed; 
    bottom: 20px; 
    left: 16px; 
    right: 16px; 
    border: none; 
    padding: 16px; 
    font-size: 16px; 
    font-weight: 700; 
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
