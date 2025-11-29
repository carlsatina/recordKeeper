<template>
<div class="add-illness-container">
    <div class="header">
        <button class="back-btn" @click="goBack">
            <mdicon name="arrow-left" :size="22"/>
        </button>
        <h2>Add Illness Record</h2>
        <span class="spacer"></span>
    </div>

    <form class="form" @submit.prevent="submit">
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
            {{ submitting ? 'Saving...' : 'Save Record' }}
        </button>
    </form>
</div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useIllness } from '@/composables/vitals/illness'

export default {
    name: 'AddIllnessRecord',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { addRecord } = useIllness()
        const submitting = ref(false)

        const profileIdFromQuery = Array.isArray(route.query.profileId) ? route.query.profileId[0] : route.query.profileId
        const form = ref({
            diagnosis: '',
            bodyTemperature: '',
            temperatureUnit: 'C',
            severity: 'MILD',
            status: 'ONGOING',
            notes: '',
            recordedAt: '',
            profileId: profileIdFromQuery || localStorage.getItem('selectedProfileId') || ''
        })
        const symptomsInput = ref('')
        const medicationsInput = ref('')

        const goBack = () => {
            router.back()
        }

        const parseList = (input) => input.split(',').map(item => item.trim()).filter(Boolean)

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
                await addRecord(token, payload)
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

        return {
            form,
            symptomsInput,
            medicationsInput,
            submitting,
            goBack,
            submit
        }
    }
}
</script>

<style scoped>
.add-illness-container {
    min-height: 100vh;
    background: #f8fafc;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.back-btn {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: none;
    background: #eef2ff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4338ca;
}

h2 {
    flex: 1;
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
}

.spacer {
    width: 44px;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field span {
    font-size: 13px;
    color: #475569;
}

input,
textarea,
select {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: #fff;
    font-size: 14px;
    color: #0f172a;
}

input:focus,
textarea:focus,
select:focus {
    outline: 2px solid #c7d2fe;
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
    background: linear-gradient(135deg, #7c3aed, #6366f1);
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.3);
}

.submit-btn:disabled {
    opacity: 0.7;
}
</style>
