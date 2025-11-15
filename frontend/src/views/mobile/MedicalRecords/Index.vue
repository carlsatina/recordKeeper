<template>
<div class="medical-records-container">
    <!-- Top Bar -->
    <TopBar 
        :title="getTabTitle()"
        :show-back="activeTab === 'home'"
        back-route="/"
    >
        <template #actions>
            <mdicon 
                v-if="activeTab === 'home'"
                name="bell-outline" 
                :size="24" 
                class="action-icon"
            />
            <mdicon 
                v-if="activeTab === 'records'"
                name="magnify" 
                :size="24" 
                class="action-icon"
            />
            <mdicon 
                v-if="activeTab === 'health'"
                name="plus" 
                :size="24" 
                class="action-icon"
                @click="showHealthModal = true"
            />
        </template>
    </TopBar>

    <!-- Content Area -->
    <div class="content-wrapper">
        <!-- Home Tab -->
        <div v-if="activeTab === 'home'" class="tab-content">
            <!-- Quick Action Cards -->
            <div class="action-cards-grid">
                <div class="action-card-large" @click="navigateToAddRecord">
                    <div class="action-icon-wrapper">
                        <mdicon name="clipboard-plus" :size="48"/>
                    </div>
                    <h4>Add medical record</h4>
                </div>
                <div class="action-card-large">
                    <div class="action-icon-wrapper">
                        <mdicon name="pill" :size="48"/>
                    </div>
                    <h4>Add medicine reminder</h4>
                </div>
            </div>

            <!-- Today's Reminder Section -->
            <div class="section-header">
                <h3 class="section-title">Today's Reminder</h3>
                <a href="#" class="see-all-link">See all</a>
            </div>
            <div class="reminder-list">
                <div class="reminder-item">
                    <div class="reminder-checkbox"></div>
                    <div class="reminder-content">
                        <h4 class="reminder-name">Vitamin D</h4>
                        <p class="reminder-details">1 Tablet, after meal</p>
                    </div>
                    <span class="reminder-time">12:00 PM</span>
                </div>
                <div class="reminder-item">
                    <div class="reminder-checkbox"></div>
                    <div class="reminder-content">
                        <h4 class="reminder-name">Calcium</h4>
                        <p class="reminder-details">1 Tablet, after meal</p>
                    </div>
                    <span class="reminder-time">1:00 PM</span>
                </div>
                <div class="reminder-item">
                    <div class="reminder-checkbox"></div>
                    <div class="reminder-content">
                        <h4 class="reminder-name">Cefixime</h4>
                        <p class="reminder-details">1 Tablet, after meal</p>
                    </div>
                    <span class="reminder-time">1:30 PM</span>
                </div>
            </div>

            <!-- Recent Records Section -->
            <div class="section-header">
                <h3 class="section-title">Recent records</h3>
            </div>
            <div class="records-list">
                <div class="record-item">
                    <div class="record-icon">
                        <mdicon name="file-document" :size="24"/>
                    </div>
                    <div class="record-content">
                        <h4 class="record-name">Eye check-up</h4>
                        <p class="record-type">Prescription</p>
                    </div>
                    <mdicon name="chevron-right" :size="20" class="record-arrow"/>
                </div>
                <div class="record-item">
                    <div class="record-icon">
                        <mdicon name="file-document" :size="24"/>
                    </div>
                    <div class="record-content">
                        <h4 class="record-name">Blood Test</h4>
                        <p class="record-type">Lab Report</p>
                    </div>
                    <mdicon name="chevron-right" :size="20" class="record-arrow"/>
                </div>
            </div>
        </div>

        <!-- Records Tab -->
        <div v-if="activeTab === 'records'" class="tab-content">
            <div class="records-list-view">
                <!-- Sample Records -->
                <div class="record-card" v-for="record in medicalRecords" :key="record.id">
                    <div class="record-icon-large">
                        <mdicon :name="record.icon" :size="24"/>
                    </div>
                    <div class="record-info">
                        <h4 class="record-title">{{ record.title }}</h4>
                        <p class="record-meta">{{ record.type }} | {{ record.date }}</p>
                    </div>
                    <mdicon name="chevron-right" :size="20" class="record-chevron"/>
                </div>

                <!-- Empty State (show when no records) -->
                <div v-if="medicalRecords.length === 0" class="empty-state">
                    <mdicon name="file-document-multiple" :size="64" class="empty-icon"/>
                    <p class="empty-title">No Records Yet</p>
                    <p class="empty-text">Start adding medical records to track your health history</p>
                </div>
            </div>

            <!-- Floating Action Button -->
            <button class="fab" @click="navigateToAddRecord">
                <mdicon name="plus" :size="28"/>
            </button>
        </div>

        <!-- My Health Tab -->
        <div v-if="activeTab === 'health'" class="tab-content">
            <div class="health-metrics">
                <!-- Blood Pressure Card -->
                <div class="health-card" @click="navigateToBloodPressure">
                    <div class="health-card-header">
                        <div>
                            <h4 class="health-title">Blood Pressure</h4>
                            <p class="health-subtitle">Last 7 days</p>
                        </div>
                        <mdicon name="chevron-right" :size="20" class="health-chevron"/>
                    </div>
                    <div class="health-chart">
                        <div class="chart-y-axis">
                            <span>145</span>
                            <span>110</span>
                            <span>75</span>
                        </div>
                        <div class="chart-area">
                            <div class="chart-bars">
                                <div class="chart-bar-group" v-for="(day, index) in weekDays" :key="index">
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

                <!-- Blood Sugar (Fasting) Card -->
                <div class="health-card" @click="navigateToBloodSugar">
                    <div class="health-card-header">
                        <div>
                            <h4 class="health-title">Blood Sugar <span class="health-tag">(Fasting)</span></h4>
                            <p class="health-subtitle">Last 7 days</p>
                        </div>
                        <mdicon name="chevron-right" :size="20" class="health-chevron"/>
                    </div>
                    <div class="health-chart">
                        <div class="chart-y-axis">
                            <span>110</span>
                            <span>100</span>
                            <span>90</span>
                            <span>80</span>
                            <span>70</span>
                        </div>
                        <div class="chart-area">
                            <svg class="line-chart" viewBox="0 0 280 120" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.3" />
                                        <stop offset="100%" style="stop-color:#667eea;stop-opacity:0.05" />
                                    </linearGradient>
                                </defs>
                                <path d="M 0 30 L 40 35 L 80 45 L 120 50 L 160 40 L 200 20 L 240 15 L 280 35" 
                                      fill="url(#lineGradient)" 
                                      stroke="none"/>
                                <path d="M 0 30 L 40 35 L 80 45 L 120 50 L 160 40 L 200 20 L 240 15 L 280 35" 
                                      fill="none" 
                                      stroke="#667eea" 
                                      stroke-width="2"/>
                                <circle cx="0" cy="30" r="3" fill="#667eea"/>
                                <circle cx="40" cy="35" r="3" fill="#667eea"/>
                                <circle cx="80" cy="45" r="3" fill="#667eea"/>
                                <circle cx="120" cy="50" r="3" fill="#667eea"/>
                                <circle cx="160" cy="40" r="3" fill="#667eea"/>
                                <circle cx="200" cy="20" r="3" fill="#667eea"/>
                                <circle cx="240" cy="15" r="3" fill="#667eea"/>
                                <circle cx="280" cy="35" r="3" fill="#667eea"/>
                            </svg>
                            <div class="chart-x-labels">
                                <span v-for="day in weekDays" :key="day">{{ day }}</span>
                            </div>
                        </div>
                        <span class="chart-unit">mg/dL</span>
                    </div>
                </div>

                <!-- Body Weight Card -->
                <div class="health-card" @click="navigateToBodyWeight">
                    <div class="health-card-header">
                        <div>
                            <h4 class="health-title">Body Weight</h4>
                            <p class="health-subtitle">Last 7 days</p>
                        </div>
                        <mdicon name="chevron-right" :size="20" class="health-chevron"/>
                    </div>
                    <div class="health-chart-placeholder">
                        <p class="placeholder-text">No data available</p>
                    </div>
                    <span class="chart-unit-bottom">kg</span>
                </div>
            </div>
        </div>

        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="tab-content profile-tab">
            <div class="profile-header">
                <button class="back-btn" @click="router.back()">
                    <mdicon name="arrow-left" :size="22"/>
                </button>
                <h2>Profile</h2>
                <button class="icon-btn">
                    <mdicon name="account-plus" :size="22"/>
                </button>
            </div>

            <div class="profile-switcher" v-if="profileMembers.length">
                <div 
                    v-for="member in profileMembers" 
                    :key="member.id"
                    class="profile-avatar"
                    :class="{ active: member.id === activeMemberId }"
                    @click="activeMemberId = member.id"
                >
                    <div class="avatar-circle">
                        <mdicon :name="activeMemberId === member.id ? 'account' : 'account-outline'" :size="28"/>
                    </div>
                    <span>{{ member.name }}</span>
                </div>
                <div class="profile-avatar add" @click="addFamilyMember">
                    <div class="avatar-circle">
                        <mdicon name="plus" :size="26"/>
                    </div>
                    <span>Add</span>
                </div>
            </div>
            <div v-else class="profile-switcher empty">
                <div class="profile-avatar add" @click="addFamilyMember">
                    <div class="avatar-circle">
                        <mdicon name="plus" :size="26"/>
                    </div>
                    <span>Add Profile</span>
                </div>
            </div>

            <div class="profile-card">
                <div 
                    class="profile-row"
                    v-for="item in profileSections"
                    :key="item.label"
                    @click="navigateProfileSection(item.action)"
                >
                    <div class="row-left">
                        <mdicon :name="item.icon" :size="20"/>
                        <span>{{ item.label }}</span>
                    </div>
                    <mdicon name="chevron-right" :size="20"/>
                </div>
            </div>

            <div class="profile-card">
                <div 
                    class="profile-row"
                    v-for="item in supportSections"
                    :key="item.label"
                    @click="navigateProfileSection(item.action)"
                >
                    <div class="row-left">
                        <mdicon :name="item.icon" :size="20"/>
                        <span>{{ item.label }}</span>
                    </div>
                    <mdicon name="chevron-right" :size="20"/>
                </div>
            </div>
        </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNav 
        :active-tab="activeTab"
        @change-tab="handleTabChange"
    />

    <!-- Health Category Modal -->
    <div v-if="showHealthModal" class="modal-overlay" @click="showHealthModal = false">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <mdicon name="plus" :size="24" class="modal-icon"/>
                <h3 class="modal-title">Add new category</h3>
            </div>
            <div class="modal-options">
                <div 
                    class="modal-option"
                    v-for="category in healthCategories" 
                    :key="category.id"
                    @click="selectHealthCategory(category.id)"
                >
                    <div class="option-radio" :class="{ selected: selectedCategory === category.id }">
                        <div class="radio-dot" v-if="selectedCategory === category.id"></div>
                    </div>
                    <span class="option-label">{{ category.name }}</span>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/MedicalRecords/TopBar.vue'
import BottomNav from '@/components/MedicalRecords/BottomNav.vue'
import { useProfiles } from '@/composables/profiles'

export default {
    name: "MedicalRecordsMobile",
    components: {
        TopBar,
        BottomNav
    },
    setup() {
        const router = useRouter()
        const activeTab = ref('home')
        const showHealthModal = ref(false)
        const selectedCategory = ref('blood-pressure')

        const handleTabChange = (tab) => {
            activeTab.value = tab
        }

        const getTabTitle = () => {
            const titles = {
                home: 'Medical Records',
                records: 'Records',
                health: 'My Health',
                profile: 'Profile'
            }
            return titles[activeTab.value] || 'Medical Records'
        }

        const navigateToAddRecord = () => {
            router.push('/medical-records/add-record')
        }

        // Health categories for modal
        const healthCategories = [
            { id: 'blood-pressure', name: 'Blood pressure' },
            { id: 'blood-sugar', name: 'Blood sugar' },
            { id: 'body-weight', name: 'Body weight' }
        ]

        const selectHealthCategory = (categoryId) => {
            selectedCategory.value = categoryId
            // TODO: Navigate to add health data page or show form
            console.log('Selected category:', categoryId)
            showHealthModal.value = false
        }

        const navigateToBloodPressure = () => {
            router.push('/medical-records/blood-pressure')
        }

        const navigateToBloodSugar = () => {
            router.push('/medical-records/blood-sugar')
        }

        const navigateToBodyWeight = () => {
            router.push('/medical-records/body-weight')
        }

        // Week days for charts
        const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
        
        // Blood pressure data (height percentages for visualization)
        const bloodPressureData = [
            { height: '75%' },
            { height: '70%' },
            { height: '78%' },
            { height: '72%' },
            { height: '76%' },
            { height: '74%' },
            { height: '80%' }
        ]

        // Sample medical records data
        const profileMembers = ref([])
        const activeMemberId = ref(null)

        const profileSections = [
            { label: 'Personal information', icon: 'account-outline', action: 'personal' },
            { label: 'Medical Conditions', icon: 'stethoscope', action: 'conditions' },
            { label: 'Drug Allergies', icon: 'pill', action: 'allergies' },
            { label: 'Family History', icon: 'account-group-outline', action: 'family' }
        ]

        const supportSections = [
            { label: 'Notifications', icon: 'bell-outline', action: 'notifications' },
            { label: 'Settings', icon: 'cog-outline', action: 'settings' },
            { label: 'Help Center', icon: 'help-circle-outline', action: 'help' }
        ]

        const addFamilyMember = () => {
            router.push('/medical-records/profile/add')
        }
        const { fetchProfiles } = useProfiles()
        const loadProfiles = async () => {
            const token = localStorage.getItem('token')
            if (!token) return
            const { response, error } = await fetchProfiles(token)
            if (error.value === null && response.value?.profiles) {
                profileMembers.value = response.value.profiles.map(profile => ({
                    id: profile.id,
                    name: profile.displayName || 'Profile'
                }))
                if (profileMembers.value.length && !activeMemberId.value) {
                    activeMemberId.value = profileMembers.value[0].id
                }
            }
        }

        onMounted(() => {
            loadProfiles()
        })

        watch(activeTab, (val) => {
            if (val === 'profile' && profileMembers.value.length === 0) {
                loadProfiles()
            }
        })

        const navigateProfileSection = (section) => {
            console.log('Navigate to', section)
        }

        const medicalRecords = ref([
            {
                id: 1,
                title: 'Eye check-up',
                type: 'Prescription',
                date: 'Nov 10, 2025',
                description: 'Regular eye examination with vision test',
                tags: ['Vision', 'Routine'],
                icon: 'file-document'
            },
            {
                id: 2,
                title: 'Blood Test Results',
                type: 'Lab Report',
                date: 'Nov 8, 2025',
                description: 'Complete blood count and lipid profile',
                tags: ['Lab', 'Blood Work'],
                icon: 'file-document'
            },
            {
                id: 3,
                title: 'Annual Physical',
                type: 'Prescription',
                date: 'Nov 5, 2025',
                description: 'Yearly health checkup and consultation',
                tags: ['Checkup', 'General'],
                icon: 'file-document'
            },
            {
                id: 4,
                title: 'Dental Cleaning',
                type: 'Invoice',
                date: 'Nov 1, 2025',
                description: 'Professional teeth cleaning and examination',
                tags: ['Dental', 'Routine'],
                icon: 'receipt'
            }
        ])

        return {
            router,
            activeTab,
            handleTabChange,
            getTabTitle,
            navigateToAddRecord,
            medicalRecords,
            weekDays,
            bloodPressureData,
            showHealthModal,
            selectedCategory,
            healthCategories,
            selectHealthCategory,
            navigateToBloodPressure,
            navigateToBloodSugar,
            navigateToBodyWeight,
            profileMembers,
            profileSections,
            supportSections,
            activeMemberId,
            addFamilyMember,
            navigateProfileSection,
            loadProfiles
        }
    }
}
</script>

<style scoped>
.medical-records-container {
    min-height: 100vh;
    background: #f8f9fa;
    padding-bottom: 80px;
}

.action-icon {
    cursor: pointer;
    color: #374151;
    transition: all 0.2s ease;
    padding: 4px;
    border-radius: 8px;
}

.action-icon:active {
    background: #f3f4f6;
    transform: scale(0.95);
}

.content-wrapper {
    padding: 20px 16px;
    min-height: calc(100vh - 140px);
    background: #f8f9fa;
}

.tab-content {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Action Cards Grid */
.action-cards-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 32px;
}

.action-card-large {
    background: white;
    border-radius: 16px;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 140px;
    justify-content: center;
}

.action-card-large:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.action-icon-wrapper {
    width: 64px;
    height: 64px;
    background: #f0f4ff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667eea;
}

.action-card-large h4 {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.4;
}

/* Section Header */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

.see-all-link {
    font-size: 14px;
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
}

/* Reminder List */
.reminder-list {
    background: white;
    border-radius: 16px;
    padding: 4px;
    margin-bottom: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.reminder-item {
    display: flex;
    align-items: center;
    padding: 16px 12px;
    gap: 12px;
    border-bottom: 1px solid #f3f4f6;
}

.reminder-item:last-child {
    border-bottom: none;
}

.reminder-checkbox {
    width: 24px;
    height: 24px;
    border: 2px solid #d1d5db;
    border-radius: 50%;
    flex-shrink: 0;
    cursor: pointer;
    transition: all 0.2s ease;
}

.reminder-checkbox:active {
    transform: scale(0.9);
}

.reminder-content {
    flex: 1;
}

.reminder-name {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 4px 0;
}

.reminder-details {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
}

.reminder-time {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    flex-shrink: 0;
}

/* Records List */
.records-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.record-item {
    background: white;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: all 0.3s ease;
}

.record-item:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.record-icon {
    width: 48px;
    height: 48px;
    background: #f0f4ff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667eea;
    flex-shrink: 0;
}

.record-content {
    flex: 1;
}

.record-name {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 4px 0;
}

.record-type {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
}

.record-arrow {
    color: #9ca3af;
    flex-shrink: 0;
}

/* Records List View */
.records-list-view {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
    padding-bottom: 80px;
}

.record-card {
    background: white;
    border-radius: 12px;
    padding: 14px 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
}

.record-card:active {
    transform: scale(0.98);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.record-icon-large {
    width: 48px;
    height: 48px;
    background: #e8eaf6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667eea;
    flex-shrink: 0;
}

.record-info {
    flex: 1;
    min-width: 0;
}

.record-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 4px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.record-meta {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.record-chevron {
    color: #9ca3af;
    flex-shrink: 0;
}

/* Floating Action Button */
.fab {
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 56px;
    height: 56px;
    background: #667eea;
    border: none;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 100;
}

.fab:active {
    transform: scale(0.9);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* Health Metrics */
.health-metrics {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.health-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: all 0.3s ease;
}

.health-card:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.health-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.health-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 4px 0;
}

.health-tag {
    font-size: 14px;
    font-weight: 400;
    color: #6b7280;
}

.health-subtitle {
    font-size: 13px;
    color: #9ca3af;
    margin: 0;
}

.health-chevron {
    color: #9ca3af;
}

/* Health Chart */
.health-chart {
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

.chart-unit-bottom {
    display: block;
    text-align: right;
    font-size: 11px;
    color: #9ca3af;
    margin-top: 8px;
}

/* Blood Pressure Bar Chart */
.chart-bars {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 120px;
    padding: 10px 0;
}

.chart-bar-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.bp-bar {
    height: 100px;
    display: flex;
    align-items: flex-end;
}

.bp-range {
    width: 8px;
    background: linear-gradient(180deg, #a5b4fc 0%, #c7d2fe 100%);
    border-radius: 4px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 4px 0;
}

.bp-dot-top,
.bp-dot-bottom {
    width: 8px;
    height: 8px;
    background: #667eea;
    border-radius: 50%;
    display: block;
    margin: 0 auto;
}

.chart-label {
    font-size: 12px;
    color: #6b7280;
}

/* Line Chart */
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

/* Chart Placeholder */
.health-chart-placeholder {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9fafb;
    border-radius: 12px;
    margin-bottom: 8px;
}

.placeholder-text {
    font-size: 14px;
    color: #9ca3af;
    margin: 0;
}

/* Empty State */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
}

.empty-icon {
    color: #d1d5db;
    margin-bottom: 16px;
}

.empty-title {
    font-size: 18px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 8px 0;
}

.empty-text {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
    max-width: 280px;
}

.profile-tab {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.profile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.profile-header h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #111827;
}

.back-btn,
.icon-btn {
    border: none;
    background: #f3f4f6;
    border-radius: 12px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #111827;
}

.profile-switcher {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 8px;
}

.profile-switcher.empty {
    justify-content: center;
}

.profile-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 70px;
    cursor: pointer;
}

.avatar-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f4f4f4;
    color: #6b7280;
}

.profile-avatar.active .avatar-circle {
    border-color: #667eea;
    color: #667eea;
    background: rgba(102, 126, 234, 0.08);
}

.profile-avatar span {
    font-size: 13px;
    color: #1f2937;
}

.profile-avatar.add .avatar-circle {
    border-color: #d1d5db;
    background: white;
}

.profile-card {
    background: white;
    border-radius: 18px;
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
    padding: 8px 0;
}

.profile-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #f1f5f9;
}

.profile-row:last-child {
    border-bottom: none;
}

.profile-row .row-left {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #111827;
    font-weight: 600;
}

/* Health Category Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.modal-content {
    background: white;
    border-radius: 24px 24px 0 0;
    width: 100%;
    padding: 24px;
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}

.modal-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f3f4f6;
}

.modal-icon {
    color: #667eea;
}

.modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
}

.modal-options {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.modal-option {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 8px;
    cursor: pointer;
    transition: background 0.2s ease;
    border-radius: 12px;
}

.modal-option:active {
    background: #f9fafb;
}

.option-radio {
    width: 24px;
    height: 24px;
    border: 2px solid #d1d5db;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.option-radio.selected {
    border-color: #667eea;
    background: #667eea;
}

.radio-dot {
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
}

.option-label {
    font-size: 16px;
    color: #1a1a1a;
    font-weight: 400;
}
</style>
