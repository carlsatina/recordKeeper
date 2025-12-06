<template>
<div class="add-medicine-page">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <header class="header glass-nav">
        <button class="icon-btn" @click="goBack">
            <mdicon name="arrow-left" :size="22"/>
        </button>
        <h2 class="title">{{ headerTitle }}</h2>
        <div class="spacer"></div>
    </header>

    <div class="content">
        <section class="input-card glass-card">
            <label class="input-label">Medicine Name</label>
            <input
                type="text"
                v-model="medicineName"
                placeholder="e.g., Pantoprazole"
                class="input-field"
            />
        </section>

        <section class="input-card glass-card">
            <label class="input-label">Unit</label>
            <div class="select-field" @click="toggleUnit">
                <span>{{ unit }}</span>
                <mdicon name="chevron-down" :size="20"/>
            </div>
            <div v-if="showUnitOptions" class="option-list">
                <button
                    v-for="option in unitOptions"
                    :key="option"
                    class="option-item"
                    @click="selectUnit(option)"
                >
                    {{ option }}
                </button>
            </div>
        </section>

        <section class="input-card glass-card">
            <p class="section-label">Schedule</p>
            <div class="schedule-grid">
                <div class="schedule-row select-row">
                    <label>Start date</label>
                    <div class="styled-select">
                        <input type="date" v-model="startDate"/>
                    </div>
                </div>
                <div class="schedule-row">
                    <span>Dosage</span>
                    <div class="dosage-value">{{ dosage }}</div>
                </div>
                <div class="schedule-row select-row">
                    <label>Frequency</label>
                    <div class="styled-select">
                        <select v-model="frequency">
                            <option v-for="option in frequencyOptions" :key="option" :value="option">
                                {{ option }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="schedule-row select-row">
                    <label>Times per day</label>
                    <div class="time-list">
                        <div 
                            class="time-chip" 
                            v-for="(slot, index) in timeSlots" 
                            :key="`time-${index}`"
                        >
                            <div class="styled-select compact">
                                <input type="time" v-model="timeSlots[index]"/>
                            </div>
                            <button 
                                class="remove-time" 
                                type="button" 
                                @click="removeTimeSlot(index)" 
                                v-if="timeSlots.length > 1"
                            >
                                <mdicon name="close" :size="16"/>
                            </button>
                        </div>
                    </div>
                    <button 
                        class="add-time-btn" 
                        type="button" 
                        @click="addTimeSlot" 
                        :disabled="timeSlots.length >= maxTimeSlots"
                    >
                        + Add Time
                    </button>
                </div>
                <div class="schedule-row select-row">
                    <label>Duration</label>
                    <div class="styled-select">
                        <select v-model="duration">
                            <option v-for="option in durationOptions" :key="option" :value="option">
                                {{ option }}
                            </option>
                        </select>
                        <mdicon name="chevron-down" :size="18"/>
                    </div>
                </div>
                <div class="schedule-row select-row">
                    <label>Intake method</label>
                    <div class="styled-select">
                        <select v-model="intakeMethod">
                            <option v-for="option in intakeOptions" :key="option" :value="option">
                                {{ option }}
                            </option>
                        </select>
                        <mdicon name="chevron-down" :size="18"/>
                    </div>
                </div>
            </div>
        </section>

        <button class="primary-btn" :disabled="saving" @click="saveReminder">
            {{ saving ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update reminder' : 'Save') }}
        </button>
    </div>
</div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMedicineReminders } from '@/composables/medicineReminders'

export default {
    name: 'AddMedicineReminder',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const reminderId = computed(() => route.params.id || route.query.reminderId || null)
        const medicineName = ref('')
        const unit = ref('Tablet')
        const dosage = ref(1)
        const frequency = ref('Once daily')
        const timeSlots = ref(['08:00'])
        const maxTimeSlots = 6
        const duration = ref('5 days')
        const intakeMethod = ref('Before meal')
        const startDate = ref(new Date().toISOString().slice(0, 10))
        const showUnitOptions = ref(false)
        const unitOptions = ['Tablet', 'Capsule', 'Syrup', 'Drops']
        const frequencyOptions = ['Once daily', 'Twice daily', 'Thrice daily', 'Weekly']
        const durationOptions = ['3 days', '5 days', '7 days', '14 days', '30 days']
        const intakeOptions = ['Before meal', 'After meal']

        const saving = ref(false)
        const initializing = ref(false)
        const isEditing = computed(() => Boolean(reminderId.value))
        const headerTitle = computed(() => (isEditing.value ? 'Edit medicine' : 'Add medicine'))
        const { createReminder, updateReminder, fetchReminderById } = useMedicineReminders()

        const goBack = () => router.back()
        const toggleUnit = () => (showUnitOptions.value = !showUnitOptions.value)
        const selectUnit = (value) => {
            unit.value = value
            showUnitOptions.value = false
        }
        const frequencyMultiplierMap = {
            'Once daily': 1,
            'Twice daily': 2,
            'Thrice daily': 3,
            'Weekly': 1
        }

        const parseDurationDays = (value) => {
            if (!value) return 1
            const match = value.match(/(\d+)/)
            return match ? Number(match[1]) : 1
        }

        const updateCalculatedDosage = () => {
            const days = parseDurationDays(duration.value) || 1
            const multiplier = frequencyMultiplierMap[frequency.value] || timeSlots.value.length || 1
            dosage.value = days * multiplier
        }

        const addTimeSlot = () => {
            if (timeSlots.value.length >= maxTimeSlots) return
            timeSlots.value.push('08:00')
            updateCalculatedDosage()
        }
        const removeTimeSlot = (index) => {
            if (timeSlots.value.length === 1) return
            timeSlots.value.splice(index, 1)
            updateCalculatedDosage()
        }
        const sanitizedTimes = () => {
            return timeSlots.value
                .map((value) => value?.trim())
                .filter((value) => Boolean(value))
        }
        const populateForm = (reminder) => {
            medicineName.value = reminder.medicineName || ''
            unit.value = reminder.unit || 'Tablet'
            dosage.value = reminder.dosage || 1
            frequency.value = reminder.frequency || 'Once daily'
            duration.value = reminder.duration || '5 days'
            intakeMethod.value = reminder.intakeMethod || 'Before meal'
            const times = (Array.isArray(reminder.times) && reminder.times.length ? reminder.times : [reminder.time || '08:00']).filter(Boolean)
            timeSlots.value = times.length ? times : ['08:00']
            const start = reminder.startDate || reminder.medication?.startDate || reminder.createdAt || new Date().toISOString()
            startDate.value = start ? new Date(start).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
            updateCalculatedDosage()
        }

        const loadReminder = async () => {
            if (!isEditing.value) return
            const token = localStorage.getItem('token')
            if (!token || !reminderId.value) return
            try {
                initializing.value = true
                const reminder = await fetchReminderById(token, reminderId.value)
                populateForm(reminder)
            } catch (err) {
                alert(err.message || 'Unable to load reminder details.')
            } finally {
                initializing.value = false
            }
        }

        const saveReminder = async () => {
            const token = localStorage.getItem('token')
            const profileId = localStorage.getItem('selectedProfileId')
            const times = sanitizedTimes()
            if (!times.length) {
                alert('Please add at least one time for this reminder.')
                return
            }
            if (!token) {
                alert('Please log in again.')
                router.push('/login')
                return
            }
            if (!profileId && !isEditing.value) {
                alert('Please select a profile first.')
                return
            }
            saving.value = true
            try {
                const payload = {
                    medicineName: medicineName.value.trim(),
                    unit: unit.value,
                    dosage: dosage.value,
                    frequency: frequency.value,
                    time: times[0],
                    times,
                    duration: duration.value,
                    intakeMethod: intakeMethod.value,
                    startDate: startDate.value
                }
                if (isEditing.value) {
                    await updateReminder(token, reminderId.value, payload)
                } else {
                    await createReminder(token, {
                        ...payload,
                        profileId
                    })
                }
                router.replace('/medical-records/medicine-reminders')
            } catch (err) {
                alert(err.message || 'Unable to save reminder.')
            } finally {
                saving.value = false
            }
        }

        onMounted(() => {
            loadReminder()
            updateCalculatedDosage()
        })

        watch(reminderId, () => {
            loadReminder()
        })

        watch([frequency, duration], () => {
            updateCalculatedDosage()
        }, { immediate: true })

        return {
            goBack,
            headerTitle,
            medicineName,
            unit,
            unitOptions,
            showUnitOptions,
            selectUnit,
            toggleUnit,
            dosage,
            frequency,
            frequencyOptions,
            durationOptions,
            duration,
            intakeMethod,
            intakeOptions,
            startDate,
            timeSlots,
            maxTimeSlots,
            addTimeSlot,
            removeTimeSlot,
            saveReminder,
            isEditing,
            saving
        }
    }
}
</script>

<style scoped>
.add-medicine-page {
    min-height: 100vh;
    background: #05060a;
    display: flex;
    flex-direction: column;
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
    background: linear-gradient(135deg, #22d3ee, #a855f7);
    top: -140px;
    left: -110px;
}
.orb-2 {
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #06b6d4);
    bottom: -120px;
    right: -90px;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: rgba(5,6,10,0.8);
    border-bottom: 1px solid rgba(148,163,184,0.16);
    position: sticky;
    top: 0;
    z-index: 5;
}

.icon-btn {
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    padding: 8px;
    border-radius: 12px;
    color: #e2e8f0;
}

.icon-btn.ghost {
    background: transparent;
    border-color: transparent;
}

.title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #e2e8f0;
}

.spacer {
    width: 32px;
}

.content {
    flex: 1;
    padding: 18px 16px 36px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: relative;
    z-index: 1;
}

.input-card {
    background: rgba(255,255,255,0.05);
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 12px 26px rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.08);
}

.input-label {
    display: block;
    font-size: 13px;
    color: #cbd5e1;
    margin-bottom: 8px;
    font-weight: 700;
}

.input-field {
    width: 100%;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 12px;
    background: rgba(255,255,255,0.05);
    font-size: 15px;
    font-weight: 600;
    color: #e2e8f0;
}

.select-field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255,255,255,0.05);
    padding: 12px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.12);
    color: #e2e8f0;
}

.option-list {
    margin-top: 8px;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 12px 24px rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.08);
}

.option-item {
    width: 100%;
    border: none;
    background: rgba(255,255,255,0.05);
    padding: 12px 16px;
    text-align: left;
    font-size: 14px;
    color: #e2e8f0;
}

.option-item:active {
    background: rgba(103,232,249,0.12);
}

.section-label {
    font-size: 14px;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 10px;
}

.schedule-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.schedule-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 600;
    color: #cbd5e1;
}

.dosage-value {
    background: rgba(103,232,249,0.12);
    color: #67e8f9;
    padding: 8px 12px;
    border-radius: 999px;
    font-weight: 700;
    min-width: 60px;
    text-align: center;
    border: 1px solid rgba(103,232,249,0.25);
}

.primary-btn {
    width: 100%;
    margin-top: auto;
    border-radius: 16px;
    padding: 16px;
    font-size: 16px;
    font-weight: 700;
}

.primary-btn:active {
    opacity: 0.9;
}

.select-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
}

.styled-select {
    width: 100%;
    position: relative;
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.12);
    padding: 0 10px;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.12);
}

.styled-select select,
.styled-select input[type="time"],
.styled-select input[type="date"] {
    width: 100%;
    border: none;
    background: transparent;
    padding: 10px 0;
    font-size: 14px;
    font-weight: 600;
    appearance: none;
    color: #e2e8f0;
}

.styled-select select:focus,
.styled-select input[type="time"]:focus,
.styled-select input[type="date"]:focus {
    outline: none;
}

.styled-select.compact {
    min-width: 120px;
    flex: 1;
}

.time-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
}

.time-chip {
    display: flex;
    align-items: center;
    gap: 8px;
}

.remove-time {
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    color: #e2e8f0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-time-btn {
    align-self: flex-start;
    border: 1px solid rgba(103,232,249,0.4);
    background: rgba(103,232,249,0.12);
    color: #67e8f9;
    border-radius: 999px;
    padding: 8px 16px;
    font-weight: 700;
    margin-top: 4px;
}
</style>
