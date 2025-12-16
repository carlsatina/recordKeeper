<template>
<div class="blood-pressure-container">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <!-- Header -->
    <div class="header glass-nav">
        <button class="back-btn" @click="goBack">
            <mdicon name="arrow-left" :size="24"/>
        </button>
        <div class="title-block">
            <h2 class="page-title">Blood Pressure</h2>
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
                <span>145</span>
                <span>110</span>
                <span>75</span>
            </div>
            <div class="chart-area">
                        <div class="chart-bars">
                            <div class="chart-bar-group" v-for="record in bpChartRecords" :key="record.id">
                                <div class="bp-bar">
                                    <div class="bp-range" :style="{ height: record.height }">
                                        <span class="bp-dot-top"></span>
                                        <span class="bp-dot-bottom"></span>
                                    </div>
                                </div>
                                <span class="chart-label">{{ record.label }}</span>
                            </div>
                        </div>
            </div>
            <span class="chart-unit">mmHg</span>
        </div>
    </div>

    <!-- Records List -->
    <div class="records-list">
        <div class="record-item glass-card" v-for="record in bpRecords" :key="record.id" @click="openRecordDetail(record.id)">
            <div class="record-info">
                <p class="record-date">{{ record.date }}</p>
                <p class="record-value">{{ record.systolic }} systolic/{{ record.diastolic }} diastolic</p>
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
import { useBloodPressure } from '@/composables/vitals/bloodPressure'

export default {
    name: 'BloodPressureDetail',
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

        const { records, fetchRecords } = useBloodPressure()

        const classifyStatus = (systolic, diastolic) => {
            if (systolic < 120 && diastolic < 80) return 'Normal'
            if (systolic < 130 && diastolic < 80) return 'Elevated'
            return 'High'
        }

        const bpRecords = computed(() => {
            return records.value.map(record => ({
                id: record.id,
                date: new Date(record.recordedAt).toLocaleDateString(),
                systolic: record.systolic || record.valueNumber,
                diastolic: record.diastolic || 0,
                status: classifyStatus(record.systolic || record.valueNumber, record.diastolic || 0)
            }))
        })

        const loadRecords = async () => {
            const token = localStorage.getItem('token')
            await fetchRecords(token, activeProfileId.value)
        }

        const bpChartRecords = computed(() => {
            const values = bpRecords.value.slice(-7)
            if (!values.length) {
                return weekDaysLong.map((label, index) => ({
                    id: index,
                    height: `${70 + index % 6}%`,
                    label
                }))
            }
            const systolicValues = values.map(val => Number(val.systolic) || 0)
            const max = Math.max(...systolicValues)
            const min = Math.min(...systolicValues)
            const range = (max - min) || 1
            return values.map((record, index) => {
                const normalized = (systolicValues[index] - min) / range
                return {
                    id: record.id,
                    height: `${60 + normalized * 30}%`,
                    label: new Date(record.date).toLocaleDateString(undefined, { weekday: 'short' })
                }
            })
        })

        const goBack = () => {
            router.push({ path: '/medical-records', query: { tab: 'health' } })
        }
        const openRecordDetail = (recordId) => {
            if (!recordId) return
            router.push({
                path: `/medical-records/blood-pressure/${recordId}`,
                query: {
                    profileId: activeProfileId.value,
                    profileName: activeProfileName.value
                }
            })
        }
        const goToAddRecord = () => {
            router.push({
                path: '/medical-records/blood-pressure/add',
                query: {
                    profileId: activeProfileId.value,
                    profileName: activeProfileName.value
                }
            })
        }

        const previousWeek = () => {
            // TODO: Implement previous week logic
            console.log('Previous week')
        }

        const nextWeek = () => {
            // TODO: Implement next week logic
            console.log('Next week')
        }

        onMounted(() => {
            loadRecords()
        })

        watch(
            () => route.query.profileId,
            (val) => {
                const newId = Array.isArray(val) ? val[0] : val
                if (newId && newId !== activeProfileId.value) {
                    activeProfileId.value = newId
                    localStorage.setItem('selectedProfileId', newId)
                    loadRecords()
                }
            }
        )

        watch(
            () => route.query.profileName,
            (val) => {
                const newName = Array.isArray(val) ? val[0] : val
                if (newName) {
                    activeProfileName.value = newName
                    localStorage.setItem('selectedProfileName', newName)
                }
            }
        )

        return {
            selectedPeriod,
            timePeriods,
            dateRange,
            weekDaysLong,
            bpChartRecords,
            bpRecords,
            goBack,
            previousWeek,
            nextWeek,
            goToAddRecord,
            activeProfileName,
            openRecordDetail
        }
    }
}
</script>

<style scoped>
.blood-pressure-container { min-height: 100vh; background: var(--bg-main); position: relative; overflow: hidden; padding-bottom: 100px; }
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
.chart-bars { display: flex; justify-content: space-around; align-items: flex-end; height: 140px; padding: 10px 0; }
.chart-bar-group { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.bp-bar { height: 120px; display: flex; align-items: flex-end; }
.bp-range { width: 10px; background: linear-gradient(180deg, #22d3ee 0%, #a855f7 100%); border-radius: 6px; position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: 5px 0; }
.bp-dot-top, .bp-dot-bottom { width: 10px; height: 10px; background: #0b1020; border-radius: 50%; display: block; margin: 0 auto; border: 2px solid rgba(255,255,255,0.7); }
.chart-label { font-size: 11px; color: var(--text-muted); }
.records-list { padding: 0 16px; display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 1; }
.record-item { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 14px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 24px rgba(0,0,0,0.28); }
.record-info { flex: 1; }
.record-date { font-size: 12px; color: var(--text-muted); margin: 0 0 4px 0; }
.record-value { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0; }
.status-badge { padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 700; border: 1px solid rgba(255,255,255,0.12); }
.status-badge.normal { background: rgba(34, 197, 94, 0.18); color: #4ade80; border-color: rgba(34,197,94,0.3); }
.status-badge.elevated { background: rgba(251, 191, 36, 0.18); color: #fbbf24; border-color: rgba(251,191,36,0.35); }
.status-badge.high { background: rgba(239, 68, 68, 0.18); color: #f87171; border-color: rgba(239,68,68,0.35); }
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
