<template>
<div class="vital-entry-page">
    <TopBar
        title="Body Weight"
        :show-back="true"
        :back-route="backRoute"
    >
        <template #actions>
            <div class="menu-wrapper" ref="menuRef" v-if="record">
                <button class="menu-button" type="button" @click.stop="toggleMenu">
                    <mdicon name="menu" :size="20"/>
                </button>
                <div v-if="menuOpen" class="menu-dropdown">
                    <button class="menu-item" @click="startEdit">
                        <mdicon name="pencil" :size="18"/>
                        <span>Edit</span>
                    </button>
                </div>
            </div>
        </template>
    </TopBar>

    <div class="record-detail-content">
        <div v-if="loading" class="state-card">
            Loading record...
        </div>
        <div v-else-if="errorMessage" class="state-card error">
            {{ errorMessage }}
        </div>
        <div v-else-if="record" class="detail-stack">
            <section class="card measurement-card weight-card">
                <div class="measurement-header">
                    <div class="measurement-icon">
                        <mdicon name="scale-bathroom" :size="30"/>
                    </div>
                    <div>
                        <p class="measurement-label">Body Weight</p>
                        <p class="measurement-status">Current</p>
                    </div>
                </div>
                <div v-if="!isEditing" class="measurement-display">
                    <p class="measurement-value">{{ displayWeight }}<span>kg</span></p>
                </div>
                <div v-else class="form-group">
                    <label>Weight (kg)</label>
                    <input type="number" step="0.1" v-model="form.weight" placeholder="68.5"/>
                </div>
            </section>

            <section class="card">
                <h3>Date & Time</h3>
                <div v-if="!isEditing" class="info-row">
                    <span>{{ formattedDate }}</span>
                    <span>{{ formattedTime }}</span>
                </div>
                <div v-else class="form-grid">
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" v-model="form.date"/>
                    </div>
                    <div class="form-group">
                        <label>Time</label>
                        <input type="time" v-model="form.time"/>
                    </div>
                </div>
            </section>

            <section class="card">
                <h3>Notes</h3>
                <p v-if="!isEditing && record.notes">{{ record.notes }}</p>
                <p v-else-if="!isEditing" class="empty-hint">No notes for this record.</p>
                <textarea
                    v-else
                    rows="4"
                    v-model="form.notes"
                    placeholder="Add any helpful notes"
                ></textarea>
            </section>

            <div v-if="isEditing" class="edit-actions">
                <p v-if="formError" class="edit-error">{{ formError }}</p>
                <button class="edit-cancel" type="button" @click="cancelEdit" :disabled="saving">
                    Cancel
                </button>
                <button class="edit-save" type="button" @click="saveChanges" :disabled="saving">
                    {{ saving ? 'Saving...' : 'Save changes' }}
                </button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { ref, computed, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TopBar from '@/components/MedicalRecords/TopBar.vue'
import { useBodyWeight } from '@/composables/vitals/bodyWeight'

export default {
    name: 'BodyWeightEntry',
    components: {
        TopBar
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { fetchRecordById, updateRecord } = useBodyWeight()
        const record = ref(null)
        const loading = ref(true)
        const errorMessage = ref('')
        const saving = ref(false)
        const isEditing = ref(false)
        const formError = ref('')
        const menuOpen = ref(false)
        const menuRef = ref(null)
        const form = reactive({
            weight: '',
            date: '',
            time: '',
            notes: ''
        })

        const backRoute = computed(() => {
            const from = route.query.from
            return typeof from === 'string' && from.length ? from : '/medical-records?tab=health'
        })

        const loadRecord = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }
            try {
                loading.value = true
                errorMessage.value = ''
                const data = await fetchRecordById(token, route.params.id)
                record.value = data
                populateForm()
            } catch (err) {
                errorMessage.value = err.message || 'Unable to load record.'
            } finally {
                loading.value = false
            }
        }

        const populateForm = () => {
            if (!record.value) return
            form.weight = record.value.valueNumber ?? ''
            form.notes = record.value.notes || ''
            if (record.value.recordedAt) {
                const date = new Date(record.value.recordedAt)
                form.date = date.toISOString().slice(0, 10)
                form.time = date.toISOString().slice(11, 16)
            } else {
                form.date = new Date().toISOString().slice(0, 10)
                form.time = new Date().toISOString().slice(11, 16)
            }
            formError.value = ''
        }

        const toggleMenu = () => {
            menuOpen.value = !menuOpen.value
        }

        const startEdit = () => {
            populateForm()
            isEditing.value = true
            menuOpen.value = false
        }

        const cancelEdit = () => {
            isEditing.value = false
            populateForm()
        }

        const saveChanges = async () => {
            if (!record.value) return
            if (!form.weight) {
                formError.value = 'Weight is required.'
                return
            }
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }
            try {
                saving.value = true
                formError.value = ''
                const payload = {
                    weight: form.weight,
                    notes: form.notes,
                    recordedAt: form.date ? `${form.date}T${form.time || '00:00'}:00` : undefined
                }
                const data = await updateRecord(token, record.value.id, payload)
                record.value = data.record || data
                isEditing.value = false
            } catch (err) {
                formError.value = err.message || 'Unable to save changes.'
            } finally {
                saving.value = false
            }
        }

        const displayWeight = computed(() => record.value?.valueNumber ?? '--')
        const formattedDate = computed(() => {
            if (!record.value?.recordedAt) return '—'
            return new Date(record.value.recordedAt).toLocaleDateString()
        })
        const formattedTime = computed(() => {
            if (!record.value?.recordedAt) return ''
            return new Date(record.value.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })

        const handleClickOutside = (event) => {
            if (!menuOpen.value) return
            if (menuRef.value && !menuRef.value.contains(event.target)) {
                menuOpen.value = false
            }
        }

        onMounted(() => {
            loadRecord()
            document.addEventListener('click', handleClickOutside)
        })

        onBeforeUnmount(() => {
            document.removeEventListener('click', handleClickOutside)
        })

        watch(
            () => route.params.id,
            (newId, oldId) => {
                if (newId && newId !== oldId) {
                    loadRecord()
                }
            }
        )

        return {
            record,
            loading,
            errorMessage,
            isEditing,
            form,
            startEdit,
            cancelEdit,
            saveChanges,
            displayWeight,
            formattedDate,
            formattedTime,
            menuOpen,
            menuRef,
            toggleMenu,
            formError,
            saving,
            backRoute
        }
    }
}
</script>

<style scoped>
.vital-entry-page {
    min-height: 100vh;
    background: #f8f9fa;
}

.record-detail-content {
    padding: 20px 16px 40px;
}

.state-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    color: #4b5563;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.state-card.error {
    color: #b91c1c;
}

.detail-stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.card {
    background: white;
    border-radius: 18px;
    padding: 20px;
    box-shadow: 0 15px 35px rgba(17, 24, 39, 0.08);
    border: 1px solid #eef2ff;
}

.measurement-card {
    text-align: center;
    background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
    color: white;
}

.measurement-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
}

.measurement-icon {
    width: 50px;
    height: 50px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.measurement-label {
    margin: 0;
    font-size: 15px;
    opacity: 0.9;
}

.measurement-status {
    margin: 2px 0 0;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.8;
}

.measurement-value {
    font-size: 48px;
    font-weight: 700;
    margin: 0;
}

.measurement-value span {
    font-size: 18px;
    margin-left: 8px;
    color: rgba(255, 255, 255, 0.8);
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group input,
.card textarea {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 12px;
    font-size: 14px;
}

.card textarea {
    resize: vertical;
    min-height: 120px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    color: #4b5563;
}

.empty-hint {
    color: #9ca3af;
    margin: 0;
}

.edit-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.edit-error {
    color: #dc2626;
    margin: 0;
    font-size: 13px;
    text-align: center;
}

.edit-actions button {
    border: none;
    border-radius: 12px;
    padding: 14px;
    font-size: 15px;
    font-weight: 600;
}

.edit-cancel {
    background: #f3f4f6;
    color: #374151;
}

.edit-save {
    background: #4f46e5;
    color: white;
}

.menu-wrapper {
    position: relative;
}

.menu-button {
    border: none;
    background: transparent;
    padding: 6px;
    border-radius: 8px;
    cursor: pointer;
    color: #374151;
}

.menu-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 6px 0;
    z-index: 20;
    min-width: 150px;
}

.menu-item {
    width: 100%;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    font-size: 14px;
    color: #1f2937;
    cursor: pointer;
}

.menu-item:active {
    background: #f3f4f6;
}

</style>
