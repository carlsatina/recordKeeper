<template>
<div class="reminder-history-page">
    <header class="header">
        <button class="icon-btn" @click="router.back()">
            <mdicon name="arrow-left" :size="22"/>
        </button>
        <h2 class="title">Reminder history</h2>
        <div class="spacer"></div>
    </header>

    <div class="search-row">
        <mdicon name="magnify" :size="20"/>
        <input 
            type="text" 
            v-model="searchTerm"
            placeholder="Search medicine name"
        />
    </div>

    <div class="filters-row">
        <p class="filter-label">Date range</p>
        <div class="filter-chips">
            <button
                v-for="option in rangeOptions" 
                :key="option.value"
                class="filter-chip"
                :class="{ active: selectedRange === option.value }"
                type="button"
                @click="selectedRange = option.value"
            >
                {{ option.label }}
            </button>
        </div>
    </div>

    <section class="history-list">
        <div v-if="loading" class="empty-state">Loading reminders...</div>
        <div v-else-if="!timelineGroups.length" class="empty-state">
            No reminder history for this range.
        </div>
        <div v-else class="date-group" v-for="group in timelineGroups" :key="group.dateKey">
            <div class="group-header">
                <div class="group-date">
                    <p class="group-day">{{ formatGroupDate(group.dateObj) }}</p>
                    <p class="group-sub">{{ groupLabel(group.dateObj) }}</p>
                </div>
                <span class="group-count">{{ group.items.length }} events</span>
            </div>
            <div 
                class="history-card"
                v-for="entry in group.items"
                :key="entry.id"
                @click="openReminder(entry.reminderId)"
            >
                <div class="history-header">
                    <div>
                        <p class="history-name">{{ entry.medicineName }}</p>
                        <p class="history-details">
                            {{ entry.dosage || 1 }} {{ entry.unit || '' }} · {{ entry.intakeMethod || 'Anytime' }}
                        </p>
                    </div>
                    <span class="history-time">{{ entry.timeLabel }}</span>
                </div>
                <div class="history-footer">
                    <div class="history-meta">
                        <span class="status-pill" :class="statusClass(entry.status)">{{ entry.status }}</span>
                        <span class="meta-text">{{ entry.frequency || '—' }}</span>
                    </div>
                    <div class="history-actions">
                        <button class="pill-btn ghost" type="button" @click.stop="openReminder(entry.reminderId)">
                            Edit
                        </button>
                        <button 
                            class="pill-btn danger" 
                            type="button"
                            :disabled="deletingId === entry.reminderId"
                            @click.stop="requestDelete(entry)"
                        >
                            {{ deletingId === entry.reminderId ? 'Deleting...' : 'Delete' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <ConfirmDeleteModal
        :show="showDeleteModal"
        :loading="Boolean(deletingId)"
        :title="`Delete ${pendingDeleteName || 'reminder'}?`"
        message="This will remove the reminder and its schedule."
        confirm-label="Delete"
        cancel-label="Cancel"
        @confirm="confirmDelete"
        @cancel="closeDeleteModal"
        @close="closeDeleteModal"
    />
</div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMedicineReminders } from '@/composables/medicineReminders'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'

export default {
    name: 'MedicineReminderHistory',
    components: {
        ConfirmDeleteModal
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { fetchAllReminders, deleteReminder } = useMedicineReminders()
        const reminders = ref([])
        const searchTerm = ref('')
        const loading = ref(false)
        const deletingId = ref(null)
        const showDeleteModal = ref(false)
        const pendingDeleteId = ref(null)
        const pendingDeleteName = ref('')
        const selectedRange = ref('30')
        const activeProfileId = ref(
            Array.isArray(route.query.profileId) ? route.query.profileId[0] : route.query.profileId || localStorage.getItem('selectedProfileId')
        )
        const rangeOptions = [
            { value: '7', label: 'Last 7 days' },
            { value: '30', label: 'Last 30 days' },
            { value: '90', label: 'Last 90 days' },
            { value: 'all', label: 'All time' }
        ]

        const loadReminders = async () => {
            const token = localStorage.getItem('token')
            if (!token || !activeProfileId.value) return
            loading.value = true
            try {
                reminders.value = await fetchAllReminders(token, activeProfileId.value)
            } catch (err) {
                console.error(err)
            } finally {
                loading.value = false
            }
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

        const startOfDay = (value) => {
            const date = new Date(value)
            date.setHours(0, 0, 0, 0)
            return date
        }

        const formatDateKey = (date) => {
            const y = date.getFullYear()
            const m = `${date.getMonth() + 1}`.padStart(2, '0')
            const d = `${date.getDate()}`.padStart(2, '0')
            return `${y}-${m}-${d}`
        }

        const normalizeTimeValue = (value) => {
            if (typeof value !== 'string') return null
            const match = value.trim().match(/^(\d{1,2})(?::(\d{1,2}))?$/)
            if (!match) return null
            const hours = Math.min(23, Math.max(0, Number(match[1])))
            const minutes = Math.min(59, Math.max(0, Number(match[2] ?? '0')))
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        }

        const formatTimeLabel = (timeString) => {
            if (!timeString) return '—'
            const [hour, minute] = timeString.split(':')
            const date = new Date()
            date.setHours(Number(hour) || 0, Number(minute) || 0, 0, 0)
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        }

        const parseDurationDays = (duration) => {
            if (!duration) return 1
            const match = duration.match(/(\d+)/)
            const days = match ? Number(match[1]) : 1
            if (Number.isNaN(days)) return 1
            return Math.max(days, 1)
        }

        const scheduleTimesForReminder = (reminder) => {
            const baseTimes = Array.isArray(reminder.times) ? reminder.times : []
            const normalized = baseTimes.map(normalizeTimeValue).filter(Boolean)
            if (!normalized.length && reminder.time) {
                const fallback = normalizeTimeValue(reminder.time)
                if (fallback) normalized.push(fallback)
            }
            return normalized.length ? normalized : ['08:00']
        }

        const reminderLogsIndex = (reminder) => {
            const index = new Map()
            const logs = reminder.medication?.logs || []
            logs.forEach(log => {
                const logDate = new Date(log.occurredAt)
                if (Number.isNaN(logDate.getTime())) return
                const key = `${formatDateKey(logDate)}|${normalizeTimeValue(`${logDate.getHours()}:${logDate.getMinutes()}`)}`
                index.set(key, log.status)
            })
            return index
        }

        const dateRange = computed(() => {
            const today = startOfDay(new Date())
            if (selectedRange.value === 'all') {
                return { start: null, end: today }
            }
            const days = Number(selectedRange.value) || 30
            const end = today
            const start = new Date(end)
            start.setDate(end.getDate() - (days - 1))
            return { start, end }
        })

        const filteredReminders = computed(() => {
            const term = searchTerm.value.toLowerCase().trim()
            if (!term) return reminders.value
            return reminders.value.filter(reminder =>
                reminder.medicineName?.toLowerCase().includes(term)
            )
        })

        const timelineEntries = computed(() => {
            const entries = []
            const { start: rangeStart, end: rangeEnd } = dateRange.value
            filteredReminders.value.forEach(reminder => {
                const startDate = reminder.startDate || reminder.medication?.startDate || reminder.createdAt
                const baseDate = startOfDay(startDate || new Date())
                const durationDays = parseDurationDays(reminder.duration)
                const reminderEnd = new Date(baseDate)
                reminderEnd.setDate(reminderEnd.getDate() + durationDays - 1)

                const loopStart = rangeStart ? new Date(Math.max(baseDate.getTime(), rangeStart.getTime())) : baseDate
                const loopEnd = rangeEnd ? new Date(Math.min(reminderEnd.getTime(), rangeEnd.getTime())) : reminderEnd
                if (loopEnd < loopStart) return

                const times = scheduleTimesForReminder(reminder)
                const logIndex = reminderLogsIndex(reminder)

                for (let cursor = new Date(loopStart); cursor <= loopEnd; cursor.setDate(cursor.getDate() + 1)) {
                    const dateKey = formatDateKey(cursor)
                    times.forEach((time, idx) => {
                        const status = logIndex.get(`${dateKey}|${time}`) || 'pending'
                        entries.push({
                            id: `${reminder.id}-${dateKey}-${time}-${idx}`,
                            reminderId: reminder.id,
                            dateKey,
                            dateObj: new Date(cursor),
                            time,
                            timeLabel: formatTimeLabel(time),
                            medicineName: reminder.medicineName,
                            dosage: reminder.dosage,
                            unit: reminder.unit,
                            intakeMethod: reminder.intakeMethod,
                            status,
                            frequency: reminder.frequency
                        })
                    })
                }
            })

            return entries.sort((a, b) => {
                if (a.dateObj.getTime() === b.dateObj.getTime()) {
                    return b.time.localeCompare(a.time)
                }
                return b.dateObj.getTime() - a.dateObj.getTime()
            })
        })

        const timelineGroups = computed(() => {
            const grouped = {}
            timelineEntries.value.forEach(entry => {
                if (!grouped[entry.dateKey]) {
                    grouped[entry.dateKey] = {
                        dateKey: entry.dateKey,
                        dateObj: entry.dateObj,
                        items: []
                    }
                }
                grouped[entry.dateKey].items.push(entry)
            })
            return Object.values(grouped).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
        })

        const formatGroupDate = (date) => {
            if (!date) return '—'
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        }

        const groupLabel = (date) => {
            if (!date) return ''
            const today = startOfDay(new Date())
            const yesterday = new Date(today)
            yesterday.setDate(today.getDate() - 1)
            if (date.getTime() === today.getTime()) return 'Today'
            if (date.getTime() === yesterday.getTime()) return 'Yesterday'
            return date.toLocaleDateString(undefined, { weekday: 'long' })
        }

        const openReminder = (reminderId) => {
            router.push(`/medical-records/medicine-reminders/${reminderId}/edit`)
        }

        const requestDelete = (entry) => {
            pendingDeleteId.value = entry.reminderId
            pendingDeleteName.value = entry.medicineName
            showDeleteModal.value = true
        }

        const closeDeleteModal = () => {
            showDeleteModal.value = false
            pendingDeleteId.value = null
            pendingDeleteName.value = ''
        }

        const confirmDelete = async() => {
            if (!pendingDeleteId.value) return
            const token = localStorage.getItem('token')
            if (!token) return
            deletingId.value = pendingDeleteId.value
            try {
                await deleteReminder(token, pendingDeleteId.value)
                await loadReminders()
            } catch (err) {
                console.error(err)
            } finally {
                deletingId.value = null
                closeDeleteModal()
            }
        }

        return {
            router,
            searchTerm,
            loading,
            selectedRange,
            rangeOptions,
            filteredReminders,
            timelineGroups,
            formatGroupDate,
            groupLabel,
            formatTimeLabel,
            statusClass: (status) => ({
                taken: 'status-taken',
                missed: 'status-missed',
                pending: 'status-pending'
            }[status] || 'status-pending'),
            openReminder,
            requestDelete,
            confirmDelete,
            closeDeleteModal,
            deletingId,
            showDeleteModal,
            pendingDeleteName
        }
    }
}
</script>

<style scoped>
.reminder-history-page {
    min-height: 100vh;
    background: radial-gradient(circle at 20% 20%, rgba(79,70,229,0.12), transparent 36%),
                radial-gradient(circle at 80% 0%, rgba(6,182,212,0.12), transparent 32%),
                var(--bg-main);
    display: flex;
    flex-direction: column;
    padding-bottom: 24px;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--glass-ghost-bg);
    border-bottom: 1px solid var(--glass-card-border);
}

.title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
}

.icon-btn {
    border: none;
    background: var(--glass-ghost-bg);
    padding: 6px;
    border-radius: 12px;
    color: var(--text-primary);
}

.search-row {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--glass-card-bg);
    margin: 16px;
    padding: 12px 14px;
    border-radius: 16px;
    box-shadow: var(--glass-card-shadow);
    border: 1px solid var(--glass-card-border);
}

.search-row input {
    border: none;
    flex: 1;
    font-size: 15px;
    outline: none;
    background: transparent;
    color: var(--text-primary);
}

.filters-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 16px;
    margin: 4px 0 8px;
}

.filter-label {
    margin: 0;
    color: var(--text-muted);
    font-size: 13px;
}

.filter-chips {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 6px;
}

.filter-chips::-webkit-scrollbar {
    display: none;
}

.filter-chip {
    border: 1px solid var(--glass-card-border);
    background: var(--glass-ghost-bg);
    color: var(--text-primary);
    padding: 6px 10px;
    border-radius: 12px;
    font-size: 13px;
    white-space: nowrap;
    appearance: none;
    -webkit-appearance: none;
    outline: none;
    cursor: pointer;
}

.filter-chip.active {
    background: var(--accent-1, #5b7bff);
    border-color: var(--accent-1, #5b7bff);
    color: #fff;
}

.history-list {
    flex: 1;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.date-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 4px 0;
}

.group-date {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.group-day {
    margin: 0;
    font-weight: 600;
    color: var(--text-primary);
}

.group-sub {
    margin: 0;
    font-size: 12px;
    color: var(--text-muted);
}

.group-count {
    font-size: 12px;
    color: var(--text-muted);
    background: var(--glass-ghost-bg);
    border: 1px solid var(--glass-card-border);
    border-radius: 999px;
    padding: 4px 10px;
}

.history-card {
    background: var(--glass-card-bg);
    border-radius: 16px;
    padding: 16px;
    box-shadow: var(--glass-card-shadow);
    border: 1px solid var(--glass-card-border);
}

.history-card:active {
    transform: scale(0.99);
}

.history-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
}

.history-name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.history-details {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--text-muted);
}

.history-time {
    font-size: 12px;
    color: var(--text-muted);
}

.history-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 6px 0 0;
}

.history-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
}

.history-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.pill-btn {
    border: 1px solid var(--glass-card-border);
    background: var(--glass-ghost-bg);
    color: var(--text-primary);
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    cursor: pointer;
}

.pill-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.pill-btn.danger {
    border-color: rgba(239, 68, 68, 0.4);
    color: #d14343;
    background: rgba(239, 68, 68, 0.08);
}

.pill-btn.ghost {
    border-color: var(--glass-card-border);
}

.meta-text {
    font-size: 12px;
    color: var(--text-muted);
}

.status-pill {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    text-transform: capitalize;
    border: 1px solid transparent;
}

.status-taken {
    background: rgba(16, 185, 129, 0.1);
    color: #0f9f6e;
    border-color: rgba(16, 185, 129, 0.3);
}

.status-missed {
    background: rgba(239, 68, 68, 0.1);
    color: #d14343;
    border-color: rgba(239, 68, 68, 0.3);
}

.status-pending {
    background: rgba(234, 179, 8, 0.1);
    color: #a16207;
    border-color: rgba(234, 179, 8, 0.3);
}

.empty-state {
    text-align: center;
    color: var(--text-muted);
    font-size: 14px;
    padding: 24px 12px;
}
</style>
