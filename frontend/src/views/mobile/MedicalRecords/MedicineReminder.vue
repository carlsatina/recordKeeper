<template>
<div class="medicine-reminder-page">
    <header class="header">
        <button class="icon-btn" @click="goBack">
            <mdicon name="arrow-left" :size="22"/>
        </button>
        <h2 class="title">Medicine reminder</h2>
        <button class="icon-btn ghost">
            <mdicon name="dots-vertical" :size="22"/>
        </button>
    </header>

    <div class="calendar-card">
        <div class="month-row">
            <div class="month-controls">
                <button class="month-nav" @click="previousMonth">
                    <mdicon name="chevron-left" :size="18"/>
                </button>
                <div class="month-display" @click="toggleMonthPicker">
                    {{ monthLabel }}
                    <mdicon name="chevron-down" :size="18"/>
                </div>
                <button class="month-nav" @click="nextMonth">
                    <mdicon name="chevron-right" :size="18"/>
                </button>
            </div>
            <button class="history-btn">History</button>
        </div>
        <div v-if="showMonthPicker" class="month-picker">
            <button v-for="option in monthOptions" :key="option.value" class="month-option" @click="selectMonth(option.value)">
                {{ option.label }}
            </button>
        </div>
        <div class="week-toolbar">
            <button class="week-nav" @click="previousWeek">
                <mdicon name="chevron-left" :size="18"/>
            </button>
            <div class="week-label">{{ weekLabel }}</div>
            <button class="week-nav" @click="nextWeek">
                <mdicon name="chevron-right" :size="18"/>
            </button>
        </div>
        <div class="week-days">
            <div 
                v-for="day in weekDays" 
                :key="day.iso"
                class="day-pill"
                :class="{ active: day.isSelected, today: day.isToday }"
                @click="selectDay(day.dateObj)"
            >
                <span class="day-name">{{ day.label }}</span>
                <span class="day-number">{{ day.date }}</span>
            </div>
        </div>
    </div>

    <section class="reminders-section">
        <div v-if="!hasActiveProfile" class="empty-state">
            <div class="illustration simple">
                <div class="pill-pack"></div>
                <div class="bottle">
                    <div class="cap"></div>
                    <div class="body"></div>
                </div>
            </div>
            <p class="message">Add a family profile to start scheduling reminders.</p>
            <button class="secondary-btn" type="button" @click="goToProfileTab">
                Go to profiles
            </button>
        </div>
        <div v-else-if="remindersLoading" class="empty-state small">Loading reminders...</div>
        <template v-else>
            <div v-if="formattedReminders.length" class="reminder-list">
                <div 
                    class="reminder-card"
                    v-for="reminder in formattedReminders"
                    :key="reminder.id"
                >
                    <div class="reminder-header">
                        <div class="reminder-info">
                            <p class="reminder-name">{{ reminder.title }}</p>
                            <p class="reminder-details">{{ reminder.subtitle }}</p>
                        </div>
                        <div class="reminder-meta">
                            <span class="reminder-start">{{ reminder.startDate }}</span>
                            <button class="edit-btn" type="button" @click.stop="openEdit(reminder.id)">
                                <mdicon name="pencil" :size="18"/>
                            </button>
                        </div>
                    </div>
                    <div class="reminder-slots">
                        <button 
                            class="slot-pill" 
                            v-for="slot in reminder.slots" 
                            :key="slot.id"
                            :class="{ checked: slot.status === 'taken' }"
                            @click.stop="toggleReminderSlot(reminder, slot)"
                        >
                            <span class="slot-time">{{ slot.label }}</span>
                            <span class="slot-icon" v-if="slot.status">
                                {{ slot.status === 'taken' ? '☑︎' : '✖︎' }}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div v-else class="empty-state">
                <div class="illustration">
                    <div class="pill-pack"></div>
                    <div class="bottle">
                        <div class="cap"></div>
                        <div class="body"></div>
                    </div>
                    <div class="pills">
                        <span class="pill red"></span>
                        <span class="pill blue"></span>
                    </div>
                </div>
                <p class="message">You haven’t added any medicine reminders</p>
            </div>
        </template>
    </section>

    <button 
        class="primary-btn" 
        :disabled="!hasActiveProfile"
        @click="hasActiveProfile ? addReminder() : goToProfileTab()"
    >
        {{ hasActiveProfile ? 'Add reminder' : 'Create a profile first' }}
    </button>
</div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMedicineReminders } from '@/composables/medicineReminders'

export default {
    name: 'MedicineReminderView',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { reminders, loading: remindersLoading, fetchReminders, setReminderStatus } = useMedicineReminders()
        const activeProfileId = ref(
            Array.isArray(route.query.profileId) ? route.query.profileId[0] : route.query.profileId || localStorage.getItem('selectedProfileId')
        )
        const currentDate = ref(new Date())
        const showMonthPicker = ref(false)

        const goBack = () => router.back()
        const addReminder = () => {
            router.push('/medical-records/medicine-reminders/add')
        }
        const openEdit = (reminderId) => {
            router.push(`/medical-records/medicine-reminders/${reminderId}/edit`)
        }
        const goToProfileTab = () => {
            router.push({
                path: '/medical-records',
                query: {
                    tab: 'profile'
                }
            })
        }

        const loadReminders = async () => {
            const token = localStorage.getItem('token')
            if (!token || !activeProfileId.value) {
                reminders.value = []
                return
            }
            await fetchReminders(token, activeProfileId.value, { date: currentDate.value })
        }

        onMounted(() => {
            loadReminders()
        })

        watch(
            () => route.query.profileId,
            (val) => {
                const id = Array.isArray(val) ? val[0] : val
                if (id) {
                    activeProfileId.value = id
                    localStorage.setItem('selectedProfileId', id)
                    loadReminders()
                }
            }
        )

        const monthLabel = computed(() => {
            return currentDate.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
        })

        const weekLabel = computed(() => {
            const start = weekStart.value
            const end = new Date(start)
            end.setDate(start.getDate() + 6)
            const options = { month: 'short', day: 'numeric' }
            return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`
        })

        const weekStart = computed(() => {
            const start = new Date(currentDate.value)
            start.setDate(start.getDate() - start.getDay())
            start.setHours(0, 0, 0, 0)
            return start
        })

        const monthOptions = computed(() => {
            const year = currentDate.value.getFullYear()
            return Array.from({ length: 12 }).map((_, index) => {
                const date = new Date(year, index, 1)
                return {
                    label: date.toLocaleDateString(undefined, { month: 'long' }),
                    value: index
                }
            })
        })

        const toggleMonthPicker = () => {
            showMonthPicker.value = !showMonthPicker.value
        }

        const hasActiveProfile = computed(() => Boolean(activeProfileId.value))

        const applyDateChange = (modifier) => {
            const updated = modifier(new Date(currentDate.value))
            currentDate.value = updated
            if (hasActiveProfile.value) {
                loadReminders()
            }
        }

        const selectMonth = (monthIndex) => {
            applyDateChange((prev) => {
                prev.setMonth(monthIndex)
                return prev
            })
            showMonthPicker.value = false
        }

        const previousMonth = () => {
            applyDateChange((prev) => {
                prev.setMonth(prev.getMonth() - 1)
                return prev
            })
        }

        const nextMonth = () => {
            applyDateChange((prev) => {
                prev.setMonth(prev.getMonth() + 1)
                return prev
            })
        }

        const previousWeek = () => {
            applyDateChange((prev) => {
                prev.setDate(prev.getDate() - 7)
                return prev
            })
        }

        const nextWeek = () => {
            applyDateChange((prev) => {
                prev.setDate(prev.getDate() + 7)
                return prev
            })
        }

        const weekDays = computed(() => {
            const today = new Date()
            return Array.from({ length: 7 }).map((_, idx) => {
                const day = new Date(weekStart.value)
                day.setDate(weekStart.value.getDate() + idx)
                return {
                    label: day.toLocaleDateString(undefined, { weekday: 'short' }),
                    date: day.getDate(),
                    isSelected: day.toDateString() === currentDate.value.toDateString(),
                    isToday: day.toDateString() === today.toDateString(),
                    dateObj: day,
                    iso: day.toISOString()
                }
            })
        })

        const selectDay = (dateObj) => {
            if (!dateObj) return
            currentDate.value = new Date(dateObj)
            if (hasActiveProfile.value) {
                loadReminders()
            }
        }

        const formatTime = (timeString) => {
            if (!timeString) return '—'
            const [hour, minute] = timeString.split(':')
            const date = new Date()
            date.setHours(Number(hour), Number(minute))
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        }

        const formatDate = (value) => {
            if (!value) return '—'
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return '—'
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        }

        const formattedReminders = computed(() => {
            return reminders.value.map(reminder => {
                const slots = (reminder.slots || []).map((slot, index) => {
                    const rawTime = typeof slot === 'string' ? slot : slot.time
                    return {
                        id: `${reminder.id}-${index}-${rawTime}`,
                        rawTime,
                        label: formatTime(rawTime),
                        status: slot.status || null
                    }
                })
                if (!slots.length) {
                    const fallbackTime = reminder.time || '08:00'
                    slots.push({
                        id: `${reminder.id}-0-${fallbackTime}`,
                        rawTime: fallbackTime,
                        label: formatTime(fallbackTime),
                        status: reminder.status || null
                    })
                }
                return {
                    id: reminder.id,
                    title: reminder.medicineName,
                    subtitle: `${reminder.dosage || 1} ${reminder.unit || ''}, ${reminder.intakeMethod || 'Anytime'}`,
                    startDate: formatDate(reminder.startDate || reminder.medication?.startDate || reminder.createdAt),
                    slots
                }
            })
        })

        const toggleReminderSlot = async(reminder, slot) => {
            if (!hasActiveProfile.value) return
            const token = localStorage.getItem('token')
            if (!token) return
            const newStatus = slot.status === 'taken' ? 'pending' : 'taken'
            try {
                await setReminderStatus(token, reminder.id, newStatus, currentDate.value, slot.rawTime)
                const targetReminder = reminders.value.find(r => r.id === reminder.id)
                if (targetReminder?.slots) {
                    const targetSlot = targetReminder.slots.find(s => s.time === slot.rawTime)
                    if (targetSlot) {
                        targetSlot.status = newStatus === 'pending' ? null : newStatus
                    }
                }
                slot.status = newStatus === 'pending' ? null : newStatus
            } catch (err) {
                alert(err.message || 'Unable to update reminder.')
            }
        }

        return {
            goBack,
            addReminder,
            monthLabel,
            weekLabel,
            weekDays,
            remindersLoading,
            formattedReminders,
            toggleReminderSlot,
            openEdit,
            showMonthPicker,
            toggleMonthPicker,
            monthOptions,
            selectMonth,
            previousMonth,
            nextMonth,
            previousWeek,
            nextWeek,
            selectDay,
            hasActiveProfile,
            goToProfileTab
        }
    }
}
</script>

<style scoped>
.medicine-reminder-page {
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
    border-bottom: 1px solid #eef2ff;
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

.calendar-card {
    background: white;
    margin: 16px;
    padding: 18px;
    border-radius: 20px;
    box-shadow: 0 20px 30px rgba(79, 70, 229, 0.08);
}

.month-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.month-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.month-nav {
    border: none;
    background: rgba(79, 70, 229, 0.08);
    color: #4f46e5;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.month-display {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    padding: 6px 12px;
    border-radius: 12px;
    background: rgba(79, 70, 229, 0.08);
}

.month-picker {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 8px;
    margin-bottom: 12px;
}

.month-option {
    border: none;
    border-radius: 12px;
    padding: 8px;
    background: #f3f4f6;
    font-size: 13px;
    color: #1f2937;
}

.history-btn {
    border: none;
    background: transparent;
    color: #4f46e5;
    font-weight: 600;
}

.week-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.week-label {
    font-weight: 600;
    color: #1f2937;
}

.week-nav {
    border: none;
    background: rgba(79, 70, 229, 0.08);
    color: #4f46e5;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.week-days {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 8px;
}

.day-pill {
    padding: 10px 4px;
    border-radius: 14px;
    text-align: center;
    background: #f3f4f6;
    color: #475569;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s ease;
    touch-action: manipulation;
}

.day-pill:active {
    transform: scale(0.96);
}

.day-pill.today {
    border-color: rgba(79, 70, 229, 0.25);
    background: rgba(79, 70, 229, 0.08);
}

.day-pill.active {
    background: #4f46e5;
    color: white;
    border-color: transparent;
}

.day-name {
    display: block;
    font-size: 12px;
    margin-bottom: 4px;
}

.day-number {
    font-size: 15px;
    font-weight: 600;
}

.reminders-section {
    flex: 1;
    padding: 0 16px 80px;
}

.reminder-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.reminder-card {
    background: white;
    border-radius: 20px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 12px 24px rgba(17, 24, 39, 0.08);
}

.reminder-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.reminder-info {
    flex: 1;
}

.reminder-meta {
    display: flex;
    align-items: center;
    gap: 6px;
}

.edit-btn {
    border: none;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 10px;
    padding: 4px;
    color: #4f46e5;
}

.reminder-name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
}

.reminder-details {
    margin: 2px 0 0;
    color: #6b7280;
    font-size: 13px;
}

.reminder-start {
    margin: 0;
    color: #9ca3af;
    font-size: 12px;
}

.reminder-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.slot-pill {
    border: none;
    background: rgba(79, 70, 229, 0.08);
    color: #4f46e5;
    padding: 6px 12px;
    border-radius: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
}

.slot-pill.checked {
    background: #4f46e5;
    color: white;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.slot-status {
    font-size: 12px;
    text-transform: capitalize;
}

.slot-icon {
    font-size: 16px;
}

.empty-state {
    padding: 32px 16px;
    text-align: center;
    color: #6b7280;
}

.empty-state.small {
    text-align: center;
}

.illustration {
    position: relative;
    width: 180px;
    height: 160px;
    margin: 0 auto 16px;
}

.pill-pack {
    position: absolute;
    left: 0;
    top: 40px;
    width: 70px;
    height: 100px;
    border-radius: 16px;
    background: #c3d7ff;
    box-shadow: inset -4px -4px 0 rgba(0, 0, 0, 0.05);
}

.pill-pack::before,
.pill-pack::after {
    content: '';
    position: absolute;
    left: 18px;
    width: 36px;
    height: 12px;
    border-radius: 999px;
    background: white;
    box-shadow: 0 24px white, 0 48px white, 0 72px white;
}

.bottle {
    position: absolute;
    right: 10px;
    width: 110px;
    height: 140px;
}

.cap {
    width: 100%;
    height: 22px;
    border-radius: 10px 10px 4px 4px;
    background: #7a85ff;
}

.body {
    margin-top: 4px;
    width: 100%;
    height: 110px;
    border-radius: 18px;
    background: #4c5df2;
    box-shadow: inset 0 -10px 0 rgba(0, 0, 0, 0.07);
    position: relative;
}

.body::before {
    content: '';
    position: absolute;
    left: 14px;
    top: 18px;
    right: 14px;
    bottom: 18px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.25);
}

.pills {
    position: absolute;
    bottom: -6px;
    right: 0;
    display: flex;
    gap: 8px;
}

.pill {
    width: 40px;
    height: 16px;
    border-radius: 999px;
    display: inline-block;
}

.pill.red {
    background: linear-gradient(135deg, #ff8b7b, #ff5f6d);
}

.pill.blue {
    background: linear-gradient(135deg, #a5b6ff, #7a85ff);
}

.message {
    font-size: 16px;
    color: #1f2937;
    margin: 0;
}

.primary-btn {
    margin: 0 16px 24px;
    border: none;
    border-radius: 16px;
    background: linear-gradient(135deg, #4c5df2, #7a85ff);
    color: white;
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
}

.primary-btn:active {
    opacity: 0.9;
}

.primary-btn:disabled {
    opacity: 0.4;
    pointer-events: none;
}

.secondary-btn {
    border: none;
    background: rgba(79, 70, 229, 0.12);
    color: #4f46e5;
    border-radius: 999px;
    padding: 10px 20px;
    font-weight: 600;
    margin-top: 12px;
}
</style>
