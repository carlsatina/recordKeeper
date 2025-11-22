<template>
<div class="add-maintenance-page">
    <div class="top-banner">
        <button class="icon-btn" @click="goBack">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <h2 class="title">Add Maintenance</h2>
        <span class="icon-btn ghost"></span>
    </div>

    <form class="form" @submit.prevent="submitRecord">
        <div class="field">
            <label>Vehicle</label>
            <select v-model="form.vehicleId" required>
                <option value="" disabled>Select vehicle</option>
                <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                    {{ vehicle.name }}
                </option>
            </select>
        </div>

        <div class="field">
            <label>Title</label>
            <input v-model="form.title" type="text" required placeholder="Oil Change" />
        </div>

        <div class="two-col">
            <div class="field">
                <label>Service Date</label>
                <input v-model="form.serviceDate" type="date" required />
            </div>
            <div class="field">
                <label>Maintenance Type</label>
                <input
                    v-model="form.maintenanceType"
                    list="maintenance-options"
                    type="text"
                    placeholder="Select or type"
                />
                <datalist id="maintenance-options">
                    <option value="Oil Change"></option>
                    <option value="Brake Pad Replacement"></option>
                    <option value="Tire Rotation"></option>
                    <option value="Tire Replacement"></option>
                    <option value="Battery Replacement"></option>
                    <option value="Air Filter Replacement"></option>
                    <option value="Transmission Service"></option>
                    <option value="Coolant Flush"></option>
                    <option value="Spark Plug Replacement"></option>
                    <option value="Brake Fluid Change"></option>
                    <option value="Alignment"></option>
                    <option value="Inspection"></option>
                    <option value="Repair"></option>
                    <option value="Other"></option>
                </datalist>
            </div>
        </div>

        <div class="two-col">
            <div class="field">
                <label>Mileage at Service</label>
                <input v-model="form.mileageAtService" type="number" min="0" placeholder="80456" />
            </div>
            <div class="field">
                <label>Cost</label>
                <input v-model="form.cost" type="number" min="0" step="0.01" placeholder="4000" />
            </div>
        </div>

        <div class="two-col">
            <div class="field">
                <label>Currency</label>
                <input v-model="form.currency" type="text" maxlength="3" placeholder="USD" />
            </div>
            <div class="field">
                <label>Serviced By</label>
                <input v-model="form.servicedBy" type="text" placeholder="Service Center" />
            </div>
        </div>

        <div class="field">
            <label>Location</label>
            <input v-model="form.location" type="text" placeholder="City / Garage" />
        </div>

        <div class="field">
            <label>Parts Used</label>
            <textarea v-model="form.partsUsed" rows="2" placeholder="List parts used"></textarea>
        </div>

        <div class="two-col">
            <div class="field">
                <label>Labor Hours</label>
                <input v-model="form.laborHours" type="number" min="0" step="0.1" placeholder="2.5" />
            </div>
            <div class="field">
                <label>Receipt URL</label>
                <input v-model="form.receiptUrl" type="url" placeholder="https://..." />
            </div>
        </div>

        <div class="field">
            <label>Description</label>
            <textarea v-model="form.description" rows="3" placeholder="Notes or details"></textarea>
        </div>

        <button class="primary-btn" type="submit" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save Maintenance' }}
        </button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </form>
</div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'

export default {
    name: 'CarMaintenanceAddMaintenanceMobile',
    setup() {
        const router = useRouter()
        const { createMaintenanceRecord } = useCarMaintenance()

        const vehicles = ref([
            { id: '1', name: 'Toyota Fortuner 2012' },
            { id: '2', name: 'Nissan Navarra 2018' },
            { id: '3', name: 'Suzuki Alto 2020' }
        ])

        const form = ref({
            vehicleId: '',
            title: '',
            serviceDate: '',
            maintenanceType: '',
            mileageAtService: '',
            cost: '',
            currency: 'USD',
            servicedBy: '',
            location: '',
            partsUsed: '',
            laborHours: '',
            receiptUrl: '',
            description: ''
        })

        const submitting = ref(false)
        const errorMessage = ref('')
        const successMessage = ref('')

        const payload = computed(() => ({
            ...form.value,
            mileageAtService: form.value.mileageAtService || undefined,
            cost: form.value.cost || undefined,
            laborHours: form.value.laborHours || undefined
        }))

        const goBack = () => router.back()

        const submitRecord = async() => {
            errorMessage.value = ''
            successMessage.value = ''
            submitting.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                const record = await createMaintenanceRecord(token, payload.value)
                successMessage.value = 'Maintenance saved'
                setTimeout(() => {
                    router.push('/car-maintenance')
                }, 600)
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to save maintenance'
            } finally {
                submitting.value = false
            }
        }

        return {
            vehicles,
            form,
            submitting,
            errorMessage,
            successMessage,
            goBack,
            submitRecord
        }
    }
}
</script>

<style scoped>
.add-maintenance-page {
    min-height: 100vh;
    background: #f2f4f8;
    padding-bottom: 40px;
}

.top-banner {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    padding: 14px 16px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
}

.title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
}

.icon-btn {
    border: none;
    background: transparent;
    color: inherit;
    padding: 6px;
}

.icon-btn.ghost {
    visibility: hidden;
}

.form {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

label {
    font-weight: 600;
    color: #374151;
    font-size: 14px;
}

input, textarea, select {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px;
    font-size: 14px;
    background: white;
}

.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.primary-btn {
    border: none;
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: white;
    padding: 14px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 15px;
}

.error {
    color: #dc2626;
    font-size: 13px;
    margin: 0;
}

.success {
    color: #16a34a;
    font-size: 13px;
    margin: 0;
}
</style>
