<template>
<div class="car-shell stagger-page stagger-seq" :class="{ 'stagger-ready': staggerReady }">
    <div class="car-orb one"></div>
    <div class="car-orb two"></div>
    <div class="car-hero">
        <button class="car-icon-btn" @click="goBackPage">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <div>
            <h2 class="car-hero-title">{{ editingId ? 'Edit Schedule' : 'Add Schedule' }}</h2>
            <p class="car-hero-sub">Create reminders for maintenance</p>
        </div>
        <button class="car-icon-btn" @click="goBack">
            <mdicon name="home" :size="22"/>
        </button>
    </div>

    <form class="car-body car-form" @submit.prevent="submitSchedule">
        <div class="car-field">
            <label>Vehicle</label>
            <select v-model="form.vehicleId" required class="car-select">
                <option value="" disabled>Select vehicle</option>
                <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                    {{ displayName(vehicle) }}
                </option>
            </select>
        </div>
        <div class="car-field type-field">
            <label>Maintenance Type</label>
            <div class="type-input">
                <input
                    v-model="form.maintenanceType"
                    type="text"
                    placeholder="Select or type"
                    class="car-input"
                    @focus="showTypeDropdown = true"
                />
                <button type="button" class="type-toggle" @click="toggleTypeDropdown">
                    <mdicon name="chevron-down" :size="22"/>
                </button>
            </div>
            <div v-if="showTypeDropdown" class="type-dropdown car-card">
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
        <div class="car-grid-2">
            <div class="car-field">
                <label>Due Date</label>
                <input v-model="form.dueDate" type="date" required class="car-input" />
            </div>
            <div class="car-field">
                <label>Due Mileage</label>
                <input v-model="form.dueMileage" type="number" min="0" placeholder="100000" class="car-input" />
            </div>
        </div>
        <div class="car-field">
            <label>Notes</label>
            <textarea v-model="form.notes" rows="3" placeholder="Add details" class="car-textarea"></textarea>
        </div>

        <button class="car-btn" type="submit" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save Schedule' }}
        </button>
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-text">{{ successMessage }}</p>
    </form>
    <Loading v-if="loadingOverlay"/>
</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'
import { scheduleMaintenanceNotification, cancelReminderNotifications, ensureLocalNotificationPermission } from '@/composables/localNotifications'
import Loading from '@/components/Loading.vue'
import { useStaggerReady } from '@/composables/staggerReady'

export default {
    name: 'CarMaintenanceAddSchedule',
    components: {
        Loading
    },
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
        const loadingOverlay = ref(false)
        const staggerReady = useStaggerReady()

        const withOverlay = async(fn) => {
            loadingOverlay.value = true
            try {
                return await fn()
            } finally {
                loadingOverlay.value = false
            }
        }

        const displayName = (vehicle) => {
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }

        const loadVehicles = async() => {
            await withOverlay(async() => {
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
            })
        }

        const submitSchedule = async() => {
            errorMessage.value = ''
            successMessage.value = ''
            submitting.value = true
            try {
                await ensureLocalNotificationPermission()
                await withOverlay(async() => {
                    const token = localStorage.getItem('token')
                    if (!token) throw new Error('You must be logged in.')
                    let savedReminder = null
                    if (editingId.value) {
                        savedReminder = await updateReminder(token, editingId.value, {
                            vehicleId: form.value.vehicleId,
                            maintenanceType: form.value.maintenanceType,
                            title: form.value.maintenanceType,
                            description: form.value.notes,
                            dueDate: form.value.dueDate,
                            dueMileage: form.value.dueMileage ? Number(form.value.dueMileage) : null
                        })
                        successMessage.value = 'Schedule updated'
                    } else {
                        savedReminder = await createReminder(token, {
                            vehicleId: form.value.vehicleId,
                            maintenanceType: form.value.maintenanceType,
                            title: form.value.maintenanceType,
                            description: form.value.notes,
                            dueDate: form.value.dueDate,
                            dueMileage: form.value.dueMileage ? Number(form.value.dueMileage) : null
                        })
                        successMessage.value = 'Schedule saved'
                    }
                    if (savedReminder) {
                        await cancelReminderNotifications(savedReminder.id)
                        await scheduleMaintenanceNotification({
                            id: savedReminder.id,
                            title: savedReminder.maintenanceType || savedReminder.title,
                            vehicleName: savedReminder.vehicle?.make ? `${savedReminder.vehicle.make} ${savedReminder.vehicle.model || ''}`.trim() : '',
                            dueDate: savedReminder.dueDate
                        })
                    }
                    setTimeout(() => router.push('/car-maintenance/schedules'), 400)
                })
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

        const goBack = () => router.push('/')
        const goBackPage = () => router.back()

        const loadReminder = async(id) => {
            await withOverlay(async() => {
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
            })
        }

        const loadPreferences = async() => {
            await withOverlay(async() => {
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
            })
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
            editingId,
            goBack,
            goBackPage,
            submitSchedule,
            displayName,
            showTypeDropdown,
            typeOptions,
            toggleTypeDropdown,
            chooseType,
            loadingOverlay,
            staggerReady
        }
    }
}
</script>

<style scoped>
.type-field {
  position: relative;
}

.type-input {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--glass-card-border);
  border-radius: 12px;
  padding: 4px 6px 4px 10px;
  background: var(--glass-ghost-bg);
}

.type-input .car-input {
  border: none;
  background: transparent;
  padding: 8px 0;
  box-shadow: none;
}

.type-toggle {
  border: none;
  background: transparent;
  color: var(--text-primary);
  padding: 6px;
  border-radius: 10px;
}

.type-dropdown {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 6px;
}

.type-option {
  border: none;
  background: transparent;
  color: var(--text-primary);
  padding: 10px;
  border-radius: 10px;
  text-align: left;
  font-weight: 700;
}

.type-option:active {
  background: var(--glass-ghost-bg);
}

.error-text {
  color: #ef4444;
  margin: 6px 0 0;
}

.success-text {
  color: #22c55e;
  margin: 6px 0 0;
}
</style>
