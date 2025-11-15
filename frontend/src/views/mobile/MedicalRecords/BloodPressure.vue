<template>
<div class="blood-pressure-container">
    <!-- Header -->
    <div class="header">
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
                <span>145</span>
                <span>110</span>
                <span>75</span>
            </div>
            <div class="chart-area">
                <div class="chart-bars">
                    <div class="chart-bar-group" v-for="(day, index) in weekDaysLong" :key="index">
                        <div class="bp-bar">
                            <div class="bp-range" :style="{ height: bloodPressureData[index].height }">
                                <span class="bp-dot-top"></span>
                                <span class="bp-dot-bottom"></span>
                            </div>
                        </div>
                        <span class="chart-label">{{ day }}</span>
                    </div>
                </div>
            </div>
            <span class="chart-unit">mmHg</span>
        </div>
    </div>

    <!-- Records List -->
    <div class="records-list">
        <div class="record-item" v-for="record in bpRecords" :key="record.id">
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
    <button class="add-record-btn" @click="goToAddRecord">
        Add new record
    </button>
</div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

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
        const activeProfileId = profileIdFromQuery || localStorage.getItem('selectedProfileId')
        const activeProfileName = ref(profileNameFromQuery || localStorage.getItem('selectedProfileName') || 'Profile')
        if (activeProfileId) {
            localStorage.setItem('selectedProfileId', activeProfileId)
        }
        if (activeProfileName.value) {
            localStorage.setItem('selectedProfileName', activeProfileName.value)
        }
        const weekDaysLong = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        const bloodPressureData = [
            { height: '70%' },
            { height: '75%' },
            { height: '78%' },
            { height: '72%' },
            { height: '76%' },
            { height: '74%' },
            { height: '80%' }
        ]

        const bpRecords = ref([
            {
                id: 1,
                date: 'Saturday, January 11',
                systolic: 120,
                diastolic: 80,
                status: 'Normal'
            },
            {
                id: 2,
                date: 'Friday, January 10',
                systolic: 128,
                diastolic: 82,
                status: 'Elevated'
            },
            {
                id: 3,
                date: 'Thursday, January 09',
                systolic: 132,
                diastolic: 92,
                status: 'High'
            },
            {
                id: 4,
                date: 'Wednesday, January 08',
                systolic: 118,
                diastolic: 78,
                status: 'Normal'
            }
        ])

        const goBack = () => {
            router.push({ path: '/medical-records', query: { tab: 'health' } })
        }
        const goToAddRecord = () => {
            router.push('/medical-records/blood-pressure/add')
        }

        const previousWeek = () => {
            // TODO: Implement previous week logic
            console.log('Previous week')
        }

        const nextWeek = () => {
            // TODO: Implement next week logic
            console.log('Next week')
        }

        return {
            selectedPeriod,
            timePeriods,
            dateRange,
            weekDaysLong,
            bloodPressureData,
            bpRecords,
            goBack,
            previousWeek,
            nextWeek,
            goToAddRecord,
            activeProfileName
        }
    }
}
</script>

<style scoped>
.blood-pressure-container {
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

.chart-bars {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 140px;
    padding: 10px 0;
}

.chart-bar-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.bp-bar {
    height: 120px;
    display: flex;
    align-items: flex-end;
}

.bp-range {
    width: 10px;
    background: linear-gradient(180deg, #a5b4fc 0%, #c7d2fe 100%);
    border-radius: 5px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 5px 0;
}

.bp-dot-top,
.bp-dot-bottom {
    width: 10px;
    height: 10px;
    background: #667eea;
    border-radius: 50%;
    display: block;
    margin: 0 auto;
}

.chart-label {
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
