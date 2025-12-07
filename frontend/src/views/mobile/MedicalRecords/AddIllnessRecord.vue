<template>
<div class="add-illness-container">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="header glass-nav">
        <button class="back-btn" @click="goBack">
            <mdicon name="arrow-left" :size="22"/>
        </button>
        <h2>{{ isEdit ? 'Edit Illness Record' : 'Add Illness Record' }}</h2>
        <span class="spacer"></span>
    </div>

    <form class="form glass-card" @submit.prevent="submit">
        <label class="field">
            <span>Diagnosis *</span>
            <input v-model="form.diagnosis" type="text" placeholder="e.g., Influenza" required>
        </label>

        <label class="field">
            <span>Symptoms (comma separated)</span>
            <input v-model="symptomsInput" type="text" placeholder="e.g., Fever, Cough, Fatigue">
        </label>

        <label class="field">
            <span>Body Temperature</span>
            <div class="inline">
                <input v-model="form.bodyTemperature" type="number" step="0.1" min="30" max="45" placeholder="37.5">
                <select v-model="form.temperatureUnit">
                    <option value="C">°C</option>
                    <option value="F">°F</option>
                </select>
            </div>
        </label>

        <div class="field half">
            <label>
                <span>Severity</span>
                <select v-model="form.severity">
                    <option value="MILD">Mild</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="SEVERE">Severe</option>
                    <option value="CRITICAL">Critical</option>
                </select>
            </label>
            <label>
                <span>Status</span>
                <select v-model="form.status">
                    <option value="ONGOING">Ongoing</option>
                    <option value="RECOVERED">Recovered</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CHRONIC">Chronic</option>
                </select>
            </label>
        </div>

        <label class="field">
            <span>Medications (comma separated)</span>
            <input v-model="medicationsInput" type="text" placeholder="e.g., Ibuprofen, Paracetamol">
        </label>

        <label class="field">
            <span>Notes</span>
            <textarea v-model="form.notes" rows="3" placeholder="Any observations or doctor advice"></textarea>
        </label>

        <label class="field">
            <span>Date & Time</span>
            <input v-model="form.recordedAt" type="datetime-local">
        </label>

        <button class="submit-btn" type="submit" :disabled="submitting">
            {{ submitting ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update Record' : 'Save Record') }}
        </button>
        <button 
            v-if="isEdit" 
            type="button" 
            class="submit-btn ghost danger" 
            @click="openDeleteConfirm" 
            :disabled="submitting"
        >
            Delete Record
        </button>
    </form>

    <div v-if="showDeleteConfirm" class="confirm-overlay">
        <div class="confirm-card">
            <h3 class="confirm-title">Delete illness record?</h3>
            <p class="confirm-text">This action permanently removes the record.</p>
            <div class="confirm-actions">
                <button type="button" @click="showDeleteConfirm = false" :disabled="submitting">Cancel</button>
                <button type="button" class="danger" @click="confirmDelete" :disabled="submitting">
                    {{ submitting ? 'Deleting...' : 'Delete' }}
                </button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useIllness } from '@/composables/vitals/illness'

export default {
    name: 'AddIllnessRecord',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { addRecord, fetchRecordById, updateRecord, deleteRecord } = useIllness()
        const submitting = ref(false)
        const loading = ref(false)
        const recordId = ref(route.params.id)
        const isEdit = ref(Boolean(recordId.value))
        const showDeleteConfirm = ref(false)

        const profileIdFromQuery = Array.isArray(route.query.profileId) ? route.query.profileId[0] : route.query.profileId
        const formatDateTimeLocal = (value) => {
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return ''
            const iso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString()
            return iso.slice(0, 16)
        }
        const form = ref({
            diagnosis: '',
            bodyTemperature: '',
            temperatureUnit: 'C',
            severity: 'MILD',
            status: 'ONGOING',
            notes: '',
            recordedAt: formatDateTimeLocal(new Date()),
            profileId: profileIdFromQuery || localStorage.getItem('selectedProfileId') || ''
        })
        const symptomsInput = ref('')
        const medicationsInput = ref('')

        const goBack = () => {
            router.back()
        }

        const parseList = (input) => input.split(',').map(item => item.trim()).filter(Boolean)

        const loadExisting = async () => {
            if (!recordId.value) return
            const token = localStorage.getItem('token')
            if (!token) return
            loading.value = true
            try {
                const existing = await fetchRecordById(token, recordId.value)
                if (existing) {
                    form.value = {
                        diagnosis: existing.diagnosis || '',
                        bodyTemperature: typeof existing.bodyTemperature === 'number' ? existing.bodyTemperature : '',
                        temperatureUnit: existing.temperatureUnit || 'C',
                        severity: existing.severity || 'MILD',
                        status: existing.status || 'ONGOING',
                        notes: existing.notes || '',
                        recordedAt: existing.recordedAt
                            ? formatDateTimeLocal(existing.recordedAt)
                            : '',
                        profileId: existing.profileId || form.value.profileId
                    }
                    symptomsInput.value = (existing.symptoms || []).join(', ')
                    medicationsInput.value = (existing.medications || []).join(', ')
                }
            } catch (err) {
                alert(err.message || 'Failed to load illness record')
            } finally {
                loading.value = false
            }
        }

        const submit = async() => {
            if (!form.value.diagnosis) {
                alert('Diagnosis is required.')
                return
            }
            if (!form.value.profileId) {
                alert('Profile is required.')
                return
            }
            submitting.value = true
            try {
                const payload = {
                    ...form.value,
                    symptoms: parseList(symptomsInput.value),
                    medications: parseList(medicationsInput.value)
                }
                const token = localStorage.getItem('token')
                if (!token) {
                    throw new Error('No auth token found.')
                }
                if (isEdit.value) {
                    await updateRecord(token, recordId.value, payload)
                } else {
                    await addRecord(token, payload)
                }
                router.push({
                    path: '/medical-records/illness',
                    query: {
                        profileId: form.value.profileId,
                        profileName: route.query.profileName || localStorage.getItem('selectedProfileName') || ''
                    }
                })
            } catch (err) {
                alert(err.message || 'Failed to save illness record')
            } finally {
                submitting.value = false
            }
        }

        const openDeleteConfirm = () => {
            if (!isEdit.value || !recordId.value) return
            showDeleteConfirm.value = true
        }

        const confirmDelete = async() => {
            if (!isEdit.value || !recordId.value) return
            const token = localStorage.getItem('token')
            if (!token) return
            submitting.value = true
            try {
                await deleteRecord(token, recordId.value)
                router.push('/medical-records/illness')
            } catch (err) {
                alert(err.message || 'Failed to delete illness record')
            } finally {
                submitting.value = false
                showDeleteConfirm.value = false
            }
        }

        onMounted(() => {
            loadExisting()
        })

        return {
            form,
            symptomsInput,
            medicationsInput,
            submitting,
            goBack,
            submit,
            isEdit,
            loading,
            showDeleteConfirm,
            openDeleteConfirm,
            confirmDelete
        }
    }
}
</script>

<style scoped>
.add-illness-container {
    min-height: 100vh;
    background: #05060a;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
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
    gap: 10px;
    position: relative;
    z-index: 1;
    padding: 8px 0;
}

.back-btn {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e2e8f0;
}

h2 {
    flex: 1;
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #e2e8f0;
    text-align: center;
}

.spacer {
    width: 44px;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: relative;
    z-index: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 14px 30px rgba(0,0,0,0.35);
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field span {
    font-size: 13px;
    color: #cbd5e1;
    font-weight: 700;
}

input,
textarea,
select {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
    font-size: 14px;
    color: #e2e8f0;
}

input:focus,
textarea:focus,
select:focus {
    outline: none;
    border-color: rgba(103,232,249,0.6);
    box-shadow: 0 0 0 2px rgba(103,232,249,0.25);
}

.inline {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 8px;
}

.field.half {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

textarea {
    resize: vertical;
    min-height: 80px;
}

.submit-btn {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 14px;
    background: linear-gradient(135deg, #22d3ee, #a855f7);
    color: #0b1020;
    font-size: 15px;
    font-weight: 800;
    box-shadow: 0 12px 24px rgba(168, 85, 247, 0.3);
    border: 1px solid rgba(255,255,255,0.16);
}

.submit-btn:disabled {
    opacity: 0.7;
}

.submit-btn.ghost {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    color: #e2e8f0;
}

.submit-btn.danger {
    background: linear-gradient(135deg, #f97316, #ef4444);
    color: #0b1020;
    border: none;
}

.confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(5, 6, 10, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 1100;
}

.confirm-card {
    background: rgba(10, 12, 20, 0.95);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px;
    padding: 18px;
    width: 100%;
    max-width: 360px;
    box-shadow: 0 18px 36px rgba(0,0,0,0.4);
    color: #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.confirm-title {
    margin: 0;
    font-size: 17px;
    font-weight: 800;
}

.confirm-text {
    margin: 0;
    font-size: 14px;
    color: #cbd5e1;
}

.confirm-actions {
    display: flex;
    gap: 10px;
}

.confirm-actions button {
    flex: 1;
    padding: 12px;
    border-radius: 12px;
    font-weight: 700;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
    color: #e2e8f0;
}

.confirm-actions .danger {
    background: linear-gradient(135deg, #f97316, #ef4444);
    border: none;
    color: #0b1020;
}
</style>
