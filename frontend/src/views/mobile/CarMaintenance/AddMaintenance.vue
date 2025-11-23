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
        <div v-if="isEditing" class="field readonly-field">
            <label>Vehicle</label>
            <div class="readonly-value">{{ selectedVehicleName }}</div>
        </div>
        <div v-else class="field">
            <label>Vehicle</label>
            <select v-model="form.vehicleId" required>
                <option value="" disabled>Select vehicle</option>
                <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                    {{ displayName(vehicle) }}
                </option>
            </select>
        </div>

        <div class="field">
            <label>Maintenance Type</label>
            <div class="type-input">
                <input
                    v-model="form.maintenanceType"
                    type="text"
                    placeholder="Select or type"
                    @focus="showTypeList = true"
                />
                <button type="button" class="type-icon" @click="showTypeList = !showTypeList">
                    <mdicon name="menu-down" :size="20"/>
                </button>
            </div>
            <div v-if="showTypeList" class="type-list">
                <button type="button" class="type-option" v-for="option in typeOptions" :key="option" @click="selectType(option)">
                    {{ option }}
                </button>
            </div>
        </div>

        <div class="two-col">
            <div class="field">
                <label>Service Date</label>
                <input v-model="form.serviceDate" type="date" required />
            </div>
        </div>

        <div class="two-col">
            <div class="field">
                <label>Mileage at Service ({{ distanceUnitLabel }})</label>
                <input v-model="form.mileageAtService" type="number" min="0" :placeholder="distanceUnit === 'mi' ? '50000' : '80456'" />
            </div>
            <div class="field">
                <label>Cost</label>
                <input v-model="form.cost" type="number" min="0" step="0.01" placeholder="4000" />
            </div>
        </div>

        <div class="two-col">
            <div class="field">
                <label>Currency</label>
                <select v-model="form.currency">
                    <option v-for="c in currencyOptions" :key="c" :value="c">{{ c }}</option>
                </select>
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

        <div class="field">
            <label>Labor Hours</label>
            <input v-model="form.laborHours" type="number" min="0" step="0.1" placeholder="2.5" />
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'

export default {
    name: 'CarMaintenanceAddMaintenanceMobile',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { createMaintenanceRecord, listVehicles, getMaintenanceRecord, getPreferences } = useCarMaintenance()

        const vehicles = ref([])
        const isEditing = ref(false)
        const editingId = ref('')
        const selectedVehicleName = ref('')
        const initialVehicleId = ref('')
        const showTypeList = ref(false)
        const defaultTypeOptions = [
            'Oil Change',
            'Brake Pad Replacement',
            'Tire Rotation',
            'Tire Replacement',
            'Battery Replacement',
            'Air Filter Replacement',
            'Transmission Service',
            'Coolant Flush',
            'Spark Plug Replacement',
            'Brake Fluid Change',
            'Alignment',
            'Inspection',
            'Repair',
            'Other'
        ]
        const typeOptions = ref([...defaultTypeOptions])
        const distanceUnit = ref('km')
        const currencyOptions = ref(['USD', 'PHP', 'EUR', 'JPY', 'SGD'])

        const form = ref({
            vehicleId: '',
            serviceDate: '',
            maintenanceType: '',
            mileageAtService: '',
            cost: '',
            currency: 'USD',
            servicedBy: '',
            location: '',
            partsUsed: '',
            laborHours: '',
            description: ''
        })

        const submitting = ref(false)
        const errorMessage = ref('')
        const successMessage = ref('')

        const payload = computed(() => ({
            ...form.value,
            title: form.value.maintenanceType || 'Maintenance',
            mileageAtService: form.value.mileageAtService || undefined,
            cost: form.value.cost || undefined,
            laborHours: form.value.laborHours || undefined
        }))

        const distanceUnitLabel = computed(() => distanceUnit.value === 'mi' ? 'miles' : 'km')

        const goBack = () => router.back()

        const loadVehicles = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                vehicles.value = await listVehicles(token)
                if (!isEditing.value) {
                    if (initialVehicleId.value) {
                        const match = vehicles.value.find(v => v.id === initialVehicleId.value)
                        if (match) {
                            form.value.vehicleId = match.id
                        }
                    }
                    if (!form.value.vehicleId && vehicles.value.length) {
                        form.value.vehicleId = vehicles.value[0].id
                    }
                }
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load vehicles'
                vehicles.value = []
            }
        }

        const loadRecord = async(id) => {
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                const rec = await getMaintenanceRecord(token, id)
                editingId.value = rec.id
                isEditing.value = true
                form.value = {
                    vehicleId: rec.vehicleId,
                    serviceDate: rec.serviceDate ? rec.serviceDate.split('T')[0] : '',
                    maintenanceType: rec.maintenanceType || '',
                    mileageAtService: rec.mileageAtService || '',
                    cost: rec.cost || '',
                    currency: rec.currency || 'USD',
                    servicedBy: rec.servicedBy || '',
                    location: rec.location || '',
                    partsUsed: rec.partsUsed || '',
                    laborHours: rec.laborHours || '',
                    description: rec.description || ''
                }
                selectedVehicleName.value = rec.vehicleId
            } catch (err) {
                console.error(err)
            }
        }

        const submitRecord = async() => {
            errorMessage.value = ''
            successMessage.value = ''
            submitting.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                if (isEditing.value && editingId.value) {
                    await createMaintenanceRecord(token, { ...payload.value, id: editingId.value })
                    successMessage.value = 'Maintenance updated'
                } else {
                    await createMaintenanceRecord(token, payload.value)
                    successMessage.value = 'Maintenance saved'
                }
                setTimeout(() => {
                    router.push('/car-maintenance')
                }, 600)
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to save maintenance'
            } finally {
                submitting.value = false
            }
        }

        const selectType = (option) => {
            form.value.maintenanceType = option
            showTypeList.value = false
        }

        const displayName = (vehicle) => {
            if (!vehicle) return 'Vehicle'
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            const assembled = parts.join(' ').trim()
            return assembled || vehicle.licensePlate || vehicle.vin || 'Vehicle'
        }

        const loadPreferences = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const prefs = await getPreferences(token)
                if (Array.isArray(prefs?.maintenanceTypes) && prefs.maintenanceTypes.length) {
                    typeOptions.value = prefs.maintenanceTypes
                } else {
                    typeOptions.value = [...defaultTypeOptions]
                }
                if (prefs?.distanceUnit) distanceUnit.value = prefs.distanceUnit
                if (prefs?.currency) form.value.currency = prefs.currency
                const uniqueCurrencies = new Set([prefs?.currency || 'USD', ...currencyOptions.value])
                currencyOptions.value = Array.from(uniqueCurrencies)
            } catch (err) {
                typeOptions.value = [...defaultTypeOptions]
            }
        }

        onMounted(async() => {
            const editId = route.query.id
            const vehicleIdQuery = Array.isArray(route.query.vehicleId) ? route.query.vehicleId[0] : route.query.vehicleId
            if (vehicleIdQuery) {
                initialVehicleId.value = vehicleIdQuery
                form.value.vehicleId = vehicleIdQuery
            }
            if (editId) {
                await loadRecord(editId)
            }
            await loadPreferences()
            await loadVehicles()
            if (isEditing.value) {
                const veh = vehicles.value.find(v => v.id === form.value.vehicleId)
                selectedVehicleName.value = veh ? displayName(veh) : ''
            }
        })

        return {
            vehicles,
            form,
            submitting,
            errorMessage,
            successMessage,
            goBack,
            submitRecord,
            displayName,
            isEditing,
            selectedVehicleName,
            showTypeList,
            typeOptions,
            selectType,
            distanceUnit,
            distanceUnitLabel,
            currencyOptions
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

.type-input {
    display: flex;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
    background: white;
}

.type-input input {
    border: none;
    padding: 10px;
    flex: 1;
}

.type-icon {
    border: none;
    background: transparent;
    color: #6b7280;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.type-list {
    margin-top: 8px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    padding: 8px;
}

.type-option {
    border: 1px solid #e5e7eb;
    background: #f8fafc;
    border-radius: 10px;
    padding: 8px;
    text-align: left;
    font-size: 13px;
    color: #111827;
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
