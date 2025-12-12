<template>
<div class="medical-records-container">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <!-- Top Bar -->
    <TopBar 
        :title="getTabTitle()"
        :profile-name="activeProfileName"
        :show-back="false"
    >
        <template #actions>
            <div class="top-bar-actions">
                <mdicon 
                    name="bell-outline" 
                    :size="24" 
                    class="action-icon"
                />
                <mdicon 
                    name="magnify" 
                    :size="24" 
                    class="action-icon"
                />
                <mdicon 
                    name="home-outline" 
                    :size="24" 
                    class="action-icon"
                    @click="router.push('/')"
                />
            </div>
        </template>
    </TopBar>

    <!-- Content Area -->
    <div class="content-wrapper">
        <!-- Home Tab -->
        <div v-if="activeTab === 'home'" class="tab-content">
            <!-- Quick Action Cards -->
            <div class="action-cards-grid">
                <div class="action-card-large glass-card" @click="navigateToAddRecord">
                    <div class="action-icon-wrapper">
                        <mdicon name="clipboard-plus" :size="48"/>
                    </div>
                    <h4>Add medical record</h4>
                </div>
                <div class="action-card-large glass-card" @click="navigateToMedicineReminder">
                    <div class="action-icon-wrapper">
                        <mdicon name="pill" :size="48"/>
                    </div>
                    <h4>Add medicine reminder</h4>
                </div>
            </div>

            <!-- Today's Reminder Section -->
            <div class="section-header">
                <h3 class="section-title">Today's Reminder</h3>
                <a href="#" class="see-all-link" @click="router.push('/medical-records/medicine-reminders/history')">See all</a>
            </div>
            <div class="reminder-list glass-card">
                <div v-if="!hasActiveProfile" class="reminder-empty">
                    Select or add a profile to see reminders here.
                </div>
                <div v-else-if="remindersLoading" class="reminder-empty">
                    Loading reminders...
                </div>
                <template v-else>
                    <div 
                        class="reminder-item"
                        v-for="reminder in todaysReminders"
                        :key="reminder.id"
                    >
                        <div class="reminder-content">
                            <h4 class="reminder-name">{{ reminder.medicineName }}</h4>
                            <p class="reminder-details">
                                {{ formatFrequency(reminder) }} · {{ reminder.intakeMethod || 'Anytime' }}
                            </p>
                            <div class="reminder-slot-list">
                                <button 
                                    class="reminder-slot-pill"
                                    v-for="slot in reminder.slots"
                                    :key="slot.id"
                                    :class="{ checked: slot.status === 'taken' }"
                                    @click.stop="toggleHomeReminder(reminder, slot)"
                                >
                                    <span>{{ slot.label }}</span>
                                    <span class="slot-icon" v-if="slot.status">
                                        {{ slot.status === 'taken' ? '☑︎' : '✖︎' }}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div 
                        v-if="!todaysReminders.length" 
                        class="reminder-empty"
                    >
                        No reminders yet. Tap "Add medicine reminder".
                    </div>
                </template>
            </div>

            <!-- Recent Records Section -->
            <div class="section-header">
                <h3 class="section-title">Recent records</h3>
            </div>
            <div class="records-list">
                <div v-if="medicalRecordsLoading" class="records-loading">
                    Loading records...
                </div>
                <template v-else>
                    <div 
                        class="record-item glass-card"
                        v-for="record in recentMedicalRecords"
                        :key="record.id"
                        @click="openRecordDetail(record)"
                    >
                        <div class="record-icon">
                            <mdicon :name="getRecordIcon(record.recordType)" :size="24"/>
                        </div>
                        <div class="record-content">
                            <h4 class="record-name">{{ record.title }}</h4>
                            <p class="record-type">
                                {{ getRecordTypeLabel(record.recordType) }} · {{ formatRecordDate(record.recordDate) }}
                            </p>
                        </div>
                        <mdicon name="chevron-right" :size="20" class="record-arrow"/>
                    </div>
                    <div v-if="recentMedicalRecords.length === 0" class="empty-state small">
                        <p class="empty-title">No records yet</p>
                        <p class="empty-text">Add your first record to see it here.</p>
                    </div>
                </template>
            </div>
        </div>

        <!-- Records Tab -->
        <div v-if="activeTab === 'records'" class="tab-content">
            <div class="records-list-view">
                <div class="records-search glass-card">
                    <mdicon name="magnify" :size="20" />
                    <input
                        v-model="recordSearch"
                        type="text"
                        placeholder="Search records by title or type"
                        aria-label="Search records"
                    />
                    <button 
                        v-if="recordSearch" 
                        class="clear-btn" 
                        type="button" 
                        @click="recordSearch = ''"
                    >
                        <mdicon name="close-circle" :size="18"/>
                    </button>
                </div>

                <div v-if="medicalRecordsLoading" class="records-loading large">
                    Loading medical records...
                </div>
                <template v-else>
                    <div 
                        class="record-card glass-card" 
                        v-for="record in filteredMedicalRecords" 
                        :key="record.id"
                        @click="openRecordDetail(record)"
                    >
                        <div class="record-icon-large">
                            <mdicon :name="getRecordIcon(record.recordType)" :size="24"/>
                        </div>
                        <div class="record-info">
                            <h4 class="record-title">{{ record.title }}</h4>
                            <p class="record-meta">
                                {{ getRecordTypeLabel(record.recordType) }} | {{ formatRecordDate(record.recordDate) }}
                            </p>
                        </div>
                        <mdicon name="chevron-right" :size="20" class="record-chevron"/>
                    </div>

                    <div v-if="filteredMedicalRecords.length === 0" class="empty-state">
                        <mdicon name="file-document-multiple" :size="64" class="empty-icon"/>
                        <p class="empty-title">{{ recordSearch ? 'No results' : 'No Records Yet' }}</p>
                        <p class="empty-text">
                            {{ recordSearch ? 'Try another search term.' : 'Start adding medical records to track your health history' }}
                        </p>
                    </div>

                    <p v-if="medicalRecordsError" class="records-error">
                        {{ medicalRecordsError.message || 'Something went wrong while loading records.' }}
                    </p>
                </template>
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
                <div class="health-card glass-card" @click="navigateToBloodPressure">
                    <div class="health-card-header">
                        <div>
                            <h4 class="health-title">Blood Pressure</h4>
                            <p class="health-subtitle">Last 7 records</p>
                        </div>
                        <mdicon name="chevron-right" :size="20" class="health-chevron"/>
                    </div>
                    <div v-if="bpLatest" class="health-reading">
                        <span class="reading-value">{{ bpLatest.systolic }}/{{ bpLatest.diastolic }}</span>
                        <span class="reading-status">{{ bpLatest.status }}</span>
                    </div>
                    <div v-if="bpChartData.length" class="health-chart">
                        <div class="chart-y-axis">
                            <span>145</span>
                            <span>110</span>
                            <span>75</span>
                        </div>
                        <div class="chart-area">
                            <div class="chart-bars">
                                <div class="chart-bar-group" v-for="record in bpChartData" :key="record.id">
                                    <div class="bp-bar">
                                        <div class="bp-range" :style="{ height: record.rangeHeight, top: record.topOffset }">
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
                    <div v-else class="health-chart-placeholder">
                        <p class="placeholder-text">No data available</p>
                    </div>
                </div>

                <!-- Blood Sugar Card -->
                <div class="health-card glass-card" @click="navigateToBloodSugar">
                    <div class="health-card-header">
                        <div>
                            <h4 class="health-title">Blood Sugar</h4>
                            <p class="health-subtitle">Last 7 records</p>
                        </div>
                        <mdicon name="chevron-right" :size="20" class="health-chevron"/>
                    </div>
                    <div v-if="bsLatest" class="health-reading">
                        <span class="reading-value">{{ bsLatest.value }} mg/dL</span>
                        <span class="reading-status">{{ bsStatusLabel || bsLatest.type }}</span>
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
                                <path 
                                    v-if="bsChartPath"
                                    :d="bsChartPath"
                                    fill="url(#lineGradient)"
                                    stroke="none"
                                />
                                <path 
                                    v-if="bsChartPath"
                                    :d="bsChartPath"
                                    fill="none"
                                    stroke="#667eea"
                                    stroke-width="2"
                                />
                                <circle 
                                    v-for="(point, index) in bsChartPoints"
                                    :key="index"
                                    :cx="point.x"
                                    :cy="point.y"
                                    r="3"
                                    fill="#667eea"
                                />
                            </svg>
                            <div class="chart-x-labels">
                                <span v-for="(point, index) in bsChartPoints" :key="'bs-label-' + index">{{ point.label }}</span>
                            </div>
                        </div>
                        <span class="chart-unit">mg/dL</span>
                    </div>
                </div>

                <!-- Body Weight Card -->
                <div class="health-card glass-card" @click="navigateToBodyWeight">
                    <div class="health-card-header">
                        <div>
                            <h4 class="health-title">Body Weight</h4>
                            <p class="health-subtitle">Latest measurement</p>
                        </div>
                        <mdicon name="chevron-right" :size="20" class="health-chevron"/>
                    </div>
                    <div v-if="bodyWeightLatest" class="health-reading">
                        <span class="reading-value">{{ bodyWeightLatest.weight }} kg</span>
                        <span class="reading-status" :class="{ increase: bodyWeightLatest.change > 0, decrease: bodyWeightLatest.change < 0 }">
                            <template v-if="bodyWeightLatest.change > 0">+{{ bodyWeightLatest.change }} kg</template>
                            <template v-else-if="bodyWeightLatest.change < 0">{{ bodyWeightLatest.change }} kg</template>
                            <template v-else>Stable</template>
                        </span>
                    </div>
                    <div class="health-chart-placeholder" v-else>
                        <p class="placeholder-text">No data available</p>
                    </div>
                    <span class="chart-unit-bottom">kg</span>
                </div>

                <!-- Illness Card -->
                <div class="health-card illness-card glass-card" @click="navigateToIllness">
                    <div class="health-card-header">
                        <div>
                            <h4 class="health-title">Illness</h4>
                            <p class="health-subtitle">Latest entry</p>
                        </div>
                        <mdicon name="chevron-right" :size="20" class="health-chevron"/>
                    </div>

                    <div v-if="latestIllness" class="illness-summary">
                        <div class="illness-main">
                            <div class="illness-diagnosis">{{ latestIllness.diagnosis }}</div>
                            <div class="illness-status-block">
                                <div class="pill-badge" :class="latestIllness.status?.toLowerCase()">
                                    {{ latestIllness.status }}
                                </div>
                                <span class="illness-date">
                                    {{ formatRecordDate(latestIllness.recordedAt || latestIllness.createdAt) }}
                                </span>
                            </div>
                        </div>
                        <div class="illness-meta">
                            <span class="pill-badge subtle">{{ latestIllness.severity || 'MILD' }}</span>
                            <span v-if="latestIllness.bodyTemperature" class="pill-badge subtle">
                                {{ latestIllness.bodyTemperature }}°{{ latestIllness.temperatureUnit || 'C' }}
                            </span>
                            <span 
                                v-if="latestIllness.symptoms?.length" 
                                class="symptom-chip" 
                                v-for="symptom in latestIllness.symptoms" 
                                :key="symptom"
                            >
                                {{ symptom }}
                            </span>
                        </div>
                    </div>
                    <div v-else class="health-chart-placeholder">
                        <p class="placeholder-text">No illness entries yet</p>
                    </div>
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
                    @click="selectProfileMember(member)"
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

            <div class="profile-card glass-card">
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

            <div class="profile-card glass-card">
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
        :profile-name="activeProfileName"
        @change-tab="handleTabChange"
    />

        <div v-if="showProfilePrompt && !hasActiveProfile" class="overlay">
            <div class="sheet confirm-sheet">
                <div class="sheet-head">
                    <div class="badge round-pill text-bg-danger">Attention!</div>
                </div>
                <h3 class="sheet-title">Profile needed</h3>
                <p class="sub">Create a profile to access medical records and reminders.</p>
                <div class="actions">
                    <button type="button" class="btn btn-primary" @click="goAddProfile">Add profile</button>&nbsp;&nbsp;
                    <button type="button" class="btn btn-secondary" @click="router.push('/')">Home</button>
                </div>
            </div>
        </div>
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

<div v-if="showToast" class="toast-notification">
    <div class="toast-icon">
        <mdicon name="account-check" :size="22"/>
    </div>
    <div class="toast-text">
        <p class="toast-title">Profile Selected</p>
        <p class="toast-message">{{ toastMessage }}</p>
    </div>
</div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TopBar from '@/components/MedicalRecords/TopBar.vue'
import BottomNav from '@/components/MedicalRecords/BottomNav.vue'
import { useProfiles } from '@/composables/profiles'
import { useBloodPressure } from '@/composables/vitals/bloodPressure'
import { useBloodSugar } from '@/composables/vitals/bloodSugar'
import { useIllness } from '@/composables/vitals/illness'
import { useMedicalRecords } from '@/composables/medicalRecords'
import { useMedicineReminders } from '@/composables/medicineReminders'
import { API_BASE_URL } from '@/constants/config'

export default {
    name: "MedicalRecordsMobile",
    components: {
        TopBar,
        BottomNav
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const activeTab = ref(typeof route.query.tab === 'string' ? route.query.tab : 'home')
        const showHealthModal = ref(false)
        const selectedCategory = ref('blood-pressure')
        const showProfilePrompt = ref(false)
        const showToast = ref(false)
        const toastMessage = ref('')

        const handleTabChange = (tab) => {
            activeTab.value = tab
            router.replace({ path: '/medical-records', query: { tab } })
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

        const navigateToMedicineReminder = () => {
            router.push('/medical-records/medicine-reminders')
        }

        const openRecordDetail = (record) => {
            if (!record?.id) return
            const profileId = activeMemberId.value || record.profileId || ''
            const profileName = activeProfileName.value || record.profile?.displayName || ''
            const tab = activeTab.value
            router.push({
                path: `/medical-records/records/${record.id}`,
                query: {
                    profileId,
                    profileName,
                    from: `/medical-records?tab=${tab}`
                }
            })
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

        const goProfileTab = () => {
            activeTab.value = 'profile'
            showProfilePrompt.value = true
            router.replace({ path: '/medical-records', query: { tab: 'profile' } })
        }

        const goAddProfile = () => {
            router.push('/medical-records/profile/add')
        }

        const ensureProfileSelected = () => {
            if (!activeMemberId.value) {
                alert('Please select a profile first.')
                return false
            }
            return true
        }

        const navigateToBloodPressure = () => {
            if (!ensureProfileSelected()) return
            router.push({
                path: '/medical-records/blood-pressure',
                query: {
                    profileId: activeMemberId.value,
                    profileName: activeProfileName.value
                }
            })
        }

        const navigateToBloodSugar = () => {
            if (!ensureProfileSelected()) return
            router.push({
                path: '/medical-records/blood-sugar',
                query: {
                    profileId: activeMemberId.value,
                    profileName: activeProfileName.value
                }
            })
        }

        const navigateToBodyWeight = () => {
            if (!ensureProfileSelected()) return
            router.push({
                path: '/medical-records/body-weight',
                query: {
                    profileId: activeMemberId.value,
                    profileName: activeProfileName.value
                }
            })
        }

        const navigateToIllness = () => {
            if (!ensureProfileSelected()) return
            router.push({
                path: '/medical-records/illness',
                query: {
                    profileId: activeMemberId.value,
                    profileName: activeProfileName.value
                }
            })
        }

        // Week days for charts
        const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
        
        const { records: bpRecords, fetchRecords: fetchBpRecords } = useBloodPressure()
        const { records: bsRecords, fetchRecords: fetchBsRecords } = useBloodSugar()
        const { records: illnessRecords, fetchRecords: fetchIllnessRecords } = useIllness()
        const {
            records: medicalRecords,
            loading: medicalRecordsLoading,
            error: medicalRecordsError,
            fetchRecords: fetchMedicalRecords
        } = useMedicalRecords()
        const recordSearch = ref('')
        const {
            reminders: medicineReminders,
            loading: remindersLoading,
            fetchReminders: fetchMedicineReminders,
            setReminderStatus: setMedicineReminderStatus
        } = useMedicineReminders()
        const bodyWeightRecords = ref([])

        const fetchBodyWeightRecords = async(profileId) => {
            const token = localStorage.getItem('token')
            if (!token || !profileId) {
                bodyWeightRecords.value = []
                return
            }
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/vitals/body-weight?profileId=${profileId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                const data = await res.json()
                if (res.ok) {
                    bodyWeightRecords.value = data.records || []
                } else {
                    bodyWeightRecords.value = []
                }
            } catch (err) {
                console.error(err)
                bodyWeightRecords.value = []
            }
        }

        const loadHealthData = async(profileId) => {
            const token = localStorage.getItem('token')
            if (!token || !profileId) {
                bpRecords.value = []
                bsRecords.value = []
                bodyWeightRecords.value = []
                illnessRecords.value = []
                return
            }
            await Promise.all([
                fetchBpRecords(token, profileId),
                fetchBsRecords(token, profileId),
                fetchBodyWeightRecords(profileId),
                fetchIllnessRecords(token, profileId)
            ])
        }

        const loadMedicalRecords = async(profileId) => {
            const token = localStorage.getItem('token')
            if (!token || !profileId) {
                medicalRecords.value = []
                medicalRecordsError.value = null
                return
            }
            medicalRecordsError.value = null
            await fetchMedicalRecords(token, profileId)
        }

        const loadMedicineReminders = async(profileId, referenceDate = new Date()) => {
            const token = localStorage.getItem('token')
            if (!token || !profileId) {
                medicineReminders.value = []
                return
            }
            await fetchMedicineReminders(token, profileId, { date: referenceDate })
        }

        const profileMembers = ref([])
        const activeMemberId = ref(localStorage.getItem('selectedProfileId'))
        const hasActiveProfile = computed(() => Boolean(activeMemberId.value))

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

        const recordTypeLabels = {
            PRESCRIPTION: 'Prescription',
            DIAGNOSIS: 'Diagnosis',
            LAB_RESULT: 'Lab Report',
            IMAGING: 'Imaging',
            VACCINATION: 'Vaccination',
            DISCHARGE_SUMMARY: 'Discharge Summary',
            OTHER: 'Other'
        }

        const recordTypeIcons = {
            PRESCRIPTION: 'file-document-edit',
            DIAGNOSIS: 'stethoscope',
            LAB_RESULT: 'flask-outline',
            IMAGING: 'image-multiple',
            VACCINATION: 'needle',
            DISCHARGE_SUMMARY: 'clipboard-text-outline',
            OTHER: 'file-document'
        }

        const getRecordTypeLabel = (type) => {
            return recordTypeLabels[type] || recordTypeLabels.OTHER
        }

        const getRecordIcon = (type) => {
            return recordTypeIcons[type] || recordTypeIcons.OTHER
        }

        const formatRecordDate = (date) => {
            if (!date) return ''
            const parsed = new Date(date)
            if (Number.isNaN(parsed.getTime())) return ''
            return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        }

        const recentMedicalRecords = computed(() => {
            return medicalRecords.value.slice(0, 3)
        })

        const filteredMedicalRecords = computed(() => {
            const term = recordSearch.value.trim().toLowerCase()
            if (!term) return medicalRecords.value
            return medicalRecords.value.filter((record) => {
                const title = (record.title || '').toLowerCase()
                const typeLabel = (getRecordTypeLabel(record.recordType) || '').toLowerCase()
                return title.includes(term) || typeLabel.includes(term)
            })
        })

        const addFamilyMember = () => {
            router.push('/medical-records/profile/add')
        }

        const triggerToast = (message) => {
            toastMessage.value = message
            showToast.value = true
            setTimeout(() => {
                showToast.value = false
            }, 2000)
        }

        const selectProfileMember = (member) => {
            activeMemberId.value = member.id
            localStorage.setItem('selectedProfileId', member.id)
            localStorage.setItem('selectedProfileName', member.name)
            triggerToast(`${member.name} selected`)
            handleTabChange('home')
        }

        const activeProfileName = computed(() => {
            const active = profileMembers.value.find(member => member.id === activeMemberId.value)
            if (active) {
                return active.name
            }
            return localStorage.getItem('selectedProfileName') || ''
        })

        const classifyBloodPressureStatus = (systolic, diastolic) => {
            if (systolic < 120 && diastolic < 80) return 'Normal'
            if (systolic < 130 && diastolic < 80) return 'Elevated'
            return 'High'
        }

        const formatReminderTime = (timeString) => {
            if (!timeString) return '—'
            const [hour, minute] = timeString.split(':')
            const date = new Date()
            date.setHours(Number(hour), Number(minute))
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        }

        const todaysReminders = computed(() => {
            const remindersList = medicineReminders.value.map((reminder) => {
                const reminderSlots = reminder.slots && reminder.slots.length
                    ? reminder.slots
                    : [{ time: reminder.time, status: reminder.status }]
                const slots = reminderSlots
                    .map((slot, index) => {
                        const rawTime = typeof slot === 'string' ? slot : slot.time
                        if (!rawTime) return null
                        return {
                            id: `${reminder.id}-${rawTime}-${index}`,
                            reminderId: reminder.id,
                            rawTime,
                            status: slot.status || null,
                            label: formatReminderTime(rawTime)
                        }
                    })
                    .filter(Boolean)
                    .slice(0, 3)
                return {
                    id: reminder.id,
                    medicineName: reminder.medicineName,
                    frequency: reminder.frequency,
                    intakeMethod: reminder.intakeMethod,
                    dosage: reminder.dosage,
                    unit: reminder.unit,
                    slots
                }
            })
            return remindersList.slice(0, 3)
        })

        const frequencyMap = {
            'Once daily': 1,
            'Twice daily': 2,
            'Thrice daily': 3,
            'Weekly': 1
        }

        const formatFrequency = (reminder) => {
            if (reminder.slots && reminder.slots.length) {
                return `${reminder.slots.length}x`
            }
            const mapped = frequencyMap[reminder.frequency]
            if (mapped) {
                return `${mapped}x`
            }
            const durationMatch = reminder.frequency?.match?.(/(\d+)/)
            if (durationMatch) {
                return `${durationMatch[1]}x`
            }
            return reminder.frequency || ''
        }

        const toggleHomeReminder = async(reminder, reminderSlot) => {
            const token = localStorage.getItem('token')
            if (!token) return
            const newStatus = reminderSlot.status === 'taken' ? 'pending' : 'taken'
            try {
                await setMedicineReminderStatus(token, reminderSlot.reminderId, newStatus, new Date(), reminderSlot.rawTime)
                const target = medicineReminders.value.find(r => r.id === reminderSlot.reminderId)
                if (target?.slots) {
                    const targetSlot = target.slots.find(slot => slot.time === reminderSlot.rawTime)
                    if (targetSlot) {
                        targetSlot.status = newStatus === 'pending' ? null : newStatus
                    }
                }
                reminderSlot.status = newStatus === 'pending' ? null : newStatus
            } catch (err) {
                console.error(err)
            }
        }

        const bpDisplayRecords = computed(() => {
            return bpRecords.value.map(record => ({
                id: record.id,
                systolic: record.systolic || record.valueNumber,
                diastolic: record.diastolic || 0,
                recordedAt: record.recordedAt
            }))
        })

        const bpLatest = computed(() => {
            if (bpDisplayRecords.value.length === 0) return null
            const latest = bpDisplayRecords.value[bpDisplayRecords.value.length - 1]
            const systolic = latest.systolic || latest.valueNumber || 0
            const diastolic = latest.diastolic || 0
            return {
                systolic,
                diastolic,
                status: classifyBloodPressureStatus(systolic, diastolic)
            }
        })

        const bpChartData = computed(() => {
            const recent = bpDisplayRecords.value.slice(-7)
            if (!recent.length) {
                return []
            }
            const systolics = recent.map(entry => entry.systolic || entry.valueNumber || 0)
            const diastolics = recent.map(entry => entry.diastolic || 0)
            const max = Math.max(...systolics)
            const min = Math.min(...diastolics)
            const range = (max - min) || 1
            return recent.map((record, index) => {
                const systolic = systolics[index]
                const diastolic = diastolics[index]
                const label = new Date(record.recordedAt || record.date).toLocaleDateString(undefined, { weekday: 'short' })
                const topOffset = ((max - systolic) / range) * 70
                const bottomOffset = ((max - diastolic) / range) * 70
                return {
                    id: record.id,
                    label,
                    rangeHeight: `${Math.max(bottomOffset - topOffset, 6)}%`,
                    topOffset: `${topOffset}%`
                }
            })
        })

        const bsLatest = computed(() => {
            if (bsRecords.value.length === 0) return null
            const latest = bsRecords.value[bsRecords.value.length - 1]
            return {
                value: latest.valueNumber,
                type: latest.chartGroup || 'Fasting',
                recordedAt: latest.recordedAt
            }
        })

        const classifyBloodSugarStatusLabel = (value, context = '') => {
            const ctx = context.toLowerCase()
            if (ctx.includes('after')) {
                if (value < 140) return 'Normal'
                if (value < 200) return 'Elevated'
                return 'High'
            }
            if (value < 100) return 'Normal'
            if (value < 126) return 'Elevated'
            return 'High'
        }

        const bsStatusLabel = computed(() => {
            if (!bsLatest.value) return ''
            const value = Number(bsLatest.value.value)
            if (Number.isNaN(value)) return ''
            return classifyBloodSugarStatusLabel(value, bsLatest.value.type || '')
        })

        const bsChartPoints = computed(() => {
            const values = bsRecords.value.slice(-7)
            if (!values.length) return []
            const numbers = values.map(entry => Number(entry.valueNumber) || 0)
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
                    label: new Date(values[index].recordedAt).toLocaleDateString(undefined, { weekday: 'short' })
                }
            })
        })

        const bsChartPath = computed(() => {
            const points = bsChartPoints.value
            if (!points.length) return ''
            return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
        })

        const bodyWeightLatest = computed(() => {
            if (bodyWeightRecords.value.length === 0) return null
            const latest = bodyWeightRecords.value[bodyWeightRecords.value.length - 1]
            const previous = bodyWeightRecords.value[bodyWeightRecords.value.length - 2]
            const weight = latest.valueNumber
            const change = previous ? +(weight - previous.valueNumber).toFixed(1) : 0
            return { weight, change }
        })

        const latestIllness = computed(() => {
            if (!illnessRecords.value.length) return null
            return illnessRecords.value[0]
        })

        const profilesComposable = useProfiles()
        const loadProfiles = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                profileMembers.value = []
                activeMemberId.value = null
                localStorage.removeItem('selectedProfileId')
                localStorage.removeItem('selectedProfileName')
                return
            }
            const { response, error } = await profilesComposable.fetchProfiles(token)
            if (error.value === null && response.value?.profiles) {
                profileMembers.value = response.value.profiles.map(profile => ({
                    id: profile.id,
                    name: profile.displayName || 'Profile'
                }))
                if (profileMembers.value.length > 0) {
                    const savedId = localStorage.getItem('selectedProfileId')
                    const match = profileMembers.value.find(member => member.id === savedId)
                    if (match) {
                        activeMemberId.value = match.id
                    } else {
                        activeMemberId.value = profileMembers.value[0].id
                        localStorage.setItem('selectedProfileId', activeMemberId.value)
                        localStorage.setItem('selectedProfileName', profileMembers.value[0].name)
                    }
                } else {
                    activeMemberId.value = null
                    localStorage.removeItem('selectedProfileId')
                    localStorage.removeItem('selectedProfileName')
                }
            }
        }

        onMounted(() => {
            loadProfiles()
            if (!activeMemberId.value) {
                activeTab.value = 'profile'
                showProfilePrompt.value = true
            }
        })

        watch(activeTab, (val) => {
            if (val === 'profile' && profileMembers.value.length === 0) {
                loadProfiles()
            }
        })

        watch(
            () => route.query.tab,
            (val) => {
                if (typeof val === 'string') {
                    activeTab.value = val
                } else if (!val) {
                    activeTab.value = 'home'
                }
            }
        )

        watch(activeMemberId, (id) => {
            if (id) {
                loadHealthData(id)
                loadMedicalRecords(id)
                loadMedicineReminders(id)
                showProfilePrompt.value = false
            } else {
                bpRecords.value = []
                bsRecords.value = []
                bodyWeightRecords.value = []
                illnessRecords.value = []
                medicalRecords.value = []
                medicalRecordsError.value = null
                medicineReminders.value = []
                showProfilePrompt.value = true
                activeTab.value = 'profile'
            }
        }, { immediate: true })

        const navigateProfileSection = (section) => {
            if (section === 'personal') {
                router.push({
                    path: '/medical-records/profile/personal-information',
                    query: {
                        profileId: activeMemberId.value
                    }
                })
            } else {
                console.log('Navigate to', section)
            }
        }

        return {
            router,
            activeTab,
            handleTabChange,
            getTabTitle,
            navigateToAddRecord,
            navigateToMedicineReminder,
            openRecordDetail,
            medicalRecords,
            medicalRecordsLoading,
            medicalRecordsError,
            recentMedicalRecords,
            getRecordTypeLabel,
            getRecordIcon,
            formatRecordDate,
            recordSearch,
            filteredMedicalRecords,
            weekDays,
            bpChartData,
            showProfilePrompt,
            showHealthModal,
            selectedCategory,
            healthCategories,
            selectHealthCategory,
            navigateToBloodPressure,
            navigateToBloodSugar,
            navigateToBodyWeight,
            navigateToIllness,
            profileMembers,
            profileSections,
            supportSections,
            activeMemberId,
            addFamilyMember,
            navigateProfileSection,
            selectProfileMember,
            activeProfileName,
            loadProfiles,
            goProfileTab,
            goAddProfile,
            showToast,
            toastMessage,
            bpLatest,
            bsLatest,
            bsStatusLabel,
            bsChartPoints,
            bsChartPath,
            bodyWeightLatest,
            illnessRecords,
            latestIllness,
            medicineReminders,
            remindersLoading,
            todaysReminders,
            formatFrequency,
            toggleHomeReminder,
            hasActiveProfile
        }
    }
}

</script>

<style scoped>
.medical-records-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    min-height: 100vh;
    background: radial-gradient(circle at 20% 20%, rgba(79,70,229,0.15), transparent 40%),
                radial-gradient(circle at 80% 10%, rgba(14,165,233,0.18), transparent 35%),
                radial-gradient(circle at 50% 100%, rgba(34,197,94,0.12), transparent 40%),
                var(--bg-main);
    padding-bottom: 96px;
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
    background: linear-gradient(135deg, #4f46e5, #06b6d4);
    top: -140px;
    left: -110px;
}
.orb-2 {
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #8b5cf6);
    bottom: -110px;
    right: -100px;
}

.action-icon {
    cursor: pointer;
    color: var(--accent-1);
    transition: all 0.2s ease;
    padding: 8px;
    border-radius: 12px;
    background: linear-gradient(145deg, rgba(103,232,249,0.25), rgba(168,85,247,0.3));
    border: 1px solid var(--glass-card-border);
    box-shadow: 0 6px 14px rgba(0,0,0,0.12);
}

.action-icon:active {
    background: linear-gradient(145deg, rgba(103,232,249,0.35), rgba(168,85,247,0.4));
    transform: scale(0.95);
}

.top-bar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.content-wrapper {
    padding: 18px 16px 24px;
    min-height: calc(100vh - 140px);
    position: relative;
    z-index: 1;
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

@keyframes slideFadeUp {
    from {
        opacity: 0;
        transform: translateY(16px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes floatPulse {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
}

/* Action Cards */
.action-cards-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 26px;
}

.action-card-large {
    padding: 18px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 140px;
    justify-content: center;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    animation: slideFadeUp 0.5s ease both;
}

.action-cards-grid .action-card-large:nth-child(2) {
    animation-delay: 0.08s;
}

.action-card-large:hover {
    transform: translateY(-2px);
    border-color: rgba(103,232,249,0.4);
}

.action-icon-wrapper {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #6f7efc 0%, #9b57f4 100%);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 10px 20px rgba(111, 126, 252, 0.35);
}

.action-card-large h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.4;
}

/* Section Header */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
}

.section-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.2px;
}

.see-all-link {
    font-size: 13px;
    color: #67e8f9;
    text-decoration: none;
    font-weight: 600;
}

/* Reminder List */
.reminder-list {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 6px;
    margin-bottom: 28px;
    box-shadow: 0 12px 30px rgba(0,0,0,0.35);
    animation: slideFadeUp 0.55s ease both;
}

.reminder-empty {
    text-align: center;
    padding: 18px;
    color: var(--text-muted);
    font-size: 13px;
}

.reminder-item {
    padding: 12px 10px;
    border-bottom: 1px solid rgba(148,163,184,0.15);
}

.reminder-item:last-child {
    border-bottom: none;
}

.reminder-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.reminder-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.reminder-details {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
}

.reminder-slot-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.reminder-slot-pill {
    border: 1px solid var(--glass-card-border);
    background: linear-gradient(145deg, rgba(103,232,249,0.25), rgba(168,85,247,0.3));
    color: var(--accent-1);
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 6px 14px rgba(0,0,0,0.12);
}

.reminder-slot-pill.checked {
    background: linear-gradient(135deg, var(--accent-2), var(--accent-4));
    border-color: transparent;
    color: #0b1020;
}

.reminder-slot-pill .slot-icon {
    font-size: 14px;
}

/* Records */
.records-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.records-loading {
    padding: 16px;
    text-align: center;
    color: var(--text-secondary);
    font-size: 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
}

.records-loading.large {
    padding: 40px 16px;
}

.records-error {
    color: #f87171;
    text-align: center;
    font-size: 14px;
    margin-top: 12px;
}

.empty-state.small {
    padding: 20px 12px;
}

.record-item {
    background: rgba(255,255,255,0.05);
    border-radius: 16px;
    padding: 14px 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    cursor: pointer;
    transition: all 0.25s ease;
    animation: slideFadeUp 0.5s ease both;
}

.records-list .record-item:nth-child(2) { animation-delay: 0.05s; }
.records-list .record-item:nth-child(3) { animation-delay: 0.1s; }

.record-item:active {
    transform: translateY(1px) scale(0.99);
}

.record-icon {
    width: 46px;
    height: 46px;
    background: linear-gradient(145deg, rgba(103,232,249,0.25), rgba(168,85,247,0.3));
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-1);
    flex-shrink: 0;
    border: 1px solid var(--glass-card-border);
    box-shadow: 0 6px 14px rgba(0,0,0,0.12);
}

.record-content {
    flex: 1;
}

.record-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 2px 0;
}

.record-type {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
}

.record-arrow {
    color: var(--text-muted);
    flex-shrink: 0;
}

.records-list-view {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
    padding-bottom: 88px;
}

.records-search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
}

.records-search input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-size: 14px;
}

.records-search .clear-btn {
    border: none;
    background: transparent;
    color: var(--text-muted);
    padding: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.record-card {
    background: rgba(255,255,255,0.05);
    border-radius: 14px;
    padding: 14px 12px;
    border: 1px solid rgba(255,255,255,0.08);
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    align-items: center;
    gap: 12px;
}

.record-card:hover {
    border-color: rgba(103,232,249,0.4);
}

.record-icon-large {
    width: 46px;
    height: 46px;
    background: linear-gradient(145deg, rgba(103,232,249,0.25), rgba(168,85,247,0.3));
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-1);
    flex-shrink: 0;
    border: 1px solid var(--glass-card-border);
    box-shadow: 0 6px 14px rgba(0,0,0,0.12);
}

.record-info {
    flex: 1;
    min-width: 0;
}

.record-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 2px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.record-meta {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.record-chevron {
    color: var(--text-muted);
    flex-shrink: 0;
}

/* Floating Action Button */
.fab {
    position: fixed;
    bottom: 98px;
    right: 16px;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #22d3ee, #a855f7);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 50%;
    box-shadow: 0 16px 40px rgba(34, 211, 238, 0.35);
    color: #0b1020;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 1000;
}

.fab:active {
    transform: scale(0.94);
}

/* Health Metrics */
.health-metrics {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.health-card {
    background: rgba(255,255,255,0.05);
    border-radius: 16px;
    padding: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 14px 30px rgba(0,0,0,0.3);
    animation: slideFadeUp 0.55s ease both;
}

.health-card:nth-child(2) { animation-delay: 0.05s; }
.health-card:nth-child(3) { animation-delay: 0.1s; }
.health-card:nth-child(4) { animation-delay: 0.15s; }

.health-card:hover {
    border-color: rgba(103,232,249,0.4);
    animation: floatPulse 3s ease-in-out infinite;
}

.health-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
}

.health-title {
    font-size: 15px;
    font-weight: 700;
    color: #f8fafc;
    margin: 0 0 2px 0;
}

.health-subtitle {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
}

.health-chevron {
    color: var(--text-muted);
}

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
    color: var(--text-muted);
    padding: 10px 0;
    min-width: 32px;
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
    color: var(--text-muted);
}

.chart-unit-bottom {
    display: block;
    text-align: right;
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 8px;
}

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
    width: 10px;
    height: 100px;
    position: relative;
}

.bp-range {
    width: 10px;
    background: linear-gradient(180deg, #22d3ee 0%, #a855f7 100%);
    border-radius: 6px;
    position: absolute;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 4px 0;
}

.bp-dot-top,
.bp-dot-bottom {
    width: 8px;
    height: 8px;
    background: #0b1020;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.7);
    display: block;
    margin: 0 auto;
}

.chart-label {
    font-size: 11px;
    color: var(--text-muted);
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
    font-size: 11px;
    color: var(--text-muted);
}

.health-reading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 10px 0;
}

.reading-value {
    font-size: 22px;
    font-weight: 800;
    color: var(--text-primary);
}

.reading-status {
    font-size: 13px;
    color: #a5b4fc;
    font-weight: 600;
}

.reading-status.increase {
    color: #22c55e;
}

.reading-status.decrease {
    color: #f87171;
}

.illness-card .health-subtitle {
    color: var(--text-muted);
}

.illness-summary {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.illness-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.illness-diagnosis {
    font-size: 16px;
    font-weight: 700;
    color: #f8fafc;
}

.illness-status-block {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.pill-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
    background: rgba(103,232,249,0.16);
    color: #67e8f9;
    border: 1px solid rgba(103,232,249,0.25);
}

.pill-badge.subtle {
    background: rgba(255,255,255,0.05);
    color: var(--text-secondary);
    border-color: rgba(255,255,255,0.08);
}

.pill-badge.recovered,
.pill-badge.resolved {
    background: rgba(34,197,94,0.15);
    color: #4ade80;
    border-color: rgba(34,197,94,0.25);
}

.pill-badge.ongoing,
.pill-badge.chronic {
    background: rgba(234,88,12,0.15);
    color: #fb923c;
    border-color: rgba(234,88,12,0.25);
}

.pill-badge.severe,
.pill-badge.critical {
    background: rgba(239,68,68,0.15);
    color: #f87171;
    border-color: rgba(239,68,68,0.25);
}

.illness-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

.illness-date {
    font-size: 12px;
    color: var(--text-muted);
}

.symptom-chip {
    background: rgba(255,255,255,0.05);
    color: var(--text-primary);
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid rgba(255,255,255,0.08);
}

.health-chart-placeholder {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.04);
    border-radius: 12px;
    margin-bottom: 8px;
    border: 1px dashed rgba(148,163,184,0.25);
}

.placeholder-text {
    font-size: 13px;
    color: var(--text-muted);
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
    color: var(--text-secondary);
}

.empty-icon {
    color: #64748b;
    margin-bottom: 16px;
}

.empty-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 8px 0;
}

.empty-text {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0;
    line-height: 1.5;
    max-width: 280px;
}

/* Profile Tab */
.profile-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.profile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.profile-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
}

.back-btn,
.icon-btn {
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
}

.profile-switcher {
    display: flex;
    gap: 14px;
    overflow-x: auto;
    padding-bottom: 6px;
}

.profile-switcher.empty {
    justify-content: center;
}

.profile-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 72px;
    cursor: pointer;
}

.avatar-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.05);
    color: var(--text-secondary);
}

.profile-avatar.active .avatar-circle {
    border-color: rgba(103,232,249,0.5);
    color: #67e8f9;
    background: rgba(103,232,249,0.12);
}

.profile-avatar span {
    font-size: 12px;
    color: var(--text-primary);
}

.profile-avatar.add .avatar-circle {
    border-color: rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
}

.profile-card {
    background: rgba(255,255,255,0.05);
    border-radius: 16px;
    box-shadow: 0 12px 28px rgba(0,0,0,0.3);
    padding: 6px 0;
    border: 1px solid rgba(255,255,255,0.08);
}

.profile-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(148,163,184,0.12);
    color: var(--text-primary);
}

.profile-row:last-child {
    border-bottom: none;
}

.profile-row .row-left {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(5, 6, 10, 0.7);
    display: flex;
    align-items: flex-end;
    z-index: 1200;
    animation: fadeIn 0.25s ease;
}

.modal-content {
    background: rgba(10, 12, 20, 0.95);
    border-radius: 22px 22px 0 0;
    width: 100%;
    padding: 22px;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 -6px 30px rgba(0,0,0,0.4);
    animation: slideUp 0.25s ease;
}

@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}

.modal-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(148,163,184,0.12);
}

.modal-icon {
    color: #67e8f9;
}

.modal-title {
    font-size: 17px;
    font-weight: 700;
    color: #f8fafc;
    margin: 0;
}

.modal-options {
    display: flex;
    flex-direction: column;
}

.modal-option {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 6px;
    cursor: pointer;
    transition: background 0.2s ease;
    border-radius: 12px;
    color: var(--text-primary);
}

.modal-option:active {
    background: rgba(255,255,255,0.05);
}

.option-radio {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255,255,255,0.25);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.option-radio.selected {
    border-color: #67e8f9;
    background: #67e8f9;
}

.radio-dot {
    width: 8px;
    height: 8px;
    background: #0b1020;
    border-radius: 50%;
}

.option-label {
    font-size: 15px;
    color: var(--text-primary);
    font-weight: 500;
}

/* Toast */
.toast-notification {
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #22d3ee, #a855f7);
    color: #0b1020;
    padding: 14px 18px;
    border-radius: 18px;
    font-size: 13px;
    z-index: 1500;
    box-shadow: 0 18px 36px rgba(168,85,247,0.35);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 280px;
    border: 1px solid rgba(255,255,255,0.16);
}

.toast-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
}

.toast-text {
    flex: 1;
}

.toast-title {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
}

.toast-message {
    margin: 2px 0 0;
    font-size: 12px;
    color: rgba(11,16,32,0.8);
}

/* Profile prompt sheet */
.overlay {
    position: fixed;
    inset: 0;
    background: rgba(5, 6, 10, 0.75);
    display: grid;
    place-items: center;
    padding: 16px;
    z-index: 1300;
}

.sheet {
    width: 100%;
    max-width: 480px;
    background: rgba(10,12,20,0.95);
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 18px 36px rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--text-primary);
}

.confirm-sheet {
    border: 1px solid rgba(103,232,249,0.25);
}

.sheet-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}
</style>
