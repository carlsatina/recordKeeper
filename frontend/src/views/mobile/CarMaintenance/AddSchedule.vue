<template>
<div class="add-schedule-page">
    <div class="top-banner">
        <button class="icon-btn" @click="goBack">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <h2 class="title">Add Schedule</h2>
        <span class="icon-btn ghost"></span>
    </div>

    <form class="form" @submit.prevent="submitSchedule">
        <div class="field">
            <label>Vehicle</label>
            <select v-model="form.vehicleId" required>
                <option value="" disabled>Select vehicle</option>
                <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                    {{ displayName(vehicle) }}
                </option>
            </select>
        </div>
        <div class="field type-field">
            <label>Maintenance Type</label>
            <div class="type-input-wrapper">
                <input
                    v-model="form.maintenanceType"
                    type="text"
                    placeholder="Select or type"
                />
                <button type="button" class="type-toggle" @click="toggleTypeDropdown">
                    <mdicon name="chevron-down" :size="22"/>
                </button>
            </div>
            <div v-if="showTypeDropdown" class="type-dropdown">
                <button
                    v-for="option in typeOptions"
                    :key="option"
                    type="button"
                    class="type-option"
                    @click="chooseType(option)"
                >
                    {{ option }}
                </button>
            </div>
        </div>
        <div class="two-col">
            <div class="field">
                <label>Due Date</label>
                <input v-model="form.dueDate" type="date" required />
            </div>
            <div class="field">
                <label>Due Mileage</label>
                <input v-model="form.dueMileage" type="number" min="0" placeholder="100000" />
            </div>
        </div>
        <div class="field">
            <label>Notes</label>
            <textarea v-model="form.notes" rows="3" placeholder="Add details"></textarea>
        </div>

        <button class="primary-btn" type="submit" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save Schedule' }}
        </button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </form>
</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'

export default {
    name: 'CarMaintenanceAddSchedule',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { listVehicles, createReminder, getReminder, updateReminder, getPreferences } = useCarMaintenance()

        const vehicles = ref([])
        const form = ref({
            vehicleId: '',
            maintenanceType: '',
            dueDate: '',
            dueMileage: '',
            notes: ''
        })
        const editingId = ref('')
        const submitting = ref(false)
        const errorMessage = ref('')
        const successMessage = ref('')
        const showTypeDropdown = ref(false)
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

        const displayName = (vehicle) => {
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }

        const loadVehicles = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                vehicles.value = await listVehicles(token)
                const preferredId = route.query.vehicleId || localStorage.getItem('selectedVehicleId')
                const preferred = vehicles.value.find(v => v.id === preferredId)
                form.value.vehicleId = preferred ? preferred.id : (vehicles.value[0]?.id || '')
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load vehicles'
                vehicles.value = []
            }
        }

        const submitSchedule = async() => {
            errorMessage.value = ''
            successMessage.value = ''
            submitting.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                if (editingId.value) {
                    await updateReminder(token, editingId.value, {
                        vehicleId: form.value.vehicleId,
                        maintenanceType: form.value.maintenanceType,
                        title: form.value.maintenanceType,
                        description: form.value.notes,
                        dueDate: form.value.dueDate,
                        dueMileage: form.value.dueMileage ? Number(form.value.dueMileage) : null
                    })
                    successMessage.value = 'Schedule updated'
                } else {
                    await createReminder(token, {
                        vehicleId: form.value.vehicleId,
                        maintenanceType: form.value.maintenanceType,
                        title: form.value.maintenanceType,
                        description: form.value.notes,
                        dueDate: form.value.dueDate,
                        dueMileage: form.value.dueMileage ? Number(form.value.dueMileage) : null
                    })
                    successMessage.value = 'Schedule saved'
                }
                setTimeout(() => router.push('/car-maintenance/schedules'), 400)
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to save schedule'
            } finally {
                submitting.value = false
            }
        }

        const toggleTypeDropdown = () => {
            showTypeDropdown.value = !showTypeDropdown.value
        }

        const chooseType = (option) => {
            form.value.maintenanceType = option
            showTypeDropdown.value = false
        }

        const goBack = () => router.back()

        const loadReminder = async(id) => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const reminder = await getReminder(token, id)
                if (reminder) {
                    editingId.value = reminder.id
                    form.value = {
                        vehicleId: reminder.vehicleId || '',
                        maintenanceType: reminder.maintenanceType || '',
                        dueDate: reminder.dueDate ? reminder.dueDate.substring(0, 10) : '',
                        dueMileage: reminder.dueMileage || '',
                        notes: reminder.description || ''
                    }
                }
            } catch (err) {
                // ignore load errors
            }
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
            } catch (err) {
                typeOptions.value = [...defaultTypeOptions]
            }
        }

        onMounted(() => {
            loadVehicles()
            loadPreferences()
            const paramId = route.params.id
            const queryId = route.query.reminderId
            const resolvedId = (typeof paramId === 'string' && paramId) || (typeof queryId === 'string' && queryId) || ''
            if (resolvedId) {
                loadReminder(resolvedId)
            }
        })

        return {
            vehicles,
            form,
            submitting,
            errorMessage,
            successMessage,
            goBack,
            submitSchedule,
            displayName,
            showTypeDropdown,
            typeOptions,
            toggleTypeDropdown,
            chooseType
        }
    }
}
</script>

<style scoped>
.add-schedule-page {
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

.type-field {
    position: relative;
}

.type-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.type-input-wrapper input {
    width: 100%;
    padding-right: 44px;
}

.type-toggle {
    position: absolute;
    right: 6px;
    top: 6px;
    bottom: 6px;
    width: 36px;
    border: none;
    border-radius: 10px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
}

.type-dropdown {
    margin-top: 6px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.type-option {
    width: 100%;
    border: none;
    background: transparent;
    padding: 10px 12px;
    text-align: left;
    font-size: 14px;
    color: #111827;
}

.type-option + .type-option {
    border-top: 1px solid #f3f4f6;
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
