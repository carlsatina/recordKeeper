<template>
<div class="add-vehicle-page">
    <div class="top-banner">
        <button class="icon-btn" @click="goBack">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <h2 class="title">Add Vehicle</h2>
        <span class="icon-btn ghost"></span>
    </div>

    <form class="form" @submit.prevent="submitVehicle">
        <div class="field">
            <label>Vehicle Image</label>
            <div class="upload-box" @click="triggerFileInput">
                <mdicon name="image-multiple" :size="22"/>
                <span>{{ imagePreview ? 'Change image' : 'Tap to upload image' }}</span>
            </div>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
            <div v-if="imagePreview" class="preview">
                <img :src="imagePreview" alt="Vehicle preview" />
            </div>
        </div>
        
        <div class="two-col">
            <div class="field">
                <label>Make</label>
                <input v-model="form.make" type="text" required placeholder="Toyota" />
            </div>
            <div class="field">
                <label>Model</label>
                <input v-model="form.model" type="text" required placeholder="Fortuner" />
            </div>
        </div>
        <div class="two-col">
            <div class="field">
                <label>Year</label>
                <input v-model="form.year" type="number" min="1900" max="2100" placeholder="2012" />
            </div>
            <div class="field">
                <label>Vehicle Type</label>
                <select v-model="form.vehicleType">
                    <option value="CAR">Car</option>
                    <option value="SUV">SUV</option>
                    <option value="PICKUP">Pickup</option>
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="TRUCK">Truck</option>
                    <option value="VAN">Van</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>
        </div>

        <div class="two-col">
            <div class="field">
                <label>Color</label>
                <input v-model="form.color" type="text" placeholder="Blue" />
            </div>
            <div class="field">
                <label>License Plate</label>
                <input v-model="form.licensePlate" type="text" placeholder="ABC123" />
            </div>
        </div>
        <div class="field">
            <label>VIN</label>
            <input v-model="form.vin" type="text" placeholder="Optional" />
        </div>
        <div class="two-col">
            <div class="field">
                <label>Purchase Date</label>
                <input v-model="form.purchaseDate" type="date" />
            </div>
            <div class="field">
                <label>Current Mileage</label>
                <input v-model="form.currentMileage" type="number" min="0" placeholder="80456" />
            </div>
        </div>
        <div class="field">
            <label>Notes</label>
            <textarea v-model="form.notes" rows="3" placeholder="Extra details"></textarea>
        </div>

        <button class="primary-btn" type="submit" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save Vehicle' }}
        </button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </form>
</div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL } from '@/constants/config'

export default {
    name: 'CarMaintenanceAddVehicleMobile',
    setup() {
        const router = useRouter()
        const form = ref({
            make: '',
            model: '',
            year: '',
            color: '',
            licensePlate: '',
            vin: '',
            vehicleType: 'CAR',
            purchaseDate: '',
            currentMileage: '',
            notes: ''
        })
        const fileInput = ref(null)
        const imageFile = ref(null)
        const imagePreview = ref('')
        const submitting = ref(false)
        const errorMessage = ref('')
        const successMessage = ref('')

        const goBack = () => router.back()

        const triggerFileInput = () => {
            if (fileInput.value) {
                fileInput.value.click()
            }
        }

        const handleFileChange = (event) => {
            const file = event.target.files?.[0]
            if (file) {
                imageFile.value = file
                imagePreview.value = URL.createObjectURL(file)
            }
        }

        const submitVehicle = async() => {
            errorMessage.value = ''
            successMessage.value = ''
            submitting.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    throw new Error('You must be logged in.')
                }
                const payload = new FormData()
                Object.entries(form.value).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                        payload.append(key, value)
                    }
                })
                if (imageFile.value) {
                    payload.append('image', imageFile.value)
                }
                const res = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/vehicles`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: payload
                })
                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.message || 'Unable to add vehicle')
                }
                successMessage.value = 'Vehicle added successfully'
                setTimeout(() => {
                    router.push('/car-maintenance/vehicles')
                }, 600)
            } catch (err) {
                errorMessage.value = err?.message || 'Something went wrong'
            } finally {
                submitting.value = false
            }
        }

        return {
            form,
            fileInput,
            imagePreview,
            submitting,
            errorMessage,
            successMessage,
            goBack,
            triggerFileInput,
            handleFileChange,
            submitVehicle
        }
    }
}
</script>

<style scoped>
.add-vehicle-page {
    min-height: 100vh;
    background: #f2f4f8;
    padding-bottom: 40px;
}

.top-banner {
    background: #0d73dd;
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

.upload-box {
    border: 1px dashed #cbd5e1;
    padding: 12px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #4b5563;
    cursor: pointer;
}

.hidden {
    display: none;
}

.preview img {
    margin-top: 8px;
    max-width: 100%;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
}

.primary-btn {
    border: none;
    background: linear-gradient(135deg, #0d73dd, #2563eb);
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
