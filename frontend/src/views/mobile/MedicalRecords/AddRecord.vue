<template>
<div class="add-record-container">
    <!-- Header -->
    <div class="header">
        <button class="close-btn" @click="goBack">
            <mdicon name="close" :size="24"/>
        </button>
        <h2 class="page-title">Add Record</h2>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Image Upload Section -->
        <div class="image-upload-section">
            <div class="image-preview" v-if="uploadedImage">
                <img :src="uploadedImage" alt="Uploaded record" />
            </div>
            <div class="add-image-card" @click="triggerFileUpload">
                <mdicon name="plus" :size="48" class="plus-icon"/>
                <p>Add more images</p>
                <input 
                    type="file" 
                    ref="fileInput" 
                    @change="handleFileUpload" 
                    accept="image/*"
                    style="display: none"
                />
            </div>
        </div>

        <!-- Form Fields -->
        <div class="form-section">
            <!-- Record For -->
            <div class="form-group">
                <label class="form-label">Record for</label>
                <div class="select-wrapper">
                    <select v-model="recordFor" class="form-select">
                        <option value="">Select family member</option>
                        <option 
                            v-for="member in profileMembers" 
                            :key="member.id" 
                            :value="member.id"
                        >
                            {{ member.name }}
                        </option>
                    </select>
                    <mdicon name="chevron-down" :size="20" class="select-icon"/>
                </div>
            </div>

            <!-- File Name -->
            <div class="form-group">
                <label class="form-label">File name</label>
                <input 
                    type="text" 
                    v-model="fileName" 
                    placeholder="Add file name"
                    class="form-input"
                />
            </div>

            <!-- Record Created On -->
            <div class="form-group">
                <label class="form-label">Record created on</label>
                <div class="date-input-wrapper">
                    <input 
                        type="date" 
                        v-model="recordDate" 
                        placeholder="Add record date"
                        class="form-input date-input"
                    />
                    <mdicon name="calendar" :size="20" class="date-icon"/>
                </div>
            </div>

            <!-- Type of Record -->
            <div class="form-group">
                <label class="form-label">Type of record</label>
                <div class="record-types">
                    <div 
                        class="record-type-card"
                        :class="{ active: recordType === 'lab-report' }"
                        @click="recordType = 'lab-report'"
                    >
                        <mdicon name="file-document" :size="32"/>
                        <span>Lab Report</span>
                    </div>
                    <div 
                        class="record-type-card"
                        :class="{ active: recordType === 'prescription' }"
                        @click="recordType = 'prescription'"
                    >
                        <mdicon name="file-document-edit" :size="32"/>
                        <span>Prescription</span>
                    </div>
                    <div 
                        class="record-type-card"
                        :class="{ active: recordType === 'invoice' }"
                        @click="recordType = 'invoice'"
                    >
                        <mdicon name="receipt" :size="32"/>
                        <span>Invoice</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Save Button -->
        <button class="save-btn" @click="saveRecord">
            Save record
        </button>
    </div>
</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfiles } from '@/composables/profiles'

export default {
    name: 'AddRecordMobile',
    setup() {
        const router = useRouter()
        const fileInput = ref(null)
        const uploadedImage = ref(null)
        const recordFor = ref('')
        const fileName = ref('')
        const recordDate = ref('')
        const recordType = ref('')
        const profileMembers = ref([])
        const { fetchProfiles } = useProfiles()

        const goBack = () => {
            router.back()
        }

        const triggerFileUpload = () => {
            fileInput.value.click()
        }

        const handleFileUpload = (event) => {
            const file = event.target.files[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    uploadedImage.value = e.target.result
                }
                reader.readAsDataURL(file)
            }
        }

        const saveRecord = () => {
            // TODO: Implement save logic
            console.log('Saving record:', {
                recordFor: recordFor.value,
                fileName: fileName.value,
                recordDate: recordDate.value,
                recordType: recordType.value,
                image: uploadedImage.value
            })
            router.back()
        }

        const loadProfiles = async () => {
            const token = localStorage.getItem('token')
            if (!token) return
            const { response, error } = await fetchProfiles(token)
            if (error.value === null && response.value?.profiles) {
                profileMembers.value = response.value.profiles.map(profile => ({
                    id: profile.id,
                    name: profile.displayName || 'Profile'
                }))
            }
        }

        onMounted(() => {
            loadProfiles()
        })

        return {
            fileInput,
            uploadedImage,
            recordFor,
            fileName,
            recordDate,
            recordType,
            goBack,
            triggerFileUpload,
            handleFileUpload,
            saveRecord,
            profileMembers
        }
    }
}
</script>

<style scoped>
.add-record-container {
    min-height: 100vh;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
}

/* Header */
.header {
    background: white;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 10;
}

.close-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.close-btn:active {
    transform: scale(0.9);
    background: #f3f4f6;
    border-radius: 8px;
}

.page-title {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

/* Content */
.content {
    flex: 1;
    padding: 20px 16px;
    padding-bottom: 40px;
}

/* Image Upload Section */
.image-upload-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 32px;
}

.image-preview {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    aspect-ratio: 1;
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.add-image-card {
    background: white;
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.add-image-card:active {
    transform: scale(0.98);
    border-color: #667eea;
}

.plus-icon {
    color: #9ca3af;
}

.add-image-card p {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
    font-weight: 500;
}

/* Form Section */
.form-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 32px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
}

.form-input {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 14px 16px;
    font-size: 15px;
    color: #1a1a1a;
    transition: all 0.2s ease;
}

.form-input::placeholder {
    color: #9ca3af;
}

.form-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Select Wrapper */
.select-wrapper {
    position: relative;
}

.form-select {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 14px 40px 14px 16px;
    font-size: 15px;
    color: #1a1a1a;
    width: 100%;
    appearance: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.form-select option:first-child {
    color: #9ca3af;
}

.form-select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.select-icon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
}

/* Date Input */
.date-input-wrapper {
    position: relative;
    width: 100%;
}

.date-input {
    padding-right: 40px;
    width: 100%;
}

.date-icon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
}

/* Record Types */
.record-types {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.record-type-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #6b7280;
}

.record-type-card:active {
    transform: scale(0.95);
}

.record-type-card.active {
    border-color: #667eea;
    background: #f0f4ff;
    color: #667eea;
}

.record-type-card span {
    font-size: 12px;
    font-weight: 500;
    text-align: center;
}

/* Save Button */
.save-btn {
    width: 100%;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.save-btn:active {
    transform: scale(0.98);
    background: #5568d3;
}
</style>
