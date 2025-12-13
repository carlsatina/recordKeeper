<template>
<div class="car-shell">
    <div class="car-orb one"></div>
    <div class="car-orb two"></div>
    <div class="car-hero">
        <button class="car-icon-btn" @click="goBackPage">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <div>
            <h2 class="car-hero-title">{{ isEditing ? 'Edit Vehicle' : 'Add Vehicle' }}</h2>
            <p class="car-hero-sub">Keep your garage organized</p>
        </div>
        <button class="car-icon-btn" @click="goBack">
            <mdicon name="home" :size="22"/>
        </button>
    </div>

    <form class="car-body car-form" @submit.prevent="submitVehicle">
        <div class="car-card upload-card">
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
        
        <div class="car-grid-2">
            <div class="car-field">
                <label>Make</label>
                <input v-model="form.make" type="text" required placeholder="Toyota" class="car-input" />
            </div>
            <div class="car-field">
                <label>Model</label>
                <input v-model="form.model" type="text" required placeholder="Fortuner" class="car-input" />
            </div>
        </div>
        <div class="car-grid-2">
            <div class="car-field">
                <label>Year</label>
                <input v-model="form.year" type="number" min="1900" max="2100" placeholder="2012" class="car-input" />
            </div>
            <div class="car-field">
                <label>Vehicle Type</label>
                <select v-model="form.vehicleType" class="car-select">
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

        <div class="car-grid-2">
            <div class="car-field">
                <label>Color</label>
                <input v-model="form.color" type="text" placeholder="Blue" class="car-input" />
            </div>
            <div class="car-field">
                <label>License Plate</label>
                <input v-model="form.licensePlate" type="text" placeholder="ABC123" class="car-input" />
            </div>
        </div>
        <div class="car-field">
            <label>Reg. Exp. Date</label>
            <input v-model="form.registrationExpiryDate" type="date" class="car-input" />
        </div>
        <div class="car-field">
            <label>VIN</label>
            <input v-model="form.vin" type="text" placeholder="Optional" class="car-input" />
        </div>
        <div class="car-grid-2">
            <div class="car-field">
                <label>Purchase Date</label>
                <input v-model="form.purchaseDate" type="date" class="car-input" />
            </div>
            <div class="car-field">
                <label>Current Mileage</label>
                <input v-model="form.currentMileage" type="number" min="0" placeholder="80456" class="car-input" />
            </div>
        </div>
        <div class="car-field">
            <label>Notes</label>
            <textarea v-model="form.notes" rows="3" placeholder="Extra details" class="car-textarea"></textarea>
        </div>

        <button class="car-btn" type="submit" :disabled="submitting">
            {{ submitting ? 'Saving...' : (isEditing ? 'Update Vehicle' : 'Save Vehicle') }}
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
import { API_BASE_URL } from '@/constants/config'
import { useCarMaintenance } from '@/composables/carMaintenance'
import Loading from '@/components/Loading.vue'

export default {
    name: 'CarMaintenanceAddVehicleMobile',
    components: {
        Loading
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { createVehicle, getVehicle, updateVehicle } = useCarMaintenance()
        const form = ref({
            make: '',
            model: '',
            year: '',
            color: '',
            licensePlate: '',
            registrationExpiryDate: '',
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
        const isEditing = ref(false)
        const editingId = ref('')
        const existingImageUrl = ref('')
        const loadingOverlay = ref(false)

        const goBack = () => router.push('/')
        const goBackPage = () => router.back()

        const withOverlay = async(fn) => {
            loadingOverlay.value = true
            try {
                return await fn()
            } finally {
                loadingOverlay.value = false
            }
        }

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

        const compressImage = (file, maxSize = 1024 * 1024) => {
            return new Promise((resolve) => {
                const img = new Image()
                const reader = new FileReader()
                reader.onload = (e) => {
                    img.src = e.target.result
                }
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    const ctx = canvas.getContext('2d')
                    const maxDimension = 1200
                    let { width, height } = img
                    if (width > maxDimension || height > maxDimension) {
                        const scale = Math.min(maxDimension / width, maxDimension / height)
                        width = Math.round(width * scale)
                        height = Math.round(height * scale)
                    }
                    canvas.width = width
                    canvas.height = height
                    ctx.drawImage(img, 0, 0, width, height)
                    let quality = 0.9
                    const attempt = () => {
                        canvas.toBlob(
                            (blob) => {
                                if (blob && blob.size <= maxSize) {
                                    resolve(new File([blob], file.name, { type: blob.type }))
                                } else if (quality > 0.1) {
                                    quality -= 0.1
                                    attempt()
                                } else {
                                    resolve(file)
                                }
                            },
                            'image/jpeg',
                            quality
                        )
                    }
                    attempt()
                }
                reader.readAsDataURL(file)
            })
        }

        const loadVehicle = async() => {
            await withOverlay(async() => {
                try {
                    const token = localStorage.getItem('token')
                    const id = route.params.id || route.query.vehicleId
                    if (!token || !id) return
                    const vehicle = await getVehicle(token, id)
                    editingId.value = vehicle.id
                    isEditing.value = true
                    form.value = {
                        make: vehicle.make || '',
                        model: vehicle.model || '',
                        year: vehicle.year || '',
                        color: vehicle.color || '',
                        licensePlate: vehicle.licensePlate || '',
                        registrationExpiryDate: vehicle.registrationExpiryDate ? vehicle.registrationExpiryDate.split('T')[0] : '',
                        vin: vehicle.vin || '',
                        vehicleType: vehicle.vehicleType || 'CAR',
                        purchaseDate: vehicle.purchaseDate ? vehicle.purchaseDate.split('T')[0] : '',
                        currentMileage: vehicle.currentMileage || '',
                        notes: vehicle.notes || ''
                    }
                    if (vehicle.imageUrl) {
                        existingImageUrl.value = vehicle.imageUrl
                        imagePreview.value = vehicle.imageUrl.startsWith('http') ? vehicle.imageUrl : `${API_BASE_URL}${vehicle.imageUrl}`
                    }
                } catch (err) {
                    console.error(err)
                }
            })
        }

        const submitVehicle = async() => {
            errorMessage.value = ''
            successMessage.value = ''
            submitting.value = true
            try {
                await withOverlay(async() => {
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
                    if (!imageFile.value && existingImageUrl.value) {
                        payload.append('imageUrl', existingImageUrl.value)
                    }
                    if (imageFile.value) {
                        const compressed = await compressImage(imageFile.value)
                        payload.append('image', compressed)
                    }
                    if (isEditing.value && editingId.value) {
                        await updateVehicle(token, editingId.value, payload)
                        successMessage.value = 'Vehicle updated successfully'
                    } else {
                        await createVehicle(token, payload)
                        successMessage.value = 'Vehicle added successfully'
                    }
                    setTimeout(() => {
                        router.push('/car-maintenance/vehicles')
                    }, 600)
                })
            } catch (err) {
                errorMessage.value = err?.message || 'Something went wrong'
            } finally {
                submitting.value = false
            }
        }

        onMounted(() => {
            loadVehicle()
        })

        return {
            form,
            fileInput,
            imagePreview,
            submitting,
            errorMessage,
            successMessage,
            goBack,
            goBackPage,
            triggerFileInput,
            handleFileChange,
            submitVehicle,
            isEditing,
            loadingOverlay
        }
    }
}
</script>

<style scoped>
.upload-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-box {
  border: 1px dashed var(--glass-card-border);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  background: var(--glass-ghost-bg);
  cursor: pointer;
}

.hidden {
  display: none;
}

.preview {
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--glass-card-border);
}

.preview img {
  width: 100%;
  height: auto;
  display: block;
}

.error-text {
  color: #ef4444;
  margin: 8px 0 0;
}

.success-text {
  color: #22c55e;
  margin: 8px 0 0;
}
</style>
