<template>
<div class="add-medicine-page">
    <header class="header">
        <button class="icon-btn" @click="goBack">
            <mdicon name="arrow-left" :size="22"/>
        </button>
        <h2 class="title">{{ headerTitle }}</h2>
        <div class="spacer"></div>
    </header>

    <div class="content">
        <section class="input-card">
            <label class="input-label">Medicine Name</label>
            <input
                type="text"
                v-model="medicineName"
                placeholder="e.g., Pantoprazole"
                class="input-field"
            />
        </section>

        <section class="input-card">
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

        <section class="input-card">
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
                    <div class="dosage-controls">
                        <button @click="decrementDosage">-</button>
                        <span>{{ dosage }}</span>
                        <button @click="incrementDosage">+</button>
                    </div>
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
        const incrementDosage = () => (dosage.value = Math.min(10, dosage.value + 1))
        const decrementDosage = () => (dosage.value = Math.max(1, dosage.value - 1))
        const addTimeSlot = () => {
            if (timeSlots.value.length >= maxTimeSlots) return
            timeSlots.value.push('08:00')
        }
        const removeTimeSlot = (index) => {
            if (timeSlots.value.length === 1) return
            timeSlots.value.splice(index, 1)
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
        })

        watch(reminderId, () => {
            loadReminder()
        })

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
            incrementDosage,
            decrementDosage,
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
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: white;
    border-bottom: 1px solid #f1f5f9;
}

.icon-btn {
    border: none;
    background: transparent;
    padding: 6px;
    border-radius: 12px;
}

.icon-btn:active {
    background: #f3f4f6;
}

.title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
}

.spacer {
    width: 32px;
}

.content {
    flex: 1;
    padding: 20px 16px 40px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.input-card {
    background: white;
    border-radius: 20px;
    padding: 18px;
    box-shadow: 0 15px 30px rgba(15, 23, 42, 0.05);
}

.input-label {
    display: block;
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 8px;
}

.input-field {
    width: 100%;
    border: none;
    border-radius: 16px;
    padding: 14px;
    background: #f5f6fb;
    font-size: 16px;
    font-weight: 500;
}

.select-field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f5f6fb;
    padding: 14px;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
}

.option-list {
    margin-top: 8px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 20px rgba(15, 23, 42, 0.08);
}

.option-item {
    width: 100%;
    border: none;
    background: white;
    padding: 12px 16px;
    text-align: left;
    font-size: 15px;
}

.option-item:active {
    background: #eef2ff;
}

.section-label {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 12px;
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
    font-size: 15px;
    font-weight: 500;
    color: #0f172a;
}

.dosage-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f5f6fb;
    padding: 8px 12px;
    border-radius: 999px;
}

.dosage-controls button {
    border: none;
    background: #4f46e5;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    font-size: 18px;
}

.value {
    color: #4f46e5;
}

.primary-btn {
    width: 100%;
    border: none;
    border-radius: 16px;
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    margin-top: auto;
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
    background: #eef2ff;
    border-radius: 12px;
    border: 1px solid #dbe2ff;
    padding: 0 10px;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: inset 0 1px 3px rgba(79, 70, 229, 0.08);
}

.styled-select select,
.styled-select input[type="time"],
.styled-select input[type="date"] {
    width: 100%;
    border: none;
    background: transparent;
    padding: 10px 0;
    font-size: 14px;
    font-weight: 500;
    appearance: none;
    color: #0f172a;
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
    border: none;
    background: rgba(99, 102, 241, 0.15);
    color: #4f46e5;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-time-btn {
    align-self: flex-start;
    border: none;
    background: rgba(79, 70, 229, 0.12);
    color: #4f46e5;
    border-radius: 999px;
    padding: 8px 16px;
    font-weight: 600;
    margin-top: 4px;
}

</style>
