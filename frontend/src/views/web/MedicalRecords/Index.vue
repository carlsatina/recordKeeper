<template>
<div class="medical-records-container">
    <!-- Side Navigation -->
    <SideNav 
        :active-tab="activeTab"
        @change-tab="handleTabChange"
        @go-back="router.push('/')"
    />

    <!-- Main Content Area -->
    <div class="main-content">
        <!-- Top Bar -->
        <TopBar 
            :title="getTabTitle()"
            :show-back="false"
        >
            <template #actions>
                <div 
                    v-if="profileChipName" 
                    class="toolbar-profile-chip"
                >
                    <span class="toolbar-profile-avatar">
                        <mdicon name="account-circle" :size="24"/>
                    </span>
                    <span class="toolbar-profile-name">{{ profileChipName }}</span>
                </div>
                <mdicon 
                    v-if="activeTab === 'records'"
                    name="magnify" 
                    :size="24" 
                    class="action-icon"
                />
                <mdicon 
                    name="bell-outline" 
                    :size="24" 
                    class="action-icon"
                />
                <mdicon 
                    name="cog-outline" 
                    :size="24" 
                    class="action-icon"
                />
            </template>
        </TopBar>

        <!-- Content Wrapper -->
        <div class="content-wrapper">
            <!-- Home Tab -->
            <div v-if="activeTab === 'home'" class="tab-content home-tab">
                <div class="home-actions">
                    <div class="action-card home" @click="navigateToAddRecord">
                        <mdicon name="clipboard-plus" :size="40" class="action-icon-primary"/>
                        <div>
                            <h4>Add medical record</h4>
                            <p>Create a new entry</p>
                        </div>
                    </div>
                    <div class="action-card home" @click="navigateToMedicineReminder">
                        <mdicon name="pill" :size="40" class="action-icon-primary"/>
                        <div>
                            <h4>Add medicine reminder</h4>
                            <p>Set up dosage alerts</p>
                        </div>
                    </div>
                </div>

                <section class="home-section">
                    <div class="home-section-header">
                        <h3>Today's Reminders</h3>
                        <button class="link-button" @click="router.push('/medical-records/medicine-reminders/history')">
                            View history
                        </button>
                    </div>
                    <div class="home-reminders">
                        <p v-if="!activeProfileId" class="home-empty">
                            Select or add a profile to view reminders.
                        </p>
                        <p v-else-if="remindersLoading" class="home-empty">Loading reminders...</p>
                        <template v-else>
                            <div 
                                class="reminder-card" 
                                v-for="reminder in todaysReminders" 
                                :key="reminder.id"
                            >
                                <div class="reminder-card-header">
                                    <h4>{{ reminder.medicineName }}</h4>
                                    <span class="reminder-frequency">{{ formatFrequency(reminder) }}</span>
                                </div>
                                <p class="reminder-meta">
                                    {{ reminder.intakeMethod || 'Anytime' }}
                                </p>
                                <div class="reminder-slots" v-if="reminder.slots.length">
                                    <span 
                                        class="slot-chip" 
                                        v-for="slot in reminder.slots" 
                                        :key="slot.id"
                                        :class="{ checked: slot.status === 'taken', missed: slot.status === 'missed' }"
                                    >
                                        {{ slot.label }}
                                        <span class="slot-status" v-if="slot.status">
                                            {{ slot.status === 'taken' ? '☑︎' : '✖︎' }}
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <p v-if="!todaysReminders.length" class="home-empty">
                                No reminders scheduled for today.
                            </p>
                        </template>
                        <p v-if="remindersError" class="records-error">
                            {{ remindersError.message || 'Unable to load reminders.' }}
                        </p>
                    </div>
                </section>

                <section class="home-section">
                    <div class="home-section-header">
                        <h3>Recent medical records</h3>
                        <button class="link-button" @click="handleTabChange('records')">
                            View all
                        </button>
                    </div>
                    <div v-if="medicalRecordsLoading" class="records-loading">
                        <mdicon name="loading" :size="32" class="spin"/>
                        <p>Loading recent records...</p>
                    </div>
                    <div v-else-if="recentRecords.length" class="home-records">
                        <div 
                            class="home-record-card" 
                            v-for="record in recentRecords" 
                            :key="record.id"
                            @click="openRecordDetail(record.id)"
                        >
                            <div class="home-record-icon">
                                <mdicon :name="record.icon" :size="24"/>
                            </div>
                            <div class="home-record-info">
                                <h4>{{ record.title }}</h4>
                                <p>{{ record.date }} · {{ record.typeLabel }}</p>
                            </div>
                            <mdicon name="chevron-right" :size="18" class="home-record-chevron"/>
                        </div>
                    </div>
                    <p v-else class="home-empty">No medical records yet.</p>
                </section>
            </div>

            <!-- Records Tab -->
            <div v-if="activeTab === 'records'" class="tab-content">
                <div class="records-header">
                    <h3 class="records-title">All Medical Records</h3>
                    <button class="add-record-btn" @click="navigateToAddRecord">
                        <mdicon name="plus" :size="20"/>
                        Add Record
                    </button>
                </div>

                <div v-if="medicalRecordsLoading" class="records-loading">
                    <mdicon name="loading" :size="48" class="spin"/>
                    <p>Loading medical records...</p>
                </div>
                <template v-else>
                    <div class="records-grid" v-if="medicalRecords.length > 0">
                        <div class="record-card-web" v-for="record in medicalRecords" :key="record.id" @click="openRecordDetail(record.id)">
                            <div class="record-card-content">
                                <div class="record-icon-web">
                                    <mdicon :name="record.icon" :size="32"/>
                                </div>
                                <div class="record-details-web">
                                    <div class="record-header-web">
                                        <h4 class="record-title-web">{{ record.title }}</h4>
                                        <span class="record-type-chip">{{ record.typeLabel }}</span>
                                    </div>
                                    <p class="record-meta-web">{{ record.date }} · {{ record.provider }}</p>
                                    <p class="record-description-web">{{ record.description }}</p>
                                    <div class="record-tags-web" v-if="record.tags.length">
                                        <span class="record-tag-web" v-for="tag in record.tags" :key="`${record.id}-${tag}`">{{ tag }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="empty-state">
                        <mdicon name="file-document-multiple" :size="80" class="empty-icon"/>
                        <p class="empty-title">No Records Yet</p>
                        <p class="empty-text">Start adding medical records to track your health history</p>
                        <button class="primary-button" @click="navigateToAddRecord">
                            <mdicon name="plus" :size="20"/>
                            Add First Record
                        </button>
                    </div>
                </template>
                <p v-if="medicalRecordsError" class="records-error">
                    {{ medicalRecordsError.message || 'Something went wrong while loading records.' }}
                </p>
            </div>

            <!-- My Health Tab -->
            <div v-if="activeTab === 'health'" class="tab-content">
                <div v-if="healthLoading" class="empty-state">
                    <mdicon name="loading" :size="60" class="empty-icon spin"/>
                    <p class="empty-title">Loading vitals...</p>
                </div>
                <div v-else class="health-grid">
                    <div class="health-card">
                        <div class="health-card-header">
                            <div>
                                <h4>Blood Pressure</h4>
                                <p>Latest reading</p>
                            </div>
                            <button class="health-link" @click="navigateToBloodPressure">
                                View details
                            </button>
                        </div>
                        <div v-if="bpLatest" class="health-reading">
                            <p class="health-value">{{ bpLatest.systolic }}/{{ bpLatest.diastolic }} <span>mmHg</span></p>
                            <span class="health-status" :class="bpLatest.status.toLowerCase()">{{ bpLatest.status }}</span>
                        </div>
                        <p v-else class="health-empty">No blood pressure records yet.</p>
                        <div v-if="bpChartData.length" class="health-chart stacked">
                            <div class="chart-y-axis">
                                <span>145</span>
                                <span>110</span>
                                <span>75</span>
                            </div>
                            <div class="chart-area">
                                <div class="chart-bars">
                                    <div 
                                        class="chart-bar-group" 
                                        v-for="record in bpChartData" 
                                        :key="record.id"
                                    >
                                        <div class="bp-bar">
                                            <div 
                                                class="bp-range" 
                                                :style="{ height: record.rangeHeight, top: record.topOffset }"
                                            >
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
                            <p class="placeholder-text">Add records to see trends</p>
                        </div>
                    </div>

                    <div class="health-card">
                        <div class="health-card-header">
                            <div>
                                <h4>Blood Sugar</h4>
                                <p>Latest reading</p>
                            </div>
                            <button class="health-link" @click="navigateToBloodSugar">
                                View details
                            </button>
                        </div>
                        <div v-if="bsLatest">
                            <div class="health-reading">
                                <p class="health-value">{{ bsLatest.value }} <span>mg/dL</span></p>
                                <span class="health-status" :class="bsLatest.status.toLowerCase()">{{ bsLatest.status }}</span>
                            </div>
                        </div>
                        <p v-else class="health-empty">No blood sugar records yet.</p>
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
                                        <linearGradient id="webSugarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.25"/>
                                            <stop offset="100%" style="stop-color:#667eea;stop-opacity:0.05"/>
                                        </linearGradient>
                                    </defs>
                                    <path 
                                        v-if="bsChartPath"
                                        :d="bsChartPath"
                                        fill="url(#webSugarGradient)"
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
                                        :key="`bs-point-${index}`"
                                        :cx="point.x"
                                        :cy="point.y"
                                        r="3"
                                        fill="#667eea"
                                    />
                                </svg>
                                <div class="chart-x-labels">
                                    <span v-for="(point, index) in bsChartPoints" :key="`bs-label-${index}`">{{ point.label }}</span>
                                </div>
                            </div>
                            <span class="chart-unit">mg/dL</span>
                        </div>
                    </div>
                    <div class="health-card">
                        <div class="health-card-header">
                            <div>
                                <h4>Body Weight</h4>
                                <p>Latest measurement</p>
                            </div>
                            <button class="health-link" @click="navigateToBodyWeight">
                                View details
                            </button>
                        </div>
                        <div v-if="bodyWeightLatest" class="health-reading">
                            <p class="health-value">{{ bodyWeightLatest.weight }} <span>kg</span></p>
                            <span class="health-status body-weight" :class="{ increase: bodyWeightLatest.change > 0, decrease: bodyWeightLatest.change < 0 }">
                                <template v-if="bodyWeightLatest.change > 0">+{{ bodyWeightLatest.change }} kg</template>
                                <template v-else-if="bodyWeightLatest.change < 0">{{ bodyWeightLatest.change }} kg</template>
                                <template v-else>Stable</template>
                            </span>
                        </div>
                        <p v-else class="health-empty">No body weight records yet.</p>
                    </div>
                </div>
            </div>

            <!-- Profile Tab -->
            <div v-if="activeTab === 'profile'" class="tab-content profile-tab">
                <ProfileOverview />
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/MedicalRecords/TopBar.vue'
import SideNav from '@/components/MedicalRecords/SideNav.vue'
import ProfileOverview from '@/views/web/Profile/ProfileOverview.vue'
import { useBloodPressure } from '@/composables/vitals/bloodPressure'
import { useBloodSugar } from '@/composables/vitals/bloodSugar'
import { useBodyWeight } from '@/composables/vitals/bodyWeight'
import { useMedicalRecords } from '@/composables/medicalRecords'
import { useMedicineReminders } from '@/composables/medicineReminders'

export default {
    name: "MedicalRecordsWeb",
    components: {
        TopBar,
        SideNav,
        ProfileOverview
    },
    setup() {
        const router = useRouter()
        const activeTab = ref('home')
        const activeProfileId = ref(localStorage.getItem('selectedProfileId') || null)
        const profileChipName = ref(localStorage.getItem('selectedProfileName') || 'Select profile')

        const updateProfileChipName = () => {
            profileChipName.value = localStorage.getItem('selectedProfileName') || 'Select profile'
        }

        const handleTabChange = (tab) => {
            activeTab.value = tab
            updateProfileChipName()
        }

        const getTabTitle = () => {
            const titles = {
                home: 'Medical Records Dashboard',
                records: 'Medical Records',
                health: 'My Health',
                profile: 'Profile Settings'
            }
            return titles[activeTab.value] || 'Medical Records'
        }

        const navigateToAddRecord = () => {
            router.push('/medical-records/add-record')
        }

        const navigateToMedicineReminder = () => {
            router.push('/medical-records/medicine-reminders/add')
        }

        const navigateToBloodPressure = () => {
            router.push('/medical-records/web/blood-pressure')
        }

        const navigateToBloodSugar = () => {
            router.push('/medical-records/web/blood-sugar')
        }

        const navigateToBodyWeight = () => {
            router.push('/medical-records/web/body-weight')
        }

        const openRecordDetail = (recordId) => {
            router.push(`/medical-records/web/records/${recordId}`)
        }

        const recordTypeMeta = {
            LAB_RESULT: { label: 'Lab Report', icon: 'file-document' },
            PRESCRIPTION: { label: 'Prescription', icon: 'file-document-edit' },
            INVOICE: { label: 'Invoice', icon: 'receipt' },
            VACCINATION: { label: 'Vaccination', icon: 'needle' },
            DIAGNOSIS: { label: 'Diagnosis', icon: 'clipboard-text' },
            IMAGING: { label: 'Imaging', icon: 'image' },
            DISCHARGE_SUMMARY: { label: 'Discharge Summary', icon: 'file-chart' },
            OTHER: { label: 'Other', icon: 'file-question' }
        }

        const formatRecordDate = (value) => {
            if (!value) return 'Unknown date'
            return new Date(value).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        }

        const {
            records: medicalRecordsSource,
            loading: medicalRecordsLoading,
            error: medicalRecordsError,
            fetchRecords: fetchMedicalRecords
        } = useMedicalRecords()

        const {
            reminders: reminderSource,
            loading: remindersLoading,
            error: remindersError,
            fetchReminders
        } = useMedicineReminders()

        const medicalRecords = computed(() => {
            return medicalRecordsSource.value.map(record => {
                const meta = recordTypeMeta[record.recordType] || recordTypeMeta.OTHER
                return {
                    id: record.id,
                    title: record.title,
                    typeLabel: meta.label,
                    icon: meta.icon,
                    date: formatRecordDate(record.recordDate),
                    provider: record.providerName || 'Provider not specified',
                    description: record.notes || 'No notes added for this record.',
                    tags: Array.isArray(record.tags) ? record.tags : []
                }
            })
        })

        const recentRecords = computed(() => medicalRecords.value.slice(0, 5))

        const {
            records: bpRecords,
            fetchRecords: fetchBpRecords
        } = useBloodPressure()
        const {
            records: bsRecords,
            fetchRecords: fetchBsRecords
        } = useBloodSugar()
        const {
            records: bodyWeightRecords,
            fetchRecords: fetchBodyWeightRecords
        } = useBodyWeight()

        const healthLoading = ref(false)

        const classifyBloodPressureStatus = (systolic, diastolic) => {
            if (systolic < 120 && diastolic < 80) return 'Normal'
            if (systolic < 130 && diastolic < 80) return 'Elevated'
            return 'High'
        }

        const classifyBloodSugarStatus = (value, context = '') => {
            const ctx = (context || '').toLowerCase()
            if (ctx.includes('after')) {
                if (value < 140) return 'Normal'
                if (value < 200) return 'Elevated'
                return 'High'
            }
            if (value < 100) return 'Normal'
            if (value < 126) return 'Elevated'
            return 'High'
        }

        const bpDisplayRecords = computed(() => {
            return bpRecords.value.map(record => ({
                id: record.id,
                systolic: record.systolic || record.valueNumber,
                diastolic: record.diastolic || 0,
                recordedAt: record.recordedAt
            }))
        })

        const bpChartData = computed(() => {
            const recent = bpDisplayRecords.value.slice(-7)
            if (!recent.length) {
                return []
            }
            const systolics = recent.map(entry => Number(entry.systolic) || 0)
            const diastolics = recent.map(entry => Number(entry.diastolic) || 0)
            const max = Math.max(...systolics)
            const min = Math.min(...diastolics)
            const range = (max - min) || 1
            return recent.map((record, index) => {
                const systolic = systolics[index]
                const diastolic = diastolics[index]
                const labelSource = record.recordedAt || record.date || new Date().toISOString()
                const label = new Date(labelSource).toLocaleDateString(undefined, { weekday: 'short' })
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

        const bpLatest = computed(() => {
            if (!bpDisplayRecords.value.length) return null
            const latest = bpDisplayRecords.value[bpDisplayRecords.value.length - 1]
            const systolic = latest.systolic || 0
            const diastolic = latest.diastolic || 0
            return {
                systolic,
                diastolic,
                status: classifyBloodPressureStatus(systolic, diastolic)
            }
        })

        const bsLatest = computed(() => {
            if (!bsRecords.value.length) return null
            const latest = bsRecords.value[bsRecords.value.length - 1]
            const value = Number(latest.valueNumber) || 0
            const type = latest.chartGroup || 'Fasting'
            return {
                value,
                type,
                status: classifyBloodSugarStatus(value, type)
            }
        })

        const bodyWeightLatest = computed(() => {
            if (!bodyWeightRecords.value.length) return null
            const latest = bodyWeightRecords.value[bodyWeightRecords.value.length - 1]
            const previous = bodyWeightRecords.value[bodyWeightRecords.value.length - 2]
            const weight = Number(latest.valueNumber) || 0
            const change = previous ? +(weight - previous.valueNumber).toFixed(1) : 0
            return { weight, change }
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
                const label = new Date(values[index].recordedAt).toLocaleDateString(undefined, { weekday: 'short' })
                return { x, y, label }
            })
        })

        const bsChartPath = computed(() => {
            const points = bsChartPoints.value
            if (!points.length) return ''
            return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
        })

        const formatReminderTime = (timeString) => {
            if (!timeString) return '—'
            const [hour, minute] = timeString.split(':')
            const date = new Date()
            date.setHours(Number(hour), Number(minute), 0, 0)
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        }

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
            const durationMatch = reminder.frequency?.match?.(/(\d]+)/)
            if (durationMatch) {
                return `${durationMatch[1]}x`
            }
            return reminder.frequency || ''
        }

        const todaysReminders = computed(() => {
            const mapped = reminderSource.value.map(reminder => {
                const reminderSlots = Array.isArray(reminder.slots) && reminder.slots.length
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
                return {
                    id: reminder.id,
                    medicineName: reminder.medicineName,
                    intakeMethod: reminder.intakeMethod,
                    frequency: reminder.frequency,
                    slots
                }
            })
            return mapped.slice(0, 3)
        })

        const loadHealthData = async () => {
            const token = localStorage.getItem('token')
            activeProfileId.value = localStorage.getItem('selectedProfileId')
            updateProfileChipName()
            if (!token || !activeProfileId.value) {
                bpRecords.value = []
                bsRecords.value = []
                bodyWeightRecords.value = []
                return
            }
            healthLoading.value = true
            await Promise.all([
                fetchBpRecords(token, activeProfileId.value),
                fetchBsRecords(token, activeProfileId.value),
                fetchBodyWeightRecords(token, activeProfileId.value)
            ])
            healthLoading.value = false
        }

        const loadMedicalRecords = async () => {
            const token = localStorage.getItem('token')
            activeProfileId.value = localStorage.getItem('selectedProfileId')
            updateProfileChipName()
            medicalRecordsError.value = null
            if (!token || !activeProfileId.value) {
                medicalRecordsSource.value = []
                return
            }
            await fetchMedicalRecords(token, activeProfileId.value)
        }

        const loadReminders = async () => {
            const token = localStorage.getItem('token')
            activeProfileId.value = localStorage.getItem('selectedProfileId')
            updateProfileChipName()
            if (!token || !activeProfileId.value) {
                reminderSource.value = []
                return
            }
            await fetchReminders(token, activeProfileId.value, { date: new Date() })
        }

        const loadHomeData = async () => {
            await Promise.all([
                loadMedicalRecords(),
                loadReminders()
            ])
        }

        watch(activeTab, (tab) => {
            if (tab === 'health') {
                loadHealthData()
            }
            if (tab === 'records') {
                loadMedicalRecords()
            }
            if (tab === 'home') {
                loadHomeData()
            }
        })

        const handleStorage = (event) => {
            if (event.key === 'selectedProfileName') {
                updateProfileChipName()
            }
            if (event.key === 'selectedProfileId') {
                if (activeTab.value === 'health') {
                    loadHealthData()
                }
                if (activeTab.value === 'records') {
                    loadMedicalRecords()
                }
                if (activeTab.value === 'home') {
                    loadHomeData()
                }
            }
        }

        onMounted(() => {
            updateProfileChipName()
            if (activeTab.value === 'health') {
                loadHealthData()
            }
            if (activeTab.value === 'records') {
                loadMedicalRecords()
            }
            if (activeTab.value === 'home') {
                loadHomeData()
            }
            window.addEventListener('storage', handleStorage)
        })

        onUnmounted(() => {
            window.removeEventListener('storage', handleStorage)
        })

        return {
            router,
            activeTab,
            handleTabChange,
            getTabTitle,
            navigateToAddRecord,
            navigateToMedicineReminder,
            navigateToBloodPressure,
            navigateToBloodSugar,
            navigateToBodyWeight,
            openRecordDetail,
            medicalRecords,
            medicalRecordsLoading,
            medicalRecordsError,
            recentRecords,
            remindersLoading,
            remindersError,
            todaysReminders,
            formatFrequency,
            healthLoading,
            bpLatest,
            bsLatest,
            bodyWeightLatest,
            bpChartData,
            bsChartPoints,
            bsChartPath,
            profileChipName
        }
    }
}
</script>

<style scoped>
.medical-records-container {
    display: flex;
    min-height: 100vh;
    background: #f8f9fa;
}

.main-content {
    flex: 1;
    margin-left: 260px;
    display: flex;
    flex-direction: column;
}

.action-icon {
    cursor: pointer;
    color: #374151;
    transition: all 0.2s ease;
    padding: 8px;
    border-radius: 8px;
}

.action-icon:hover {
    background: #f3f4f6;
}

.action-icon:active {
    transform: scale(0.95);
}

.toolbar-profile-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: #eef2ff;
    border-radius: 999px;
    font-size: 13px;
    color: #1e1b4b;
    margin-right: 12px;
}

.toolbar-profile-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: white;
    color: #6366f1;
}

.toolbar-profile-name {
    font-weight: 600;
    white-space: nowrap;
}

.content-wrapper {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
}

.tab-content {
    animation: fadeIn 0.3s ease;
    max-width: 1400px;
    margin: 0 auto;
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

.home-tab {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.home-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
}

.action-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    align-items: center;
}

.action-card.home {
    align-items: center;
}

.action-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
}

.action-card:active {
    transform: translateY(-2px);
}

.action-icon-primary {
    color: #667eea;
}

.action-card h4 {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
}

.action-card p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    line-height: 1.4;
}

.home-section {
    background: white;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.home-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.home-section-header h3 {
    margin: 0;
    font-size: 20px;
}

.link-button {
    border: none;
    background: none;
    color: #6366f1;
    font-weight: 600;
    cursor: pointer;
}

.home-reminders {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.home-empty {
    margin: 0;
    color: #94a3b8;
}

.reminder-card {
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 16px 20px;
    background: #f8fafc;
}

.reminder-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.reminder-card-header h4 {
    margin: 0;
}

.reminder-frequency {
    background: #eef2ff;
    color: #4338ca;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
}

.reminder-meta {
    margin: 6px 0 12px;
    color: #6b7280;
}

.reminder-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.slot-chip {
    background: white;
    border-radius: 999px;
    border: 1px solid #e2e8f0;
    padding: 6px 12px;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #374151;
}

.slot-chip.checked {
    border-color: #22c55e;
    color: #15803d;
}

.slot-chip.missed {
    border-color: #f97316;
    color: #c2410c;
}

.slot-status {
    font-size: 12px;
}

.home-records {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.home-record-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    cursor: pointer;
    transition: border-color 0.2s ease, transform 0.2s ease;
}

.home-record-card:hover {
    border-color: #6366f1;
    transform: translateY(-2px);
}

.home-record-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #eef2ff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4338ca;
}

.home-record-info h4 {
    margin: 0;
    font-size: 16px;
}

.home-record-info p {
    margin: 2px 0 0;
    color: #6b7280;
    font-size: 13px;
}

.home-record-chevron {
    margin-left: auto;
    color: #94a3b8;
}

/* Records Header */
.records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.records-title {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

.add-record-btn {
    background: #667eea;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.add-record-btn:hover {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.add-record-btn:active {
    transform: translateY(0);
}

/* Records Grid */
.records-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px;
}

.records-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 24px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    color: #4b5563;
}

.record-card-web {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.record-card-web:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    border-color: #667eea;
}

.record-card-web:active {
    transform: translateY(-2px);
}

.record-card-content {
    display: flex;
    gap: 16px;
}

.record-icon-web {
    width: 64px;
    height: 64px;
    background: #f0f4ff;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667eea;
    flex-shrink: 0;
}

.record-details-web {
    flex: 1;
    min-width: 0;
}

.record-header-web {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.record-type-chip {
    background: #eef2ff;
    color: #4338ca;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
}

.record-title-web {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
}

.record-meta-web {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 12px 0;
}

.record-description-web {
    font-size: 14px;
    color: #374151;
    margin: 0 0 12px 0;
    line-height: 1.6;
}

.record-tags-web {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

/* Health Grid */
.health-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
}

.health-card {
    background: white;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.health-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.health-card-header h4 {
    margin: 0;
    font-size: 20px;
}

.health-card-header p {
    margin: 4px 0 0;
    color: #6b7280;
}

.health-link {
    border: none;
    background: rgba(102, 126, 234, 0.12);
    color: #4c51bf;
    padding: 6px 12px;
    border-radius: 999px;
    font-weight: 600;
    cursor: pointer;
}

.health-reading {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

.health-value {
    font-size: 32px;
    font-weight: 700;
    margin: 0;
}

.health-value span {
    font-size: 16px;
    color: #6b7280;
    margin-left: 6px;
}

.health-status {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.health-status.normal {
    color: #16a34a;
}

.health-status.elevated {
    color: #d97706;
}

.health-status.high {
    color: #dc2626;
}

.health-status.body-weight {
    font-size: 16px;
    text-transform: none;
}

.health-status.body-weight.increase {
    color: #d97706;
}

.health-status.body-weight.decrease {
    color: #16a34a;
}

.health-empty {
    color: #94a3b8;
    margin: 0;
}

.health-chart {
    position: relative;
    display: flex;
    gap: 12px;
    background: #f8fafc;
    border-radius: 16px;
    padding: 16px;
    margin-top: 12px;
}

.health-chart.stacked {
    min-height: 160px;
}

.chart-y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 12px;
    color: #94a3b8;
    min-width: 32px;
}

.chart-area {
    flex: 1;
    position: relative;
}

.chart-unit {
    position: absolute;
    top: 12px;
    right: 16px;
    font-size: 12px;
    color: #94a3b8;
}

.chart-bars {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 120px;
}

.chart-bar-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.bp-bar {
    width: 12px;
    height: 110px;
    position: relative;
}

.bp-range {
    width: 12px;
    background: linear-gradient(180deg, #a5b4fc 0%, #c7d2fe 100%);
    border-radius: 6px;
    position: absolute;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 6px 0;
}

.bp-dot-top,
.bp-dot-bottom {
    width: 10px;
    height: 10px;
    background: #6366f1;
    border-radius: 50%;
    display: block;
    margin: 0 auto;
}

.chart-label {
    font-size: 12px;
    color: #6b7280;
}

.line-chart {
    width: 100%;
    height: 120px;
}

.chart-x-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    font-size: 12px;
    color: #6b7280;
}

.health-chart-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    border-radius: 16px;
    padding: 24px;
    min-height: 160px;
    margin-top: 12px;
    border: 1px dashed #e5e7eb;
}

.placeholder-text {
    color: #94a3b8;
    margin: 0;
    font-size: 14px;
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.record-tag-web {
    background: #f0f4ff;
    color: #667eea;
    padding: 6px 14px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
}

/* Empty State */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 40px;
    text-align: center;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.empty-icon {
    color: #d1d5db;
    margin-bottom: 24px;
}

.empty-title {
    font-size: 24px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 12px 0;
}

.empty-text {
    font-size: 16px;
    color: #6b7280;
    margin: 0 0 24px 0;
    line-height: 1.6;
    max-width: 400px;
}

.primary-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.primary-button:active {
    transform: translateY(0);
}

.records-error {
    color: #dc2626;
    margin-top: 16px;
    font-size: 14px;
}
</style>
