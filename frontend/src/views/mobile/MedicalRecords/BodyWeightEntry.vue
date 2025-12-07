<template>
<div class="vital-entry-page">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
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
                    <button class="menu-item danger" @click="openDeleteConfirm">
                        <mdicon name="delete" :size="18"/>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </template>
    </TopBar>

    <div class="record-detail-content">
        <div v-if="loading" class="state-card glass-card">
            Loading record...
        </div>
        <div v-else-if="errorMessage" class="state-card error glass-card">
            {{ errorMessage }}
        </div>
        <div v-else-if="record" class="detail-stack">
            <section class="card measurement-card weight-card glass-card">
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

            <section class="card glass-card">
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

            <section class="card glass-card">
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
                <button class="edit-cancel glass-btn-ghost" type="button" @click="cancelEdit" :disabled="saving">
                    Cancel
                </button>
                <button class="edit-save glass-btn-primary" type="button" @click="saveChanges" :disabled="saving">
                    {{ saving ? 'Saving...' : 'Save changes' }}
                </button>
            </div>
        </div>
    </div>

    <div v-if="showDeleteConfirm" class="confirm-overlay">
        <div class="confirm-card">
            <h3 class="confirm-title">Delete record?</h3>
            <p class="confirm-text">This will permanently remove this body weight entry.</p>
            <div class="confirm-actions">
                <button type="button" @click="showDeleteConfirm = false" :disabled="saving">Cancel</button>
                <button type="button" class="danger" @click="confirmDelete" :disabled="saving">
                    {{ saving ? 'Deleting...' : 'Delete' }}
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
        const { fetchRecordById, updateRecord, deleteRecord } = useBodyWeight()
        const record = ref(null)
        const loading = ref(true)
        const errorMessage = ref('')
        const saving = ref(false)
        const isEditing = ref(false)
        const formError = ref('')
        const menuOpen = ref(false)
        const menuRef = ref(null)
        const showDeleteConfirm = ref(false)
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

        const confirmDelete = async () => {
            if (!record.value) return
            if (!window.confirm('Delete this body weight record? This cannot be undone.')) return
            const token = localStorage.getItem('token')
            if (!token) return
            try {
                saving.value = true
                await deleteRecord(token, record.value.id)
                router.push({ path: '/medical-records', query: { tab: 'health' } })
            } catch (err) {
                formError.value = err.message || 'Unable to delete record.'
            } finally {
                saving.value = false
            }
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

        const openDeleteConfirm = () => {
            if (!record.value) return
            showDeleteConfirm.value = true
            menuOpen.value = false
        }
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
            showDeleteConfirm,
            toggleMenu,
            formError,
            saving,
            backRoute,
            openDeleteConfirm,
            confirmDelete
        }
    }
}
</script>

<style scoped>
.vital-entry-page { min-height: 100vh; background: #05060a; position: relative; overflow: hidden; padding-bottom: 80px; }
.bg-orb { position: absolute; filter: blur(60px); opacity: 0.28; z-index: 0; }
.orb-1 { width: 320px; height: 320px; border-radius: 50%; background: linear-gradient(135deg, #22d3ee, #a855f7); top: -140px; left: -110px; }
.orb-2 { width: 260px; height: 260px; border-radius: 50%; background: linear-gradient(135deg, #22c55e, #06b6d4); bottom: -120px; right: -90px; }
.record-detail-content { padding: 16px; position: relative; z-index: 1; }
.detail-stack { display: flex; flex-direction: column; gap: 14px; }
.card { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 16px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 12px 26px rgba(0,0,0,0.32); }
.measurement-card { display: flex; flex-direction: column; gap: 12px; }
.measurement-header { display: flex; align-items: center; gap: 12px; }
.measurement-icon { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #22d3ee, #a855f7); color: #0b1020; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 24px rgba(0,0,0,0.35); }
.measurement-label { margin: 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
.measurement-status { margin: 2px 0 0; font-size: 16px; font-weight: 800; color: #e2e8f0; }
.measurement-display { display: flex; align-items: baseline; gap: 8px; }
.measurement-value { margin: 0; font-size: 28px; font-weight: 800; color: #e2e8f0; }
.measurement-value span { font-size: 14px; color: #94a3b8; margin-left: 4px; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 12px; color: #94a3b8; font-weight: 700; }
.form-group input, .form-group textarea, .form-group select { border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 10px; background: rgba(255,255,255,0.05); color: #e2e8f0; }
.form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: rgba(103,232,249,0.6); box-shadow: 0 0 0 2px rgba(103,232,249,0.25); }
.info-row { display: flex; justify-content: space-between; font-size: 14px; color: #e2e8f0; }
.state-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #cbd5e1; padding: 16px; border-radius: 14px; text-align: center; box-shadow: 0 10px 24px rgba(0,0,0,0.28); }
.state-card.error { color: #f87171; border-color: rgba(239,68,68,0.35); }
.menu-button { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 6px; color: #e2e8f0; }
.menu-dropdown { position: absolute; top: 40px; right: 0; background: rgba(10,12,20,0.95); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; box-shadow: 0 12px 24px rgba(0,0,0,0.32); display: flex; flex-direction: column; min-width: 140px; overflow: hidden; }
.menu-item { background: transparent; border: none; color: #e2e8f0; padding: 10px 12px; display: flex; align-items: center; gap: 8px; text-align: left; }
.menu-item.danger { color: #f87171; }
.menu-item:active { background: rgba(255,255,255,0.08); }
.empty-hint { color: #94a3b8; font-size: 13px; margin: 0; }
.edit-actions { display: flex; flex-direction: column; gap: 10px; }
.edit-error { color: #f87171; font-size: 13px; margin: 0; }
.edit-cancel { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 12px; color: #e2e8f0; font-weight: 700; }
.edit-save { border-radius: 12px; padding: 12px; font-weight: 700; }
.confirm-overlay { position: fixed; inset: 0; background: rgba(5,6,10,0.75); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 16px; }
.confirm-card { background: rgba(10,12,20,0.95); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 18px; width: 100%; max-width: 360px; box-shadow: 0 18px 36px rgba(0,0,0,0.4); color: #e2e8f0; display: flex; flex-direction: column; gap: 12px; }
.confirm-title { margin: 0; font-size: 17px; font-weight: 800; }
.confirm-text { margin: 0; font-size: 14px; color: #cbd5e1; }
.confirm-actions { display: flex; gap: 10px; }
.confirm-actions button { flex: 1; padding: 12px; border-radius: 12px; font-weight: 700; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); color: #e2e8f0; }
.confirm-actions .danger { background: linear-gradient(135deg, #f97316, #ef4444); border: none; color: #0b1020; }
</style>
