<template>
<div class="car-shell">
    <div class="car-orb one"></div>
    <div class="car-orb two"></div>
    <div class="car-hero">
        <span class="car-icon-btn ghost"></span>
        <div>
            <h2 class="car-hero-title">Add Maintenance</h2>
            <p class="car-hero-sub">Track service details and costs</p>
        </div>
        <button class="car-icon-btn" @click="goBack">
            <mdicon name="home" :size="22"/>
        </button>
    </div>

    <form class="car-body car-form" @submit.prevent="submitRecord">
        <div v-if="isEditing" class="car-field">
            <label>Vehicle</label>
            <div class="car-input" style="background: var(--glass-ghost-bg); border: 1px solid var(--glass-card-border);">
                {{ selectedVehicleName }}
            </div>
        </div>
        <div v-else class="car-field">
            <label>Vehicle</label>
            <select v-model="form.vehicleId" required class="car-select">
                <option value="" disabled>Select vehicle</option>
                <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                    {{ displayName(vehicle) }}
                </option>
            </select>
        </div>

        <div class="car-field">
            <label>Maintenance Type</label>
            <div class="car-type-input car-input" style="display:flex; align-items:center; gap:8px; border:1px solid var(--glass-card-border);">
                <input
                    class="car-input"
                    v-model="form.maintenanceType"
                    type="text"
                    placeholder="Select or type"
                    @focus="showTypeList = true"
                    style="border:none; background:transparent; padding:0; box-shadow:none;"
                />
                <button type="button" class="type-icon" @click="showTypeList = !showTypeList">
                    <mdicon name="menu-down" :size="20"/>
                </button>
            </div>
            <div v-if="showTypeList" class="car-type-list">
                <button type="button" class="car-type-option" v-for="option in typeOptions" :key="option" @click="selectType(option)">
                    {{ option }}
                </button>
            </div>
        </div>

        <div class="car-grid-2">
            <div class="car-field">
                <label>Service Date</label>
                <input v-model="form.serviceDate" type="date" required class="car-input" />
            </div>
        </div>

        <div class="car-grid-2">
            <div class="car-field">
                <label>Mileage at Service ({{ distanceUnitLabel }})</label>
                <input v-model="form.mileageAtService" type="number" min="0" :placeholder="distanceUnit === 'mi' ? '50000' : '80456'" class="car-input" />
            </div>
            <div class="car-field">
                <label>Cost</label>
                <input v-model="form.cost" type="number" min="0" step="0.01" placeholder="4000" class="car-input" />
            </div>
        </div>

        <div class="car-grid-2">
            <div class="car-field">
                <label>Currency</label>
                <select v-model="form.currency" class="car-select">
                    <option v-for="c in currencyOptions" :key="c" :value="c">{{ c }}</option>
                </select>
            </div>
            <div class="car-field">
                <label>Serviced By</label>
                <input v-model="form.servicedBy" type="text" placeholder="Service Center" class="car-input" />
            </div>
        </div>

        <div class="car-field">
            <label>Location</label>
            <input v-model="form.location" type="text" placeholder="City / Garage" class="car-input" />
        </div>

        <div class="car-field">
            <label>Parts Used</label>
            <textarea v-model="form.partsUsed" rows="2" placeholder="List parts used" class="car-textarea"></textarea>
        </div>

        <div class="car-field">
            <label>Labor Hours</label>
            <input v-model="form.laborHours" type="number" min="0" step="0.1" placeholder="2.5" class="car-input" />
        </div>

        <div class="car-field">
            <label>Description</label>
            <textarea v-model="form.description" rows="3" placeholder="Notes or details" class="car-textarea"></textarea>
        </div>

        <button class="car-btn" type="submit" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save Maintenance' }}
        </button>
        <button 
            v-if="isEditing" 
            class="car-btn ghost" 
            type="button" 
            @click="cancelEdit"
        >
            Cancel
        </button>
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-text">{{ successMessage }}</p>
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
        const { createMaintenanceRecord, updateMaintenanceRecord, listVehicles, getMaintenanceRecord, getPreferences } = useCarMaintenance()

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

        const goBack = () => {
            if (window.history.length > 1) {
                router.back()
            } else {
                router.push('/car-maintenance')
            }
        }

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
                    await updateMaintenanceRecord(token, editingId.value, payload.value)
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

        const cancelEdit = () => {
            if (isEditing.value && editingId.value) {
                router.push(`/car-maintenance/maintenance/${editingId.value}`)
            } else {
                router.push('/car-maintenance')
            }
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
            currencyOptions,
            cancelEdit
        }
    }
}
</script>

<style scoped>
.type-icon { border: none; background: transparent; color: var(--text-muted); padding: 0 10px; display: flex; align-items: center; justify-content: center; }
.error-text { color: #dc2626; font-size: 13px; margin: 0; }
.success-text { color: #16a34a; font-size: 13px; margin: 0; }
.car-type-input :deep(input) { border: none !important; padding: 0; }
</style>
