<template>
<div class="body-weight-container">
    <!-- Header -->
    <div class="header">
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
    <div class="chart-card">
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
        <div class="record-item" v-for="record in weightRecords" :key="record.id">
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
    <button class="add-record-btn" @click="goToAddRecord">
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
            chartPath
        }
    }
}
</script>

<style scoped>
.body-weight-container {
    min-height: 100vh;
    background: #f8f9fa;
    padding-bottom: 100px;
}

/* Header */
.header {
    background: white;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 10;
}

.title-block {
    display: flex;
    flex-direction: column;
}

.profile-subtitle {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
}

.back-btn,
.menu-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.back-btn:active,
.menu-btn:active {
    transform: scale(0.9);
    background: #f3f4f6;
    border-radius: 8px;
}

.page-title {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

/* Time Period Tabs */
.time-tabs {
    display: flex;
    gap: 0;
    padding: 20px 20px 0;
    background: #f8f9fa;
}

.time-tab {
    flex: 1;
    background: none;
    border: none;
    padding: 12px 16px;
    font-size: 15px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    position: relative;
    transition: color 0.2s ease;
}

.time-tab.active {
    color: #667eea;
}

.time-tab.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #667eea;
    border-radius: 3px 3px 0 0;
}

/* Chart Card */
.chart-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    margin: 20px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.nav-arrow {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-arrow:active {
    transform: scale(0.9);
}

.date-range {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
}

/* Chart Container */
.chart-container {
    position: relative;
    display: flex;
    gap: 8px;
}

.chart-y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 11px;
    color: #9ca3af;
    padding: 10px 0;
    min-width: 30px;
}

.chart-area {
    flex: 1;
    position: relative;
}

.chart-unit {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 11px;
    color: #9ca3af;
}

.line-chart {
    width: 100%;
    height: 120px;
}

.chart-x-labels {
    display: flex;
    justify-content: space-around;
    margin-top: 8px;
}

.chart-x-labels span {
    font-size: 12px;
    color: #6b7280;
}

/* Records List */
.records-list {
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.record-item {
    background: white;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.record-info {
    flex: 1;
}

.record-date {
    font-size: 13px;
    color: #9ca3af;
    margin: 0 0 4px 0;
}

.record-value {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
}

.record-change {
    font-size: 14px;
    font-weight: 500;
    margin-left: 8px;
}

.record-change.increase {
    color: #dc2626;
}

.record-change.decrease {
    color: #059669;
}

.status-badge {
    padding: 6px 16px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
}

.status-badge.normal {
    background: #d1fae5;
    color: #065f46;
}

.status-badge.elevated {
    background: #fef3c7;
    color: #92400e;
}

.status-badge.high {
    background: #fecaca;
    color: #991b1b;
}

/* Add Record Button */
.add-record-btn {
    position: fixed;
    bottom: 20px;
    left: 16px;
    right: 16px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;
}

.add-record-btn:active {
    transform: scale(0.98);
    background: #5568d3;
}
</style>
