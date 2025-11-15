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

    <section class="history-list">
        <div v-if="loading" class="empty-state">Loading reminders...</div>
        <div v-else-if="!filteredReminders.length" class="empty-state">
            No reminders found.
        </div>
        <div 
            v-else
            class="history-card"
            v-for="reminder in filteredReminders"
            :key="reminder.id"
            @click="openReminder(reminder.id)"
        >
            <div class="history-header">
                <div>
                    <p class="history-name">{{ reminder.medicineName }}</p>
                    <p class="history-details">{{ reminder.dosage || 1 }} {{ reminder.unit || '' }} · {{ reminder.intakeMethod || 'Anytime' }}</p>
                </div>
                <span class="history-date">{{ formatDate(reminder.startDate) }}</span>
            </div>
        </div>
    </section>
</div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMedicineReminders } from '@/composables/medicineReminders'

export default {
    name: 'MedicineReminderHistory',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { fetchAllReminders } = useMedicineReminders()
        const reminders = ref([])
        const searchTerm = ref('')
        const loading = ref(false)
        const activeProfileId = ref(
            Array.isArray(route.query.profileId) ? route.query.profileId[0] : route.query.profileId || localStorage.getItem('selectedProfileId')
        )

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

        const filteredReminders = computed(() => {
            const term = searchTerm.value.toLowerCase().trim()
            if (!term) return reminders.value
            return reminders.value.filter(reminder =>
                reminder.medicineName?.toLowerCase().includes(term)
            )
        })

        const formatDate = (value) => {
            if (!value) return '—'
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return '—'
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        }

        const openReminder = (reminderId) => {
            router.push(`/medical-records/medicine-reminders/${reminderId}/edit`)
        }

        return {
            router,
            searchTerm,
            loading,
            filteredReminders,
            formatDate,
            openReminder
        }
    }
}
</script>

<style scoped>
.reminder-history-page {
    min-height: 100vh;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
    padding-bottom: 24px;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: white;
    border-bottom: 1px solid #eef2ff;
}

.title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #111827;
}

.icon-btn {
    border: none;
    background: transparent;
    padding: 6px;
    border-radius: 12px;
}

.search-row {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    margin: 16px;
    padding: 12px 14px;
    border-radius: 16px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-row input {
    border: none;
    flex: 1;
    font-size: 15px;
    outline: none;
}

.history-list {
    flex: 1;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.history-card {
    background: white;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
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
    color: #0f172a;
}

.history-details {
    margin: 4px 0 0;
    font-size: 13px;
    color: #6b7280;
}

.history-date {
    font-size: 12px;
    color: #9ca3af;
}

.empty-state {
    text-align: center;
    color: #94a3b8;
    font-size: 14px;
    padding: 24px 12px;
}
</style>
